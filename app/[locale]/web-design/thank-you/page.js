import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { MarketingNav } from '@/components/marketing/MarketingNav'
import { MarketingFooter } from '@/components/marketing/MarketingFooter'
import { Check } from 'lucide-react'

export const metadata = { title: 'Payment Received — RollingRover Productions' }

export default async function ThankYouPage() {
  const t = await getTranslations('WebDesignThankYou')

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      <MarketingNav />
      <section style={{ padding: '5rem 2rem', maxWidth: '520px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
          <div style={{ background: 'var(--cream)', borderRadius: '50%', padding: '1rem' }}>
            <Check size={36} color="var(--teal)" />
          </div>
        </div>
        <h1 style={{ color: 'var(--navy)', fontFamily: 'Montserrat, sans-serif', marginBottom: '0.75rem' }}>{t('title')}</h1>
        <p style={{ color: 'var(--gray-500)', marginBottom: '2rem' }}>
          {t('body')}
        </p>
        <Link href="/" className="btn btn-primary">{t('backHome')}</Link>
      </section>
      <MarketingFooter />
    </div>
  )
}
