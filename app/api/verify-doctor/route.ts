import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export async function POST(request: Request) {
  // 1. Authenticate user using standard SSR client
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll() {} // We only need to read
      }
    }
  )

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Use Service Role to bypass RLS for fetching file and updating status (if needed)
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 2. Get pending verification details
  const { data: verification } = await supabaseAdmin
    .from('doctor_verifications')
    .select('*, profiles(full_name)')
    .eq('doctor_id', user.id)
    .eq('verification_status', 'pending')
    .single()

  if (!verification) {
    return NextResponse.json({ message: 'No pending verification found' })
  }

  try {
    // 3. Download the certificate file from storage
    const { data: fileData, error: downloadError } = await supabaseAdmin.storage
      .from('doctor-certificates')
      .download(verification.certificate_file_url)

    if (downloadError || !fileData) {
      throw new Error('Failed to download certificate file')
    }

    // Convert Blob to Base64
    const arrayBuffer = await fileData.arrayBuffer()
    const base64Image = Buffer.from(arrayBuffer).toString('base64')

    // 4. Send to Ollama Vision Model
    const fullName = verification.profiles?.full_name
    const prompt = `Extract the following details from this medical certificate: Name, Degree, Registration Number, and Issuing Council. 
Compare it with the provided user details:
- Provided Name: ${fullName}
- Provided Degree: ${verification.degree}
- Provided Registration Number: ${verification.registration_number}

Determine if the extracted details reasonably match the provided details (allow for minor fuzzy matching/spelling variations).
Return ONLY a valid JSON object in this exact format:
{
  "extracted_name": "string",
  "extracted_degree": "string",
  "extracted_registration_number": "string",
  "match_status": "ai_verified" | "ai_flagged",
  "reasoning": "Explain why it matched or was flagged"
}`

    const ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    if (process.env.OLLAMA_API_KEY) {
      headers['Authorization'] = `Bearer ${process.env.OLLAMA_API_KEY}`
    }

    const aiResponse = await fetch(`${ollamaUrl}/api/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: 'llama3.2-vision',
        messages: [
          {
            role: 'user',
            content: prompt,
            images: [base64Image]
          }
        ],
        format: 'json',
        stream: false
      })
    })

    if (!aiResponse.ok) {
      throw new Error(`Ollama API responded with status: ${aiResponse.status}`)
    }

    const aiResult = await aiResponse.json()
    const parsedMessage = JSON.parse(aiResult.message.content)
    
    // Safety check - never auto reject, only flag
    let newStatus = parsedMessage.match_status
    if (newStatus !== 'ai_verified') newStatus = 'ai_flagged'

    const aiNotes = `Extracted Name: ${parsedMessage.extracted_name}
Extracted Degree: ${parsedMessage.extracted_degree}
Extracted Reg No: ${parsedMessage.extracted_registration_number}

Reasoning: ${parsedMessage.reasoning}`

    // 5. Update the database with results
    await supabaseAdmin
      .from('doctor_verifications')
      .update({
        verification_status: newStatus,
        ai_verification_notes: aiNotes,
        updated_at: new Date().toISOString()
      })
      .eq('id', verification.id)

    return NextResponse.json({ success: true, status: newStatus })
  } catch (error: any) {
    console.error('AI Verification Error:', error)
    
    // On hard failure, flag for manual review
    await supabaseAdmin
      .from('doctor_verifications')
      .update({
        verification_status: 'ai_flagged',
        ai_verification_notes: `System Error during AI verification: ${error.message}`,
        updated_at: new Date().toISOString()
      })
      .eq('id', verification.id)

    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
