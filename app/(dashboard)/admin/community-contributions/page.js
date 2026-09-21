'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

function monthsBetween(startDate, endDate) {
  const start = new Date(startDate)
  const end = endDate
  let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
  if (end.getDate() >= start.getDate()) months += 1 // count the current partial month as contributed
  return Math.max(months, 0)
}

export default function Page() {
  const supabase = createClient()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const { data, error } = await supabase
      .from('companies')
      .select('id, name, comp_reason, comped_since, package:marketing_packages(name, monthly_price)')
      .eq('comped', true)
      .order('comped_since')
    if (error) { console.error(error); setLoading(false); return }
    setRows(data || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const now = new Date()
  const withTotals = rows.map(r => {
    const monthlyValue = Number(r.package?.monthly_price) || 0
    const months = r.comped_since ? monthsBetween(r.comped_since, now) : 0
    return { ...r, monthlyValue, months, total: monthlyValue * months }
  })
  const grandTotal = withTotals.reduce((sum, r) => sum + r.total, 0)

  if (loading) {
    return <div style={{ color: '#6b7280', padding: 40, textAlign: 'center' }}>Loading community contributions...</div>
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ color: 'white', fontWeight: 700, fontSize: 20, margin: 0 }}>Community Contributions</h2>
        <p style={{ color: '#6b7280', fontSize: 13, margin: '2px 0 0' }}>
          Companies using OpDesk for free as a community/enterprise-development contribution, and the retail value of what's being provided.
        </p>
      </div>

      <div style={{ background: '#1a1a00', border: '1px solid #ca8a04', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#fde047' }}>
        This report totals the retail plan value donated over time — it's a starting point for supporting documentation, not a formal BBBEE
        certificate. Confirm treatment and exact wording with your BBBEE verification agency or consultant before submitting it anywhere.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 20 }}>
        <div style={{ background: '#1a1a1a', borderRadius: 12, padding: '16px 20px', border: '1px solid #222' }}>
          <div style={{ color: '#6b7280', fontSize: 12, marginBottom: 4 }}>Comped Companies</div>
          <div style={{ color: 'white', fontSize: 24, fontWeight: 800 }}>{rows.length}</div>
        </div>
        <div style={{ background: '#1a1a1a', borderRadius: 12, padding: '16px 20px', border: '1px solid #222' }}>
          <div style={{ color: '#6b7280', fontSize: 12, marginBottom: 4 }}>Combined Monthly Value</div>
          <div style={{ color: 'white', fontSize: 24, fontWeight: 800 }}>R{withTotals.reduce((s, r) => s + r.monthlyValue, 0).toLocaleString()}</div>
        </div>
        <div style={{ background: '#1a1a1a', borderRadius: 12, padding: '16px 20px', border: '1px solid #D4A853' }}>
          <div style={{ color: '#D4A853', fontSize: 12, marginBottom: 4 }}>Total Contribution to Date</div>
          <div style={{ color: '#D4A853', fontSize: 24, fontWeight: 800 }}>R{grandTotal.toLocaleString()}</div>
        </div>
      </div>

      <div style={{ background: '#1a1a1a', borderRadius: 12, border: '1px solid #222', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#0d0d0d' }}>
              {['Company', 'Plan', 'Monthly Value', 'Comped Since', 'Months', 'Total Contribution', 'Reason', ''].map(h => (
                <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: '#6b7280', fontSize: 11, textTransform: 'uppercase', borderBottom: '1px solid #222' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {withTotals.length === 0 ? (
              <tr><td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>No comped accounts yet — mark one as comped from its company page.</td></tr>
            ) : withTotals.map(r => (
              <tr key={r.id} style={{ borderBottom: '1px solid #1a1a1a' }}>
                <td style={{ padding: '10px 12px', color: 'white', fontWeight: 600 }}>{r.name}</td>
                <td style={{ padding: '10px 12px', color: '#9ca3af', fontSize: 13 }}>{r.package?.name || '—'}</td>
                <td style={{ padding: '10px 12px', color: '#9ca3af', fontSize: 13 }}>R{r.monthlyValue.toLocaleString()}</td>
                <td style={{ padding: '10px 12px', color: '#9ca3af', fontSize: 13 }}>{r.comped_since ? new Date(r.comped_since).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</td>
                <td style={{ padding: '10px 12px', color: '#9ca3af', fontSize: 13 }}>{r.months}</td>
                <td style={{ padding: '10px 12px', color: '#D4A853', fontSize: 13, fontWeight: 700 }}>R{r.total.toLocaleString()}</td>
                <td style={{ padding: '10px 12px', color: '#9ca3af', fontSize: 13 }}>{r.comp_reason || '—'}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                  <a href={`/admin/companies/${r.id}`} style={{ color: '#6b7280', fontSize: 12 }}>View →</a>
                </td>
              </tr>
            ))}
          </tbody>
          {withTotals.length > 0 && (
            <tfoot>
              <tr style={{ background: '#0d0d0d' }}>
                <td colSpan={5} style={{ padding: '10px 12px', color: '#6b7280', fontSize: 12, textTransform: 'uppercase', fontWeight: 700 }}>Total</td>
                <td style={{ padding: '10px 12px', color: '#D4A853', fontSize: 14, fontWeight: 800 }}>R{grandTotal.toLocaleString()}</td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  )
}

export const dynamic = 'force-dynamic'
