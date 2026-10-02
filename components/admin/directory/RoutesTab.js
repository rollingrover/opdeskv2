'use client'
import { useMemo, useState } from 'react'
import { C, Btn, Card, Pill, input, label, dirAction, fmtDate, BILLING_COLORS, priceOf, FOUNDING } from './ui'

const EMPTY = { name: '', kind: 'route', summary: '', description: '', region: '', website_url: '', contact_email: '',
  logo_url: '', package_key: '', sites: ['zatours'], published: false, pathText: '' }
const ZATOURS = process.env.NEXT_PUBLIC_ZATOURS_URL || 'https://www.zatours.co.za'

function pathToText(path) { return (path || []).map(p => p.join(', ')).join('\n') }
function textToPath(t) {
  return String(t || '').split('\n').map(l => l.split(',').map(x => Number(x.trim()))).filter(p => p.length === 2 && p.every(Number.isFinite))
}

function RouteEditor({ route, listings, memberIds, billing, packages, onClose, onSaved, toast }) {
  const creating = !route
  const [form, setForm] = useState(() => {
    const src = route || {}
    return { ...EMPTY, ...Object.fromEntries(Object.entries(src).filter(([k]) => k in EMPTY).map(([k, v]) => [k, v ?? ''])),
      sites: src.sites?.length ? src.sites : ['zatours'], pathText: pathToText(src.path) }
  })
  const [members, setMembers] = useState(() => new Set(memberIds))
  const [q, setQ] = useState('')
  const [pay, setPay] = useState({ plan: route?.package_key || 'route_hub', quantity: 10, name: '', email: route?.contact_email || '', sendEmail: true })
  const [payUrl, setPayUrl] = useState('')
  const [busy, setBusy] = useState('')
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  async function run(key, fn) { setBusy(key); try { await fn() } catch (e) { toast.error(e.message) } setBusy('') }

  const fields = () => {
    const { pathText, ...rest } = form
    return { ...rest, package_key: rest.package_key || null, path: textToPath(pathText) }
  }
  const shown = listings.filter(l => !q || l.name.toLowerCase().includes(q.toLowerCase()) || (l.town || '').toLowerCase().includes(q.toLowerCase()))
  const unit = (() => { try { return priceOf(pay.plan, packages) } catch { return 0 } })()
  const qty = pay.plan === 'association_bulk_premium' ? Math.max(10, Number(pay.quantity) || 0) : 1

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', justifyContent: 'flex-end', background: 'rgba(0,0,0,0.55)' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: 'min(640px, 100%)', height: '100%', overflowY: 'auto', background: C.bg, borderLeft: `1px solid ${C.line}`, padding: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0, color: 'white' }}>{creating ? 'Add route / association' : route.name}</h3>
          <Btn kind="ghost" onClick={onClose}>✕</Btn>
        </div>
        {!creating && route.published && (
          <a href={`${ZATOURS}/routes/${route.slug}`} target="_blank" rel="noopener noreferrer" style={{ color: C.gold, fontSize: 12 }}>view live ↗</a>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 16 }}>
          <label style={label}>Name<input style={input} value={form.name} onChange={set('name')} /></label>
          <label style={label}>Type
            <select style={input} value={form.kind} onChange={set('kind')}>
              <option value="route">Tourism route</option><option value="association">Tourism association</option>
            </select>
          </label>
          <label style={label}>Region<input style={input} value={form.region} onChange={set('region')} placeholder="e.g. Zululand, KZN" /></label>
          <label style={label}>Package
            <select style={input} value={form.package_key || ''} onChange={set('package_key')}>
              <option value="">— none yet —</option><option value="route_hub">Route Hub</option><option value="route_hub_plus">Route Hub Plus</option>
            </select>
          </label>
          <label style={label}>Website<input style={input} value={form.website_url} onChange={set('website_url')} /></label>
          <label style={label}>Contact email<input style={input} value={form.contact_email} onChange={set('contact_email')} /></label>
        </div>
        <label style={{ ...label, marginTop: 10 }}>Logo URL<input style={input} value={form.logo_url} onChange={set('logo_url')} /></label>
        <label style={{ ...label, marginTop: 10 }}>Summary (cards)<input style={input} value={form.summary} onChange={set('summary')} /></label>
        <label style={{ ...label, marginTop: 10 }}>Story / description<textarea rows={5} style={input} value={form.description} onChange={set('description')} /></label>
        <label style={{ ...label, marginTop: 10 }}>Route line (optional) — one &quot;lat, lng&quot; per line
          <textarea rows={3} style={{ ...input, fontFamily: 'monospace' }} value={form.pathText} onChange={set('pathText')} placeholder={'-28.05, 32.03\n-27.55, 32.35'} />
        </label>
        <div style={{ display: 'flex', gap: 16, color: C.text, fontSize: 13, margin: '12px 0' }}>
          {[['zatours', 'ZAtours'], ['route22', 'Route22']].map(([s, l]) => (
            <label key={s} style={{ display: 'flex', gap: 6 }}>
              <input type="checkbox" checked={form.sites.includes(s)} onChange={e => setForm(f => ({ ...f, sites: e.target.checked ? [...f.sites, s] : f.sites.filter(x => x !== s) }))} />{l}
            </label>
          ))}
          <label style={{ display: 'flex', gap: 6 }}><input type="checkbox" checked={!!form.published} onChange={set('published')} />Published</label>
        </div>
        <Btn kind="gold" disabled={busy === 'save' || !form.name} onClick={() => run('save', async () => {
          if (creating) { await dirAction('create_route', { fields: fields() }); toast.success('Route created'); await onSaved(); onClose() }
          else { await dirAction('update_route', { id: route.id, patch: fields() }); toast.success('Route saved'); await onSaved() }
        })}>{busy === 'save' ? 'Saving…' : creating ? 'Create route' : 'Save route'}</Btn>

        {!creating && (
          <>
            <div style={{ borderTop: `1px solid ${C.line}`, marginTop: 18, paddingTop: 14 }}>
              <h4 style={{ color: 'white', margin: '0 0 8px', fontSize: 14 }}>Member businesses ({members.size})</h4>
              <input style={{ ...input, marginBottom: 8 }} placeholder="Search listings…" value={q} onChange={e => setQ(e.target.value)} />
              <div style={{ maxHeight: 240, overflowY: 'auto', border: `1px solid ${C.line}`, borderRadius: 8, padding: 8 }}>
                {shown.map(l => (
                  <label key={l.id} style={{ display: 'flex', gap: 8, padding: '3px 0', color: C.text, fontSize: 13 }}>
                    <input type="checkbox" checked={members.has(l.id)} onChange={e => setMembers(m => { const n = new Set(m); e.target.checked ? n.add(l.id) : n.delete(l.id); return n })} />
                    {l.name} <span style={{ color: C.muted }}>· {l.town || l.province} · {l.tier}{l.published ? '' : ' · draft'}</span>
                  </label>
                ))}
              </div>
              <div style={{ marginTop: 8 }}>
                <Btn disabled={busy === 'members'} onClick={() => run('members', async () => {
                  const r = await dirAction('set_route_members', { routeId: route.id, listingIds: Array.from(members) })
                  toast.success(`${r.members} members saved`); await onSaved()
                })}>{busy === 'members' ? 'Saving…' : 'Save members'}</Btn>
              </div>
            </div>

            <div style={{ borderTop: `1px solid ${C.line}`, marginTop: 18, paddingTop: 14 }}>
              <h4 style={{ color: 'white', margin: '0 0 8px', fontSize: 14 }}>
                Billing {billing && <Pill color={BILLING_COLORS[billing.billing_status] || '#6b7280'}>{billing.billing_status}{billing.plan ? ` · ${billing.plan}` : ''}</Pill>}
              </h4>
              {billing?.locked_amount && <p style={{ color: C.muted, fontSize: 12, margin: '0 0 8px' }}>R{Number(billing.locked_amount)}/mo{billing.founding ? ` · founding${billing.lock_until ? ` until ${billing.lock_until}` : ''}` : ''}{billing.last_paid_at ? ` · last paid ${fmtDate(billing.last_paid_at)}` : ''}</p>}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.6fr 1fr 1fr', gap: 10 }}>
                <label style={label}>Package
                  <select style={input} value={pay.plan} onChange={e => setPay(p => ({ ...p, plan: e.target.value }))}>
                    <option value="route_hub">Route Hub</option><option value="route_hub_plus">Route Hub Plus</option>
                    <option value="association_bulk_premium">Association bulk Premium</option>
                  </select>
                </label>
                <label style={label}>Members<input type="number" min={10} style={input} disabled={pay.plan !== 'association_bulk_premium'} value={pay.quantity} onChange={e => setPay(p => ({ ...p, quantity: e.target.value }))} /></label>
                <label style={label}>Contact name<input style={input} value={pay.name} onChange={e => setPay(p => ({ ...p, name: e.target.value }))} /></label>
                <label style={label}>Billing email<input style={input} value={pay.email} onChange={e => setPay(p => ({ ...p, email: e.target.value }))} /></label>
              </div>
              <p style={{ color: C.text, fontSize: 13, margin: '8px 0' }}>
                Total <strong style={{ color: 'white' }}>R{unit * qty}/month</strong>{qty > 1 ? ` (${qty} × R${unit})` : ''} · <span style={{ color: C.gold }}>founding until {FOUNDING.deadlineLabel}</span>
              </p>
              <label style={{ display: 'flex', gap: 6, color: C.text, fontSize: 13, marginBottom: 8 }}>
                <input type="checkbox" checked={pay.sendEmail} onChange={e => setPay(p => ({ ...p, sendEmail: e.target.checked }))} />Email the link
              </label>
              <Btn kind="gold" disabled={busy === 'pay' || !pay.email} onClick={() => run('pay', async () => {
                const r = await dirAction('route_payment_link', { routeId: route.id, ...pay })
                setPayUrl(r.paymentUrl); toast.success(`Payment link — R${r.amount}/month${r.emailed ? ', emailed' : ''}`); await onSaved()
              })}>{busy === 'pay' ? 'Generating…' : 'Generate payment link'}</Btn>
              {payUrl && (
                <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                  <input readOnly value={payUrl} style={{ ...input, fontSize: 11 }} />
                  <Btn small onClick={() => { navigator.clipboard.writeText(payUrl); toast.success('Copied') }}>Copy</Btn>
                </div>
              )}
              <p style={{ color: C.muted, fontSize: 12, marginTop: 8 }}>On payment the route is published with its package. Bulk Premium lifts all free members to Premium.</p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function RoutesTab({ routes, members, listings, billingByRoute, packages, reload, toast }) {
  const [open, setOpen] = useState(null) // { route } or { route: null }
  const memberMap = useMemo(() => {
    const m = {}; for (const r of members) (m[r.route_id] ||= []).push(r.listing_id); return m
  }, [members])
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <p style={{ color: C.muted, fontSize: 13, margin: 0 }}>Tourism routes and associations with their own page on ZAtours (/routes).</p>
        <Btn kind="gold" onClick={() => setOpen({ route: null })}>+ Add route</Btn>
      </div>
      {routes.length === 0 && <Card style={{ padding: 24, color: C.muted, textAlign: 'center' }}>No routes yet.</Card>}
      <div style={{ display: 'grid', gap: 10 }}>
        {routes.map(r => {
          const b = billingByRoute[r.id]
          return (
            <Card key={r.id} style={{ padding: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <div>
                <div style={{ color: 'white', fontWeight: 700 }}>{r.name}</div>
                <div style={{ color: C.muted, fontSize: 12 }}>
                  {r.kind === 'association' ? 'Association' : 'Route'}{r.region ? ` · ${r.region}` : ''} · {(memberMap[r.id] || []).length} members · {r.package_key || 'no package'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Pill color={r.published ? C.green : '#6b7280'}>{r.published ? 'live' : 'draft'}</Pill>
                {b && <Pill color={BILLING_COLORS[b.billing_status] || '#6b7280'}>{b.billing_status}</Pill>}
                <Btn small onClick={() => setOpen({ route: r })}>Manage</Btn>
              </div>
            </Card>
          )
        })}
      </div>
      {open && (
        <RouteEditor key={open.route?.id || 'new'} route={open.route ? routes.find(x => x.id === open.route.id) || open.route : null}
          listings={listings} memberIds={open.route ? memberMap[open.route.id] || [] : []}
          billing={open.route ? billingByRoute[open.route.id] : null} packages={packages}
          onClose={() => setOpen(null)} onSaved={reload} toast={toast} />
      )}
    </>
  )
}
