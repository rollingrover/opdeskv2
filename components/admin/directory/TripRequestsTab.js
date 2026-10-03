'use client'
import { C, Btn, Card, Pill, fmtDate } from './ui'
import { createClient } from '@/lib/supabase/client'

const STATUS_COLORS = { open: '#3b82f6', full: '#22c55e', closed: '#6b7280', spam: '#ef4444' }

// Superadmin view of all trip requests (contact details visible), their
// claims, and close / spam controls.
export default function TripRequestsTab({ requests, claims, companies, reload, toast }) {
  const supabase = createClient()
  const companyName = Object.fromEntries(companies.map(c => [c.id, c.name]))
  async function setStatus(r, status) {
    const { error } = await supabase.from('dir_trip_requests').update({ status }).eq('id', r.id)
    if (error) toast.error(error.message); else { toast.success(`Marked ${status}`); reload() }
  }
  if (!requests.length) return <Card style={{ padding: 24, color: C.muted, textAlign: 'center' }}>No trip requests yet. They arrive from /plan on ZAtours and Route22.</Card>
  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {requests.map(r => {
        const rc = claims.filter(c => c.request_id === r.id)
        return (
          <Card key={r.id} style={{ padding: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <div style={{ color: 'white', fontWeight: 700 }}>
                  {r.name} <span style={{ color: C.muted, fontWeight: 400, fontSize: 12 }}>· {r.email}{r.phone ? ` · ${r.phone}` : ''} · {r.site} · {r.locale} · {fmtDate(r.created_at)}</span>
                </div>
                <div style={{ color: C.text, fontSize: 13, marginTop: 4 }}>
                  {r.date_from ? `${fmtDate(r.date_from)}${r.date_to ? ` – ${fmtDate(r.date_to)}` : ''}` : 'No dates'}{r.flexible ? ' (flexible)' : ''}
                  {' · '}{r.adults} adults{r.children ? `, ${r.children} children` : ''}{r.area ? ` · ${r.area}` : ''}{r.budget ? ` · ${r.budget}` : ''}
                  {r.categories?.length ? ` · ${r.categories.join(', ')}` : ''}
                </div>
                {r.message && <p style={{ color: C.text, fontSize: 13, margin: '6px 0 0', whiteSpace: 'pre-wrap' }}>{r.message}</p>}
                <div style={{ color: C.muted, fontSize: 12, marginTop: 6 }}>
                  Claims {r.claims_count}/{r.max_claims}{rc.length ? `: ${rc.map(c => `${companyName[c.company_id] || 'company'} (${c.status})`).join(', ')}` : ''}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                <Pill color={STATUS_COLORS[r.status] || '#6b7280'}>{r.status}</Pill>
                {r.status !== 'closed' && <Btn small onClick={() => setStatus(r, 'closed')}>Close</Btn>}
                {r.status !== 'spam' && <Btn small kind="danger" onClick={() => setStatus(r, 'spam')}>Spam</Btn>}
                {(r.status === 'closed' || r.status === 'spam') && <Btn small onClick={() => setStatus(r, r.claims_count >= r.max_claims ? 'full' : 'open')}>Reopen</Btn>}
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
