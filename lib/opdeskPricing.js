// OpDesk SaaS founding-member pricing (decided Oct 2026).
// Pure helpers — safe on client and server.
//
// Founding members = businesses that start a paid monthly plan by
// 31 March 2027 (same deadline as the directory). They get:
//   1. the plan's intro price for the first 3 billed months (after the
//      30-day free trial), then
//   2. 20% off the standard price, locked for 3 years from first billing,
//   3. then the standard price.
// Stages advance via the daily /api/cron/opdesk-founding job, which emails
// 14 days' notice before every price change.
import { FOUNDING, addYears, isFoundingOpen } from './directoryPricing'

export { FOUNDING, isFoundingOpen }
export const FOUNDING_INTRO_MONTHS = 3
export const FOUNDING_DISCOUNT_PCT = 20

export function addMonths(date, months) {
  const d = new Date(date)
  d.setMonth(d.getMonth() + months)
  return d.toISOString().slice(0, 10)
}
export { addYears }

export function foundingRateFor(pkg) {
  return Math.round(Number(pkg.monthly_price) * (1 - FOUNDING_DISCOUNT_PCT / 100))
}

// 'intro' | 'founding' | 'standard' | null (not a founding member)
export function foundingStage(company, today = new Date()) {
  if (!company?.founding_member) return null
  const d = (typeof today === 'string' ? today : today.toISOString()).slice(0, 10)
  if (company.founding_intro_until && d < company.founding_intro_until) return 'intro'
  if (company.founding_lock_until && d < company.founding_lock_until) return 'founding'
  return 'standard'
}

// Monthly package price this company should pay on a given day.
export function packagePriceFor(company, pkg, today = new Date()) {
  const standard = Number(pkg?.monthly_price) || 0
  const stage = foundingStage(company, today)
  if (stage === 'intro') return Number(pkg.intro_price) || Number(company.founding_rate) || standard
  if (stage === 'founding') return Number(company.founding_rate) || foundingRateFor(pkg)
  return standard
}

// Full monthly total (package after location discount + add-ons). Pass any
// Supabase client allowed to read the company's package and add-ons.
export async function monthlyTotalFor(supabase, company, today = new Date()) {
  const [{ data: pkg }, { data: addons }] = await Promise.all([
    company.package_id
      ? supabase.from('marketing_packages').select('monthly_price, intro_price').eq('id', company.package_id).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase.from('company_addons').select('price_per_unit, quantity').eq('company_id', company.id).eq('active', true),
  ])
  const discountPct = Number(company.location_discount_pct) || 0
  const packagePrice = (pkg ? packagePriceFor(company, pkg, today) : 0) * (1 - discountPct / 100)
  const addonsTotal = (addons || []).reduce((sum, a) => sum + (Number(a.price_per_unit) || 0) * (a.quantity || 1), 0)
  return Math.round((packagePrice + addonsTotal) * 100) / 100
}
