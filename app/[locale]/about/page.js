import { getTranslations } from 'next-intl/server'
import AboutClient from './AboutClient'

export async function generateMetadata({ params }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'About' })
  const title = t('metaTitle')
  const description = t('metaDescription')
  return {
    title,
    description,
    openGraph: { title, description, type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
    alternates: {
      canonical: locale === 'en' ? '/about' : `/${locale}/about`,
    },
  }
}

export default function AboutPage() {
  return <AboutClient />
}
