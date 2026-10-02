'use client'
import { useState } from 'react'
import { C, LEAD_COLORS, INTEREST_LABELS, Btn, Pill, Card, input, dirAction, fmtDate } from './ui'

export default function LeadsTab({ leads, listingsById, onOpenListing, onCreateFromLead, reload, toast }) {
  const [filter, setFilter] = useState('open')
  const [notes, setNotes] = useState({})
  const shown = leads.filter(l => filter === 'all' || (filter === 'open' ? ['new', 'contacted'].includes(l.status) : l.status === filter))

  async function update(lead, patch, msg) {
    try { await dirAction('update_lead', { id: lead.id, ...patch }); if (msg) toast.success(msg); await reload() }
    catch (e) { toast.error(e.message) }
  }

  return (
    <>
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
        {['open', 'new', 'contacted', 'won', 'lost', 'all'].map(f => (
          <Btn key={f} small kind={filter === f ? 'gold' : 'default'} onClick={() => setFilter(f)}>
            {f} ({f === 'all' ? leads.length : f === 'open' ? leads.filter(l => ['new', 'contacted'].includes(l.status)).length : leads.filter(l => l.status === f).length})
          </Btn>
        ))}
      </div>
      {shown.length === 0 && <Card style={{ padding: 24, color: C.muted, textAlign: 'center' }}>No leads here.</Card>}
      <div style={{ display: 'grid', gap: 10 }}>
        {shown.map(lead => {
          const listing = lead.listing_id ? listingsById[lead.listing_id] : null
          return (
            <Card key={lead.id} style={{ padding: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ color: 'white', fontWeight: 700 }}>
                    {lead.business} <span style={{ color: C.muted, fontWeight: 400, fontSize: 12 }}>via {lead.site} · {fmtDate(lead.created_at)}</span>
                  </div>
                  <div style={{ color: C.text, fontSize: 13, marginTop: 2 }}>
                    {lead.contact} · <a href={`mailto:${lead.email}`} style={{ color: C.gold }}>{lead.email}</a>
                    {lead.phone && <> · <a href={`tel:${lead.phone}`} style={{ color: C.gold }}>{lead.phone}</a></>}
                    {lead.location && <span style={{ color: C.muted }}> · {lead.location}</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {lead.interest && <Pill color={C.blue}>{INTEREST_LABELS[lead.interest] || lead.interest}</Pill>}
                  <select value={lead.status} onChange={e => update(lead, { status: e.target.value }, `Marked ${e.target.value}`)}
                    style={{ ...input, width: 'auto', borderColor: LEAD_COLORS[lead.status] }}>
                    {Object.keys(LEAD_COLORS).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              {lead.message && <p style={{ color: C.text, fontSize: 13, whiteSpace: 'pre-wrap', margin: '10px 0 0' }}>{lead.message}</p>}
              <div style={{ display: 'flex', gap: 8, marginTop: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                {listing ? (
                  <Btn small kind="gold" onClick={() => onOpenListing(listing, lead)}>Listing: {listing.name} — upgrade / payment link</Btn>
                ) : (
                  <Btn small kind="gold" onClick={() => onCreateFromLead(lead)}>Create listing from lead</Btn>
                )}
                {lead.payment_link && (
                  <Btn small onClick={() => { navigator.clipboard.writeText(lead.payment_link); toast.success('Payment link copied') }}>Copy payment link</Btn>
                )}
                <input placeholder="Notes (saved when you click away)" defaultValue={lead.notes || ''}
                  onChange={e => setNotes(n => ({ ...n, [lead.id]: e.target.value }))}
                  onBlur={() => notes[lead.id] !== undefined && notes[lead.id] !== (lead.notes || '') && update(lead, { notes: notes[lead.id] }, 'Notes saved')}
                  style={{ ...input, flex: 1, minWidth: 200 }} />
              </div>
            </Card>
          )
        })}
      </div>
    </>
  )
}
