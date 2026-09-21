import { getTranslations } from 'next-intl/server'
import HomeClient from './HomeClient'

// Homepage-specific metadata — previously this page had none of its own
// and silently inherited the root layout's single shared title/
// description/OG-image block, same as every other page that also lacked
// its own metadata. Explicit here now, and localized per locale, so
// search engines and social shares show accurate homepage copy distinct
// from Pricing/Features/About in every language.
export async function generateMetadata({ params }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Home' })
  const title = t('metaTitle')
  const description = t('metaDescription')
  return {
    title,
    description,
    openGraph: {
      title,
      description: t('metaOgDescription'),
      type: 'website',
      images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: t('metaOgDescription'),
      images: ['/og-image.png'],
    },
    alternates: {
      canonical: locale === 'en' ? '/' : `/${locale}`,
    },
  }
}

export default function HomePage() {
  return <HomeClient />
}
