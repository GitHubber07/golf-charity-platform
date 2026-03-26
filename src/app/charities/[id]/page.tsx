import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const revalidate = 60

export default async function CharityProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // First check if it's our mock data
  const isMock = id.startsWith('mock-')
  
  let charity: any = null

  if (isMock) {
    const mocks = [
      { id: 'mock-1', name: 'Global Clean Water Initiative', description: 'Providing clean and safe drinking water to developing communities through sustainable infrastructure.', is_featured: true },
      { id: 'mock-2', name: 'Youth Golf Education Fund', description: 'Helping underprivileged youth access golf equipment, lessons, and mentorship programs to build character.', is_featured: false },
      { id: 'mock-3', name: 'Wildlife Preservation Trust', description: 'Protecting endangered species and restoring critical natural habitats around the globe.', is_featured: false }
    ]
    charity = mocks.find(m => m.id === id)
  } else {
    const { data } = await supabase.from('charities').select('*').eq('id', id).single()
    charity = data
  }

  if (!charity) {
    notFound()
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="container" style={{ padding: '2rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ fontSize: '1.5rem', fontWeight: '700', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--primary)' }}></div>
          ImpactGolf
        </Link>
        <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <Link href="/charities" className="btn btn-secondary" style={{ padding: '0.5rem 1.25rem' }}>Full Directory</Link>
        </nav>
      </header>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '4rem 1.5rem', maxWidth: '1000px', width: '100%', margin: '0 auto' }} className="container">
        <Link href="/charities" style={{ color: '#a1a1aa', textDecoration: 'none', marginBottom: '2rem', display: 'inline-block' }}>
          &larr; Back to Directory
        </Link>
        
        <div style={{ display: 'flex', gap: '4rem', flexWrap: 'wrap' }}>
          
          {/* Main Content */}
          <div style={{ flex: '1 1 500px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ width: 80, height: 80, borderRadius: '16px', background: 'rgba(251, 191, 36, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(251, 191, 36, 0.2)' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--primary)' }}></div>
              </div>
              <div>
                <h1 className="animate-fade-in" style={{ fontSize: '2.5rem', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
                  {charity.name}
                </h1>
                {charity.is_featured && (
                  <span style={{ padding: '0.25rem 0.75rem', background: 'var(--primary)', color: '#000', fontSize: '0.75rem', fontWeight: 600, borderRadius: '99px' }}>FEATURED PARTNER</span>
                )}
              </div>
            </div>
            
            <p className="animate-fade-in delay-1" style={{ fontSize: '1.25rem', color: '#e4e4e7', lineHeight: 1.6, marginTop: '2rem', whiteSpace: 'pre-wrap' }}>
              {charity.description || 'Dedicated to making a positive impact in the world through community-driven initiatives.'}
            </p>

            <h3 style={{ fontSize: '1.5rem', marginTop: '3rem', marginBottom: '1rem' }}>Upcoming Events</h3>
            <div className="glass-panel" style={{ padding: '2rem', color: '#a1a1aa', textAlign: 'center' }}>
              No upcoming events scheduled at this time.
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="animate-fade-in delay-2" style={{ flex: '1 1 300px', maxWidth: '400px' }}>
            <div className="glass-panel" style={{ padding: '2.5rem', position: 'sticky', top: '2rem' }}>
               <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Support {charity.name}</h3>
               <p style={{ color: '#a1a1aa', marginBottom: '2rem', lineHeight: 1.5 }}>
                 Commit a percentage of your monthly ImpactGolf subscription to this cause effortlessly.
               </p>
               <Link href="/subscribe" className="btn btn-primary" style={{ display: 'block', textAlign: 'center', padding: '1rem', marginBottom: '1rem' }}>
                 Support via Subscription
               </Link>
               
               <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                 <p style={{ color: '#a1a1aa', fontSize: '0.875rem', marginBottom: '1rem' }}>Want to give without subscribing?</p>
                 <button className="btn btn-secondary" style={{ width: '100%', padding: '0.75rem', opacity: 0.6, cursor: 'not-allowed' }}>
                   Donate Directly (Coming Soon)
                 </button>
               </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
