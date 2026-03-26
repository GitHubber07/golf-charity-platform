import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="container animate-fade-in" style={{ padding: '2rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: '700', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--primary)' }}></div>
          ImpactGolf
        </div>
        <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <Link href="/charities" className="nav-link">
            Charities
          </Link>
          <Link href="/how-it-works" className="nav-link">
            How it Works
          </Link>
          <Link href="/login" className="btn btn-secondary" style={{ padding: '0.5rem 1.25rem' }}>Log In</Link>
        </nav>
      </header>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '4rem 1.5rem' }} className="container">
        
        <div className="glass-panel animate-fade-in delay-1" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '0.5rem 1rem', borderRadius: '9999px', marginBottom: '2rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--primary)' }}>
          <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 8px var(--primary)' }}></span>
          Over $50,000 Raised for Charity This Month
        </div>

        <h1 className="animate-fade-in delay-2" style={{ fontSize: 'clamp(3rem, 8vw, 5.5rem)', letterSpacing: '-0.03em', marginBottom: '1.5rem', maxWidth: '900px', lineHeight: 1.1 }}>
          Turn Your Score Into <span style={{ background: 'linear-gradient(to right, var(--primary), #fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Real Impact</span>
        </h1>
        
        <p className="animate-fade-in delay-3" style={{ fontSize: '1.25rem', maxWidth: '600px', marginBottom: '3rem', lineHeight: 1.6 }}>
          Join the exclusive platform where every round you play supports life-changing charities and unlocks massive monthly reward pools.
        </p>
        
        <div className="animate-fade-in delay-3" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/subscribe" className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.125rem' }}>
            Start Your Journey
          </Link>
          <Link href="/charities" className="btn btn-secondary" style={{ padding: '1rem 2.5rem', fontSize: '1.125rem' }}>
            Explore Charities
          </Link>
        </div>
        
      </main>
      
      <footer style={{ padding: '2rem', textAlign: 'center', color: '#52525b', fontSize: '0.875rem' }}>
        &copy; {new Date().getFullYear()} Digital Heroes Impact Platform. All rights reserved.
      </footer>
    </div>
  );
}
