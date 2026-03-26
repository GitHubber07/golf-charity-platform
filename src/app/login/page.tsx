import { login, signup } from './actions'
import Link from 'next/link'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; mode?: string }>
}) {
  const params = await searchParams;
  const isSignup = params?.mode === 'signup';

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyItems: 'center', padding: '4rem 1.5rem', minHeight: '100vh', justifyContent: 'center' }}>
      
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <Link href="/" style={{ fontSize: '1.5rem', fontWeight: '700', letterSpacing: '-0.02em', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--primary)' }}></div>
          ImpactGolf
        </Link>
      </div>

      <form className="glass-panel animate-fade-in delay-1" style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '400px', gap: '1.5rem', padding: '2.5rem' }}>
        <h2 style={{ fontSize: '1.75rem', textAlign: 'center', marginBottom: '0.5rem' }}>
          {isSignup ? 'Create an Account' : 'Welcome Back'}
        </h2>
        <p style={{ textAlign: 'center', color: '#a1a1aa', fontSize: '0.875rem', marginTop: '-1rem' }}>
          {isSignup ? 'Join ImpactGolf to start making a difference.' : 'Enter your credentials to access your dashboard.'}
        </p>
        
        {params?.message && (
          <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}>
            {params.message}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label htmlFor="email" style={{ fontSize: '0.875rem', fontWeight: 500, color: '#a1a1aa' }}>Email Address</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            style={{ padding: '0.875rem', borderRadius: 'var(--radius-md)', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', color: 'var(--foreground)', fontSize: '1rem' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label htmlFor="password" style={{ fontSize: '0.875rem', fontWeight: 500, color: '#a1a1aa' }}>Password</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            style={{ padding: '0.875rem', borderRadius: 'var(--radius-md)', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', color: 'var(--foreground)', fontSize: '1rem' }}
          />
        </div>

        <div style={{ marginTop: '1rem' }}>
          {isSignup ? (
            <button formAction={signup} className="btn btn-secondary" style={{ width: '100%' }}>
              Create Account
            </button>
          ) : (
            <button formAction={login} className="btn btn-primary" style={{ width: '100%' }}>
              Log In
            </button>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          {isSignup ? (
            <Link href="/login" style={{ color: 'var(--accent)', fontSize: '0.875rem', textDecoration: 'underline' }}>
              Already have an account? Log in here
            </Link>
          ) : (
            <Link href="/login?mode=signup" style={{ color: 'var(--accent)', fontSize: '0.875rem', textDecoration: 'underline' }}>
              Don't have an account? Sign up here
            </Link>
          )}
        </div>
      </form>
    </div>
  )
}
