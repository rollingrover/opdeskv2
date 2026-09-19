import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['en', 'af', 'fr', 'pt', 'de'],
  defaultLocale: 'en',
  // 'as-needed': the default locale (en) is served with NO prefix — every
  // URL already built and shipped (/, /pricing, /features/bookings-calendar,
  // etc.) keeps working exactly as-is. Only af/fr/pt/de get a URL prefix
  // (/fr/pricing, /af/pricing, /pt/pricing). This matters a lot here
  // specifically because those English URLs may already be indexed by
  // search engines — switching them to /en/... would be a real SEO
  // regression, not just a cosmetic URL change.
  localePrefix: 'as-needed',
  // Locale is determined purely by the URL, never auto-redirected based on
  // the visitor's browser language. Translation coverage is partial this
  // round (Home/Pricing/Signup/Login are fully translated; other pages are
  // locale-routable but still render English content) — auto-redirecting a
  // French-browser visitor into a mostly-English /fr/features page would be
  // a worse experience than just showing the English site by default and
  // letting them switch languages explicitly via the switcher.
  localeDetection: false,
})
