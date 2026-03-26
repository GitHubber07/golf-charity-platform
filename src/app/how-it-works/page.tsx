import Link from 'next/link'

export default function HowItWorksPage() {
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
        
        <div style={{ textAlign: 'center', marginBottom: '5rem', maxWidth: '800px' }}>
          <h1 className="animate-fade-in" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', letterSpacing: '-0.03em', marginBottom: '1.5rem' }}>
            How <span style={{ color: 'var(--primary)' }}>ImpactGolf</span> Works
          </h1>
          <p className="animate-fade-in delay-1" style={{ fontSize: '1.25rem', color: '#a1a1aa', lineHeight: 1.6 }}>
            A powerful new way to track your golf performance, fund meaningful causes, and win massive rewards every single month.
          </p>
        </div>

        <div className="animate-fade-in delay-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', width: '100%', maxWidth: '1000px', marginBottom: '4rem' }}>
          
          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '1.5rem', fontWeight: 700, border: '1px solid rgba(255,255,255,0.1)' }}>
              1
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Subscribe & Support</h3>
            <p style={{ color: '#a1a1aa', fontSize: '0.875rem', lineHeight: 1.6 }}>
              Join the platform. At least 10% of your subscription goes directly to the charity of your choice. The rest funds the platform and the massive monthly prize pool.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '1.5rem', fontWeight: 700, border: '1px solid rgba(255,255,255,0.1)' }}>
              2
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Enter Your Scores</h3>
            <p style={{ color: '#a1a1aa', fontSize: '0.875rem', lineHeight: 1.6 }}>
              After playing a round, enter your Stableford score (1-45). Your 5 most recent scores become your "tickets" for the monthly draw.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(251, 191, 36, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '1.5rem', fontWeight: 700, border: '1px solid rgba(251, 191, 36, 0.2)', color: 'var(--primary)' }}>
              3
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Win the Draw</h3>
            <p style={{ color: '#a1a1aa', fontSize: '0.875rem', lineHeight: 1.6 }}>
              Every month, 5 winning numbers are generated. Match 3, 4, or 5 of your scores with the winning numbers to claim your share of the massive prize pool!
            </p>
          </div>

        </div>

        <div className="animate-fade-in delay-3" style={{ textAlign: 'center' }}>
          <Link href="/subscribe" className="btn btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.125rem' }}>
            Start Your Journey Today
          </Link>
        </div>

      </main>
    </div>
  )
}
