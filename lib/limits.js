/**
 * Checks a company's usage of a limited resource (vehicles, guides, rooms,
 * bookings_per_month) against its package's limit.
 *
 * Returns null if there's nothing worth showing (unlimited, or usage is
 * comfortably under the limit) — callers should render nothing in that case.
 * Otherwise returns { level: 'warning'|'at_limit', current, limit }.
 */
// Resources that can be topped up via an individually-purchased add-on, on
// top of whatever the package includes. bookings_per_month has no purchasable
// top-up currently — the only way past that limit is a tier upgrade.
const RESOURCE_ADDON_KEY = { vehicles: 'vehicles', guides: 'guides', rooms: 'rooms' }

/**
 * Checks a company's usage of a limited resource (vehicles, guides, rooms,
 * bookings_per_month) against its package's limit, plus any extra capacity
 * bought as an add-on (e.g. "Extra Vehicle Slot").
 *
 * Returns null if there's nothing worth showing (unlimited, or usage is
 * comfortably under the limit) — callers should render nothing in that case.
 * Otherwise returns { level: 'warning'|'at_limit', current, limit }.
 */
export function checkLimit(resourceKey, current, { profile, company, companyAddons = [] } = {}) {
  if (profile?.is_superadmin) return null
  const baseLimit = company?.package?.limits?.[resourceKey]
  if (baseLimit === null || baseLimit === undefined) return null // unlimited or not tracked

  const addonKey = RESOURCE_ADDON_KEY[resourceKey]
  const extra = addonKey
    ? companyAddons.filter(a => a.addon_key === addonKey && a.active).reduce((sum, a) => sum + (a.quantity || 1), 0)
    : 0
  const limit = baseLimit + extra

  if (current >= limit) return { level: 'at_limit', current, limit }
  if (current >= limit * 0.8) return { level: 'warning', current, limit }
  return null
}
