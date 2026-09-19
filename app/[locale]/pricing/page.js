'use client'
import { BrandIcon } from '@/components/ui/BrandIcon'
import { useEffect, useState } from 'react'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { MarketingNav } from '@/components/marketing/MarketingNav'
import { MarketingFooter } from '@/components/marketing/MarketingFooter'
import { Check, Globe } from 'lucide-react'
import { MODULE_LABELS, GATED_MODULES, CURRENCIES } from '@/lib/constants'

// Packages are now one universal pooled-tier ladder (no more separate
// Tours/Lodging/Logistics package sets), so there's one fixed set of
// comparison rows rather than a per-vertical branch.
function getComparisonRows() {
  return [
    { key: 'capacity', label: 'Vehicle + Room Capacity', type: 'limit' },
    { key: 'guides', label: 'Staff', type: 'limit' },
    { key: 'seats', label: 'Team Seats', type: 'limit' },
    { key: 'bookings_per_month', label: 'Bookings / month', type: 'limit' },
    ...GATED_MODULES.map(m => ({ key: m, label: MODULE_LABELS[m], type: 'module' })),
  ]
}

const ADDON_LABELS = {
  vehicles: 'Extra Capacity Slot (vehicle or room)', guides: 'Extra Staff Slot', rooms: 'Extra Capacity Slot (vehicle or room)', seats: 'Extra Team Seat',
  schedules_module: 'Schedules & Shifts Module',
  certifications: 'Certifications Module',
  cost_to_company: 'Cost to Company Module', leave: 'Leave Module',
  hr_bundle: 'HR Package — Certifications, Shifts, Cost to Company & Leave',
  logistics_bundle: 'Logistics Package — Client List, Price List, Orders & Statements',
  quotations: 'Quotations Module', ical_sync: 'Channel Sync (Airbnb/Booking.com)',
  delivery_management: 'Logistics & Support Management',
  checklists: 'Checklists & Inventory Lists',
}

function buildHighlights(pkg) {
  const lines = []
  const limits = pkg.limits || {}
  if (limits.capacity !== undefined) lines.push(limits.capacity === null ? 'Unlimited vehicles & rooms' : `${limits.capacity} vehicle/room capacity`)
  if (limits.guides !== undefined) lines.push(limits.guides === null ? 'Unlimited staff' : `${limits.guides} staff`)
  if (limits.seats !== undefined) lines.push(limits.seats === null ? 'Unlimited team seats' : `${limits.seats} team seat${limits.seats === 1 ? '' : 's'}`)
  if (limits.bookings_per_month !== undefined) lines.push(limits.bookings_per_month === null ? 'Unlimited bookings' : `${limits.bookings_per_month} bookings/mo`)
  const modules = pkg.modules || {}
  const included = Object.entries(modules).filter(([, v]) => v === true).map(([k]) => MODULE_LABELS[k] || k)
  if (included.length) lines.push(`${included.join(', ')} included`)
  return lines
}

export default function PricingPage() {
  const t = useTranslations('Pricing')
  const [packages, setPackages] = useState([])
  const [addons, setAddons] = useState([])
  const [annual, setAnnual] = useState(false)
  const [currency] = useState('ZAR')
  const [loading, setLoading] = useState(true)
  const [detectedCurrency, setDetectedCurrency] = useState(null)

  useEffect(() => {
    const supabase = createClient()
    ;(async () => {
      const { data: p } = await supabase.from('marketing_packages').select('*').eq('active', true).order('sort_order')
      const { data: a } = await supabase.from('addon_pricing').select('*').order('addon_key')
      setPackages(p || [])
      setAddons(a || [])
      setLoading(false)
    })()
    // Rough, best-effort region detection via Vercel's geo headers (see
    // /api/geo) — used only to show an informational note about which
    // currency the visitor's region likely uses. Never used to convert the
    // displayed price itself: doing that responsibly needs a live exchange
    // rate source, which isn't part of this build, and a stale hardcoded
    // conversion rate would be actively misleading on a pricing page.
    fetch('/api/geo').then(r => r.json()).then(d => {
      if (d.currency && d.currency !== 'ZAR') setDetectedCurrency(d.currency)
    }).catch(() => {})
  }, [])

  // Packages are one universal pooled-tier ladder now — every package
  // applies to every vertical, so there's no longer a per-vertical subset
  // to filter down to (this used to filter on recommended_for tags, which
  // now include all verticals on every package and would show zero rows).
  const visiblePackages = packages

  const detectedCurrencyInfo = CURRENCIES.find(c => c.code === detectedCurrency)

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      <MarketingNav />

      <section style={{ background: 'linear-gradient(135deg, var(--navy) 0%, #1a3a5c 55%, #1B8A8F 100%)', padding: '4rem 2rem 3rem', textAlign: 'center', color: 'white' }}>
        <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 'clamp(2rem, 4.5vw, 3rem)', fontWeight: 900, color: 'white', margin: '0 auto 1rem' }}>
          {t('heading')}
        </h1>
        <p style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,0.75)', maxWidth: '560px', margin: '0 auto 1.75rem', lineHeight: 1.6 }}>
          {t('subheading')}
        </p>
        <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.1)', borderRadius: '999px', padding: '0.25rem' }}>
          {[[t('monthly'), false], [t('annual'), true]].map(([label, val]) => (
            <button key={label} onClick={() => setAnnual(val)}
              style={{
                border: 'none', borderRadius: '999px', padding: '0.5rem 1.25rem', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer',
                background: annual === val ? 'var(--gold)' : 'transparent',
                color: annual === val ? 'var(--navy)' : 'rgba(255,255,255,0.7)',
              }}>
              {label}
            </button>
          ))}
        </div>

        {detectedCurrencyInfo && (
          <p style={{ marginTop: '1.25rem', fontSize: '0.8125rem', color: 'rgba(255,255,255,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem' }}>
            <Globe size={13} /> Prices below are shown in ZAR — your region's currency looks like {detectedCurrencyInfo.name} ({detectedCurrencyInfo.code}), for reference only.
          </p>
        )}
      </section>

      <section style={{ padding: '3.5rem 2rem', maxWidth: '1300px', margin: '0 auto' }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--gray-400)' }}>{t('loadingPlans')}</p>
        ) : visiblePackages.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--gray-400)' }}>{t('noPlans')}</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.25rem' }}>
            {visiblePackages.map(p => {
              const highlights = buildHighlights(p)
              const popular = !!p.badge
              return (
                <div key={p.id} className="card card-lg card-shadow" style={popular ? { border: '2px solid var(--gold)', position: 'relative' } : {}}>
                  {popular && (
                    <div style={{ position: 'absolute', top: '-0.75rem', left: '50%', transform: 'translateX(-50%)', background: 'var(--gold)', color: 'var(--navy)', fontSize: '0.6875rem', fontWeight: 700, padding: '0.25rem 0.75rem', borderRadius: '999px', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                      {p.badge.toUpperCase()}
                    </div>
                  )}
                  <h3 style={{ margin: '0.5rem 0 0.25rem', fontSize: '1.125rem', color: 'var(--navy)' }}>{p.name}</h3>
                  <p style={{ margin: '0 0 0.5rem', fontSize: '0.8125rem', color: 'var(--gray-500)' }}>{p.tagline}</p>
                  <div style={{ marginBottom: '1.25rem' }}>
                    <span style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--navy)' }}>
                      {p.monthly_price === 0 ? t('free') : `${p.currency || currency} ${Number(annual ? Math.round(p.annual_price / 12) : p.monthly_price).toLocaleString()}`}
                    </span>
                    {p.monthly_price > 0 && <span style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>{t('perMonth')}{annual ? t('billedAnnually') : ''}</span>}
                  </div>
                  <ul style={{ listStyle: 'none', margin: '0 0 1.5rem', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {highlights.map(h => (
                      <li key={h} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--gray-500)' }}>
                        <Check size={14} color="var(--gold)" /> {h}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={p.slug === 'enterprise' ? 'mailto:central@opdesk.app?subject=Enterprise%20plan%20enquiry' : p.monthly_price === 0 ? '/auth/signup' : `/auth/signup?package=${p.slug}`}
                    className={popular ? 'btn btn-primary' : 'btn btn-outline'} style={{ width: '100%', justifyContent: 'center' }}>
                    {p.slug === 'enterprise' ? t('contactUs') : p.monthly_price === 0 ? t('startFree') : t('choosePlan')}
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {!loading && visiblePackages.length > 0 && (
        <section style={{ padding: '0 2rem 3.5rem', maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.5rem', color: 'var(--navy)', textAlign: 'center', marginBottom: '1.75rem' }}>{t('compareHeading')}</h2>
          <div className="card card-shadow" style={{ padding: 0, overflow: 'auto' }}>
            <table className="table" style={{ minWidth: 640 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left' }}>{t('featureColumn')}</th>
                  {visiblePackages.map(p => (
                    <th key={p.id} style={{ textAlign: 'center', color: 'var(--navy)' }}>{p.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {getComparisonRows().map(row => (
                  <tr key={row.key}>
                    <td style={{ fontWeight: 600, color: 'var(--navy)' }}>{row.label}</td>
                    {visiblePackages.map(p => (
                      <td key={p.id} style={{ textAlign: 'center', color: 'var(--gray-500)' }}>
                        {row.type === 'limit'
                          ? (p.limits?.[row.key] === null || p.limits?.[row.key] === undefined
                              ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--teal)', fontWeight: 600 }}><Check size={14} /> {t('unlimited')}</span>
                              : p.limits[row.key])
                          : row.type === 'flag'
                          ? (p.limits?.[row.key]
                              ? <Check size={16} color="var(--teal)" style={{ margin: '0 auto' }} />
                              : <span style={{ color: 'var(--gray-300)' }}>—</span>)
                          : (p.modules?.[row.key]
                              ? <Check size={16} color="var(--teal)" style={{ margin: '0 auto' }} />
                              : <span style={{ color: 'var(--gray-300)' }}>—</span>)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section style={{ background: 'var(--cream)', padding: '3.5rem 2rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.5rem', color: 'var(--navy)', textAlign: 'center', marginBottom: '0.5rem' }}>{t('needCapacityHeading')}</h2>
          <p style={{ textAlign: 'center', color: 'var(--gray-500)', marginBottom: '2rem' }}>{t('needCapacitySub')}</p>
          <div className="card card-shadow" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="table">
              <tbody>
                {addons.map(a => {
                  const isBundle = a.addon_key === 'hr_bundle'
                  const bundleSavings = isBundle
                    ? ['certifications', 'schedules_module', 'cost_to_company', 'leave']
                        .reduce((sum, k) => sum + (Number(addons.find(c => c.addon_key === k)?.monthly_price) || 0), 0) - Number(a.monthly_price)
                    : 0
                  return (
                    <tr key={a.addon_key} style={isBundle ? { background: 'white' } : {}}>
                      <td style={{ fontWeight: 600, color: 'var(--navy)' }}>
                        {ADDON_LABELS[a.addon_key] || a.label || a.addon_key?.replace(/_/g, ' ')}
                        {isBundle && bundleSavings > 0 && (
                          <span style={{ marginLeft: '0.5rem', fontSize: '0.6875rem', fontWeight: 700, color: 'var(--teal)', border: '1px solid var(--teal)', borderRadius: '999px', padding: '0.0625rem 0.5rem' }}>
                            {t('save')} {currency} {bundleSavings.toLocaleString()}/mo
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right', color: 'var(--gray-500)' }}>{currency} {Number(a.monthly_price).toLocaleString()}/mo</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section style={{ background: 'var(--navy)', padding: '4rem 2rem', textAlign: 'center', color: 'white' }}>
        <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '2rem', color: 'white', marginBottom: '0.75rem' }}>{t('stillDecidingHeading')}</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '2rem', fontSize: '1rem' }}>{t('stillDecidingSub')}</p>
        <Link href="/auth/signup" className="btn btn-primary btn-xl">{t('startFree')} <BrandIcon name="arrowRight" size={14} style={{ display:'inline-block' }} /></Link>
      </section>

      <MarketingFooter />
    </div>
  )
}
