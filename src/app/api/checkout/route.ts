import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized: Missing or invalid session' }, { status: 401 })
    }

    const body = await req.json()
    // Simulated validation
    if (!body.plan) {
      return NextResponse.json({ error: 'Plan is required' }, { status: 400 })
    }

    // Simulate mock delay for PCI gateway processing
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Update profile subscription status
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ subscription_status: 'active' })
      .eq('id', user.id)

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({ success: true, message: 'Subscription activated' })
  } catch (error: any) {
    console.error('Checkout API error:', error)
    return NextResponse.json({ error: error?.message || 'Internal server error processing mock payment' }, { status: 500 })
  }
}
