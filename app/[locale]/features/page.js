import { getTranslations } from 'next-intl/server'
import FeaturesClient from './FeaturesClient'

export async function generateMetadata({ params }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Features' })
  const title = t('metaTitle')
  const description = t('metaDescription')
  return {
    title,
    description,
    openGraph: { title, description, type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
    alternates: {
      canonical: locale === 'en' ? '/features' : `/${locale}/features`,
    },
  }
}

export default function FeaturesPage() {
  return <FeaturesClient />
}
