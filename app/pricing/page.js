'use client'
import { BrandIcon } from '@/components/ui/BrandIcon'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { MarketingNav } from '@/components/marketing/MarketingNav'
import { MarketingFooter } from '@/components/marketing/MarketingFooter'
import { Check } from 'lucide-react'
import { MODULE_LABELS, GATED_MODULES } from '@/lib/constants'

const VERTICAL_ICON = {
  safari: 'safari', shuttle: 'shuttle', fishing: 'fishing', yacht: 'yacht',
  trail: 'trailGuide', lodge: 'gameLodge', eastafrica: 'eastAfrica', transfer: 'islandTransfer',
}
const VERTICAL_NAME = {
  safari: 'Safari', shuttle: 'Shuttle', fishing: 'Fishing', yacht: 'Yacht',
  trail: 'Trail Guide', lodge: 'Lodging', eastafrica: 'East Africa Tours', transfer: 'Island Transfers',
}

// Rows for the feature comparison table below the cards.
const COMPARISON_ROWS = [
  { key: 'vehicles', label: 'Vehicles', type: 'limit' },
  { key: 'guides', label: 'Guides', type: 'limit' },
  { key: 'rooms', label: 'Rooms', type: 'limit' },
  { key: 'bookings_per_month', label: 'Bookings / month', type: 'limit' },
  ...GATED_MODULES.map(m => ({ key: m, label: MODULE_LABELS[m], type: 'module' })),
]

const ADDON_LABELS = {
  vehicles: 'Extra Vehicle Slot', guides: 'Extra Guide Slot', drivers: 'Extra Driver Slot',
  shuttles: 'Extra Shuttle Slot', safaris: 'Extra Safari Listing', tours: 'Extra Tour Listing',
  charters: 'Extra Charter Listing', trails: 'Extra Trail Listing', seats: 'Extra User Seat',
  firearm_register: 'Firearm Register', schedules_module: 'Schedules & Shifts Module',
  white_label: 'White-Label Branding', no_watermark: 'Remove Watermark',
  storage_10gb: 'Storage +10 GB', storage_50gb: 'Storage +50 GB', storage_200gb: 'Storage +200 GB',
  bandwidth_50gb: 'Bandwidth +50 GB', bandwidth_200gb: 'Bandwidth +200 GB', bandwidth_1tb: 'Bandwidth +1 TB',
  client_list: 'Client List & Billing', certifications: 'Certifications Module',
  cost_to_company: 'Cost to Company Module', leave: 'Leave Module',
  hr_bundle: 'HR Bundle — Certifications, Shifts, Cost to Company & Leave',
}

function formatLimitCell(value) {
  if (value === null || value === undefined) {
    return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--teal)', fontWeight: 600 }}><Check size={14} /> Unlimited</span>
  }
  return value
}

// Builds a readable bullet list straight from a package's limits/modules
// JSON, so a brand-new package created in Marketing Packages shows sensible
// highlights immediately without needing a matching hardcoded entry
// somewhere else in the code — the DB row is the only thing that needs editing.
function buildHighlights(pkg) {
  const lines = []
  const limits = pkg.limits || {}
  if (limits.vehicles !== undefined) lines.push(limits.vehicles === null ? 'Unlimited vehicles' : `${limits.vehicles} vehicle${limits.vehicles === 1 ? '' : 's'}`)
  if (limits.guides !== undefined) lines.push(limits.guides === null ? 'Unlimited guides' : `${limits.guides} guide${limits.guides === 1 ? '' : 's'}`)
  if (limits.rooms !== undefined) lines.push(limits.rooms === null ? 'Unlimited rooms' : `${limits.rooms} room${limits.rooms === 1 ? '' : 's'}`)
  if (limits.bookings_per_month !== undefined) lines.push(limits.bookings_per_month === null ? 'Unlimited bookings' : `${limits.bookings_per_month} bookings/mo`)
  const modules = pkg.modules || {}
  const included = Object.entries(modules).filter(([, v]) => v === true).map(([k]) => MODULE_LABELS[k] || k)
  if (included.length) lines.push(`${included.join(', ')} included`)
  return lines
}

export default function PricingPage() {
  const [packages, setPackages] = useState([])
  const [addons, setAddons] = useState([])
  const [annual, setAnnual] = useState(false)
  const [currency] = useState('ZAR')
  const [loading, setLoading] = useState(true)
  const [vertical, setVertical] = useState('operators') // 'operators' | 'lodge'

  useEffect(() => {
    const supabase = createClient()
    ;(async () => {
      const { data: p } = await supabase.from('marketing_packages').select('*').eq('active', true).order('sort_order')
      const { data: a } = await supabase.from('addon_pricing').select('*').order('addon_key')
      setPackages(p || [])
      setAddons(a || [])
      setLoading(false)
    })()
  }, [])

  // Two groups: "Lodging" packages (tagged lodge, room/guest-focused) and
  // everything else ("Tour & Transport Operators" — safari/shuttle/fishing/
  // yacht/trail/etc, vehicle-focused). Every package is still purchasable by
  // anyone regardless of tag — this is just which set shows by default.
  const visiblePackages = packages.filter(p =>
    vertical === 'lodge' ? (p.recommended_for || []).includes('lodge') : !(p.recommended_for || []).includes('lodge')
  )

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      <MarketingNav />

      <section style={{ background: 'linear-gradient(135deg, var(--navy) 0%, #1a3a5c 55%, #1B8A8F 100%)', padding: '4rem 2rem 3rem', textAlign: 'center', color: 'white' }}>
        <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 'clamp(2rem, 4.5vw, 3rem)', fontWeight: 900, color: 'white', margin: '0 auto 1rem' }}>
          Simple, transparent pricing
        </h1>
        <p style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,0.75)', maxWidth: '560px', margin: '0 auto 1.75rem', lineHeight: 1.6 }}>
          Start free. Upgrade only when you need more capacity. Built for safari, shuttle, fishing, yacht, trail and lodging operators alike.
        </p>
        <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.1)', borderRadius: '999px', padding: '0.25rem' }}>
          {[['Monthly', false], ['Annual (save ~17%)', true]].map(([label, val]) => (
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

        <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.1)', borderRadius: '999px', padding: '0.25rem', marginTop: '1rem' }}>
          {[['Tour & Transport Operators', 'operators'], ['Lodging & Hospitality', 'lodge']].map(([label, val]) => (
            <button key={val} onClick={() => setVertical(val)}
              style={{
                border: 'none', borderRadius: '999px', padding: '0.5rem 1.25rem', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer',
                background: vertical === val ? 'var(--gold)' : 'transparent',
                color: vertical === val ? 'var(--navy)' : 'rgba(255,255,255,0.7)',
              }}>
              {label}
            </button>
          ))}
        </div>
      </section>

      <section style={{ padding: '3.5rem 2rem', maxWidth: '1300px', margin: '0 auto' }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--gray-400)' }}>Loading plans…</p>
        ) : visiblePackages.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--gray-400)' }}>Pricing is being updated — check back shortly.</p>
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
                  {p.recommended_for && p.recommended_for.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '1rem' }}>
                      {p.recommended_for.map(tag => (
                        <span key={tag} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: 'var(--cream)', borderRadius: '999px', padding: '0.125rem 0.5rem 0.125rem 0.25rem', fontSize: '0.6875rem', fontWeight: 600, color: 'var(--navy)' }}>
                          <BrandIcon name={VERTICAL_ICON[tag]} size={14} /> {VERTICAL_NAME[tag] || tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <span style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--navy)' }}>
                      {p.monthly_price === 0 ? 'Free' : `${p.currency || currency} ${Number(annual ? Math.round(p.annual_price / 12) : p.monthly_price).toLocaleString()}`}
                    </span>
                    {p.monthly_price > 0 && <span style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>/mo{annual ? ', billed annually' : ''}</span>}
                  </div>
                  <ul style={{ listStyle: 'none', margin: '0 0 1.5rem', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {highlights.map(h => (
                      <li key={h} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--gray-500)' }}>
                        <Check size={14} color="var(--gold)" /> {h}
                      </li>
                    ))}
                  </ul>
                  <Link href={p.monthly_price === 0 ? '/auth/signup' : `/auth/signup?package=${p.slug}`} className={popular ? 'btn btn-primary' : 'btn btn-outline'} style={{ width: '100%', justifyContent: 'center' }}>
                    {p.monthly_price === 0 ? 'Start Free' : 'Choose Plan'}
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {!loading && visiblePackages.length > 0 && (
        <section style={{ padding: '0 2rem 3.5rem', maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.5rem', color: 'var(--navy)', textAlign: 'center', marginBottom: '1.75rem' }}>Compare plans in detail</h2>
          <div className="card card-shadow" style={{ padding: 0, overflow: 'auto' }}>
            <table className="table" style={{ minWidth: 640 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left' }}>Feature</th>
                  {visiblePackages.map(p => (
                    <th key={p.id} style={{ textAlign: 'center', color: 'var(--navy)' }}>{p.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map(row => (
                  <tr key={row.key}>
                    <td style={{ fontWeight: 600, color: 'var(--navy)' }}>{row.label}</td>
                    {visiblePackages.map(p => (
                      <td key={p.id} style={{ textAlign: 'center', color: 'var(--gray-500)' }}>
                        {row.type === 'limit'
                          ? formatLimitCell(p.limits?.[row.key])
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
          <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.5rem', color: 'var(--navy)', textAlign: 'center', marginBottom: '0.5rem' }}>Need more capacity?</h2>
          <p style={{ textAlign: 'center', color: 'var(--gray-500)', marginBottom: '2rem' }}>Add extra slots and modules to any paid plan.</p>
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
                            Save {currency} {bundleSavings.toLocaleString()}/mo
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
        <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '2rem', color: 'white', marginBottom: '0.75rem' }}>Still deciding?</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '2rem', fontSize: '1rem' }}>Start on the Free plan — no credit card, no time limit.</p>
        <Link href="/auth/signup" className="btn btn-primary btn-xl">Start for Free <BrandIcon name="arrowRight" size={14} style={{ display:'inline-block' }} /></Link>
      </section>

      <MarketingFooter />
    </div>
  )
}
