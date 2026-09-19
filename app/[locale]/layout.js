import { NextIntlClientProvider } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import { notFound } from 'next/navigation'

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }))
}

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params
  if (!routing.locales.includes(locale)) notFound()

  // Enables static rendering for this locale segment.
  setRequestLocale(locale)

  return (
    <NextIntlClientProvider>
      {children}
    </NextIntlClientProvider>
  )
}
