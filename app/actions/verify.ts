'use server'

import { createClient } from '@/lib/supabase/server'

export async function submitDoctorVerification(formData: FormData) {
  const supabase = createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  const degree = formData.get('degree') as string
  const registrationNumber = formData.get('registration_number') as string
  const registrationCouncil = formData.get('registration_council') as string
  const file = formData.get('certificate') as File

  if (!file || !degree || !registrationNumber || !registrationCouncil) {
    return { error: 'Missing required fields' }
  }

  // Upload file to Supabase Storage
  const fileExt = file.name.split('.').pop()
  const fileName = `${user.id}-${Date.now()}.${fileExt}`
  const filePath = `${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('doctor-certificates')
    .upload(filePath, file)

  if (uploadError) {
    console.error('Storage upload error:', uploadError)
    return { error: 'Failed to upload certificate' }
  }


  
  // Insert into doctor_verifications
  const { error: insertError } = await supabase
    .from('doctor_verifications')
    .insert({
      doctor_id: user.id,
      degree,
      registration_number: registrationNumber,
      registration_council: registrationCouncil,
      certificate_file_url: filePath,
      verification_status: 'pending'
    })

  if (insertError) {
    console.error('Database insert error:', insertError)
    return { error: 'Failed to save verification details' }
  }

  return { success: true }
}
