'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useToast, ToastContainer } from '@/components/ui/Toast'
import { notify } from '@/lib/notify'
import { STAFF_PACK_PRICING } from '@/lib/constants'

async function syncPayfastAmount(companyId) {
  // Fire-and-report, never throws — a PayFast sync hiccup shouldn't block
  // or roll back an add-on grant/revoke that already succeeded in our own
  // database. Returns the parsed result so callers can warn if it failed.
  try {
    const res = await fetch('/api/payfast/update-subscription-amount', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyId }),
    })
    return await res.json()
  } catch (err) {
    return { synced: false, error: err.message }
  }
}

const TIER_COLOR = { free: '#6b7280', explorer: '#6b7280', basic: '#3b82f6', standard: '#9333ea', professional: '#D4A853', enterprise: '#dc2626' }
const STATUS_OPTIONS = ['active', 'trial', 'vip', 'churned', 'suspended', 'payment_failed']

const ADDON_TYPES = [
  { key: 'hr_bundle', label: 'HR Bundle (Certs+Shifts+CTC+Leave)' },
  { key: 'vehicles', label: 'Extra Vehicle Slot' }, { key: 'guides', label: 'Extra Guide Slot' },
  { key: 'drivers', label: 'Extra Driver Slot' }, { key: 'shuttles', label: 'Extra Shuttle Slot' },
  { key: 'safaris', label: 'Extra Safari Listing' }, { key: 'tours', label: 'Extra Tour Listing' },
  { key: 'charters', label: 'Extra Charter Listing' }, { key: 'trails', label: 'Extra Trail Listing' },
  { key: 'seats', label: 'Extra User Seat' }, { key: 'firearm_register', label: 'Firearm Register' },
  { key: 'schedules_module', label: 'Schedules Module' }, { key: 'white_label', label: 'White-Label Branding' },
  { key: 'no_watermark', label: 'Remove Watermark' }, { key: 'client_list', label: 'Client List & Billing' },
  { key: 'storage_10gb', label: 'Storage +10 GB' }, { key: 'storage_50gb', label: 'Storage +50 GB' },
  { key: 'storage_200gb', label: 'Storage +200 GB' }, { key: 'bandwidth_50gb', label: 'Bandwidth +50 GB' },
  { key: 'bandwidth_200gb', label: 'Bandwidth +200 GB' }, { key: 'bandwidth_1tb', label: 'Bandwidth +1 TB' },
  { key: 'certifications', label: 'Certifications Module (individual)' },
  { key: 'cost_to_company', label: 'Cost to Company Module (individual)' },
  { key: 'leave', label: 'Leave Module (individual)' },
  { key: 'quotations', label: 'Quotations Module (individual)' },
  { key: 'ical_sync', label: 'Channel Sync (Airbnb/Booking.com)' },
  { key: 'delivery_management', label: 'Delivery & Supply Management' },
  { key: 'checklists', label: 'Checklists & Inventory Lists' },
]

function SACompanyDetail({ companyId }) {
  const supabase = createClient()
  const router = useRouter()
  const toast = useToast()
  const [co, setCo] = useState(null)
  const [profiles, setProfiles] = useState([])
  const [bookings, setBookings] = useState([])
  const [addons, setAddons] = useState([])
  const [pendingRequests, setPendingRequests] = useState([])
  const [allPackages, setAllPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('overview')
  const [saving, setSaving] = useState(false)

  const [addonForm, setAddonForm] = useState({ key: 'vehicles', qty: 1, price: '', note: '' })
  const [adminNotes, setAdminNotes] = useState('')
  const [accountStatus, setAccountStatus] = useState('active')
  const [expiresAt, setExpiresAt] = useState('')

  async function load() {
    setLoading(true)
    try {
      // These reads are already permitted for a superadmin directly — the
      // companies/profiles/bookings/company_addons SELECT policies all
      // include `or is_superadmin()`, so no RPC is needed just to read.
      // Company and its package are fetched as two plain queries rather
      // than a PostgREST embedded join (`select('*, package:marketing_
      // packages(*)')`) — that syntax depends on PostgREST's schema-
      // relationship cache already knowing about the FK, which can lag
      // behind a fresh migration for a while even when the table and FK
      // genuinely exist, and fails outright if the migration simply hasn't
      // been run yet on this database.
      const [{ data: company, error: coErr }, p, b, a, pkgs, reqs] = await Promise.all([
        supabase.from('companies').select('*').eq('id', companyId).single(),
        supabase.from('profiles').select('*').eq('company_id', companyId).order('created_at'),
        supabase.from('bookings').select('id,booking_ref,guest_name,amount_total,status,created_at,currency').eq('company_id', companyId).order('created_at', { ascending: false }).limit(10),
        supabase.from('company_addons').select('*').eq('company_id', companyId).eq('active', true).order('created_at', { ascending: false }),
        supabase.from('marketing_packages').select('*').order('sort_order'),
        supabase.from('addon_requests').select('*, profiles(email)').eq('company_id', companyId).eq('status', 'pending').order('created_at'),
      ])
      if (coErr) throw coErr
      if (company?.package_id) {
        const { data: pkg } = await supabase.from('marketing_packages').select('*').eq('id', company.package_id).maybeSingle()
        company.package = pkg || null
      }
      setCo(company)
      setProfiles(p.data || [])
      setBookings(b.data || [])
      setAddons(a.data || [])
      setAllPackages(pkgs.data || [])
      setPendingRequests(reqs.data || [])
      setAdminNotes(company.admin_notes || '')
      setAccountStatus(company.account_status || 'active')
    } catch (error) {
      // error can be a PostgrestError (plain object, not an Error instance)
      // or occasionally something with no .message at all — stringify the
      // whole thing so the console actually shows something useful instead
      // of the unhelpful `{}` an Error-shaped console.error assumes.
      console.error('Error loading company:', JSON.stringify(error, null, 2) || error)
      toast.error('Failed to load company: ' + (error?.message || error?.hint || error?.code || 'unknown error — check console for details'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [companyId])

  async function changePackage(pkg) {
    setSaving(true)
    let expires = expiresAt ? new Date(expiresAt).toISOString() : null
    if (!expires && pkg.monthly_price > 0) {
      const d = new Date(); d.setFullYear(d.getFullYear() + 1); expires = d.toISOString()
    }
    // First time this company has ever moved onto a paid package: start a
    // 30-day trial rather than billing immediately (automatic billing isn't
    // built yet regardless, but this keeps the trial window explicit and
    // visible rather than implicit). Only fires once — if they're already
    // on a paid plan and switch tiers, the existing trial_ends_at (or lack
    // of one, if the trial already ended) is left alone.
    const startingTrial = pkg.monthly_price > 0 && !co.trial_ends_at
    const trialEndsAt = startingTrial ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null
    const { data, error } = await supabase.rpc('sa_update_company', {
      p_company_id: companyId, p_package_id: pkg.id, p_subscription_expires_at: expires,
      p_subscription_tier: pkg.slug,
      p_account_status: startingTrial ? 'trial' : null,
      p_trial_ends_at: trialEndsAt,
    })
    setSaving(false)
    if (error) { toast.error(error.message); return }
    setCo({ ...data, package: pkg })
    const sync = await syncPayfastAmount(companyId)
    toast.success(
      sync.synced === false && sync.error ? `Moved to ${pkg.name}, but PayFast sync failed: ${sync.error}`
      : startingTrial ? `Moved to ${pkg.name} — 30-day trial started` : `Moved to ${pkg.name}`
    )
    setExpiresAt('')
  }

  async function saveSettings() {
    setSaving(true)
    const { data, error } = await supabase.rpc('sa_update_company', {
      p_company_id: companyId, p_account_status: accountStatus, p_admin_notes: adminNotes,
    })
    setSaving(false)
    if (error) { toast.error(error.message); return }
    setCo(data)
    toast.success('Settings saved')
  }

  async function toggleSuspend() {
    const next = accountStatus === 'suspended' ? 'active' : 'suspended'
    if (!confirm(`${next === 'suspended' ? 'Suspend' : 'Reactivate'} ${co.name}?`)) return
    setSaving(true)
    const { data, error } = await supabase.rpc('sa_update_company', { p_company_id: companyId, p_account_status: next })
    setSaving(false)
    if (error) { toast.error(error.message); return }
    setCo(data); setAccountStatus(next)
    toast.success(`Company ${next === 'suspended' ? 'suspended' : 'reactivated'}`)
  }

  async function deactivateCompany() {
    const typed = prompt(`Type the company name exactly to confirm deactivation:\n\n${co.name}`)
    if (typed !== co.name) { toast.error('Name did not match — cancelled'); return }
    setSaving(true)
    const { error } = await supabase.rpc('sa_update_company', { p_company_id: companyId, p_active: false, p_account_status: 'suspended' })
    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success('Company deactivated')
    router.push('/admin/companies')
  }

  async function grantAddon(e) {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase.rpc('sa_grant_addon', {
      p_company_id: companyId, p_addon_key: addonForm.key, p_quantity: Number(addonForm.qty) || 1,
      p_price_per_unit: addonForm.price === '' ? 0 : Number(addonForm.price),
      p_billing_cycle: 'monthly', p_note: addonForm.note || null,
    })
    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success('Add-on granted')
    setAddonForm({ key: 'vehicles', qty: 1, price: '', note: '' })
    const sync = await syncPayfastAmount(companyId)
    if (sync.synced === false && sync.error) toast.error(`Granted, but PayFast sync failed: ${sync.error}`)
    load()
  }

  async function revokeAddon(id) {
    if (!confirm('Revoke this add-on?')) return
    const { error } = await supabase.rpc('sa_revoke_addon', { p_addon_id: id })
    if (error) { toast.error(error.message); return }
    toast.success('Add-on revoked')
    const sync = await syncPayfastAmount(companyId)
    if (sync.synced === false && sync.error) toast.error(`Revoked, but PayFast sync failed: ${sync.error}`)
    load()
  }

  async function approveRequest(req) {
    setSaving(true)
    const { data: priceRow } = await supabase.from('addon_pricing').select('monthly_price').eq('addon_key', req.addon_key).maybeSingle()
    // Staff seats are sold in packs (5/10/20/50) at a bulk-discounted total,
    // not the flat per-seat catalog rate times quantity — see
    // lib/constants.js STAFF_PACK_PRICING. Falls back to the catalog's
    // per-seat rate for anything that isn't a recognized pack size (e.g. a
    // manual 1-seat top-up from elsewhere).
    const packTotal = req.addon_key === 'guides' ? STAFF_PACK_PRICING[req.quantity] : null
    const pricePerUnit = packTotal ? packTotal / req.quantity : (priceRow?.monthly_price || 0)
    const { error: grantErr } = await supabase.rpc('sa_grant_addon', {
      p_company_id: companyId, p_addon_key: req.addon_key, p_quantity: req.quantity || 1,
      p_price_per_unit: pricePerUnit, p_billing_cycle: 'monthly',
      p_note: packTotal ? `Approved from self-service request — ${req.quantity}-seat pack at ${co?.currency || 'R'}${packTotal}/mo total` : 'Approved from self-service request',
    })
    if (grantErr) { setSaving(false); toast.error(grantErr.message); return }
    const { error } = await supabase.from('addon_requests').update({ status: 'approved', resolved_at: new Date().toISOString() }).eq('id', req.id)
    setSaving(false)
    if (error) { toast.error(error.message); return }
    notify('addon_request_resolved', { toEmail: req.profiles?.email, addonKey: req.addon_key, status: 'approved' })
    const sync = await syncPayfastAmount(companyId)
    toast.success(sync.synced === false && sync.error ? `Granted and approved, but PayFast sync failed: ${sync.error}` : 'Granted at standard pricing and approved')
    load()
  }

  async function declineRequest(req) {
    const { error } = await supabase.from('addon_requests').update({ status: 'declined', resolved_at: new Date().toISOString() }).eq('id', req.id)
    if (error) { toast.error(error.message); return }
    notify('addon_request_resolved', { toEmail: req.profiles?.email, addonKey: req.addon_key, status: 'declined' })
    toast.success('Request declined')
    load()
  }

  async function sendPasswordReset(email) {
    // This is the standard, secure "forgot password" flow — it doesn't
    // require the service role key or any elevated privilege, since anyone
    // can trigger a reset email for any account (that's how "forgot
    // password" works everywhere). It's the safer option vs an admin
    // directly setting a password, since the user still controls the change.
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    if (error) { toast.error(error.message); return }
    toast.success(`Password reset email sent to ${email}`)
  }

  async function reset2FA(userId) {
    if (!confirm('Reset 2FA for this user? They will need to set it up again next time 2FA is required.')) return
    const { error } = await supabase.rpc('sa_reset_2fa', { p_user_id: userId })
    if (error) { toast.error(error.message); return }
    toast.success('2FA reset')
    load()
  }

  if (loading) return <div style={{ color: '#9ca3af', padding: 40, textAlign: 'center' }}>Loading company…</div>
  if (!co) return <div style={{ color: '#9ca3af', padding: 40, textAlign: 'center' }}>Company not found</div>

  const sl = (color) => ({ background: color + '22', color, borderRadius: 999, padding: '2px 9px', fontSize: 12, fontWeight: 700 })

  return (
    <div style={{ background: '#0a0a0a', margin: '-1.75rem', padding: '1.75rem', borderRadius: '0.75rem' }}>
      <ToastContainer toasts={toast.toasts} remove={toast.remove} />

      <Link href="/admin/companies" style={{ color: '#6b7280', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 20, textDecoration: 'none', fontSize: 14 }}>
        ← Back to Companies
      </Link>

      <div style={{ background: '#1a1a1a', borderRadius: 14, padding: 24, marginBottom: 20, border: '1px solid #222' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ color: 'white', fontWeight: 900, fontSize: 22 }}>{co.name}</div>
            <div style={{ color: '#6b7280', fontSize: 13, marginTop: 2 }}>{co.email} · {co.phone}</div>
            {co.vat_number && <div style={{ color: '#6b7280', fontSize: 12 }}>VAT: {co.vat_number}</div>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
            <span style={{ ...sl(TIER_COLOR[co.subscription_tier || 'free']), fontSize: 14, padding: '4px 14px', textTransform: 'capitalize' }}>
              {co.subscription_tier || 'free'}
            </span>
            {co.trial_ends_at && (() => {
              const daysLeft = Math.ceil((new Date(co.trial_ends_at) - new Date()) / 86400000)
              const expired = daysLeft < 0
              return (
                <span style={{ ...sl(expired ? '#ef4444' : '#f59e0b'), fontSize: 11, padding: '2px 10px' }}>
                  {expired ? `Trial ended ${Math.abs(daysLeft)}d ago — follow up` : `Trial: ${daysLeft}d left`}
                </span>
              )
            })()}
          </div>
        </div>
        <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ color: '#6b7280', fontSize: 13, marginRight: 6 }}>Change package:</span>
          {allPackages.map(pkg => {
            const active = pkg.id === co.package_id
            const color = TIER_COLOR[pkg.slug] || '#3b82f6'
            return (
              <button key={pkg.id} onClick={() => changePackage(pkg)} disabled={active || saving} title={pkg.tagline}
                style={{
                  background: active ? color + '33' : '#222',
                  color: active ? color : '#9ca3af',
                  border: `1px solid ${active ? color : '#333'}`,
                  borderRadius: 8, padding: '6px 16px', cursor: active ? 'default' : 'pointer',
                  fontWeight: 600, fontSize: 13,
                }}>
                {pkg.name}
              </button>
            )
          })}
          <Link href="/admin/packages" style={{ color: '#6b7280', fontSize: 12, textDecoration: 'underline', marginLeft: 4 }}>Manage packages</Link>
        </div>
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: '#6b7280', fontSize: 12 }}>Expires (optional — defaults to 1yr for paid tiers):</span>
          <input type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)}
            style={{ background: '#111', border: '1px solid #333', color: 'white', borderRadius: 6, padding: '5px 10px', fontSize: 13 }} />
          {co.subscription_expires_at && (
            <span style={{ color: '#f59e0b', fontSize: 12 }}>Current: {new Date(co.subscription_expires_at).toLocaleDateString('en-ZA')}</span>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {['overview', 'addons', 'bookings', 'users', 'settings'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{
              background: tab === t ? '#D4A853' : '#1a1a1a', color: tab === t ? '#0F2540' : '#9ca3af',
              border: 'none', borderRadius: 8, padding: '8px 18px', cursor: 'pointer', fontWeight: 700, fontSize: 13, textTransform: 'capitalize',
            }}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
          {[['Bookings', bookings.length], ['Users', profiles.length], ['Active Add-ons', addons.length]].map(([l, v]) => (
            <div key={l} style={{ background: '#1a1a1a', borderRadius: 12, padding: 18, border: '1px solid #222' }}>
              <div style={{ color: '#6b7280', fontSize: 11, textTransform: 'uppercase', marginBottom: 3 }}>{l}</div>
              <div style={{ color: 'white', fontSize: 28, fontWeight: 900 }}>{v}</div>
            </div>
          ))}
        </div>
      )}

      {tab === 'addons' && (
        <div>
          {pendingRequests.length > 0 && (
            <div style={{ background: '#1a1a00', borderRadius: 12, padding: 20, border: '1px solid #ca8a04', marginBottom: 16 }}>
              <h3 style={{ color: '#fde047', fontWeight: 700, marginBottom: 4, fontSize: 15 }}>Pending Requests ({pendingRequests.length})</h3>
              <p style={{ color: '#a3a3a3', fontSize: 12, marginBottom: 14 }}>Self-service requests from {co.name}'s Add-ons page.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {pendingRequests.map(req => (
                  <div key={req.id} style={{ background: '#111', borderRadius: 8, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'white', fontWeight: 600, fontSize: 13, textTransform: 'capitalize' }}>
                      {req.addon_key.replace(/_/g, ' ')} {req.quantity > 1 ? `×${req.quantity}` : ''}
                      <span style={{ color: '#6b7280', fontWeight: 400, marginLeft: 8 }}>{new Date(req.created_at).toLocaleDateString('en-ZA')}</span>
                    </span>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => approveRequest(req)} disabled={saving} style={{ background: '#22c55e22', color: '#22c55e', border: '1px solid #22c55e', borderRadius: 6, padding: '4px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Approve</button>
                      <button onClick={() => declineRequest(req)} style={{ background: '#ef444422', color: '#ef4444', border: '1px solid #ef4444', borderRadius: 6, padding: '4px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Decline</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ background: '#1a1a1a', borderRadius: 12, padding: 20, border: '1px solid #222', marginBottom: 16 }}>
            <h3 style={{ color: 'white', fontWeight: 700, marginBottom: 4, fontSize: 15 }}>Grant Add-on to {co.name}</h3>
            <p style={{ color: '#6b7280', fontSize: 12, marginBottom: 14 }}>Leave price blank or set to 0 to comp it for free — this overrides the public pricing page for this company only.</p>
            <form onSubmit={grantAddon} style={{ display: 'grid', gridTemplateColumns: '1.5fr 80px 140px 1.5fr auto', gap: 10, alignItems: 'end' }}>
              <div>
                <label style={{ color: '#6b7280', fontSize: 12, display: 'block', marginBottom: 4 }}>Add-on</label>
                <select value={addonForm.key} onChange={e => setAddonForm({ ...addonForm, key: e.target.value })}
                  style={{ background: '#111', border: '1px solid #333', color: 'white', borderRadius: 8, padding: '9px 12px', width: '100%' }}>
                  {ADDON_TYPES.map(a => <option key={a.key} value={a.key}>{a.label}</option>)}
                </select>
              </div>
              <div>
                <label style={{ color: '#6b7280', fontSize: 12, display: 'block', marginBottom: 4 }}>Qty</label>
                <input type="number" min={1} value={addonForm.qty} onChange={e => setAddonForm({ ...addonForm, qty: e.target.value })}
                  style={{ background: '#111', border: '1px solid #333', color: 'white', borderRadius: 8, padding: '9px 12px', width: '100%', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ color: '#6b7280', fontSize: 12, display: 'block', marginBottom: 4 }}>Price/mo (blank=free)</label>
                <input type="number" min={0} placeholder="0 = free" value={addonForm.price} onChange={e => setAddonForm({ ...addonForm, price: e.target.value })}
                  style={{ background: '#111', border: '1px solid #333', color: 'white', borderRadius: 8, padding: '9px 12px', width: '100%', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ color: '#6b7280', fontSize: 12, display: 'block', marginBottom: 4 }}>Note</label>
                <input placeholder="e.g. launch promo" value={addonForm.note} onChange={e => setAddonForm({ ...addonForm, note: e.target.value })}
                  style={{ background: '#111', border: '1px solid #333', color: 'white', borderRadius: 8, padding: '9px 12px', width: '100%', boxSizing: 'border-box' }} />
              </div>
              <button type="submit" disabled={saving}
                style={{ background: '#D4A853', color: '#0F2540', fontWeight: 700, border: 'none', borderRadius: 8, padding: '9px 18px', cursor: 'pointer' }}>
                Grant
              </button>
            </form>
          </div>
          <div style={{ background: '#111', borderRadius: 12, border: '1px solid #222', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#0d0d0d' }}>
                  {['Add-on', 'Qty', 'Price/unit', 'Note', 'Action'].map(h => (
                    <th key={h} style={{ padding: '9px 14px', textAlign: 'left', color: '#6b7280', fontSize: 11, textTransform: 'uppercase', borderBottom: '1px solid #222' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {addons.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: 24, textAlign: 'center', color: '#6b7280' }}>No active add-ons</td></tr>
                ) : addons.map(a => (
                  <tr key={a.id} style={{ borderBottom: '1px solid #1a1a1a' }}>
                    <td style={{ padding: '10px 14px', color: 'white', fontWeight: 600, textTransform: 'capitalize' }}>{a.addon_key?.replace(/_/g, ' ')}</td>
                    <td style={{ padding: '10px 14px', color: '#D4A853', fontWeight: 700 }}>{a.quantity}</td>
                    <td style={{ padding: '10px 14px', color: Number(a.price_per_unit) === 0 ? '#22c55e' : '#9ca3af', fontWeight: Number(a.price_per_unit) === 0 ? 700 : 400 }}>
                      {Number(a.price_per_unit) === 0 ? 'FREE' : `R${a.price_per_unit}/mo`}
                    </td>
                    <td style={{ padding: '10px 14px', color: '#6b7280', fontSize: 13 }}>{a.note || '—'}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <button onClick={() => revokeAddon(a.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                        Revoke
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'bookings' && (
        <div style={{ background: '#111', borderRadius: 12, border: '1px solid #222', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#0d0d0d' }}>
                {['Ref', 'Guest', 'Amount', 'Status', 'Date'].map(h => (
                  <th key={h} style={{ padding: '9px 14px', textAlign: 'left', color: '#6b7280', fontSize: 11, textTransform: 'uppercase', borderBottom: '1px solid #222' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: 24, textAlign: 'center', color: '#6b7280' }}>No bookings</td></tr>
              ) : bookings.map(b => (
                <tr key={b.id} style={{ borderBottom: '1px solid #1a1a1a' }}>
                  <td style={{ padding: '10px 14px' }}><code style={{ background: '#222', color: '#D4A853', borderRadius: 6, padding: '2px 8px', fontSize: 12 }}>{b.booking_ref}</code></td>
                  <td style={{ padding: '10px 14px', color: 'white', fontWeight: 600 }}>{b.guest_name}</td>
                  <td style={{ padding: '10px 14px', color: '#22c55e', fontWeight: 700 }}>{b.currency} {Number(b.amount_total || 0).toLocaleString()}</td>
                  <td style={{ padding: '10px 14px', color: '#9ca3af', textTransform: 'capitalize' }}>{b.status}</td>
                  <td style={{ padding: '10px 14px', color: '#6b7280', fontSize: 13 }}>{b.created_at ? new Date(b.created_at).toLocaleDateString('en-ZA') : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'users' && (
        <div style={{ background: '#111', borderRadius: 12, border: '1px solid #222', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#0d0d0d' }}>
                {['Name', 'Email', 'Role', '2FA', 'Joined', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '9px 14px', textAlign: 'left', color: '#6b7280', fontSize: 11, textTransform: 'uppercase', borderBottom: '1px solid #222' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {profiles.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid #1a1a1a' }}>
                  <td style={{ padding: '10px 14px', color: 'white', fontWeight: 600 }}>{p.full_name || '—'}</td>
                  <td style={{ padding: '10px 14px', color: '#9ca3af' }}>{p.email || '—'}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ background: '#1a1a2a', color: '#818cf8', borderRadius: 999, padding: '2px 9px', fontSize: 12, fontWeight: 700, textTransform: 'capitalize' }}>{p.role}</span>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ background: p.totp_enabled ? '#22c55e22' : '#6b728022', color: p.totp_enabled ? '#22c55e' : '#6b7280', borderRadius: 999, padding: '2px 9px', fontSize: 12, fontWeight: 700 }}>
                      {p.totp_enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px', color: '#6b7280', fontSize: 13 }}>{p.created_at ? new Date(p.created_at).toLocaleDateString('en-ZA') : '—'}</td>
                  <td style={{ padding: '10px 14px', display: 'flex', gap: 8 }}>
                    <button onClick={() => sendPasswordReset(p.email)} disabled={!p.email}
                      style={{ background: '#1a1a2a', color: '#818cf8', border: '1px solid #333', borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 600, cursor: p.email ? 'pointer' : 'not-allowed' }}>
                      Reset Password
                    </button>
                    {p.totp_enabled && (
                      <button onClick={() => reset2FA(p.id)}
                        style={{ background: '#dc262622', color: '#ef4444', border: '1px solid #ef4444', borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                        Reset 2FA
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'settings' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ background: '#1a1a1a', borderRadius: 12, padding: 20, border: '1px solid #222' }}>
            <h3 style={{ color: 'white', fontWeight: 700, marginBottom: 14, fontSize: 15 }}>Account Status</h3>
            <div style={{ marginBottom: 14 }}>
              <label style={{ color: '#6b7280', fontSize: 12, display: 'block', marginBottom: 6 }}>Status</label>
              <select value={accountStatus} onChange={e => setAccountStatus(e.target.value)}
                style={{ width: '100%', background: '#111', border: '1px solid #333', color: 'white', borderRadius: 8, padding: '9px 12px', fontSize: 14, boxSizing: 'border-box' }}>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ color: '#6b7280', fontSize: 12, display: 'block', marginBottom: 6 }}>Admin Notes (internal)</label>
              <textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)} rows={4} placeholder="Internal notes — not visible to the company…"
                style={{ width: '100%', background: '#111', border: '1px solid #333', color: 'white', borderRadius: 8, padding: '9px 12px', fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={saveSettings} disabled={saving}
                style={{ flex: 1, background: '#D4A853', color: '#0F2540', fontWeight: 700, border: 'none', borderRadius: 8, padding: '10px 0', cursor: 'pointer', fontSize: 14 }}>
                {saving ? 'Saving…' : 'Save Settings'}
              </button>
              <button onClick={toggleSuspend}
                style={{
                  background: accountStatus === 'suspended' ? '#22c55e22' : '#dc262622',
                  color: accountStatus === 'suspended' ? '#22c55e' : '#ef4444',
                  fontWeight: 700, border: `1px solid ${accountStatus === 'suspended' ? '#22c55e' : '#dc2626'}`,
                  borderRadius: 8, padding: '10px 16px', cursor: 'pointer', fontSize: 13,
                }}>
                {accountStatus === 'suspended' ? 'Reactivate' : 'Suspend'}
              </button>
            </div>
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #222' }}>
              <div style={{ color: '#6b7280', fontSize: 12, marginBottom: 8 }}>Danger Zone</div>
              <button onClick={deactivateCompany}
                style={{ width: '100%', background: '#1a0000', color: '#ef4444', fontWeight: 700, border: '1px solid #ef4444', borderRadius: 8, padding: '10px 0', cursor: 'pointer', fontSize: 13 }}>
                Deactivate Company
              </button>
              <p style={{ color: '#4b5563', fontSize: 11, marginTop: 8 }}>
                Deactivates and suspends the account rather than hard-deleting — their bookings, staff and invoice records are kept intact in case this needs to be reversed.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Page() {
  const params = useParams()
  return <SACompanyDetail companyId={params.id} />
}

export const dynamic = 'force-dynamic'
