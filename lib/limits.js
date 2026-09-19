/**
 * Checks a company's usage of a limited resource against its package's
 * limit, plus any extra capacity bought as an add-on.
 *
 * Two kinds of resource:
 *  - 'guides' (staff count) and 'bookings_per_month' are checked on their
 *    own, same as always.
 *  - 'vehicles' and 'rooms' now draw from ONE shared pool — package.limits
 *    has a single 'capacity' number, not separate vehicles/rooms numbers,
 *    since some operators are vehicles-only, some rooms-only, some both.
 *    Callers checking 'vehicles' or 'rooms' MUST pass `poolUsage` — the
 *    combined current vehicle+room count for the company, not just the
 *    count of the one resource being added — since the limit is shared.
 *
 * Returns null if there's nothing worth showing (unlimited, or usage is
 * comfortably under the limit) — callers should render nothing in that case.
 * Otherwise returns { level: 'warning'|'at_limit', current, limit }.
 */
const POOLED_RESOURCES = ['vehicles', 'rooms']
const LIMIT_KEY = { guides: 'guides', bookings_per_month: 'bookings_per_month', vehicles: 'capacity', rooms: 'capacity' }

// Resources that can be topped up via an individually-purchased add-on, on
// top of whatever the package includes. bookings_per_month has no purchasable
// top-up currently — the only way past that limit is a tier upgrade. Both
// pooled resources still top up independently — buying an extra vehicle slot
// adds 1 to the shared pool the same as an extra room slot would.
const RESOURCE_ADDON_KEY = { vehicles: 'vehicles', guides: 'guides', rooms: 'rooms' }

export function checkLimit(resourceKey, current, { profile, company, companyAddons = [], poolUsage } = {}) {
  if (profile?.is_superadmin) return null
  const limitKey = LIMIT_KEY[resourceKey] || resourceKey
  const baseLimit = company?.package?.limits?.[limitKey]
  if (baseLimit === null || baseLimit === undefined) return null // unlimited or not tracked

  if (POOLED_RESOURCES.includes(resourceKey) && (poolUsage === undefined || poolUsage === null)) {
    throw new Error(`checkLimit('${resourceKey}', ...) needs poolUsage — the combined vehicles+rooms count — since ${resourceKey} now draws from a shared capacity pool.`)
  }
  const effectiveCurrent = POOLED_RESOURCES.includes(resourceKey) ? poolUsage : current

  const addonKey = RESOURCE_ADDON_KEY[resourceKey]
  const extra = addonKey
    ? companyAddons.filter(a => a.addon_key === addonKey && a.active).reduce((sum, a) => sum + (a.quantity || 1), 0)
    : 0
  const limit = baseLimit + extra

  if (effectiveCurrent >= limit) return { level: 'at_limit', current: effectiveCurrent, limit }
  if (effectiveCurrent >= limit * 0.8) return { level: 'warning', current: effectiveCurrent, limit }
  return null
}
