import { NextResponse } from 'next/server'

// Vercel injects the visitor's country automatically on every request when
// deployed there — no third-party geolocation API or extra cost needed.
// This is a rough estimate (VPNs, corporate networks, and mobile carriers
// can all throw it off) — it's a sensible *default* for what currency to
// show on the pricing page, never a determination of what a customer will
// actually be billed in.
const COUNTRY_TO_CURRENCY = {
  ZA: 'ZAR', KE: 'KES', TZ: 'TZS', BW: 'BWP', NA: 'NAD', ZW: 'ZWL',
  MZ: 'MZN', ZM: 'ZMW', UG: 'UGX', RW: 'RWF', MW: 'MWK',
  US: 'USD', GB: 'GBP', AU: 'AUD',
  // Eurozone
  FR: 'EUR', DE: 'EUR', IT: 'EUR', ES: 'EUR', PT: 'EUR', NL: 'EUR',
  BE: 'EUR', IE: 'EUR', AT: 'EUR', FI: 'EUR', GR: 'EUR',
}

export async function GET(request) {
  const country = request.headers.get('x-vercel-ip-country') || null
  const currency = (country && COUNTRY_TO_CURRENCY[country]) || 'ZAR'
  return NextResponse.json({ country, currency })
}
