// Directory (ZAtours / Route22) listing plans — founding-member pricing.
// Pure module: safe for client and server. Must match lib/pricing.ts in the
// route22 repo (what the public pricing page shows).
//
// Businesses that start a paid plan by 31 March 2027 get the founding price,
// locked for 3 years from their first payment. After the deadline new
// subscriptions use standard pricing automatically.

export const FOUNDING = {
  deadline: '2027-03-31T23:59:59+02:00',
  deadlineLabel: '31 March 2027',
  lockYears: 3,
}

export const LISTING_PLANS = {
  founding: { premium: 99, featured: 199, extraCategory: 29 },
  standard: { premium: 149, featured: 249, extraCategory: 39 },
}

export const PLAN_LABELS = { premium: 'Premium listing', featured: 'Featured listing' }

// Categories included per tier; paid plans can buy extra categories.
export const INCLUDED_CATEGORIES = { community: 1, basic: 1, premium: 2, featured: 3 }
export const MAX_EXTRA_CATEGORIES = 6

export function isFoundingOpen(now = new Date()) {
  return now.getTime() <= new Date(FOUNDING.deadline).getTime()
}

// Fallback price table (used if dir_packages can't be read). The live
// prices are rows in dir_packages, edited in OpDesk Admin → Directory →
// Packages, and shared with the ZAtours / Route22 pricing pages.
export const FALLBACK_PACKAGES = {
  premium: { founding_price: 99, standard_price: 149 },
  featured: { founding_price: 199, standard_price: 249 },
  extra_category: { founding_price: 29, standard_price: 39 },
  route_hub: { founding_price: 499, standard_price: 749 },
  route_hub_plus: { founding_price: 999, standard_price: 1499 },
  route_member_premium: { founding_price: 79, standard_price: 119 },
  association_bulk_premium: { founding_price: 69, standard_price: 99, min_quantity: 10 },
}
export const DIRECTORY_PLAN_LABELS = {
  premium: 'Premium listing', featured: 'Featured listing',
  route_member_premium: 'Premium listing (route member rate)',
  route_hub: 'Route Hub', route_hub_plus: 'Route Hub Plus',
  association_bulk_premium: 'Association bulk Premium',
}

// rows: array from dir_packages (or a key->row map). Returns key->row.
export function packageTable(rows) {
  if (!rows) return { ...FALLBACK_PACKAGES }
  const list = Array.isArray(rows) ? rows : Object.entries(rows).map(([key, r]) => ({ key, ...r }))
  const out = { ...FALLBACK_PACKAGES }
  for (const r of list) out[r.key] = r
  return out
}

export function priceOf(key, table, now = new Date()) {
  const r = packageTable(table)[key]
  if (!r) throw new Error(`Unknown package: ${key}`)
  return Number(isFoundingOpen(now) ? r.founding_price : r.standard_price)
}

export function currentPrices(now = new Date(), table) {
  const t = packageTable(table)
  const founding = isFoundingOpen(now)
  const pick = k => Number(founding ? t[k].founding_price : t[k].standard_price)
  return { founding, premium: pick('premium'), featured: pick('featured'), extraCategory: pick('extra_category') }
}

// Monthly amount for a listing plan + extra categories. `priceKey` lets a
// Premium listing on a Route Hub Plus route bill at the member rate.
export function planAmount(plan, extraCategories = 0, now = new Date(), table, priceKey) {
  const founding = isFoundingOpen(now)
  const base = priceOf(priceKey || plan, table, now)
  const extraPrice = priceOf('extra_category', table, now)
  const extras = Math.max(0, Math.min(MAX_EXTRA_CATEGORIES, Number(extraCategories) || 0))
  return { amount: base + extras * extraPrice, founding, base, extras, extraPrice }
}

export function allowedCategories(tier, extraCategories = 0) {
  return (INCLUDED_CATEGORIES[tier] || 1) + (tier === 'premium' || tier === 'featured' ? Number(extraCategories) || 0 : 0)
}

export function addYears(date, years) {
  const d = new Date(date)
  d.setFullYear(d.getFullYear() + years)
  return d.toISOString().slice(0, 10)
}
