import { createClient } from '@/utils/supabase/server'
import { supabaseAdmin } from '@/utils/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { runDraw, updateWinningStatus } from './actions'
import { signOut } from '@/app/dashboard/actions'

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Authenticate user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Check admin role
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  // Fetch Admin Stats using supabaseAdmin to bypass RLS limits
  const { count: userCount } = await supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true })
  const { count: subCount } = await supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).eq('subscription_status', 'active')
  
  const { data: draws } = await supabaseAdmin.from('draws').select('*').order('created_at', { ascending: false }).limit(10)

  // Fetch Pending Winnings with Proofs
  const { data: pendingWinnings } = await supabaseAdmin
    .from('winnings')
    .select('*, profiles(email)')
    .eq('status', 'pending')
    .not('proof_url', 'is', null)
    .order('created_at', { ascending: false })
  
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="container" style={{ padding: '2rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ fontSize: '1.5rem', fontWeight: '700', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444' }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444' }}></div>
          Admin Control
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/dashboard" className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>User View</Link>
          <form action={signOut}>
            <button className="btn btn-primary" style={{ padding: '0.5rem 1rem', background: '#eab308', color: '#000', border: 'none' }}>Sign Out</button>
          </form>
        </div>
      </header>

      <main className="container animate-fade-in delay-1" style={{ padding: '2rem 1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', alignItems: 'start' }}>
        
        {/* KPI Panel */}
        <section className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Platform Stats</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.875rem', color: '#a1a1aa', marginBottom: '0.5rem' }}>Total Users</div>
              <div style={{ fontSize: '2rem', fontWeight: 700 }}>{userCount || 0}</div>
            </div>
            <div style={{ padding: '1.5rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--accent)', marginBottom: '0.5rem' }}>Active Subs</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent)' }}>{subCount || 0}</div>
            </div>
          </div>
        </section>

        {/* Draw Engine Control */}
        <section className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Draw Engine Control</h2>
          <form action={runDraw} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#a1a1aa' }}>Execution Mode</label>
              <select name="mode" style={{ width: '100%', padding: '0.875rem', borderRadius: 'var(--radius-md)', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', color: 'var(--foreground)' }}>
                <option value="simulation">Simulation (Test Run)</option>
                <option value="publish">Official Publish</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#a1a1aa' }}>Number Generation Logic</label>
              <select name="logic" style={{ width: '100%', padding: '0.875rem', borderRadius: 'var(--radius-md)', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', color: 'var(--foreground)' }}>
                <option value="random">Standard Random</option>
                <option value="algorithmic">Algorithmic (Score-Weighted)</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary" style={{ background: '#ef4444', color: '#fff', boxShadow: 'none' }}>
              Execute Draw Engine
            </button>
          </form>
        </section>

        {/* Draw History */}
        <section className="glass-panel" style={{ padding: '2rem', gridColumn: '1 / -1' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Draw History</h2>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '1rem 0.5rem', color: '#a1a1aa', fontWeight: 500 }}>Month</th>
                  <th style={{ padding: '1rem 0.5rem', color: '#a1a1aa', fontWeight: 500 }}>Status</th>
                  <th style={{ padding: '1rem 0.5rem', color: '#a1a1aa', fontWeight: 500 }}>Numbers</th>
                  <th style={{ padding: '1rem 0.5rem', color: '#a1a1aa', fontWeight: 500 }}>Total Pool ($)</th>
                  <th style={{ padding: '1rem 0.5rem', color: '#a1a1aa', fontWeight: 500 }}>Jackpot Carry ($)</th>
                </tr>
              </thead>
              <tbody>
                {draws?.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: '1rem', textAlign: 'center', color: '#a1a1aa' }}>No draws executed yet.</td></tr>
                ) : (
                  draws?.map(d => (
                    <tr key={d.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '1rem 0.5rem' }}>{d.month_year}</td>
                      <td style={{ padding: '1rem 0.5rem' }}>
                        <span style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', background: d.status === 'simulation' ? 'rgba(255,255,255,0.1)' : 'rgba(245, 158, 11, 0.2)', color: d.status === 'simulation' ? '#a1a1aa' : 'var(--primary)' }}>
                          {d.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 0.5rem', letterSpacing: '2px', fontWeight: 500 }}>{d.winning_numbers?.join(' - ')}</td>
                      <td style={{ padding: '1rem 0.5rem' }}>{Number(d.total_pool).toFixed(2)}</td>
                      <td style={{ padding: '1rem 0.5rem' }}>{Number(d.jackpot_carryover).toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Verification Queue */}
        <section className="glass-panel" style={{ padding: '2rem', gridColumn: '1 / -1' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Winner Verification Queue</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {(!pendingWinnings || pendingWinnings.length === 0) ? (
              <p style={{ color: '#a1a1aa' }}>No pending proofs to review.</p>
            ) : (
              pendingWinnings.map((w: any) => (
                <div key={w.id} style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.875rem', color: '#a1a1aa', marginBottom: '0.5rem' }}>User: {w.profiles?.email}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div style={{ fontWeight: 600 }}>{w.match_type}</div>
                    <div style={{ fontWeight: 700, color: 'var(--primary)' }}>${Number(w.prize_amount).toFixed(2)}</div>
                  </div>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <a href={w.proof_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontSize: '0.875rem', textDecoration: 'underline' }}>View Submitted Proof ↗</a>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <form action={updateWinningStatus} style={{ flex: 1 }}>
                      <input type="hidden" name="winningId" value={w.id} />
                      <input type="hidden" name="status" value="paid" />
                      <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.5rem', color: '#000', fontSize: '0.875rem' }}>Approve</button>
                    </form>
                    <form action={updateWinningStatus} style={{ flex: 1 }}>
                      <input type="hidden" name="winningId" value={w.id} />
                      <input type="hidden" name="status" value="rejected" />
                      <button type="submit" className="btn btn-secondary" style={{ width: '100%', padding: '0.5rem', fontSize: '0.875rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}>Reject</button>
                    </form>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

      </main>
    </div>
  )
}
