import Link from 'next/link'

export const metadata = {
  title: 'Page Not Found — OpDesk',
  robots: { index: false, follow: true },
}

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: 'var(--navy, #0F2540)', color: 'white', textAlign: 'center', padding: '2rem', fontFamily: 'Inter, sans-serif',
    }}>
      <p style={{ fontSize: '0.875rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold, #D4A853)', marginBottom: '1rem' }}>
        404
      </p>
      <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 900, margin: '0 0 0.75rem' }}>
        We couldn't find that page
      </h1>
      <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: '480px', marginBottom: '2rem', lineHeight: 1.6 }}>
        The page you're looking for may have moved or no longer exists. Here are some places to go instead.
      </p>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link href="/" className="btn btn-primary btn-xl">Go Home</Link>
        <Link href="/features" className="btn btn-outline btn-xl" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.4)' }}>
          See Features
        </Link>
        <Link href="/pricing" className="btn btn-outline btn-xl" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.4)' }}>
          Pricing
        </Link>
      </div>
    </div>
  )
}
