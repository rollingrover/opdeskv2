'use client'
import { useMemo, useState } from 'react'
import { C, CATEGORY_LABELS, BILLING_COLORS, Btn, Pill, Card, input, dirAction, currentPrices, allowedCategories } from './ui'

const TIERS = ['community', 'basic', 'premium', 'featured']

export default function ListingsTab({ listings, billingById, verifiedById, enquiryCounts, companies, onOpen, onCreate, reload, toast }) {
  const [q, setQ] = useState('')
  const [site, setSite] = useState('all')
  const [tier, setTier] = useState('all')
  const [pub, setPub] = useState('all')
  const [bill, setBill] = useState('all')
  const [busy, setBusy] = useState(null)

  const companyName = useMemo(() => Object.fromEntries(companies.map(c => [c.id, c.name])), [companies])

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return listings.filter(l => {
      const b = billingById[l.id]?.billing_status || 'free'
      return (site === 'all' || l.sites?.includes(site)) &&
        (tier === 'all' || l.tier === tier) &&
        (pub === 'all' || (pub === 'yes') === !!l.published) &&
        (bill === 'all' || b === bill) &&
        (!needle || [l.name, l.slug, l.town, l.province, l.email].some(v => v && String(v).toLowerCase().includes(needle)))
    })
  }, [listings, billingById, q, site, tier, pub, bill])

  const stats = useMemo(() => {
    let paid = 0, comped = 0, mrr = 0
    for (const l of listings) {
      const b = billingById[l.id]
      if (b?.billing_status === 'paid') { paid++; mrr += Number(b.locked_amount) || currentPrices()[b.plan || l.tier] || 0 }
      if (b?.billing_status === 'comped') comped++
    }
    return { total: listings.length, published: listings.filter(l => l.published).length, paid, comped, mrr }
  }, [listings, billingById])

  async function quick(l, patch, msg) {
    setBusy(l.id)
    try { await dirAction('update_listing', { id: l.id, patch }); toast.success(msg); await reload() }
    catch (e) { toast.error(e.message) }
    setBusy(null)
  }

  function toggleSite(l, s) {
    const has = l.sites?.includes(s)
    const next = has ? l.sites.filter(x => x !== s) : [...(l.sites || []), s]
    if (!next.length) { toast.error('A listing must be on at least one site'); return }
    quick(l, { sites: next }, `${s === 'zatours' ? 'ZAtours' : 'Route22'} ${has ? 'removed' : 'added'}`)
  }

  const sel = { ...input, width: 'auto' }

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 16 }}>
        {[
          ['Listings', stats.total], ['Published', stats.published], ['Paying', stats.paid],
          ['Comped', stats.comped], ['Directory MRR', `R${stats.mrr.toLocaleString('en-ZA')}`],
        ].map(([k, v]) => (
          <Card key={k} style={{ padding: 14 }}>
            <div style={{ color: C.muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>{k}</div>
            <div style={{ color: 'white', fontSize: 22, fontWeight: 800, marginTop: 4 }}>{v}</div>
          </Card>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12, alignItems: 'center' }}>
        <input placeholder="Search name, town, email, slug…" value={q} onChange={e => setQ(e.target.value)} style={{ ...input, maxWidth: 280 }} />
        <select value={site} onChange={e => setSite(e.target.value)} style={sel}>
          <option value="all">All sites</option><option value="zatours">ZAtours</option><option value="route22">Route22</option>
        </select>
        <select value={tier} onChange={e => setTier(e.target.value)} style={sel}>
          <option value="all">All tiers</option>{TIERS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={pub} onChange={e => setPub(e.target.value)} style={sel}>
          <option value="all">Published + drafts</option><option value="yes">Published</option><option value="no">Unpublished</option>
        </select>
        <select value={bill} onChange={e => setBill(e.target.value)} style={sel}>
          <option value="all">All billing</option>{Object.keys(BILLING_COLORS).map(b => <option key={b} value={b}>{b}</option>)}
        </select>
        <span style={{ color: C.muted, fontSize: 12 }}>{rows.length} shown</span>
        <span style={{ flex: 1 }} />
        <Btn kind="gold" onClick={onCreate}>+ Add listing</Btn>
      </div>

      <Card style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ color: C.muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.4, textAlign: 'left' }}>
              {['Listing', 'Tier', 'Sites', 'Live', 'Billing', 'OpDesk', 'Enq.', ''].map(h => (
                <th key={h} style={{ padding: '10px 12px', borderBottom: `1px solid ${C.line}`, fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(l => {
              const b = billingById[l.id]
              const status = b?.billing_status || 'free'
              return (
                <tr key={l.id} style={{ borderBottom: `1px solid ${C.line}`, opacity: busy === l.id ? 0.5 : 1 }}>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ color: 'white', fontWeight: 600 }}>{l.name}</div>
                    <div style={{ color: C.muted, fontSize: 12 }}>
                      {(l.categories?.length ? l.categories : [l.category]).map(c => CATEGORY_LABELS[c] || c).join(' · ')} · {l.town || l.province || '—'}
                      {(l.categories?.length || 1) > allowedCategories(l.tier, billingById[l.id]?.extra_categories) && (
                        <span style={{ color: C.amber }}> · over category allowance</span>
                      )}
                      {l.claimed && <span style={{ color: C.gold }}> · claimed</span>}
                    </div>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <select value={l.tier} disabled={busy === l.id}
                      onChange={e => quick(l, { tier: e.target.value }, `Tier set to ${e.target.value}`)} style={sel}>
                      {TIERS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                    {[['zatours', 'ZA'], ['route22', 'R22']].map(([s, lbl]) => (
                      <button key={s} onClick={() => toggleSite(l, s)} disabled={busy === l.id} title={s}
                        style={{ marginRight: 4, borderRadius: 6, padding: '3px 7px', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                          background: l.sites?.includes(s) ? `${C.gold}22` : 'transparent',
                          color: l.sites?.includes(s) ? C.gold : '#555', border: `1px solid ${l.sites?.includes(s) ? `${C.gold}66` : C.line}` }}>
                        {lbl}
                      </button>
                    ))}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <button onClick={() => quick(l, { published: !l.published }, l.published ? 'Unpublished' : 'Published')}
                      disabled={busy === l.id}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
                      <Pill color={l.published ? C.green : '#6b7280'}>{l.published ? 'live' : 'draft'}</Pill>
                    </button>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <Pill color={BILLING_COLORS[status]}>{status}{b?.plan && status === 'paid' ? ` · ${b.plan}` : ''}</Pill>
                    {b?.founding && status === 'paid' && (
                      <div style={{ color: C.gold, fontSize: 11, marginTop: 3 }}>
                        founding R{Number(b.locked_amount) || '—'}{b.lock_until ? ` until ${b.lock_until}` : ''}
                      </div>
                    )}
                    {b?.payment_failed_at && <div style={{ color: C.red, fontSize: 11, marginTop: 3 }}>payment failed</div>}
                  </td>
                  <td style={{ padding: '10px 12px', fontSize: 12 }}>
                    {l.company_id ? (
                      <span style={{ color: verifiedById[l.id] ? C.green : C.muted }}>
                        {companyName[l.company_id] || 'linked'}{verifiedById[l.id] ? ' ✓' : ''}
                      </span>
                    ) : <span style={{ color: '#555' }}>—</span>}
                  </td>
                  <td style={{ padding: '10px 12px', color: enquiryCounts[l.id] ? 'white' : '#555' }}>{enquiryCounts[l.id] || 0}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                    <Btn small onClick={() => onOpen(l)}>Manage</Btn>
                  </td>
                </tr>
              )
            })}
            {rows.length === 0 && (
              <tr><td colSpan={8} style={{ padding: 24, color: C.muted, textAlign: 'center' }}>No listings match these filters.</td></tr>
            )}
          </tbody>
        </table>
      </Card>
    </>
  )
}
