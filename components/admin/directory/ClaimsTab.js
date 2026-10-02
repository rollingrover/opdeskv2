'use client'
import { useState } from 'react'
import { C, Btn, Pill, Card, dirAction, fmtDate } from './ui'

const STATUS_COLORS = { pending: '#f59e0b', verified: '#3b82f6', approved: '#22c55e', rejected: '#6b7280' }

export default function ClaimsTab({ claims, listingsById, reload, toast }) {
  const [busy, setBusy] = useState(null)
  const sorted = [...claims].sort((a, b) =>
    (['pending', 'verified'].includes(b.status) - ['pending', 'verified'].includes(a.status)) ||
    new Date(b.created_at) - new Date(a.created_at))

  async function act(action, claim) {
    if (action === 'reject_claim' && !confirm('Reject this claim?')) return
    setBusy(claim.id)
    try {
      await dirAction(action, { claimId: claim.id })
      toast.success(action === 'approve_claim' ? 'Approved — owner emailed their edit link' : 'Claim rejected')
      await reload()
    } catch (e) { toast.error(e.message) }
    setBusy(null)
  }

  if (!claims.length) return <Card style={{ padding: 24, color: C.muted, textAlign: 'center' }}>No claims yet.</Card>

  return (
    <Card style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ color: C.muted, fontSize: 11, textTransform: 'uppercase', textAlign: 'left' }}>
            {['Listing', 'Claimant', 'Website check', 'Status', 'Date', ''].map(h =>
              <th key={h} style={{ padding: '10px 12px', borderBottom: `1px solid ${C.line}` }}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {sorted.map(c => {
            const l = listingsById[c.listing_id]
            const open = ['pending', 'verified'].includes(c.status)
            return (
              <tr key={c.id} style={{ borderBottom: `1px solid ${C.line}`, opacity: busy === c.id ? 0.5 : 1 }}>
                <td style={{ padding: '10px 12px', color: 'white', fontWeight: 600 }}>{l?.name || '(deleted listing)'}</td>
                <td style={{ padding: '10px 12px', color: C.text }}>{c.business_email}</td>
                <td style={{ padding: '10px 12px', fontSize: 12 }}>
                  <a href={c.website_url} target="_blank" rel="noopener noreferrer" style={{ color: C.gold }}>{c.website_url}</a>
                  {c.verified_at && <div style={{ color: C.green }}>verified {fmtDate(c.verified_at)}</div>}
                </td>
                <td style={{ padding: '10px 12px' }}><Pill color={STATUS_COLORS[c.status] || '#6b7280'}>{c.status}</Pill></td>
                <td style={{ padding: '10px 12px', color: C.muted }}>{fmtDate(c.created_at)}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                  {open && <>
                    <Btn small kind="gold" disabled={busy === c.id} onClick={() => act('approve_claim', c)}>Approve</Btn>{' '}
                    <Btn small kind="danger" disabled={busy === c.id} onClick={() => act('reject_claim', c)}>Reject</Btn>
                  </>}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </Card>
  )
}
