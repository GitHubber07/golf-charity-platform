'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const plan = searchParams.get('plan') || 'monthly'
  const isYearly = plan === 'yearly'
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvc, setCvc] = useState('')

  const handleCardNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '')
    val = val.replace(/(\d{4})(?=\d)/g, '$1 ')
    setCardNumber(val.substring(0, 19))
  }

  const handleExpiry = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '')
    if (val.length >= 3) {
      val = val.substring(0, 2) + '/' + val.substring(2, 4)
    }
    setExpiry(val.substring(0, 5))
  }

  const handleCvc = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '')
    setCvc(val.substring(0, 4))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (cardNumber.length < 19 || expiry.length < 5 || cvc.length < 3) {
        throw new Error('Please fill out all card details properly')
      }

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: isYearly ? 'annual' : 'monthly' })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Payment processing failed')
      }

      // Success, redirect to dashboard
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '3rem 2rem' }}>
        
        <Link href="/subscribe" style={{ display: 'inline-block', marginBottom: '2rem', color: '#a1a1aa', fontSize: '0.875rem' }}>
          ← Back to Plans
        </Link>
        
        <h1 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '0.5rem' }}>Secure Checkout</h1>
        <p style={{ color: '#a1a1aa', marginBottom: '2rem' }}>PCI-Compliant Payment Simulation</p>

        <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-md)', marginBottom: '2rem', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span>{isYearly ? 'Annual Impact Plan' : 'Monthly Impact Plan'}</span>
            <span style={{ fontWeight: 600 }}>{isYearly ? '$150.00' : '$15.00'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a1a1aa', fontSize: '0.875rem' }}>
            <span>Billed {isYearly ? 'yearly' : 'monthly'}</span>
          </div>
        </div>

        {error && (
          <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.875rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#a1a1aa' }}>Card Information (Mock)</label>
            <input 
              type="text" 
              placeholder="0000 0000 0000 0000" 
              value={cardNumber}
              onChange={handleCardNumber}
              required 
              style={{ width: '100%', padding: '0.875rem', borderRadius: 'var(--radius-md)', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', color: 'var(--foreground)', fontFamily: 'monospace' }} 
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <input 
              type="text" 
              placeholder="MM/YY" 
              value={expiry}
              onChange={handleExpiry}
              required 
              style={{ width: '100%', padding: '0.875rem', borderRadius: 'var(--radius-md)', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', color: 'var(--foreground)' }} 
            />
            <input 
              type="text" 
              placeholder="CVC" 
              value={cvc}
              onChange={handleCvc}
              required 
              style={{ width: '100%', padding: '0.875rem', borderRadius: 'var(--radius-md)', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', color: 'var(--foreground)' }} 
            />
          </div>
          
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '1rem', marginTop: '1rem', color: '#000', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Processing...' : `Pay ${isYearly ? '$150.00' : '$15.00'}`}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.75rem', color: '#71717a' }}>
          This is a simulated assignment environment. No real funds will be charged.
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  )
}
