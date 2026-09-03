import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const path = searchParams.get('path')

  if (!path) return new NextResponse('Missing path', { status: 400 })

  // Basic admin check
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== 'admin@medivault.com') {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  // Use service role to download
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await supabaseAdmin.storage
    .from('doctor-certificates')
    .download(path)

  if (error || !data) {
    return new NextResponse('File not found', { status: 404 })
  }

  return new NextResponse(data, {
    headers: {
      'Content-Type': data.type || 'application/octet-stream',
      'Content-Disposition': `inline; filename="${path}"`
    }
  })
}
