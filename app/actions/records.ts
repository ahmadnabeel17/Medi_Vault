'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function uploadRecord(formData: FormData) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  const file = formData.get('file') as File
  const type = formData.get('type') as string
  const dateStr = formData.get('upload_date') as string

  if (!file || !type) {
    return { error: 'Missing required fields' }
  }

  const uploadDate = dateStr ? new Date(dateStr).toISOString() : new Date().toISOString()
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
  const filePath = `${user.id}/${fileName}`

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('medical-records')
    .upload(filePath, file)

  if (uploadError) {
    console.error('Upload Error:', uploadError)
    return { error: 'Failed to upload file to storage' }
  }

  // Insert row into records table
  const { error: dbError } = await supabase
    .from('records')
    .insert({
      patient_id: user.id,
      type,
      file_url: filePath,
      upload_date: uploadDate
    })

  if (dbError) {
    console.error('Database Error:', dbError)
    // Attempt rollback
    await supabase.storage.from('medical-records').remove([filePath])
    return { error: 'Failed to save record to database' }
  }

  revalidatePath('/patient/dashboard')
  return { success: true }
}

export async function deleteRecord(recordId: string, filePath: string) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from('medical-records')
    .remove([filePath])

  if (storageError) {
    console.error('Storage Delete Error:', storageError)
    return { error: 'Failed to delete file from storage' }
  }

  // Delete from database
  const { error: dbError } = await supabase
    .from('records')
    .delete()
    .eq('id', recordId)
    .eq('patient_id', user.id)

  if (dbError) {
    console.error('Database Delete Error:', dbError)
    return { error: 'Failed to delete record from database' }
  }

  revalidatePath('/patient/dashboard')
  return { success: true }
}

export async function getSignedUrl(filePath: string) {
  const supabase = createClient()
  
  // Create a signed URL valid for 60 seconds
  const { data, error } = await supabase.storage
    .from('medical-records')
    .createSignedUrl(filePath, 60)

  if (error || !data) {
    console.error('Signed URL Error:', error)
    return { error: 'Failed to generate signed URL' }
  }

  return { signedUrl: data.signedUrl }
}
