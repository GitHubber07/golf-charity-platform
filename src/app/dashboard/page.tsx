import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { addScore, updateScore, updateCharityPreferences, signOut, submitWinningProof } from './actions'

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const params = await searchParams
  const supabase = await createClient()

  // Ensure user is authenticated
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch all necessary data
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_status, charity_id, charity_percentage, role')
    .eq('id', user.id)
    .single()

  const { data: scores } = await supabase
    .from('scores')
    .select('*')
    .eq('user_id', user.id)
    .order('date_played', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(5)

  const { data: charities } = await supabase
    .from('charities')
    .select('id, name')
    .eq('active', true)

  const { data: winnings } = await supabase
    .from('winnings')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const isSubscribed = profile?.subscription_status === 'active'
  const currentPercentage = profile?.charity_percentage || 10

  const totalWon = winnings?.reduce((acc, w) => acc + (w.status === 'paid' ? Number(w.prize_amount) : 0), 0) || 0

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="container" style={{ padding: '2rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ fontSize: '1.5rem', fontWeight: '700', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--primary)' }}></div>
          ImpactGolf Dashboard
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {profile?.role === 'admin' && (
            <Link href="/admin" className="btn btn-primary" style={{ padding: '0.5rem 1rem', background: '#eab308', color: '#000', border: 'none' }}>Admin Portal</Link>
          )}
          <span style={{ fontSize: '0.875rem', color: '#a1a1aa' }}>{user.email}</span>
          <form action={signOut}>
            <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>Sign Out</button>
          </form>
        </div>
      </header>

      <main className="container animate-fade-in delay-1" style={{ padding: '2rem 1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', alignItems: 'start' }}>
        
        {/* Subscription Status Panel */}
        <section className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Subscription</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ 
              width: 12, height: 12, borderRadius: '50%', 
              background: isSubscribed ? 'var(--accent)' : '#ef4444',
              boxShadow: isSubscribed ? '0 0 10px var(--accent)' : '0 0 10px #ef4444'
            }}></div>
            <span style={{ fontSize: '1.125rem', fontWeight: 500 }}>
              {isSubscribed ? 'Active Member' : 'Inactive Plan'}
            </span>
          </div>
          {!isSubscribed && (
            <div style={{ padding: '1rem', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--primary)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.875rem' }}>
              Subscribe to participate in monthly prize draws and support charities!
            </div>
          )}
          <Link href="/subscribe" className="btn btn-secondary" style={{ width: '100%' }}>
            {isSubscribed ? 'Manage Plan' : 'View Subscription Plans'}
          </Link>
        </section>

        {/* Score Management Panel */}
        <section className="glass-panel" style={{ padding: '2rem', borderTop: '4px solid var(--primary)' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Recent Scores (Stableford)</h2>
          <p style={{ fontSize: '0.875rem', color: '#a1a1aa', marginBottom: '1.5rem' }}>Your 5 most recent scores act as your unique lottery numbers for the monthly prize draws. Play well!</p>
          
          {!isSubscribed && (
            <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', border: '1px solid rgba(239, 68, 68, 0.2)', fontSize: '0.875rem' }}>
              <strong>Action Required:</strong> An active subscription is required to add or edit your scores.
            </div>
          )}
          
          {params?.updated === 'score' && (
            <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', border: '1px solid rgba(16, 185, 129, 0.2)', fontSize: '0.875rem' }}>
              ✓ Score successfully added to your history!
            </div>
          )}
          <form action={addScore} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <input type="number" name="score" min="1" max="45" placeholder="Score (1-45)" required style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
            <input type="date" name="date" required defaultValue={new Date().toISOString().split('T')[0]} style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
            <button type="submit" className="btn btn-primary" disabled={!isSubscribed}>Add</button>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {scores?.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '1rem', color: '#a1a1aa' }}>No scores entered yet.</p>
            ) : (
              scores?.map((s) => (
                <div key={s.id} className="hover-scale" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', cursor: 'default' }}>
                  {params?.edit === s.id ? (
                    <form action={updateScore} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      <input type="hidden" name="scoreId" value={s.id} />
                      <input type="number" name="score" min="1" max="45" defaultValue={s.score} required style={{ flex: 1, minWidth: '80px', padding: '0.5rem', borderRadius: '4px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--primary)', color: '#fff' }} />
                      <input type="date" name="date" defaultValue={s.date_played} required style={{ flex: 1, minWidth: '130px', padding: '0.5rem', borderRadius: '4px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--primary)', color: '#fff' }} />
                      <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>Save</button>
                      <Link href="/dashboard" className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>Cancel</Link>
                    </form>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontWeight: 600, color: 'var(--primary)', marginRight: '1rem' }}>{s.score} pts</span>
                        <span style={{ color: '#a1a1aa', fontSize: '0.875rem' }}>{new Date(s.date_played).toLocaleDateString()}</span>
                      </div>
                      {isSubscribed && (
                        <Link href={`/dashboard?edit=${s.id}`} style={{ fontSize: '0.875rem', color: '#a1a1aa', textDecoration: 'underline' }}>Edit</Link>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        {/* Charity Preferences */}
        <section className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Charity Impact</h2>
          {params?.updated === 'charity' && (
            <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', border: '1px solid rgba(16, 185, 129, 0.2)', fontSize: '0.875rem' }}>
              ✓ Charity routing preferences securely saved!
            </div>
          )}
          <form action={updateCharityPreferences} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#a1a1aa' }}>Selected Charity</label>
              <select name="charityId" defaultValue={profile?.charity_id || 'none'} style={{ width: '100%', padding: '0.875rem', borderRadius: 'var(--radius-md)', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', color: 'var(--foreground)' }}>
                <option value="none">Choose a charity</option>
                {charities?.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#a1a1aa' }}>Contribution Percentage (%) - Min 10%</label>
              <input type="number" name="percentage" min="10" max="100" step="0.5" defaultValue={currentPercentage} style={{ width: '100%', padding: '0.875rem', borderRadius: 'var(--radius-md)', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
            </div>
            <button type="submit" className="btn btn-secondary">Save Preferences</button>
          </form>
        </section>

        {/* Participation Summary */}
        <section className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Draw Participation</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
               <span style={{ color: '#a1a1aa' }}>Upcoming Draw</span>
               <span style={{ fontWeight: 600, color: 'var(--primary)' }}>End of {new Date().toLocaleString('default', { month: 'long' })}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
               <span style={{ color: '#a1a1aa' }}>Eligibility Status</span>
               {isSubscribed && (scores?.length || 0) >= 5 ? (
                 <span style={{ fontWeight: 600, color: 'var(--accent)' }}>Eligible (5/5 scores logs)</span>
               ) : (
                 <span style={{ fontWeight: 600, color: '#ef4444' }}>Not Eligible (Action Required)</span>
               )}
            </div>
            <p style={{ fontSize: '0.875rem', color: '#a1a1aa', marginTop: '0.5rem' }}>
              To participate in upcoming monthly draws, you must maintain an active subscription and have at least 5 scores logged.
            </p>
          </div>
        </section>

        {/* Winnings Overview */}
        <section className="glass-panel" style={{ padding: '2rem', borderTop: '4px solid #eab308' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Prize Winnings</h2>
          <p style={{ fontSize: '0.875rem', color: '#a1a1aa', marginBottom: '1.5rem' }}>When Admin draws occur, your scores are evaluated for matches. Win cash prizes automatically!</p>
          
          <div style={{ marginBottom: '1.5rem', padding: '1.5rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
            <div style={{ fontSize: '0.875rem', color: '#eab308', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Paid Out</div>
            <div style={{ fontSize: '3rem', fontWeight: 700, lineHeight: 1, color: '#eab308' }}>${totalWon.toFixed(2)}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Recent Draws</h3>
            {winnings?.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '1rem', color: '#a1a1aa', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)' }}>No winning matches yet. Keep playing!</p>
            ) : (
              winnings?.map(w => (
                <div key={w.id} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{w.match_type}</div>
                      <div style={{ fontSize: '0.75rem', color: w.status === 'paid' ? 'var(--accent)' : (w.status === 'rejected' ? '#ef4444' : '#a1a1aa'), textTransform: 'uppercase' }}>{w.status}</div>
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--primary)' }}>${Number(w.prize_amount).toFixed(2)}</div>
                  </div>

                  {w.status === 'pending' && !w.proof_url && (
                    <form action={submitWinningProof} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                      <input type="hidden" name="winningId" value={w.id} />
                      <input type="file" name="proofFile" accept="image/*" required style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border)', color: '#fff', fontSize: '0.875rem' }} />
                      <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', color: '#000' }}>Upload Proof</button>
                    </form>
                  )}
                  {w.status === 'pending' && w.proof_url && (
                    <div style={{ fontSize: '0.875rem', color: 'var(--primary)', marginTop: '0.5rem', padding: '0.5rem', background: 'rgba(251, 191, 36, 0.1)', borderRadius: '4px' }}>
                      ✓ Proof submitted. Awaiting admin review.
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

      </main>
    </div>
  )
}
