'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const supabase = createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error, data } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single()

  revalidatePath('/', 'layout')

  redirect(
    profile?.role === 'doctor'
      ? '/doctor/dashboard'
      : '/patient/dashboard'
  )
}

export async function signup(formData: FormData) {
  const supabase = createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string
  const role = formData.get('role') as string

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`)
  }

  if (data.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        full_name: fullName,
        role: role,
      })

    if (profileError) {
      console.error('Failed to create profile:', profileError)

      redirect(
        `/signup?error=${encodeURIComponent(
          'Failed to set up user profile'
        )}`
      )
    }
  }

  revalidatePath('/', 'layout')

  redirect(
    role === 'doctor'
      ? '/doctor/verify'
      : '/patient/dashboard'
  )
}

export async function logout() {
  const supabase = createClient()

  await supabase.auth.signOut()

  redirect('/login')
}