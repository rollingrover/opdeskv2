'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast, ToastContainer } from '@/components/ui/Toast'
import { GATED_MODULES, MODULE_LABELS } from '@/lib/constants'
import { Plus, Trash2, Eye, EyeOff, GripVertical } from 'lucide-react'

const emptyForm = {
  name: '', slug: '', tagline: '', description: '', monthly_price: 0, annual_price: 0,
  currency: 'ZAR', badge: '', sort_order: 0, recommended_for: [],
  limits: { vehicles: 1, guides: 1, rooms: 1, bookings_per_month: 20, clients: 1, orders_per_month: 20,
    vehicle_cost_suggestions: false, recurring_orders: false, advanced_reporting: false, quoted_vs_actual: false, cost_breakdown_analytics: false },
  modules: { certifications: false, shifts: false, costs: false, leave: false },
}

const VERTICAL_TAGS = [
  { key: 'safari', label: 'Safari / Game Lodge' }, { key: 'shuttle', label: 'Shuttle' },
  { key: 'fishing', label: 'Fishing Charter' }, { key: 'yacht', label: 'Yacht Charter' },
  { key: 'trail', label: 'Trail Guide' }, { key: 'lodge', label: 'Hotel / Guesthouse / Lodging' },
  { key: 'eastafrica', label: 'East Africa Tours' }, { key: 'transfer', label: 'Island Transfers' },
  { key: 'delivery', label: 'Logistics & Support Services' },
]

const LOGISTICS_LIMIT_KEYS = ['clients', 'orders_per_month']
const LOGISTICS_FEATURE_KEYS = [
  { key: 'vehicle_cost_suggestions', label: 'Vehicle Cost Suggestions' },
  { key: 'recurring_orders', label: 'Recurring Order Templates' },
  { key: 'advanced_reporting', label: 'Advanced Reporting' },
  { key: 'quoted_vs_actual', label: 'Quoted vs. Actual Cost Tracking' },
  { key: 'cost_breakdown_analytics', label: 'Cost Breakdown & Export' },
]

function slugify(name) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function SAMarketingPackages() {
  const supabase = createClient()
  const toast = useToast()
  const [packages, setPackages] = useState([])
  const [companiesInUse, setCompaniesInUse] = useState({}) // package_id -> count
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null) // null=list, {}=new, {...}=edit
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    const [{ data: pkgs }, { data: companies }] = await Promise.all([
      supabase.from('marketing_packages').select('*').order('sort_order'),
      supabase.from('companies').select('package_id'),
    ])
    setPackages(pkgs || [])
    const counts = {}
    ;(companies || []).forEach(c => { if (c.package_id) counts[c.package_id] = (counts[c.package_id] || 0) + 1 })
    setCompaniesInUse(counts)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function startNew() {
    setForm({ ...emptyForm, sort_order: packages.length + 1 })
    setEditing({})
  }

  function startEdit(p) {
    setForm({
      name: p.name, slug: p.slug, tagline: p.tagline || '', description: p.description || '',
      monthly_price: p.monthly_price, annual_price: p.annual_price, currency: p.currency || 'ZAR',
      badge: p.badge || '', sort_order: p.sort_order, recommended_for: p.recommended_for || [],
      limits: { vehicles: 1, guides: 1, rooms: 1, bookings_per_month: null, clients: 1, orders_per_month: null,
        vehicle_cost_suggestions: false, recurring_orders: false, advanced_reporting: false, quoted_vs_actual: false, cost_breakdown_analytics: false,
        ...(p.limits || {}) },
      modules: { certifications: false, shifts: false, costs: false, leave: false, ...(p.modules || {}) },
    })
    setEditing(p)
  }

  async function save(e) {
    e.preventDefault()
    setSaving(true)
    const payload = {
      ...form,
      slug: form.slug || slugify(form.name),
      monthly_price: Number(form.monthly_price) || 0,
      annual_price: Number(form.annual_price) || 0,
      sort_order: Number(form.sort_order) || 0,
      badge: form.badge || null,
    }
    let error
    if (editing?.id) {
      ;({ error } = await supabase.from('marketing_packages').update(payload).eq('id', editing.id))
    } else {
      ;({ error } = await supabase.from('marketing_packages').insert([payload]))
    }
    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success(editing?.id ? 'Package updated — live on the pricing page immediately' : 'Package created')
    setEditing(null)
    load()
  }

  async function toggleActive(p) {
    const { error } = await supabase.from('marketing_packages').update({ active: !p.active }).eq('id', p.id)
    if (error) { toast.error(error.message); return }
    toast.success(p.active ? 'Hidden from pricing page' : 'Now live on pricing page')
    load()
  }

  async function remove(p) {
    const inUse = companiesInUse[p.id] || 0
    if (inUse > 0) {
      toast.error(`Can't delete — ${inUse} compan${inUse === 1 ? 'y is' : 'ies are'} currently on this package. Deactivate it instead, or move them to another package first.`)
      return
    }
    if (!confirm(`Delete "${p.name}" permanently? This can't be undone.`)) return
    const { error } = await supabase.from('marketing_packages').delete().eq('id', p.id)
    if (error) { toast.error(error.message); return }
    toast.success('Package deleted')
    load()
  }

  const inputStyle = { background: '#111', border: '1px solid #333', color: 'white', borderRadius: 8, padding: '9px 12px', fontSize: 13, width: '100%', boxSizing: 'border-box' }
  const labelStyle = { color: '#9ca3af', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }

  if (loading) return <div style={{ color: '#9ca3af', padding: 40, textAlign: 'center' }}>Loading packages…</div>

  return (
    <div style={{ background: '#0a0a0a', margin: '-1.75rem', padding: '1.75rem', borderRadius: '0.75rem' }}>
      <ToastContainer toasts={toast.toasts} remove={toast.remove} />

      {!editing ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: 'white', marginBottom: 4 }}>Marketing Packages</h2>
              <p style={{ color: '#6b7280', fontSize: 14 }}>Controls exactly what shows on the public /pricing page, live.</p>
            </div>
            <button onClick={startNew} style={{ background: '#D4A853', color: '#0F2540', fontWeight: 700, border: 'none', borderRadius: 8, padding: '9px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Plus size={16} /> New Package
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {packages.length === 0 ? (
              <div style={{ background: '#1a1a1a', borderRadius: 12, padding: 40, textAlign: 'center', color: '#6b7280', border: '1px solid #222' }}>
                No packages yet — create your first one.
              </div>
            ) : packages.map(p => {
              const inUse = companiesInUse[p.id] || 0
              const included = Object.entries(p.modules || {}).filter(([, v]) => v === true).map(([k]) => MODULE_LABELS[k] || k)
              return (
                <div key={p.id} style={{ background: '#1a1a1a', border: '1px solid #222', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, opacity: p.active ? 1 : 0.5 }}>
                  <GripVertical size={16} color="#4b5563" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>{p.name}</span>
                      {p.badge && <span style={{ background: '#D4A85322', color: '#D4A853', borderRadius: 999, padding: '1px 8px', fontSize: 10, fontWeight: 700 }}>{p.badge}</span>}
                      {(p.recommended_for || []).map(tag => (
                        <span key={tag} style={{ background: '#3b82f622', color: '#3b82f6', borderRadius: 999, padding: '1px 8px', fontSize: 10, fontWeight: 700, textTransform: 'capitalize' }}>{tag}</span>
                      ))}
                      {!p.active && <span style={{ background: '#37415122', color: '#6b7280', borderRadius: 999, padding: '1px 8px', fontSize: 10, fontWeight: 700 }}>HIDDEN</span>}
                      {inUse > 0 && <span style={{ color: '#6b7280', fontSize: 11 }}>· {inUse} compan{inUse === 1 ? 'y' : 'ies'}</span>}
                    </div>
                    <div style={{ color: '#6b7280', fontSize: 12, marginTop: 2 }}>{p.tagline}</div>
                    {included.length > 0 && <div style={{ color: '#4b5563', fontSize: 11, marginTop: 2 }}>Includes: {included.join(', ')}</div>}
                  </div>
                  <div style={{ color: '#D4A853', fontWeight: 700, fontSize: 16, minWidth: 90, textAlign: 'right' }}>
                    {p.currency} {Number(p.monthly_price).toLocaleString()}<span style={{ fontSize: 11, color: '#6b7280' }}>/mo</span>
                  </div>
                  <button onClick={() => toggleActive(p)} title={p.active ? 'Hide from pricing page' : 'Show on pricing page'} style={{ color: p.active ? '#22c55e' : '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}>
                    {p.active ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                  <button onClick={() => startEdit(p)} style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Edit</button>
                  <button onClick={() => remove(p)} title={inUse > 0 ? 'In use — deactivate instead' : 'Delete'} style={{ color: inUse > 0 ? '#4b5563' : '#ef4444', background: 'none', border: 'none', cursor: inUse > 0 ? 'not-allowed' : 'pointer' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              )
            })}
          </div>
        </>
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: 'white' }}>{editing?.id ? `Edit "${editing.name}"` : 'New Package'}</h2>
            <button onClick={() => setEditing(null)} style={{ color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>← Back to list</button>
          </div>

          <form onSubmit={save} style={{ maxWidth: 640 }}>
            <div style={{ background: '#1a1a1a', borderRadius: 12, padding: 20, border: '1px solid #222', marginBottom: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={labelStyle}>Package Name</label>
                  <input required style={inputStyle} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Slug (URL-safe, unique)</label>
                  <input style={inputStyle} placeholder={slugify(form.name) || 'auto-generated'} value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} />
                </div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Tagline</label>
                <input style={inputStyle} placeholder="e.g. For growing teams" value={form.tagline} onChange={e => setForm({ ...form, tagline: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Monthly Price</label>
                  <input type="number" min="0" step="0.01" style={inputStyle} value={form.monthly_price} onChange={e => setForm({ ...form, monthly_price: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Annual Price</label>
                  <input type="number" min="0" step="0.01" style={inputStyle} value={form.annual_price} onChange={e => setForm({ ...form, annual_price: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Badge</label>
                  <input style={inputStyle} placeholder="e.g. Most Popular" value={form.badge} onChange={e => setForm({ ...form, badge: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Sort Order</label>
                  <input type="number" style={inputStyle} value={form.sort_order} onChange={e => setForm({ ...form, sort_order: e.target.value })} />
                </div>
              </div>
            </div>

            <div style={{ background: '#1a1a1a', borderRadius: 12, padding: 20, border: '1px solid #222', marginBottom: 16 }}>
              <h3 style={{ color: 'white', fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Resource Limits</h3>
              <p style={{ color: '#6b7280', fontSize: 11, marginBottom: 12 }}>Leave blank for unlimited.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 14 }}>
                {(form.recommended_for.includes('delivery') ? LOGISTICS_LIMIT_KEYS : ['vehicles', 'guides', 'rooms', 'bookings_per_month']).map(key => (
                  <div key={key}>
                    <label style={labelStyle}>{key.replace(/_/g, ' ')}</label>
                    <input type="number" min="0" style={inputStyle} placeholder="Unlimited"
                      value={form.limits[key] ?? ''}
                      onChange={e => setForm({ ...form, limits: { ...form.limits, [key]: e.target.value === '' ? null : Number(e.target.value) } })} />
                  </div>
                ))}
              </div>
            </div>

            {form.recommended_for.includes('delivery') && (
              <div style={{ background: '#1a1a1a', borderRadius: 12, padding: 20, border: '1px solid #222', marginBottom: 16 }}>
                <h3 style={{ color: 'white', fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Logistics Features</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {LOGISTICS_FEATURE_KEYS.map(f => (
                    <label key={f.key} style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#9ca3af', fontSize: 13, cursor: 'pointer' }}>
                      <input type="checkbox" checked={!!form.limits[f.key]} style={{ accentColor: '#D4A853' }}
                        onChange={e => setForm({ ...form, limits: { ...form.limits, [f.key]: e.target.checked } })} />
                      {f.label}
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div style={{ background: '#1a1a1a', borderRadius: 12, padding: 20, border: '1px solid #222', marginBottom: 16 }}>
              <h3 style={{ color: 'white', fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Included Modules</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {GATED_MODULES.map(m => (
                  <label key={m} style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#9ca3af', fontSize: 13, cursor: 'pointer' }}>
                    <input type="checkbox" checked={!!form.modules[m]} style={{ accentColor: '#D4A853' }}
                      onChange={e => setForm({ ...form, modules: { ...form.modules, [m]: e.target.checked } })} />
                    {MODULE_LABELS[m]}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ background: '#1a1a1a', borderRadius: 12, padding: 20, border: '1px solid #222', marginBottom: 16 }}>
              <h3 style={{ color: 'white', fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Recommended For</h3>
              <p style={{ color: '#6b7280', fontSize: 11, marginBottom: 12 }}>Shows as a badge on the pricing page — doesn't restrict who can buy it, every package is purchasable by every operator type.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {VERTICAL_TAGS.map(v => (
                  <label key={v.key} style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#9ca3af', fontSize: 13, cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.recommended_for.includes(v.key)} style={{ accentColor: '#D4A853' }}
                      onChange={e => setForm({
                        ...form,
                        recommended_for: e.target.checked
                          ? [...form.recommended_for, v.key]
                          : form.recommended_for.filter(k => k !== v.key),
                      })} />
                    {v.label}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={() => setEditing(null)} style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: '1px solid #333', background: 'none', color: '#9ca3af', cursor: 'pointer', fontWeight: 600 }}>
                Cancel
              </button>
              <button type="submit" disabled={saving} style={{ flex: 2, padding: '10px 0', borderRadius: 8, background: '#D4A853', border: 'none', color: '#0F2540', cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
                {saving ? 'Saving…' : editing?.id ? 'Save Changes' : 'Create Package'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default function Page() {
  return <SAMarketingPackages />
}

export const dynamic = 'force-dynamic'
