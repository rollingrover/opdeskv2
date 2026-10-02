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

export function currentPrices(now = new Date()) {
  const founding = isFoundingOpen(now)
  return { founding, ...(founding ? LISTING_PLANS.founding : LISTING_PLANS.standard) }
}

// Monthly amount for a plan + extra categories at today's (or a given) price list.
export function planAmount(plan, extraCategories = 0, now = new Date()) {
  const p = currentPrices(now)
  if (!p[plan]) throw new Error('Unknown plan')
  const extras = Math.max(0, Math.min(MAX_EXTRA_CATEGORIES, Number(extraCategories) || 0))
  return { amount: p[plan] + extras * p.extraCategory, founding: p.founding, base: p[plan], extras, extraPrice: p.extraCategory }
}

export function allowedCategories(tier, extraCategories = 0) {
  return (INCLUDED_CATEGORIES[tier] || 1) + (tier === 'premium' || tier === 'featured' ? Number(extraCategories) || 0 : 0)
}

export function addYears(date, years) {
  const d = new Date(date)
  d.setFullYear(d.getFullYear() + years)
  return d.toISOString().slice(0, 10)
}
