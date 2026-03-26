import { createClient } from '@/utils/supabase/server'
import { supabaseAdmin } from '@/utils/supabase/admin'
import Link from 'next/link'
import { adminUpdateUserSub, adminUpdateUserScore } from '../actions'
import { redirect } from 'next/navigation'

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const params = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  // Fetch all profiles
  const { data: profiles } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  // Fetch all scores
  const { data: allScores } = await supabaseAdmin
    .from('scores')
    .select('*')
    .order('date_played', { ascending: false })

  // Group scores by user
  const scoresMap = new Map()
  allScores?.forEach(score => {
    if (!scoresMap.has(score.user_id)) {
      scoresMap.set(score.user_id, [])
    }
    if (scoresMap.get(score.user_id).length < 5) {
      scoresMap.get(score.user_id).push(score)
    }
  })

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="container" style={{ padding: '2rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/admin" style={{ fontSize: '1.5rem', fontWeight: '700', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444' }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444' }}></div>
          Admin: User Management
        </Link>
        <nav style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link href="/admin" className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>Back to Admin</Link>
        </nav>
      </header>

      <main className="container animate-fade-in delay-1" style={{ padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {params?.msg === 'success' && (
          <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            ✓ Update successful.
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {profiles?.map(p => {
            const userScores = scoresMap.get(p.id) || []
            
            return (
              <div key={p.id} className="glass-panel" style={{ padding: '2rem', display: 'grid', gridTemplateColumns: 'minmax(250px, 1fr) 2fr', gap: '2rem' }}>
                
                {/* User Info Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', borderRight: '1px solid var(--border)', paddingRight: '2rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, wordBreak: 'break-all' }}>{p.email}</h3>
                    <p style={{ color: '#a1a1aa', fontSize: '0.875rem' }}>ID: {p.id.split('-')[0]}...</p>
                  </div>
                  
                  <form action={adminUpdateUserSub} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <input type="hidden" name="userId" value={p.id} />
                    <label style={{ fontSize: '0.875rem', color: '#a1a1aa' }}>Subscription Status</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <select name="subscription_status" defaultValue={p.subscription_status} style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', color: 'var(--foreground)' }}>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                      <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem' }}>Update</button>
                    </div>
                  </form>
                </div>
                
                {/* Scores Column */}
                <div>
                  <h4 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#e4e4e7' }}>Recent Scores (Max 5)</h4>
                  {userScores.length === 0 ? (
                    <p style={{ color: '#a1a1aa', fontSize: '0.875rem' }}>No scores found.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {userScores.map((score: any) => (
                        <div key={score.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', background: 'rgba(0,0,0,0.3)', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)' }}>
                          {params?.editScore === score.id ? (
                            <form action={adminUpdateUserScore} style={{ display: 'flex', gap: '1rem', flex: 1 }}>
                              <input type="hidden" name="scoreId" value={score.id} />
                              <input type="number" name="score" min="1" max="45" defaultValue={score.score} style={{ flex: 1, maxWidth: '100px', padding: '0.5rem', borderRadius: '4px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--primary)', color: '#fff' }} />
                              <div style={{ flex: 1, padding: '0.5rem', color: '#a1a1aa', display: 'flex', alignItems: 'center' }}>
                                {new Date(score.date_played).toLocaleDateString()}
                              </div>
                              <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>Save</button>
                              <Link href="/admin/users" className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>Cancel</Link>
                            </form>
                          ) : (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                              <div>
                                <span style={{ fontWeight: 600, color: 'var(--primary)', marginRight: '1rem' }}>{score.score} pts</span>
                                <span style={{ color: '#a1a1aa', fontSize: '0.875rem' }}>{new Date(score.date_played).toLocaleDateString()}</span>
                              </div>
                              <Link href={`/admin/users?editScore=${score.id}`} style={{ fontSize: '0.875rem', color: '#a1a1aa', textDecoration: 'underline' }}>Edit</Link>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )
          })}
          {profiles?.length === 0 && (
            <p style={{ color: '#a1a1aa', textAlign: 'center' }}>No users found.</p>
          )}
        </div>
      </main>
    </div>
  )
}
