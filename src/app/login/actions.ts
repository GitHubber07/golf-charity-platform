'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect(`/login?message=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()
  const { supabaseAdmin } = await import('@/utils/supabase/admin')

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // Create an auto-confirmed user using admin API
  const { data: adminData, error: adminError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (adminError || !adminData?.user) {
    redirect(`/login?mode=signup&message=${encodeURIComponent(adminError?.message || 'Could not create account at this time.')}`)
  }

  // Insert profile explicitly
  const { error: insertError } = await supabaseAdmin.from('profiles').insert({
    id: adminData.user.id,
    email: adminData.user.email,
    role: 'user',
    subscription_status: 'inactive'
  })

  // Sign them in immediately using standard auth
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (signInError) {
    redirect(`/login?message=${encodeURIComponent(signInError.message || 'Account created but failed to auto-login.')}`)
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}
