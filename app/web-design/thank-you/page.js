import Link from 'next/link'
import { MarketingNav } from '@/components/marketing/MarketingNav'
import { MarketingFooter } from '@/components/marketing/MarketingFooter'
import { Check } from 'lucide-react'

export const metadata = { title: 'Payment Received — RollingRover Web Services' }

export default function ThankYouPage() {
  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      <MarketingNav />
      <section style={{ padding: '5rem 2rem', maxWidth: '520px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
          <div style={{ background: 'var(--cream)', borderRadius: '50%', padding: '1rem' }}>
            <Check size={36} color="var(--teal)" />
          </div>
        </div>
        <h1 style={{ color: 'var(--navy)', fontFamily: 'Montserrat, sans-serif', marginBottom: '0.75rem' }}>Payment received</h1>
        <p style={{ color: 'var(--gray-500)', marginBottom: '2rem' }}>
          Thanks — we've got your payment and will be in touch shortly to kick off your project.
        </p>
        <Link href="/" className="btn btn-primary">Back to Home</Link>
      </section>
      <MarketingFooter />
    </div>
  )
}
