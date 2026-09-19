import { TIER_INCLUDED_MODULES, MODULE_ADDON_KEY } from './constants'

/**
 * Does this company have access to a gated module (certifications, shifts,
 * costs, leave)?
 *
 * Access if ANY of:
 *  - the signed-in profile is a superadmin (unrestricted, for testing/support)
 *  - the company's linked marketing package includes this module
 *    (company.package.modules[moduleKey] === true) — the real source of
 *    truth, editable live by superadmin in Marketing Packages
 *  - as a fallback, for a company not yet linked to a package row (e.g. the
 *    backfill migration hasn't run in this environment yet), the old
 *    tier-name lookup still applies so nobody loses access mid-migration
 *  - the company has an active company_addons row unlocking it individually
 *
 * `companyAddons` should be the array of active rows from `company_addons`
 * for this company (already fetched by most pages that need this check —
 * this function does no fetching itself, so it's cheap to call per-render).
 */
export function hasModuleAccess(moduleKey, { profile, company, companyAddons = [] } = {}) {
  if (profile?.is_superadmin) return true
  if (!company) return false

  if (company.package?.modules) {
    if (company.package.modules[moduleKey] === true) return true
  } else {
    const includedByTier = TIER_INCLUDED_MODULES[company.subscription_tier || 'free'] || []
    if (includedByTier.includes(moduleKey)) return true
  }

  const addonKey = MODULE_ADDON_KEY[moduleKey]
  if (addonKey && companyAddons.some(a => a.addon_key === addonKey && a.active)) return true

  // HR Bundle: one addon that unlocks certifications + shifts + costs +
  // leave together, at a discount vs buying each individually.
  if (companyAddons.some(a => a.addon_key === 'hr_bundle' && a.active)) return true

  // Logistics Bundle: one flat-priced addon that unlocks delivery_management
  // (and therefore the delivery_clients/delivery_orders sidebar items) for
  // ANY operator type, not just companies whose operator_type is 'delivery'.
  if (moduleKey === 'delivery_management' && companyAddons.some(a => a.addon_key === 'logistics_bundle' && a.active)) return true

  return false
}
