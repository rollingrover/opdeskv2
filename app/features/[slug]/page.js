import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BrandIcon } from '@/components/ui/BrandIcon'
import { MarketingNav } from '@/components/marketing/MarketingNav'
import { MarketingFooter } from '@/components/marketing/MarketingFooter'
import { FEATURES_CONTENT, FEATURE_SLUGS } from '@/lib/featuresContent'
import { Check, ArrowLeft } from 'lucide-react'

// Pre-render all 18 feature pages at build time — real static HTML for
// search engines to crawl, not client-side-rendered content.
export function generateStaticParams() {
  return FEATURE_SLUGS.map(slug => ({ slug }))
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const feature = FEATURES_CONTENT[slug]
  if (!feature) return {}
  return {
    title: feature.metaTitle,
    description: feature.metaDescription,
    keywords: feature.keywords,
    openGraph: {
      title: feature.metaTitle,
      description: feature.metaDescription,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: feature.metaTitle,
      description: feature.metaDescription,
    },
    alternates: {
      canonical: `/features/${slug}`,
    },
  }
}

export default async function FeatureDetailPage({ params }) {
  const { slug } = await params
  const feature = FEATURES_CONTENT[slug]
  if (!feature) notFound()

  // Structured data helps search engines understand this is a specific
  // product feature page, not generic marketing copy.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `OpDesk — ${feature.title}`,
    description: feature.metaDescription,
    brand: { '@type': 'Brand', name: 'OpDesk' },
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <MarketingNav />

      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, var(--navy) 0%, #1a3a5c 55%, #1B8A8F 100%)', padding: '4rem 2rem', textAlign: 'center', color: 'white' }}>
        <Link href="/features" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '0.8125rem', marginBottom: '1.5rem' }}>
          <ArrowLeft size={14} /> All Features
        </Link>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: '1.25rem', padding: '1rem', display: 'inline-flex' }}>
            <BrandIcon name={feature.icon} size={56} />
          </div>
        </div>
        <p style={{ fontSize: '0.875rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '1rem' }}>
          {feature.group}
        </p>
        <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 'clamp(2rem, 4.5vw, 3rem)', fontWeight: 900, color: 'white', margin: '0 auto 1.25rem', maxWidth: '760px', lineHeight: 1.15 }}>
          {feature.title}
        </h1>
        <p style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,0.8)', maxWidth: '620px', margin: '0 auto', lineHeight: 1.6 }}>
          {feature.heroTagline}
        </p>
      </section>

      {/* Intro */}
      <section style={{ padding: '3.5rem 2rem', maxWidth: '780px', margin: '0 auto' }}>
        <p style={{ fontSize: '1.0625rem', color: 'var(--gray-600, #4b5563)', lineHeight: 1.8 }}>
          {feature.intro}
        </p>
      </section>

      {/* Benefits */}
      <section style={{ background: 'var(--cream)', padding: '3.5rem 2rem' }}>
        <div style={{ maxWidth: '780px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.375rem', color: 'var(--navy)', marginBottom: '1.5rem' }}>What you get</h2>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {feature.benefits.map(b => (
              <li key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.9375rem', color: 'var(--gray-600, #4b5563)', lineHeight: 1.6 }}>
                <Check size={18} color="var(--gold)" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
                {b}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Who it's for */}
      {feature.forWhom && (
        <section style={{ padding: '3rem 2rem', maxWidth: '780px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.375rem', color: 'var(--navy)', marginBottom: '0.75rem' }}>Who it&rsquo;s for</h2>
          <p style={{ fontSize: '0.9375rem', color: 'var(--gray-500)', lineHeight: 1.7 }}>{feature.forWhom}</p>
        </section>
      )}

      {/* CTA */}
      <section style={{ background: 'var(--navy)', padding: '4rem 2rem', textAlign: 'center', color: 'white' }}>
        <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '2rem', color: 'white', marginBottom: '0.75rem' }}>See {feature.title} in your dashboard</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '2rem', fontSize: '1rem' }}>Start free — no credit card required.</p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/auth/signup" className="btn btn-primary btn-xl">Start for Free <BrandIcon name="arrowRight" size={14} style={{ display: 'inline-block' }} /></Link>
          <Link href="/pricing" className="btn btn-outline btn-xl" style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'white' }}>View Pricing</Link>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
