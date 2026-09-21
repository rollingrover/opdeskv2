import { getTranslations } from 'next-intl/server'
import PricingClient from './PricingClient'

export async function generateMetadata({ params }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Pricing' })
  const title = t('metaTitle')
  const description = t('metaDescription')
  return {
    title,
    description,
    openGraph: { title, description, type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
    alternates: {
      canonical: locale === 'en' ? '/pricing' : `/${locale}/pricing`,
    },
  }
}

export default function PricingPage() {
  return <PricingClient />
}
