import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

export const revalidate = 60 // Revalidate every minute

export default async function CharitiesPage() {
  const supabase = await createClient()

  const { data: charities } = await supabase
    .from('charities')
    .select('*')
    .eq('active', true)
    .order('is_featured', { ascending: false })
    .order('name', { ascending: true })

  // Ensure there are some fallback mock charities just in case DB is empty for the assignment demonstration
  const displayCharities = charities?.length ? charities : [
    {
      id: 'mock-1',
      name: 'Global Clean Water Initiative',
      description: 'Providing clean and safe drinking water to developing communities through sustainable infrastructure.',
      is_featured: true,
    },
    {
      id: 'mock-2',
      name: 'Youth Golf Education Fund',
      description: 'Helping underprivileged youth access golf equipment, lessons, and mentorship programs to build character.',
      is_featured: false,
    },
    {
      id: 'mock-3',
      name: 'Wildlife Preservation Trust',
      description: 'Protecting endangered species and restoring critical natural habitats around the globe.',
      is_featured: false,
    }
  ]

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="container" style={{ padding: '2rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ fontSize: '1.5rem', fontWeight: '700', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--primary)' }}></div>
          ImpactGolf
        </Link>
        <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <Link href="/dashboard" className="btn btn-secondary" style={{ padding: '0.5rem 1.25rem' }}>Dashboard</Link>
        </nav>
      </header>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem 1.5rem' }} className="container">
        
        <div style={{ textAlign: 'center', marginBottom: '4rem', maxWidth: '800px' }}>
          <h1 className="animate-fade-in" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', letterSpacing: '-0.03em', marginBottom: '1.5rem' }}>
            Drive <span style={{ color: 'var(--primary)' }}>Real Change</span>
          </h1>
          <p className="animate-fade-in delay-1" style={{ fontSize: '1.25rem', color: '#a1a1aa', lineHeight: 1.6 }}>
            Every subscription on ImpactGolf contributes at least 10% directly to the charity of your choice. Explore our partnered organizations below.
          </p>
        </div>

        <div className="animate-fade-in delay-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', width: '100%' }}>
          {displayCharities.map((charity) => (
            <div key={charity.id} className="glass-panel" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
              {charity.is_featured && (
                <div style={{ position: 'absolute', top: 0, right: 0, padding: '0.25rem 1rem', background: 'var(--primary)', color: '#000', fontSize: '0.75rem', fontWeight: 600, borderBottomLeftRadius: 'var(--radius-md)' }}>
                  FEATURED
                </div>
              )}
              
              <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'rgba(251, 191, 36, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', border: '1px solid rgba(251, 191, 36, 0.2)' }}>
                {/* Placeholder icon */}
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--primary)' }}></div>
              </div>
              
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', lineHeight: 1.3 }}>{charity.name}</h2>
              <p style={{ color: '#a1a1aa', fontSize: '1rem', lineHeight: 1.6, flex: 1, marginBottom: '2rem' }}>
                {charity.description || 'Dedicated to making a positive impact in the world through community-driven initiatives.'}
              </p>
              
              <Link href="/subscribe" className="btn btn-secondary" style={{ textAlign: 'center', width: '100%', padding: '0.75rem' }}>
                Support via Subscription
              </Link>
            </div>
          ))}
        </div>

      </main>
    </div>
  )
}
