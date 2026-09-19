import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

const intlMiddleware = createIntlMiddleware(routing)

const PROTECTED_PREFIXES = ['/dashboard', '/bookings', '/staff', '/lodging', '/fleet', '/invoices', '/settings', '/reports', '/guides', '/trails', '/firearm-register', '/calendar', '/support', '/admin', '/delivery', '/quotations', '/checklists']

// Pages that deliberately live outside app/[locale]/ entirely — legal
// documents kept English-only on purpose (see app/privacy/page.js). Passing
// these through next-intl's middleware produces a 404: next-intl only knows
// how to route paths that correspond to a real [locale]/... segment, and
// silently fails on anything else that its broad matcher still catches.
const NON_LOCALIZED_PATHS = ['/privacy', '/paia-manual', '/operators']

// Dashboard/API routes never have a locale prefix (they're a completely
// separate, non-localized route tree by design — see i18n/routing.js) so a
// path like /fr/auth/login needs its prefix stripped before checking
// against '/auth/', while /dashboard is already bare.
function stripLocalePrefix(path) {
  const match = path.match(/^\/(af|fr|pt|de)(\/.*|$)/)
  return match ? (match[2] || '/') : path
}

export async function proxy(request) {
  const path = request.nextUrl.pathname
  const isProtected = PROTECTED_PREFIXES.some(p => path.startsWith(p))
  const skipIntl = isProtected || NON_LOCALIZED_PATHS.some(p => path === p || path.startsWith(p + '/'))

  // Protected dashboard routes and non-localized legal pages skip next-intl
  // entirely. Everything else goes through next-intl's middleware first,
  // which handles the /fr, /af, /pt, /de prefix logic.
  let response = skipIntl ? NextResponse.next({ request }) : await intlMiddleware(request)

  // This runs on almost every request — if the auth check itself throws for
  // any reason (a transient Supabase hiccup, an env var issue specific to
  // the Edge runtime, a cookie-parsing edge case), failing hard here would
  // take down the entire site rather than just this one request. Fail open
  // instead: let the request through with whatever response next-intl
  // already produced. AuthContext + DashboardLayoutClient already redirect
  // an unauthenticated user client-side as a second layer, so protected
  // routes stay protected even if this middleware-level check can't run.
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() { return request.cookies.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value)
              response.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    const unprefixedPath = stripLocalePrefix(path)

    // Redirect logged-in users away from auth pages (dashboard has no
    // locale prefix, so this redirect target is correct regardless of
    // which locale's /auth/login they came from)
    if (user && unprefixedPath.startsWith('/auth/')) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    if (!user && isProtected) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  } catch (error) {
    console.error('[proxy middleware] auth check failed, letting request through:', error)
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|api|favicon.ico|.*\\.png$|.*\\.svg$|.*\\.ico$).*)'],
}
