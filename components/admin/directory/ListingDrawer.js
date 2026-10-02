'use client'
import { useState } from 'react'
import { C, CATEGORY_LABELS, BILLING_COLORS, PLAN_PRICES, Btn, Pill, input, label, dirAction, fmtDate } from './ui'

const EMPTY = {
  name: '', category: 'stay', town: '', province: 'KwaZulu-Natal', summary: '', description: '', phone: '',
  whatsapp: '', email: '', website_url: '', photo_url: '', lat: '', lng: '', tier: 'community',
  sites: ['zatours'], published: false, claimed: false, company_id: '', partner_source: '',
}
const PROVINCES = ['Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo', 'Mpumalanga', 'North West', 'Northern Cape', 'Western Cape']
const ZATOURS = process.env.NEXT_PUBLIC_ZATOURS_URL || 'https://www.zatours.co.za'
const ROUTE22 = process.env.NEXT_PUBLIC_ROUTE22_URL || 'https://www.route22zululand.co.za'

function Section({ title, children, right }) {
  return (
    <div style={{ borderTop: `1px solid ${C.line}`, paddingTop: 16, marginTop: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <h4 style={{ margin: 0, color: 'white', fontSize: 14 }}>{title}</h4>{right}
      </div>
      {children}
    </div>
  )
}

// Side panel for one listing: details, billing, owner edit link, PayFast plan link.
// `listing` null + `prefill` = create mode (optionally from a business lead).
export default function ListingDrawer({ listing, prefill, lead, billing, companies, onClose, onSaved, toast }) {
  const creating = !listing
  // Initialised once from props — the parent remounts this panel (key) when a
  // different listing or lead is opened.
  const [form, setForm] = useState(() => {
    const src = listing || { ...EMPTY, ...(prefill || {}) }
    return {
      ...EMPTY, ...Object.fromEntries(Object.entries(src).filter(([k]) => k in EMPTY).map(([k, v]) => [k, v ?? ''])),
      sites: src.sites?.length ? src.sites : ['zatours'],
    }
  })
  const [saving, setSaving] = useState(false)
  const [bill, setBill] = useState(() => ({
    billing_status: billing?.billing_status || 'free', paid_until: billing?.paid_until || '', source: billing?.source || 'direct',
  }))
  const [ownerEmail, setOwnerEmail] = useState(() => billing?.owner_email || listing?.email || lead?.email || '')
  const [pay, setPay] = useState(() => ({
    plan: lead?.interest === 'featured' || listing?.tier === 'featured' ? 'featured' : 'premium',
    name: lead?.contact || '', email: lead?.email || billing?.owner_email || listing?.email || '', sendEmail: true,
  }))
  const [payUrl, setPayUrl] = useState(() => lead?.payment_link || '')
  const [working, setWorking] = useState('')

  const set = k => e => setForm(f => ({ ...f, [k]: e?.target ? (e.target.type === 'checkbox' ? e.target.checked : e.target.value) : e }))

  async function save() {
    setSaving(true)
    try {
      const fields = { ...form, company_id: form.company_id || null }
      if (creating) {
        const r = await dirAction('create_listing', { fields, leadId: lead?.id })
        toast.success(`Listing created (${r.slug})`)
      } else {
        await dirAction('update_listing', { id: listing.id, patch: fields })
        toast.success('Listing saved')
      }
      await onSaved(!creating)
      if (creating) onClose()
    } catch (e) { toast.error(e.message) }
    setSaving(false)
  }

  async function run(key, fn) {
    setWorking(key)
    try { await fn() } catch (e) { toast.error(e.message) }
    setWorking('')
  }

  const liveUrl = listing && `${listing.sites?.includes('zatours') ? ZATOURS : ROUTE22}/listings/${listing.slug}`
  const twoCol = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', justifyContent: 'flex-end', background: 'rgba(0,0,0,0.55)' }}
      onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
        style={{ width: 'min(620px, 100%)', height: '100%', overflowY: 'auto', background: C.bg, borderLeft: `1px solid ${C.line}`, padding: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div>
            <h3 style={{ margin: 0, color: 'white', fontSize: 18 }}>{creating ? 'Add listing' : listing.name}</h3>
            {!creating && (
              <p style={{ margin: '4px 0 0', color: C.muted, fontSize: 12 }}>
                /{listing.slug} · created {fmtDate(listing.created_at)}
                {listing.published && listing.tier !== 'community' && (
                  <> · <a href={liveUrl} target="_blank" rel="noopener noreferrer" style={{ color: C.gold }}>view live ↗</a></>
                )}
              </p>
            )}
            {lead && <p style={{ margin: '6px 0 0', color: C.amber, fontSize: 12 }}>From lead: {lead.business} ({lead.contact})</p>}
          </div>
          <Btn kind="ghost" onClick={onClose}>✕</Btn>
        </div>

        <Section title="Details">
          <div style={twoCol}>
            <label style={label}>Name<input style={input} value={form.name} onChange={set('name')} /></label>
            <label style={label}>Category
              <select style={input} value={form.category} onChange={set('category')}>
                {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </label>
            <label style={label}>Town<input style={input} value={form.town} onChange={set('town')} /></label>
            <label style={label}>Province
              <select style={input} value={form.province} onChange={set('province')}>
                {PROVINCES.map(p => <option key={p}>{p}</option>)}
              </select>
            </label>
          </div>
          <label style={{ ...label, marginBottom: 10 }}>Summary (cards)<input style={input} value={form.summary} onChange={set('summary')} /></label>
          <label style={{ ...label, marginBottom: 10 }}>Description<textarea rows={4} style={input} value={form.description} onChange={set('description')} /></label>
          <div style={twoCol}>
            <label style={label}>Phone<input style={input} value={form.phone} onChange={set('phone')} /></label>
            <label style={label}>WhatsApp<input style={input} value={form.whatsapp} onChange={set('whatsapp')} /></label>
            <label style={label}>Public email<input style={input} value={form.email} onChange={set('email')} /></label>
            <label style={label}>Website<input style={input} value={form.website_url} onChange={set('website_url')} /></label>
            <label style={label}>Photo URL<input style={input} value={form.photo_url} onChange={set('photo_url')} /></label>
            <label style={label}>Partner source<input style={input} value={form.partner_source} onChange={set('partner_source')} placeholder="e.g. opdesk" /></label>
            <label style={label}>Latitude<input style={input} value={form.lat} onChange={set('lat')} /></label>
            <label style={label}>Longitude<input style={input} value={form.lng} onChange={set('lng')} /></label>
          </div>
          <div style={twoCol}>
            <label style={label}>Tier
              <select style={input} value={form.tier} onChange={set('tier')}>
                {['community', 'basic', 'premium', 'featured'].map(t => <option key={t}>{t}</option>)}
              </select>
            </label>
            <label style={label}>Linked OpDesk company
              <select style={input} value={form.company_id || ''} onChange={set('company_id')}>
                <option value="">— none —</option>
                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
          </div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', color: C.text, fontSize: 13, marginBottom: 12 }}>
            {[['zatours', 'ZAtours'], ['route22', 'Route22']].map(([s, l]) => (
              <label key={s} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <input type="checkbox" checked={form.sites.includes(s)}
                  onChange={e => setForm(f => ({ ...f, sites: e.target.checked ? [...f.sites, s] : f.sites.filter(x => x !== s) }))} />{l}
              </label>
            ))}
            <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}><input type="checkbox" checked={!!form.published} onChange={set('published')} />Published</label>
            <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}><input type="checkbox" checked={!!form.claimed} onChange={set('claimed')} />Claimed</label>
          </div>
          <Btn kind="gold" onClick={save} disabled={saving || !form.name}>{saving ? 'Saving…' : creating ? 'Create listing' : 'Save details'}</Btn>
        </Section>

        {!creating && (
          <>
            <Section title="Billing" right={<Pill color={BILLING_COLORS[bill.billing_status]}>{bill.billing_status}</Pill>}>
              {billing?.plan && (
                <p style={{ color: C.muted, fontSize: 12, margin: '0 0 10px' }}>
                  Plan: <strong style={{ color: C.text }}>{billing.plan}</strong> (R{PLAN_PRICES[billing.plan]}/mo)
                  {billing.last_paid_at && <> · last paid {fmtDate(billing.last_paid_at)}</>}
                  {billing.payfast_token && <> · PayFast subscription active</>}
                  {billing.payment_failed_at && <span style={{ color: C.red }}> · payment failed {fmtDate(billing.payment_failed_at)}</span>}
                </p>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
                <label style={label}>Status
                  <select style={input} value={bill.billing_status} onChange={e => setBill(b => ({ ...b, billing_status: e.target.value }))}>
                    {Object.keys(BILLING_COLORS).map(s => <option key={s}>{s}</option>)}
                  </select>
                </label>
                <label style={label}>Paid until<input type="date" style={input} value={bill.paid_until || ''} onChange={e => setBill(b => ({ ...b, paid_until: e.target.value }))} /></label>
                <label style={label}>Source
                  <select style={input} value={bill.source} onChange={e => setBill(b => ({ ...b, source: e.target.value }))}>
                    <option value="direct">direct</option><option value="opdesk_bundle">opdesk_bundle</option><option value="partner">partner</option>
                  </select>
                </label>
              </div>
              <p style={{ color: C.muted, fontSize: 12, margin: '0 0 10px' }}>
                PayFast payments set this automatically. Use manual changes for comped listings and corrections.
              </p>
              <Btn onClick={() => run('bill', async () => {
                await dirAction('set_billing', { listingId: listing.id, ...bill }); toast.success('Billing saved'); await onSaved(true)
              })} disabled={working === 'bill'}>{working === 'bill' ? 'Saving…' : 'Save billing'}</Btn>
            </Section>

            <Section title="Upgrade — PayFast payment link">
              <p style={{ color: C.muted, fontSize: 12, margin: '0 0 10px' }}>
                Monthly recurring subscription. When PayFast confirms the first payment the listing is published at the plan&apos;s tier, billing becomes paid and any open lead is marked won.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
                <label style={label}>Plan
                  <select style={input} value={pay.plan} onChange={e => setPay(p => ({ ...p, plan: e.target.value }))}>
                    <option value="premium">Premium — R{PLAN_PRICES.premium}/mo</option>
                    <option value="featured">Featured — R{PLAN_PRICES.featured}/mo</option>
                  </select>
                </label>
                <label style={label}>Contact name<input style={input} value={pay.name} onChange={e => setPay(p => ({ ...p, name: e.target.value }))} /></label>
                <label style={label}>Billing email<input style={input} value={pay.email} onChange={e => setPay(p => ({ ...p, email: e.target.value }))} /></label>
              </div>
              <label style={{ display: 'flex', gap: 6, alignItems: 'center', color: C.text, fontSize: 13, marginBottom: 10 }}>
                <input type="checkbox" checked={pay.sendEmail} onChange={e => setPay(p => ({ ...p, sendEmail: e.target.checked }))} />
                Email the link to the business
              </label>
              <Btn kind="gold" disabled={working === 'pay' || !pay.email} onClick={() => run('pay', async () => {
                const r = await dirAction('payment_link', { listingId: listing.id, leadId: lead?.id, ...pay })
                setPayUrl(r.paymentUrl)
                toast.success(r.emailed ? 'Payment link generated and emailed' : 'Payment link generated')
                await onSaved(true)
              })}>{working === 'pay' ? 'Generating…' : 'Generate payment link'}</Btn>
              {payUrl && (
                <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                  <input readOnly value={payUrl} style={{ ...input, fontSize: 11 }} />
                  <Btn small onClick={() => { navigator.clipboard.writeText(payUrl); toast.success('Copied') }}>Copy</Btn>
                </div>
              )}
            </Section>

            <Section title="Owner edit link">
              <p style={{ color: C.muted, fontSize: 12, margin: '0 0 10px' }}>
                Emails the owner a private link to edit their listing (no login). Sending a new link invalidates the old one.
                {!listing.published && <span style={{ color: C.amber }}> Publish the listing first.</span>}
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <input style={input} value={ownerEmail} onChange={e => setOwnerEmail(e.target.value)} placeholder="owner@business.co.za" />
                <Btn disabled={working === 'edit' || !listing.published || !ownerEmail} onClick={() => run('edit', async () => {
                  const r = await dirAction('send_edit_link', { listingId: listing.id, ownerEmail })
                  toast.success(r.emailed ? 'Edit link emailed' : 'Edit link created (email not sent — check RESEND_API_KEY)')
                  await onSaved(true)
                })}>{working === 'edit' ? 'Sending…' : 'Send edit link'}</Btn>
              </div>
            </Section>
          </>
        )}
      </div>
    </div>
  )
}
