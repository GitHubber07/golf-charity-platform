import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

export const revalidate = 60 // Revalidate every minute

export default async function CharitiesPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const params = await searchParams
  const q = params?.q || ''
  const sort = params?.sort || 'featured'

  const supabase = await createClient()

  let query = supabase
    .from('charities')
    .select('*')
    .eq('active', true)

  if (q) {
    query = query.ilike('name', `%${q}%`)
  }

  if (sort === 'az') {
    query = query.order('name', { ascending: true })
  } else if (sort === 'za') {
    query = query.order('name', { ascending: false })
  } else {
    query = query.order('is_featured', { ascending: false }).order('name', { ascending: true })
  }

  const { data: charities } = await query

  const mockCharities = [
    { id: 'mock-1', name: 'Global Clean Water Initiative', description: 'Providing clean and safe drinking water to developing communities through sustainable infrastructure.', is_featured: true },
    { id: 'mock-2', name: 'Youth Golf Education Fund', description: 'Helping underprivileged youth access golf equipment, lessons, and mentorship programs to build character.', is_featured: false },
    { id: 'mock-3', name: 'Wildlife Preservation Trust', description: 'Protecting endangered species and restoring critical natural habitats around the globe.', is_featured: false }
  ]

  let displayCharities = charities?.length ? charities : mockCharities

  if (!charities?.length) {
    const qLower = q.toLowerCase()
    if (q) displayCharities = displayCharities.filter((c: any) => c.name.toLowerCase().includes(qLower))
    if (sort === 'az') displayCharities.sort((a: any, b: any) => a.name.localeCompare(b.name))
    if (sort === 'za') displayCharities.sort((a: any, b: any) => b.name.localeCompare(a.name))
  }

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

        {/* Search & Filter Bar */}
        <form className="animate-fade-in delay-1" method="GET" action="/charities" style={{ display: 'flex', gap: '1rem', width: '100%', maxWidth: '800px', marginBottom: '3rem', flexWrap: 'wrap' }}>
          <input type="text" name="q" placeholder="Search charities..." defaultValue={q} style={{ flex: 1, minWidth: '200px', padding: '1rem', borderRadius: 'var(--radius-md)', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
          <select name="sort" defaultValue={sort} style={{ padding: '1rem', borderRadius: 'var(--radius-md)', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', color: 'var(--foreground)' }}>
            <option value="featured">Featured First</option>
            <option value="az">A-Z Name</option>
            <option value="za">Z-A Name</option>
          </select>
          <button type="submit" className="btn btn-primary" style={{ padding: '0 2rem' }}>Filter</button>
        </form>

        <div className="animate-fade-in delay-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', width: '100%' }}>
          {displayCharities.map((charity: any) => (
            <Link href={`/charities/${charity.id}`} key={charity.id} className="glass-panel" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', textDecoration: 'none', color: 'inherit', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02) translateY(-4px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1) translateY(0)'}>
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
              
              <div className="btn btn-secondary" style={{ textAlign: 'center', width: '100%', padding: '0.75rem' }}>
                View Profile & Support
              </div>
            </Link>
          ))}
        </div>

      </main>
    </div>
  )
}
