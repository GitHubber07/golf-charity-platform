import Link from 'next/link'

export default function SubscribePage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="container animate-fade-in" style={{ padding: '2rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ fontSize: '1.5rem', fontWeight: '700', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--primary)' }}></div>
          ImpactGolf
        </Link>
        <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <Link href="/dashboard" className="btn btn-secondary" style={{ padding: '0.5rem 1.25rem' }}>Dashboard</Link>
        </nav>
      </header>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem 1.5rem' }} className="container">
        <h1 className="animate-fade-in delay-1" style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', letterSpacing: '-0.03em', marginBottom: '1rem', textAlign: 'center' }}>
          Join the <span style={{ color: 'var(--primary)' }}>Movement</span>
        </h1>
        <p className="animate-fade-in delay-2" style={{ fontSize: '1.25rem', color: '#a1a1aa', textAlign: 'center', maxWidth: '600px', marginBottom: '4rem' }}>
          Subscribe to enter the monthly prize draws and support meaningful causes with every round you play.
        </p>

        <div className="animate-fade-in delay-3" style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'center', width: '100%', maxWidth: '900px' }}>
          
          {/* Monthly Plan */}
          <div className="glass-panel" style={{ flex: '1 1 350px', padding: '3rem 2rem', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>Monthly Impact Plan</h2>
            <div style={{ fontSize: '3rem', fontWeight: 700, marginBottom: '1.5rem' }}>$15<span style={{ fontSize: '1.25rem', color: '#a1a1aa', fontWeight: 400 }}>/mo</span></div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2.5rem 0', display: 'flex', flexDirection: 'column', gap: '1rem', color: '#e4e4e7', flex: 1 }}>
              <li style={{ display: 'flex', gap: '0.75rem', alignItems: 'start' }}>
                <span style={{ color: 'var(--primary)' }}>✓</span> Entry into all 5/4/3 Match Monthly Draws
              </li>
              <li style={{ display: 'flex', gap: '0.75rem', alignItems: 'start' }}>
                <span style={{ color: 'var(--primary)' }}>✓</span> Up to 5 rolling scores tracked
              </li>
              <li style={{ display: 'flex', gap: '0.75rem', alignItems: 'start' }}>
                <span style={{ color: 'var(--primary)' }}>✓</span> Mandatory 10% minimum charity contribution
              </li>
            </ul>
            <Link href="/checkout?plan=monthly" className="btn btn-secondary" style={{ width: '100%', textAlign: 'center', padding: '1rem' }}>
              Select Monthly
            </Link>
          </div>

          {/* Yearly Plan */}
          <div className="glass-panel" style={{ flex: '1 1 350px', padding: '3rem 2rem', display: 'flex', flexDirection: 'column', position: 'relative', border: '1px solid var(--primary)' }}>
            <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'var(--primary)', color: '#000', padding: '0.25rem 1rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 600 }}>BEST VALUE</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>Annual Impact Plan</h2>
            <div style={{ fontSize: '3rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--primary)' }}>$150<span style={{ fontSize: '1.25rem', color: '#a1a1aa', fontWeight: 400 }}>/yr</span></div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2.5rem 0', display: 'flex', flexDirection: 'column', gap: '1rem', color: '#e4e4e7', flex: 1 }}>
              <li style={{ display: 'flex', gap: '0.75rem', alignItems: 'start' }}>
                <span style={{ color: 'var(--primary)' }}>✓</span> Entry into all 5/4/3 Match Monthly Draws
              </li>
              <li style={{ display: 'flex', gap: '0.75rem', alignItems: 'start' }}>
                <span style={{ color: 'var(--primary)' }}>✓</span> Up to 5 rolling scores tracked
              </li>
              <li style={{ display: 'flex', gap: '0.75rem', alignItems: 'start' }}>
                <span style={{ color: 'var(--primary)' }}>✓</span> Mandatory 10% minimum charity contribution
              </li>
              <li style={{ display: 'flex', gap: '0.75rem', alignItems: 'start' }}>
                <span style={{ color: 'var(--primary)' }}>✓</span> <strong>Save $30 annually</strong> (2 months free)
              </li>
            </ul>
            <Link href="/checkout?plan=yearly" className="btn btn-primary" style={{ width: '100%', textAlign: 'center', padding: '1rem', color: '#000' }}>
              Select Annual
            </Link>
          </div>

        </div>
      </main>
    </div>
  )
}
