'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

function calculateMatches(userScores: number[], winningNumbers: number[]) {
  return winningNumbers.filter(n => userScores.includes(n)).length
}

export async function runDraw(formData: FormData) {
  const supabase = await createClient()

  // 1. Authenticate and Authorize
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') throw new Error('Unauthorized')

  // Import privileged client to bypass RLS restrictions on draws/winnings
  const { supabaseAdmin } = await import('@/utils/supabase/admin')

  const isSimulation = formData.get('mode') === 'simulation'
  const logicType = formData.get('logic') as string 

  // 2. Get all active subscribers
  const { data: activeSubs } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('subscription_status', 'active')
  
  const subscriberCount = activeSubs?.length || 0

  // 3. Calculate Total Pool 
  const totalPool = subscriberCount * 10.0 

  const pool5 = totalPool * 0.40
  const pool4 = totalPool * 0.35
  const pool3 = totalPool * 0.25

  // 4. Get Jackpot carryover from last published draw
  const { data: lastDraw } = await supabaseAdmin
    .from('draws')
    .select('jackpot_carryover')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  
  let jackpot = (lastDraw?.jackpot_carryover || 0) + pool5

  // 5. Generate winning numbers (5 numbers from 1-45)
  let winningNumbers: number[] = []
  if (logicType === 'random') {
    while (winningNumbers.length < 5) {
      const num = Math.floor(Math.random() * 45) + 1
      if (!winningNumbers.includes(num)) winningNumbers.push(num)
    }
  } else {
    // Algorithmic logic mapping
    winningNumbers = [7, 14, 21, 28, 35] 
  }

  const { data: draw, error: drawError } = await supabaseAdmin.from('draws').insert({
    month_year: new Date().toISOString().substring(0, 7),
    status: isSimulation ? 'simulation' : 'published',
    total_pool: totalPool,
    active_subscribers_count: subscriberCount,
    winning_numbers: winningNumbers,
    jackpot_carryover: 0,
    published_at: isSimulation ? null : new Date().toISOString()
  }).select().single()

  if (drawError || !draw) throw new Error(drawError?.message || 'Failed to create draw')

  // 6. Evaluate Matches
  const { data: allScores } = await supabaseAdmin.from('scores').select('user_id, score')
  
  const userScoreMap = new Map<string, number[]>()
  allScores?.forEach(s => {
    if (!userScoreMap.has(s.user_id)) {
      userScoreMap.set(s.user_id, [])
    }
    userScoreMap.get(s.user_id)!.push(s.score)
  })

  const winners5: string[] = []
  const winners4: string[] = []
  const winners3: string[] = []

  userScoreMap.forEach((scores, uid) => {
    const distinctScores = Array.from(new Set(scores))
    const matches = calculateMatches(distinctScores, winningNumbers)

    if (matches === 5) winners5.push(uid)
    else if (matches === 4) winners4.push(uid)
    else if (matches === 3) winners3.push(uid)
  })

  let newJackpotCarry = 0
  const winningsToInsert: any[] = []

  if (winners5.length > 0) {
    const split = jackpot / winners5.length
    winners5.forEach(uid => winningsToInsert.push({ user_id: uid, draw_id: draw.id, match_type: '5-match', prize_amount: split }))
  } else {
    newJackpotCarry = jackpot
  }

  if (winners4.length > 0) {
    const split = pool4 / winners4.length
    winners4.forEach(uid => winningsToInsert.push({ user_id: uid, draw_id: draw.id, match_type: '4-match', prize_amount: split }))
  }

  if (winners3.length > 0) {
    const split = pool3 / winners3.length
    winners3.forEach(uid => winningsToInsert.push({ user_id: uid, draw_id: draw.id, match_type: '3-match', prize_amount: split }))
  }

  if (winningsToInsert.length > 0) {
    await supabaseAdmin.from('winnings').insert(winningsToInsert)
  }

  await supabaseAdmin.from('draws').update({ jackpot_carryover: newJackpotCarry }).eq('id', draw.id)

  revalidatePath('/admin')
}

export async function updateWinningStatus(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') throw new Error('Unauthorized')

  const { supabaseAdmin } = await import('@/utils/supabase/admin')

  const winningId = formData.get('winningId') as string
  const newStatus = formData.get('status') as string

  if (!winningId || !newStatus) throw new Error('Missing fields')

  const { error } = await supabaseAdmin.from('winnings').update({ status: newStatus }).eq('id', winningId)
  if (error) throw new Error(error.message)

  revalidatePath('/admin')
}

export async function createCharity(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') throw new Error('Unauthorized')

  const { supabaseAdmin } = await import('@/utils/supabase/admin')

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const is_featured = formData.get('is_featured') === 'on'
  const active = formData.get('active') === 'on'

  if (!name) throw new Error('Name is required')

  const { error } = await supabaseAdmin.from('charities').insert({ name, description, is_featured, active })
  if (error) throw new Error(error.message)

  revalidatePath('/admin/charities')
  revalidatePath('/charities')
  redirect('/admin/charities?msg=success')
}

export async function updateCharity(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') throw new Error('Unauthorized')

  const { supabaseAdmin } = await import('@/utils/supabase/admin')

  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const is_featured = formData.get('is_featured') === 'on'
  const active = formData.get('active') === 'on'

  if (!id || !name) throw new Error('ID and Name are required')

  const { error } = await supabaseAdmin.from('charities').update({ name, description, is_featured, active }).eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/charities')
  revalidatePath('/charities')
  revalidatePath(`/charities/${id}`)
  redirect('/admin/charities?msg=success')
}

export async function deleteCharity(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') throw new Error('Unauthorized')

  const { supabaseAdmin } = await import('@/utils/supabase/admin')

  const id = formData.get('id') as string
  if (!id) throw new Error('ID required')

  const { error } = await supabaseAdmin.from('charities').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/charities')
  revalidatePath('/charities')
  redirect('/admin/charities?msg=success')
}

export async function adminUpdateUserSub(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') throw new Error('Unauthorized')

  const { supabaseAdmin } = await import('@/utils/supabase/admin')

  const targetUserId = formData.get('userId') as string
  const subStatus = formData.get('subscription_status') as string

  if (!targetUserId) throw new Error('User ID required')

  const { error } = await supabaseAdmin.from('profiles').update({ subscription_status: subStatus }).eq('id', targetUserId)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/users')
  redirect('/admin/users?msg=success')
}

export async function adminUpdateUserScore(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') throw new Error('Unauthorized')

  const { supabaseAdmin } = await import('@/utils/supabase/admin')

  const scoreId = formData.get('scoreId') as string
  const scoreValue = parseInt(formData.get('score') as string, 10)
  
  if (!scoreId || isNaN(scoreValue)) throw new Error('Invalid input')

  const { error } = await supabaseAdmin.from('scores').update({ score: scoreValue }).eq('id', scoreId)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/users')
  redirect('/admin/users?msg=success')
}
