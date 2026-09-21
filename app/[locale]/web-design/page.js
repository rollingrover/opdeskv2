import { getTranslations } from 'next-intl/server'
import WebDesignClient from './WebDesignClient'

export async function generateMetadata({ params }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'WebDesign' })
  const title = t('metaTitle')
  const description = t('metaDescription')
  return {
    title,
    description,
    openGraph: { title, description, type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
    alternates: {
      canonical: locale === 'en' ? '/web-design' : `/${locale}/web-design`,
    },
  }
}

export default function WebDesignPage() {
  return <WebDesignClient />
}
