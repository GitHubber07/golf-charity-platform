'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}


export async function addScore(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const scoreValue = parseInt(formData.get('score') as string, 10)
  const datePlayed = formData.get('date') as string

  if (isNaN(scoreValue) || scoreValue < 1 || scoreValue > 45) {
    throw new Error('Score must be between 1 and 45')
  }

  const { error } = await supabase.from('scores').insert({
    user_id: user.id,
    score: scoreValue,
    date_played: datePlayed,
  })

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard')
  redirect('/dashboard?updated=score')
}

export async function updateScore(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const scoreId = formData.get('scoreId') as string
  const scoreValue = parseInt(formData.get('score') as string, 10)
  const datePlayed = formData.get('date') as string

  if (isNaN(scoreValue) || scoreValue < 1 || scoreValue > 45) {
    throw new Error('Score must be between 1 and 45')
  }

  const { error } = await supabase
    .from('scores')
    .update({ score: scoreValue, date_played: datePlayed })
    .eq('id', scoreId)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard')
  redirect('/dashboard?updated=score')
}

export async function updateCharityPreferences(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const charityId = formData.get('charityId') as string
  const percentageStr = formData.get('percentage') as string
  const percentage = parseFloat(percentageStr)

  if (isNaN(percentage) || percentage < 10.0 || percentage > 100.0) {
    throw new Error('Contribution must be between 10% and 100%')
  }

  const updates: any = { charity_percentage: percentage }
  if (charityId === 'none') {
    updates.charity_id = null
  } else if (charityId) {
    updates.charity_id = charityId
  }

  const { error } = await supabase.from('profiles').update(updates).eq('id', user.id)
  
  if (error) throw new Error(error.message)

  revalidatePath('/dashboard')
  redirect('/dashboard?updated=charity')
}

export async function submitWinningProof(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const winningId = formData.get('winningId') as string
  const proofFile = formData.get('proofFile') as File

  if (!proofFile || proofFile.size === 0) throw new Error('Proof file is required')

  // Upload to Supabase Storage bucket 'proofs'
  const filePath = `${user.id}/${Date.now()}-${proofFile.name.replace(/[^a-zA-Z0-9.-]/g, '')}`
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('proofs')
    .upload(filePath, proofFile)

  if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`)

  const { data: { publicUrl } } = supabase.storage.from('proofs').getPublicUrl(uploadData.path)

  const { error } = await supabase
    .from('winnings')
    .update({ proof_url: publicUrl })
    .eq('id', winningId)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard')
}
