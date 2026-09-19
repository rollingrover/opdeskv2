import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { BrandIcon } from '@/components/ui/BrandIcon'
import { MarketingNav } from '@/components/marketing/MarketingNav'
import { MarketingFooter } from '@/components/marketing/MarketingFooter'
import { FEATURES_META, FEATURE_SLUGS } from '@/lib/featuresContent'
import { getFeatureContent } from '@/lib/featuresContentTranslations'
import { Check, ArrowLeft } from 'lucide-react'

// Pre-render all feature and solution pages at build time — real static
// HTML for search engines to crawl, not client-side-rendered content.
export function generateStaticParams() {
  return FEATURE_SLUGS.map(slug => ({ slug }))
}

export async function generateMetadata({ params }) {
  const { slug, locale } = await params
  const meta = FEATURES_META[slug]
  if (!meta) return {}
  const content = getFeatureContent(slug, locale)
  return {
    title: content.metaTitle,
    description: content.metaDescription,
    keywords: content.keywords,
    openGraph: {
      title: content.metaTitle,
      description: content.metaDescription,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: content.metaTitle,
      description: content.metaDescription,
    },
    alternates: {
      canonical: `/features/${slug}`,
    },
  }
}

export default async function FeatureDetailPage({ params }) {
  const { slug, locale } = await params
  const meta = FEATURES_META[slug]
  if (!meta) notFound()
  const content = getFeatureContent(slug, locale)
  const t = await getTranslations('FeatureDetail')
  const tGroups = await getTranslations('Features.groups')
  const tFeatures = await getTranslations('Features')

  // Structured data helps search engines understand this is a specific
  // product feature page, not generic marketing copy.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `OpDesk — ${content.title}`,
    description: content.metaDescription,
    brand: { '@type': 'Brand', name: 'OpDesk' },
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <MarketingNav />

      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, var(--navy) 0%, #1a3a5c 55%, #1B8A8F 100%)', padding: '4rem 2rem', textAlign: 'center', color: 'white' }}>
        <Link href="/features" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '0.8125rem', marginBottom: '1.5rem' }}>
          <ArrowLeft size={14} /> {t('allFeatures')}
        </Link>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: '1.25rem', padding: '1rem', display: 'inline-flex' }}>
            <BrandIcon name={meta.icon} size={56} />
          </div>
        </div>
        <p style={{ fontSize: '0.875rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '1rem' }}>
          {tGroups(meta.groupKey)}
        </p>
        <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 'clamp(2rem, 4.5vw, 3rem)', fontWeight: 900, color: 'white', margin: '0 auto 1.25rem', maxWidth: '760px', lineHeight: 1.15 }}>
          {content.title}
        </h1>
        <p style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,0.8)', maxWidth: '620px', margin: '0 auto', lineHeight: 1.6 }}>
          {content.heroTagline}
        </p>
      </section>

      {/* Intro */}
      <section style={{ padding: '3.5rem 2rem', maxWidth: '780px', margin: '0 auto' }}>
        <p style={{ fontSize: '1.0625rem', color: 'var(--gray-600, #4b5563)', lineHeight: 1.8 }}>
          {content.intro}
        </p>
      </section>

      {/* Benefits */}
      <section style={{ background: 'var(--cream)', padding: '3.5rem 2rem' }}>
        <div style={{ maxWidth: '780px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.375rem', color: 'var(--navy)', marginBottom: '1.5rem' }}>{t('whatYouGet')}</h2>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {content.benefits.map(b => (
              <li key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.9375rem', color: 'var(--gray-600, #4b5563)', lineHeight: 1.6 }}>
                <Check size={18} color="var(--gold)" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
                {b}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Who it's for */}
      {content.forWhom && (
        <section style={{ padding: '3rem 2rem', maxWidth: '780px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.375rem', color: 'var(--navy)', marginBottom: '0.75rem' }}>{t('whoItsFor')}</h2>
          <p style={{ fontSize: '0.9375rem', color: 'var(--gray-500)', lineHeight: 1.7 }}>{content.forWhom}</p>
        </section>
      )}

      {/* CTA */}
      <section style={{ background: 'var(--navy)', padding: '4rem 2rem', textAlign: 'center', color: 'white' }}>
        <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '2rem', color: 'white', marginBottom: '0.75rem' }}>{t('seeInDashboard', { title: content.title })}</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '2rem', fontSize: '1rem' }}>{tFeatures('ctaSubheading')}</p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/auth/signup" className="btn btn-primary btn-xl">{tFeatures('startFree')} <BrandIcon name="arrowRight" size={14} style={{ display: 'inline-block' }} /></Link>
          <Link href="/pricing" className="btn btn-outline btn-xl" style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'white' }}>{t('viewPricing')}</Link>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
