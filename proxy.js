import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function proxy(request) {
  let response = NextResponse.next({ request })

  // This runs on almost every request (see the matcher below) — if the auth
  // check itself throws for any reason (a transient Supabase hiccup, an env
  // var issue specific to the Edge runtime, a cookie-parsing edge case),
  // failing hard here would take down the entire site rather than just this
  // one request. Fail open instead: let the request through unmodified.
  // AuthContext + DashboardLayoutClient already redirect an unauthenticated
  // user client-side as a second layer, so protected routes stay protected
  // even if this middleware-level check can't run.
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
    const path = request.nextUrl.pathname

    // Redirect logged-in users away from auth pages
    if (user && path.startsWith('/auth/')) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Protected paths
    const protectedPrefixes = ['/dashboard','/bookings','/staff','/lodging','/fleet','/invoices','/settings','/reports','/guides','/trails','/firearm-register','/calendar','/support','/admin']
    const isProtected = protectedPrefixes.some(p => path.startsWith(p))
    if (!user && isProtected) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  } catch (error) {
    console.error('[proxy middleware] auth check failed, letting request through:', error)
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$|.*\\.ico$).*)'],
}
