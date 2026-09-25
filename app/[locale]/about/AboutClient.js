'use client'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { BrandIcon } from '@/components/ui/BrandIcon'
import { MarketingNav } from '@/components/marketing/MarketingNav'
import { MarketingFooter } from '@/components/marketing/MarketingFooter'

const OPERATOR_TYPES = [
  { key: 'safari', icon: 'safari', slug: 'safari-lodge-software' },
  { key: 'shuttle', icon: 'shuttle', slug: 'shuttle-transfer-software' },
  { key: 'fishing', icon: 'fishing', slug: 'fishing-charter-software' },
  { key: 'yacht', icon: 'yacht', slug: 'yacht-charter-software' },
  { key: 'trail', icon: 'trailGuide', slug: 'trail-guide-software' },
  { key: 'lodge', icon: 'gameLodge', slug: 'guesthouse-hotel-software' },
  { key: 'eastAfrica', icon: 'eastAfrica', slug: 'east-africa-tour-software' },
  { key: 'islandTransfer', icon: 'islandTransfer', slug: 'island-transfer-software' },
  { key: 'logistics', icon: 'delivery', slug: 'logistics-delivery-software' },
  { key: 'riverCruise', icon: 'yacht', slug: 'river-boat-cruise-software' },
]

export default function AboutClient() {
  const t = useTranslations('About')

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      <MarketingNav />

      <section style={{ background: 'linear-gradient(135deg, var(--navy) 0%, #1a3a5c 55%, #1B8A8F 100%)', padding: '4rem 2rem', textAlign: 'center', color: 'white' }}>
        <p style={{ fontSize: '0.875rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '1rem' }}>
          {t('eyebrow')}
        </p>
        <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 'clamp(2rem, 4.5vw, 3rem)', fontWeight: 900, color: 'white', margin: '0 auto 1.25rem', maxWidth: '700px', lineHeight: 1.15 }}>
          {t('heroTitle')}
        </h1>
        <p style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,0.75)', maxWidth: '620px', margin: '0 auto', lineHeight: 1.6 }}>
          {t('heroSubtitle')}
        </p>
      </section>

      <section style={{ padding: '4rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.5rem', color: 'var(--navy)', marginBottom: '1rem' }}>{t('whyHeading')}</h2>
        <p style={{ color: 'var(--gray-500)', lineHeight: 1.8, marginBottom: '1rem' }}>{t('why1')}</p>
        <p style={{ color: 'var(--gray-500)', lineHeight: 1.8, marginBottom: '1rem' }}>{t('why2')}</p>
        <p style={{ color: 'var(--gray-500)', lineHeight: 1.8 }}>{t('why3')}</p>
      </section>

      <section style={{ background: 'var(--cream)', padding: '3.5rem 2rem', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.5rem', color: 'var(--navy)', marginBottom: '0.5rem' }}>{t('whoHeading')}</h2>
        <p style={{ color: 'var(--gray-500)', marginBottom: '2.5rem' }}>{t('whoSubheading')}</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', maxWidth: '900px', margin: '0 auto' }}>
          {OPERATOR_TYPES.map(o => (
            <Link key={o.key} href={`/features/${o.slug}`} className="card card-shadow"
              style={{ background: 'white', textDecoration: 'none', display: 'block', transition: 'transform 0.15s' }}
              onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.625rem' }}><BrandIcon name={o.icon} size={40} /></div>
              <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--navy)', lineHeight: 1.3 }}>{t(`operatorTypes.${o.key}`)}</p>
            </Link>
          ))}
        </div>
      </section>

      <section style={{ background: 'var(--navy)', padding: '4rem 2rem', textAlign: 'center', color: 'white' }}>
        <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '2rem', color: 'white', marginBottom: '0.75rem' }}>{t('ctaHeading')}</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '2rem', fontSize: '1rem' }}>{t('ctaSubheading')}</p>
        <Link href="/auth/signup" className="btn btn-primary btn-xl">{t('startFree')} <BrandIcon name="arrowRight" size={14} style={{ display:'inline-block' }} /></Link>
      </section>

      <MarketingFooter />
    </div>
  )
}
