'use client'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { BrandIcon } from '@/components/ui/BrandIcon'
import { MarketingNav } from '@/components/marketing/MarketingNav'
import { MarketingFooter } from '@/components/marketing/MarketingFooter'

const OPERATOR_TYPE_ICONS = [
  { icon: 'safari', key: 'safari', slug: 'safari-lodge-software' },
  { icon: 'shuttle', key: 'shuttle', slug: 'shuttle-transfer-software' },
  { icon: 'fishing', key: 'fishing', slug: 'fishing-charter-software' },
  { icon: 'yacht', key: 'yacht', slug: 'yacht-charter-software' },
  { icon: 'trailGuide', key: 'trail', slug: 'trail-guide-software' },
  { icon: 'gameLodge', key: 'lodge', slug: 'guesthouse-hotel-software' },
  { icon: 'eastAfrica', key: 'eastAfrica', slug: 'east-africa-tour-software' },
  { icon: 'islandTransfer', key: 'islandTransfer', slug: 'island-transfer-software' },
  { icon: 'delivery', key: 'logistics', slug: 'logistics-delivery-software' },
]

const FEATURE_ICONS = [
  { icon: 'bookingCalendar', key: 'bookings', slug: 'bookings-calendar' },
  { icon: 'teamRoles', key: 'staff', slug: 'staff-roles' },
  { icon: 'gameLodge', key: 'lodging', slug: 'lodging-rooms' },
  { icon: 'fleet', key: 'fleet', slug: 'fleet-management' },
  { icon: 'proformaInvoice', key: 'invoices', slug: 'invoicing' },
  { icon: 'dashboardReports', key: 'reports', slug: 'reports-analytics' },
  { icon: 'firearmRegister', key: 'firearm', slug: 'firearm-register' },
  { icon: 'trailsModule', key: 'trails', slug: 'trails-module' },
  { icon: 'delivery', key: 'logistics', slug: 'delivery-management' },
]

export default function HomePage() {
  const t = useTranslations('Home')

  return (
    <div style={{ fontFamily:'Inter, sans-serif' }}>
      <MarketingNav />

      {/* HERO */}
      <section style={{ background:'linear-gradient(135deg, var(--navy) 0%, #1a3a5c 55%, #1B8A8F 100%)', padding:'5rem 2rem 6rem', textAlign:'center', color:'white' }}>
        <p style={{ fontSize:'0.875rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--gold)', marginBottom:'1rem' }}>
          {t('tagline')}
        </p>
        <h1 style={{ fontFamily:'Montserrat, sans-serif', fontSize:'clamp(2rem, 5vw, 3.5rem)', fontWeight:900, color:'white', margin:'0 auto 1.25rem', maxWidth:'800px', lineHeight:1.1 }}>
          {t('heroTitle')} <span style={{ color:'var(--gold)' }}>{t('heroTitleHighlight')}</span>
        </h1>
        <p style={{ fontSize:'clamp(1rem, 2vw, 1.25rem)', color:'rgba(255,255,255,0.75)', maxWidth:'600px', margin:'0 auto 2.5rem', lineHeight:1.6 }}>
          {t('heroSubtitle')}
        </p>
        <div style={{ display:'flex', gap:'1rem', justifyContent:'center', flexWrap:'wrap' }}>
          <Link href="/auth/signup" className="btn btn-primary btn-xl">{t('startForFree')} <BrandIcon name="arrowRight" size={14} style={{ display:'inline-block' }} /></Link>
          <Link href="/features" className="btn btn-outline btn-xl" style={{ color:'white', borderColor:'rgba(255,255,255,0.4)' }}>{t('seeFeatures')}</Link>
        </div>
        <p style={{ marginTop:'1.5rem', fontSize:'0.8125rem', color:'rgba(255,255,255,0.4)' }}>{t('heroFootnote')}</p>
      </section>

      {/* OPERATOR TYPES */}
      <section style={{ background:'var(--cream)', padding:'4rem 2rem', textAlign:'center' }}>
        <h2 style={{ fontFamily:'Montserrat, sans-serif', fontSize:'1.75rem', marginBottom:'0.5rem' }}>{t('operatorsHeading')}</h2>
        <p style={{ color:'var(--gray-500)', marginBottom:'2.5rem', fontSize:'1rem' }}>{t('operatorsSubheading')}</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))', gap:'1rem', maxWidth:'900px', margin:'0 auto' }}>
          {OPERATOR_TYPE_ICONS.map(o => (
            <Link key={o.key} href={`/features/${o.slug}`} style={{ background:'white', borderRadius:'1rem', padding:'1.5rem 1rem', border:'1px solid var(--gray-200)', transition:'box-shadow 0.2s, border-color 0.2s', textDecoration:'none', display:'block' }}
              onMouseOver={e => { e.currentTarget.style.boxShadow='0 4px 20px rgba(0,0,0,0.09)'; e.currentTarget.style.borderColor='var(--gold)' }}
              onMouseOut={e => { e.currentTarget.style.boxShadow='none'; e.currentTarget.style.borderColor='var(--gray-200)' }}>
              <div style={{ marginBottom:'0.625rem', display:'flex', justifyContent:'center' }}><BrandIcon name={o.icon} size={40} /></div>
              <p style={{ margin:0, fontSize:'0.875rem', fontWeight:600, color:'var(--navy)', lineHeight:1.3 }}>{t(`operatorTypes.${o.key}`)}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding:'4rem 2rem', maxWidth:'1100px', margin:'0 auto' }}>
        <div style={{ textAlign:'center', marginBottom:'3rem' }}>
          <h2 style={{ fontFamily:'Montserrat, sans-serif', fontSize:'1.75rem', marginBottom:'0.5rem' }}>{t('featuresHeading')}</h2>
          <p style={{ color:'var(--gray-500)', fontSize:'1rem' }}>{t('featuresSubheading')}</p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))', gap:'1.25rem' }}>
          {FEATURE_ICONS.map(f => (
            <Link key={f.key} href={`/features/${f.slug}`} className="card card-lg card-shadow"
              style={{ transition:'transform 0.2s, box-shadow 0.2s', textDecoration:'none', display:'block' }}
              onMouseOver={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 8px 30px rgba(0,0,0,0.1)' }}
              onMouseOut={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='0 1px 6px rgba(0,0,0,0.07)' }}>
              <div style={{ marginBottom:'0.75rem' }}><BrandIcon name={f.icon} size={36} /></div>
              <h3 style={{ margin:'0 0 0.5rem', fontSize:'1rem', color:'var(--navy)' }}>{t(`features.${f.key}.title`)}</h3>
              <p style={{ margin:0, fontSize:'0.875rem', color:'var(--gray-500)', lineHeight:1.6 }}>{t(`features.${f.key}.desc`)}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background:'var(--navy)', padding:'4rem 2rem', textAlign:'center', color:'white' }}>
        <h2 style={{ fontFamily:'Montserrat, sans-serif', fontSize:'2rem', color:'white', marginBottom:'0.75rem' }}>{t('ctaHeading')}</h2>
        <p style={{ color:'rgba(255,255,255,0.6)', marginBottom:'2rem', fontSize:'1rem' }}>{t('ctaSubheading')}</p>
        <Link href="/auth/signup" className="btn btn-primary btn-xl">{t('startForFree')} <BrandIcon name="arrowRight" size={14} style={{ display:'inline-block' }} /></Link>
      </section>

      <MarketingFooter />
    </div>
  )
}
