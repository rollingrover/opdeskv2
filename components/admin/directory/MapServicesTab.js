'use client'
import { useState } from 'react'
import { C, Btn, Card, Pill, dirAction, fmtDate } from './ui'

// OpenStreetMap services (ATMs, fuel, clinics, hospitals, pharmacies, police,
// airports) shown on the ZAtours and Route22 maps, refreshed region by region.
export default function MapServicesTab({ regions, reload, toast }) {
  const [busy, setBusy] = useState(null)
  async function refresh(id) {
    setBusy(id || 'all')
    try {
      const r = await dirAction('osm_refresh', id ? { regionId: id } : {})
      const summary = (r.report || []).map(x => x.error ? `${x.region}: ${x.error}` : `${x.region}: ${x.count}`).join(' · ')
      toast.success(`Refreshed — ${summary || 'nothing to do'}`)
      await reload()
    } catch (e) { toast.error(e.message) }
    setBusy(null)
  }
  return (
    <>
      <Card style={{ padding: 14, marginBottom: 14, color: C.muted, fontSize: 13, display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <span>Services come from OpenStreetMap (© OpenStreetMap contributors, ODbL). A daily job refreshes the 2 stalest regions; they appear on the maps when visitors zoom in.</span>
        <Btn kind="gold" disabled={!!busy} onClick={() => refresh(null)}>{busy === 'all' ? 'Refreshing…' : 'Refresh 2 stalest now'}</Btn>
      </Card>
      <div style={{ display: 'grid', gap: 10 }}>
        {regions.map(r => (
          <Card key={r.id} style={{ padding: 14, display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap', opacity: busy === r.id ? 0.6 : 1 }}>
            <div>
              <div style={{ color: 'white', fontWeight: 700 }}>{r.name}</div>
              <div style={{ color: C.muted, fontSize: 12 }}>
                {r.last_run_at ? `Last refreshed ${fmtDate(r.last_run_at)}` : 'Never refreshed'}
                {typeof r.last_count === 'number' ? ` · ${r.last_count} places` : ''}
                {r.last_error && <span style={{ color: C.red }}> · {r.last_error}</span>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Pill color={r.enabled ? C.green : '#6b7280'}>{r.enabled ? 'enabled' : 'off'}</Pill>
              <Btn small disabled={!!busy} onClick={() => refresh(r.id)}>{busy === r.id ? 'Refreshing…' : 'Refresh now'}</Btn>
            </div>
          </Card>
        ))}
      </div>
    </>
  )
}
