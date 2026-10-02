'use client'
import { useState } from 'react'
import { C, Btn, Card, Pill, input, dirAction, FOUNDING } from './ui'

const KIND_LABEL = { listing: 'Listing plans', addon: 'Add-ons', route_hub: 'Route Hubs', member_rate: 'Member & association rates' }

// One price list for ZAtours, Route22 and OpDesk billing (dir_packages).
// Changing a price here updates the pricing pages within seconds and applies
// to NEW payment links; existing subscriptions keep their locked amount.
export default function PackagesTab({ packages, reload, toast }) {
  const [edits, setEdits] = useState({})
  const [busy, setBusy] = useState(null)
  const set = (key, field, value) => setEdits(e => ({ ...e, [key]: { ...e[key], [field]: value } }))
  const val = (p, field) => edits[p.key]?.[field] ?? (field === 'features' ? (p.features || []).join('\n') : p[field] ?? '')

  async function save(p) {
    setBusy(p.key)
    try {
      await dirAction('update_package', { key: p.key, ...edits[p.key] })
      toast.success(`${p.name} saved`)
      setEdits(e => { const n = { ...e }; delete n[p.key]; return n })
      await reload()
    } catch (e) { toast.error(e.message) }
    setBusy(null)
  }

  const kinds = ['listing', 'addon', 'route_hub', 'member_rate']
  return (
    <>
      <Card style={{ padding: 14, marginBottom: 16, color: C.muted, fontSize: 13 }}>
        Founding prices apply to sign-ups until <strong style={{ color: C.gold }}>{FOUNDING.deadlineLabel}</strong> and are locked for {FOUNDING.lockYears} years;
        standard prices apply after that. Edits change the public pricing pages and <strong style={{ color: C.text }}>new</strong> payment links only — existing subscribers keep their locked amount.
      </Card>
      {kinds.map(kind => {
        const rows = packages.filter(p => p.kind === kind).sort((a, b) => a.sort_order - b.sort_order)
        if (!rows.length) return null
        return (
          <div key={kind} style={{ marginBottom: 22 }}>
            <h4 style={{ color: 'white', margin: '0 0 8px', fontSize: 14 }}>{KIND_LABEL[kind]}</h4>
            <div style={{ display: 'grid', gap: 10 }}>
              {rows.map(p => {
                const dirty = !!edits[p.key]
                return (
                  <Card key={p.key} style={{ padding: 14, opacity: busy === p.key ? 0.6 : 1 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.6fr 0.6fr 0.5fr auto', gap: 10, alignItems: 'end' }}>
                      <label style={{ fontSize: 11, color: C.muted }}>Name
                        <input style={input} value={val(p, 'name')} onChange={e => set(p.key, 'name', e.target.value)} />
                      </label>
                      <label style={{ fontSize: 11, color: C.muted }}>Founding R/mo
                        <input style={input} type="number" min={0} value={val(p, 'founding_price')} onChange={e => set(p.key, 'founding_price', e.target.value)} />
                      </label>
                      <label style={{ fontSize: 11, color: C.muted }}>Standard R/mo
                        <input style={input} type="number" min={0} value={val(p, 'standard_price')} onChange={e => set(p.key, 'standard_price', e.target.value)} />
                      </label>
                      <label style={{ fontSize: 11, color: C.muted }}>{kind === 'member_rate' && p.key.startsWith('association') ? 'Min. members' : 'Categories'}
                        <input style={input} type="number" min={0}
                          value={p.key.startsWith('association') ? val(p, 'min_quantity') : val(p, 'included_categories')}
                          onChange={e => set(p.key, p.key.startsWith('association') ? 'min_quantity' : 'included_categories', e.target.value)} />
                      </label>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <label style={{ display: 'flex', gap: 4, color: C.text, fontSize: 12 }}>
                          <input type="checkbox" checked={!!(edits[p.key]?.active ?? p.active)} onChange={e => set(p.key, 'active', e.target.checked)} />active
                        </label>
                        <Btn small kind={dirty ? 'gold' : 'default'} disabled={!dirty || busy === p.key} onClick={() => save(p)}>Save</Btn>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
                      <label style={{ fontSize: 11, color: C.muted }}>Description
                        <textarea rows={3} style={input} value={val(p, 'description')} onChange={e => set(p.key, 'description', e.target.value)} />
                      </label>
                      <label style={{ fontSize: 11, color: C.muted }}>Features (one per line — shown on pricing cards)
                        <textarea rows={3} style={input} value={val(p, 'features')} onChange={e => set(p.key, 'features', e.target.value)} />
                      </label>
                    </div>
                    <div style={{ marginTop: 6 }}><Pill color="#6b7280">{p.key}</Pill></div>
                  </Card>
                )
              })}
            </div>
          </div>
        )
      })}
    </>
  )
}
