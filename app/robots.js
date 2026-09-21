const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://opdesk.app'

// Dashboard/admin paths are never locale-prefixed (see proxy.js
// PROTECTED_PREFIXES), so each only needs listing once here — there's no
// /fr/dashboard variant to also block.
const DASHBOARD_PATHS = [
  '/dashboard', '/bookings', '/staff', '/lodging', '/fleet', '/invoices',
  '/settings', '/reports', '/guides', '/trails', '/firearm-register',
  '/calendar', '/support', '/admin', '/delivery', '/quotations', '/checklists',
]

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          ...DASHBOARD_PATHS,
          '/auth/', '/api/',
          // Locale-prefixed auth pages (/fr/auth/login etc.) — auth IS
          // under [locale], unlike the dashboard paths above.
          '/*/auth/',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
