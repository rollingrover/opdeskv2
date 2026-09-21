import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n/request.js')

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'tasxyiibrjrpnuemorpx.supabase.co' },
    ],
  },

  // Allow this app to be embedded in an <iframe>, but ONLY on rollingrover.co.za
  // (and its www subdomain). Every other site is blocked from framing it —
  // browsers enforce this, not the embedding site, so it can't be bypassed
  // from rollingrover.co.za's end even if they wanted to relax it further.
  //
  // Deliberately NOT setting X-Frame-Options here: it only supports a single
  // static value (DENY / SAMEORIGIN / the deprecated, poorly-supported
  // ALLOW-FROM) and can't express "this one specific external origin" the
  // way CSP's frame-ancestors can. All current browsers respect
  // frame-ancestors and ignore X-Frame-Options when both are present, so
  // adding X-Frame-Options here would do nothing except risk conflicting
  // with the policy below in an older/edge-case browser.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://rollingrover.co.za https://www.rollingrover.co.za;",
          },
        ],
      },
      // The booking widget is designed to be embedded on each operator's
      // own website — an unknown, unpredictable domain we can't allow-list
      // in advance the way rollingrover.co.za is above. This entry is
      // defined after the general one so Next.js applies it last (and
      // therefore wins) specifically for /book/* paths; every other path
      // keeps the strict default.
      {
        source: '/book/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: 'frame-ancestors *;' },
        ],
      },
    ]
  },
}
export default withNextIntl(nextConfig)
