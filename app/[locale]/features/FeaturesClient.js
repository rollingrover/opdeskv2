'use client'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { BrandIcon } from '@/components/ui/BrandIcon'
import { MarketingNav } from '@/components/marketing/MarketingNav'
import { MarketingFooter } from '@/components/marketing/MarketingFooter'

const FEATURE_GROUPS = [
  {
    groupKey: 'operations',
    items: [
      { slug: 'bookings-calendar', icon: 'bookingCalendar' },
      { slug: 'fleet-management', icon: 'fleet' },
      { slug: 'trails-module', icon: 'trailsModule' },
      { slug: 'shifts-scheduling', icon: 'schedules' },
    ],
  },
  {
    groupKey: 'staffHr',
    items: [
      { slug: 'staff-roles', icon: 'teamRoles' },
      { slug: 'certifications', icon: 'guides' },
      { slug: 'firearm-register', icon: 'firearmRegister' },
      { slug: 'cost-to-company', icon: 'driversShuttles' },
    ],
  },
  {
    groupKey: 'guestProperty',
    items: [
      { slug: 'lodging-rooms', icon: 'gameLodge' },
      { slug: 'housekeeping', icon: 'shuttle' },
      { slug: 'guest-directory', icon: 'islandTransfer' },
    ],
  },
  {
    groupKey: 'finance',
    items: [
      { slug: 'invoicing', icon: 'proformaInvoice' },
      { slug: 'reports-analytics', icon: 'dashboardReports' },
      { slug: 'csv-export', icon: 'csvExport' },
      { slug: 'automatic-backups', icon: 'autoBackup' },
    ],
  },
  {
    groupKey: 'platform',
    items: [
      { slug: 'multi-currency', icon: 'multiCurrency' },
      { slug: 'white-label-branding', icon: 'whiteLabel' },
      { slug: 'built-for-africa', icon: 'marketing' },
    ],
  },
]

export default function FeaturesClient() {
  const t = useTranslations('Features')

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      <MarketingNav />

      <section style={{ background: 'linear-gradient(135deg, var(--navy) 0%, #1a3a5c 55%, #1B8A8F 100%)', padding: '4rem 2rem', textAlign: 'center', color: 'white' }}>
        <p style={{ fontSize: '0.875rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '1rem' }}>
          {t('hero.eyebrow')}
        </p>
        <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 'clamp(2rem, 4.5vw, 3rem)', fontWeight: 900, color: 'white', margin: '0 auto 1.25rem', maxWidth: '760px', lineHeight: 1.15 }}>
          {t('hero.title')}
        </h1>
        <p style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,0.75)', maxWidth: '620px', margin: '0 auto', lineHeight: 1.6 }}>
          {t('hero.subtitle')}
        </p>
      </section>

      {FEATURE_GROUPS.map((group, i) => (
        <section key={group.groupKey} style={{ padding: '3.5rem 2rem', maxWidth: '1100px', margin: '0 auto', background: i % 2 === 1 ? 'var(--cream)' : 'transparent' }}>
          <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.5rem', color: 'var(--navy)', marginBottom: '2rem' }}>{t(`groups.${group.groupKey}`)}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            {group.items.map(f => (
              <Link key={f.slug} href={`/features/${f.slug}`} className="card card-lg card-shadow" style={{ textDecoration: 'none', display: 'block', transition: 'transform 0.15s' }}>
                <div style={{ marginBottom: '0.75rem' }}><BrandIcon name={f.icon} size={36} /></div>
                <h3 style={{ margin: '0 0 0.5rem', fontSize: '1rem', color: 'var(--navy)' }}>{t(`items.${f.slug}.title`)}</h3>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--gray-500)', lineHeight: 1.6 }}>{t(`items.${f.slug}.desc`)}</p>
              </Link>
            ))}
          </div>
        </section>
      ))}

      <section style={{ background: 'var(--navy)', padding: '4rem 2rem', textAlign: 'center', color: 'white' }}>
        <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '2rem', color: 'white', marginBottom: '0.75rem' }}>{t('ctaHeading')}</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '2rem', fontSize: '1rem' }}>{t('ctaSubheading')}</p>
        <Link href="/auth/signup" className="btn btn-primary btn-xl">{t('startFree')} <BrandIcon name="arrowRight" size={14} style={{ display:'inline-block' }} /></Link>
      </section>

      <MarketingFooter />
    </div>
  )
}
