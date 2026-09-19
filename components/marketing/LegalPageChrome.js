import Link from 'next/link'
import { OpDeskLogo } from '@/components/layout/OpDeskLogo'

export function LegalPageHeader() {
  return (
    <nav style={{ background: 'var(--navy)', padding: '0 2rem', height: '4rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Link href="/" style={{ textDecoration: 'none' }}><OpDeskLogo size={36} white /></Link>
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <Link href="/operators" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>Find Operators</Link>
        <Link href="/pricing" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>Pricing</Link>
        <Link href="/auth/login" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>Sign In</Link>
      </div>
    </nav>
  )
}

export function LegalPageFooter() {
  return (
    <footer style={{ background: '#0a1929', color: 'rgba(255,255,255,0.4)', padding: '2rem', textAlign: 'center', fontSize: '0.8125rem' }}>
      <div style={{ marginBottom: '1rem' }}><OpDeskLogo size={28} white /></div>
      <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <Link href="/privacy" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Privacy Policy</Link>
        <Link href="/paia-manual" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>PAIA Manual</Link>
        <Link href="/" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Home</Link>
      </div>
      <p style={{ margin: '0 0 0.375rem' }}>© {new Date().getFullYear()} OpDesk (Pty) Ltd. Built for Africa's operators.</p>
      <p style={{ margin: 0, fontSize: '0.6875rem', color: 'rgba(255,255,255,0.3)' }}>
        Reg. No. 2026/648649/07 · B-BBEE Level 4 Contributor
      </p>
    </footer>
  )
}
