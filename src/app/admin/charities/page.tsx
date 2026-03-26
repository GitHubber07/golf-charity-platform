import { createClient } from '@/utils/supabase/server'
import { supabaseAdmin } from '@/utils/supabase/admin'
import Link from 'next/link'
import { createCharity, updateCharity, deleteCharity } from '../actions'
import { redirect } from 'next/navigation'

export default async function AdminCharitiesPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const params = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: charities } = await supabaseAdmin.from('charities').select('*').order('name', { ascending: true })

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="container" style={{ padding: '2rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/admin" style={{ fontSize: '1.5rem', fontWeight: '700', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444' }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444' }}></div>
          Admin: Charities
        </Link>
        <nav style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link href="/admin" className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>Back to Admin</Link>
        </nav>
      </header>

      <main className="container animate-fade-in delay-1" style={{ padding: '2rem 1.5rem', display: 'grid', gridTemplateColumns: 'minmax(300px, 350px) 1fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* Create/Edit Form */}
        <section className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>
            {params?.edit ? 'Edit Charity' : 'Add New Charity'}
          </h2>
          {params?.msg === 'success' && (
            <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
              ✓ Operation successful.
            </div>
          )}

          {(() => {
            const editCharity = params?.edit ? charities?.find(c => c.id === params.edit) : null;
            return (
              <form action={params?.edit ? updateCharity : createCharity} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {params?.edit && <input type="hidden" name="id" value={params.edit} />}
                
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#a1a1aa' }}>Name</label>
                  <input type="text" name="name" required defaultValue={editCharity?.name || ''} style={{ width: '100%', padding: '0.875rem', borderRadius: 'var(--radius-md)', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#a1a1aa' }}>Description</label>
                  <textarea name="description" rows={4} defaultValue={editCharity?.description || ''} style={{ width: '100%', padding: '0.875rem', borderRadius: 'var(--radius-md)', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', color: 'var(--foreground)', resize: 'vertical' }} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="checkbox" name="is_featured" id="is_featured" defaultChecked={editCharity?.is_featured} />
                  <label htmlFor="is_featured" style={{ fontSize: '0.875rem', color: '#a1a1aa' }}>Featured Partner</label>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="checkbox" name="active" id="active" defaultChecked={editCharity ? editCharity.active : true} />
                  <label htmlFor="active" style={{ fontSize: '0.875rem', color: '#a1a1aa' }}>Active (Visible to users)</label>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{params?.edit ? 'Save Changes' : 'Create Charity'}</button>
                  {params?.edit && (
                    <Link href="/admin/charities" className="btn btn-secondary" style={{ padding: '0.75rem 1rem' }}>Cancel</Link>
                  )}
                </div>
              </form>
            );
          })()}
        </section>

        {/* Charities List */}
        <section className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Manage Charities</h2>
          
          <div style={{ display: 'grid', gap: '1rem' }}>
            {charities?.map(charity => (
              <div key={charity.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{charity.name}</h3>
                    {charity.is_featured && <span style={{ padding: '0.125rem 0.5rem', background: 'var(--primary)', color: '#000', fontSize: '0.625rem', fontWeight: 600, borderRadius: '99px' }}>FEATURED</span>}
                    {!charity.active && <span style={{ padding: '0.125rem 0.5rem', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', fontSize: '0.625rem', fontWeight: 600, borderRadius: '99px' }}>INACTIVE</span>}
                  </div>
                  <p style={{ color: '#a1a1aa', fontSize: '0.875rem', maxWidth: '600px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{charity.description || 'No description'}</p>
                </div>
                
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                  <Link href={`/admin/charities?edit=${charity.id}`} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Edit</Link>
                  <form action={deleteCharity}>
                    <input type="hidden" name="id" value={charity.id} />
                    <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', background: 'transparent', border: '1px solid rgba(239, 68, 68, 0.5)', color: '#ef4444' }}>Delete</button>
                  </form>
                </div>
              </div>
            ))}
            {charities?.length === 0 && (
              <p style={{ color: '#a1a1aa' }}>No charities found in database.</p>
            )}
          </div>
        </section>

      </main>
    </div>
  )
}
