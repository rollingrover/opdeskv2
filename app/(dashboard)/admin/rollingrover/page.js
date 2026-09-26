'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast, ToastContainer } from '@/components/ui/Toast'
import { Copy, ExternalLink, RefreshCw, UserPlus, FileText } from 'lucide-react'

const STATUS_COLORS = { new: '#3b82f6', quoted: '#f59e0b', paid: '#22c55e', declined: '#ef4444', archived: '#6b7280' }

function SARollingRover() {
  const supabase = createClient()
  const toast = useToast()
  const [requests, setRequests] = useState([])
  const [clientMap, setClientMap] = useState({}) // source_request_id -> opdesk_clients row, so already-promoted requests show that instead of the button
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [quoteForm, setQuoteForm] = useState({ quote_amount: '', quote_notes: '', billing_type: 'one_off', recurring_cadence: 'monthly' })
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [promoting, setPromoting] = useState(false)

  async function load() {
    setLoading(true)
    const [{ data, error }, { data: clients }] = await Promise.all([
      supabase.from('rollingrover_requests').select('*').order('created_at', { ascending: false }),
      supabase.from('opdesk_clients').select('id, source_request_id').not('source_request_id', 'is', null),
    ])
    if (error) toast.error(error.message)
    setRequests(data || [])
    setClientMap(Object.fromEntries((clients || []).map(c => [c.source_request_id, c])))
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function promoteToClient(r) {
    setPromoting(true)
    const { error } = await supabase.from('opdesk_clients').insert([{
      name: r.name, business_name: r.business_name || null, email: r.email || null, phone: r.phone || null,
      source_request_id: r.id,
    }])
    setPromoting(false)
    if (error) { toast.error(error.message); return }
    toast.success('Added to Client Directory')
    load()
  }

  function openRequest(r) {
    setSelected(r)
    setQuoteForm({
      quote_amount: r.quote_amount || '', quote_notes: r.quote_notes || '',
      billing_type: r.billing_type || 'one_off', recurring_cadence: r.recurring_cadence || 'monthly',
    })
  }

  async function saveQuote() {
    setSaving(true)
    const { error } = await supabase.from('rollingrover_requests').update({
      quote_amount: Number(quoteForm.quote_amount) || null,
      quote_notes: quoteForm.quote_notes,
      billing_type: quoteForm.billing_type,
      recurring_cadence: quoteForm.billing_type === 'recurring' ? quoteForm.recurring_cadence : null,
      status: selected.status === 'new' ? 'quoted' : selected.status,
    }).eq('id', selected.id)
    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success('Quote saved')
    load()
    setSelected(null)
  }

  async function generateLink(requestId) {
    setGenerating(true)
    try {
      const res = await fetch('/api/payfast/create-link', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to generate link')
      toast.success('Payment link generated')
      load()
      if (selected?.id === requestId) setSelected(prev => ({ ...prev, payment_link: data.paymentUrl }))
    } catch (err) {
      toast.error(err.message)
    } finally {
      setGenerating(false)
    }
  }

  function copyLink(link) {
    navigator.clipboard.writeText(link)
    toast.success('Link copied')
  }

  async function updateStatus(id, status) {
    const { error } = await supabase.from('rollingrover_requests').update({ status }).eq('id', id)
    if (error) { toast.error(error.message); return }
    load()
  }

  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter)
  const totalPaid = requests.filter(r => r.status === 'paid').reduce((s, r) => s + (Number(r.quote_amount) || 0), 0)
  const recurringActive = requests.filter(r => r.status === 'paid' && r.billing_type === 'recurring')
  const pendingRecurringValue = recurringActive.reduce((s, r) => s + (Number(r.quote_amount) || 0), 0)

  const inputStyle = { background: '#111', border: '1px solid #333', color: 'white', borderRadius: 8, padding: '9px 12px', fontSize: 13, width: '100%', boxSizing: 'border-box' }
  const labelStyle = { color: '#9ca3af', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }

  if (loading) return <div style={{ color: '#9ca3af', padding: 40, textAlign: 'center' }}>Loading…</div>

  return (
    <div style={{ background: '#0a0a0a', margin: '-1.75rem', padding: '1.75rem', borderRadius: '0.75rem' }}>
      <ToastContainer toasts={toast.toasts} remove={toast.remove} />
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'white', marginBottom: 4 }}>RollingRover Productions</h2>
        <p style={{ color: '#6b7280', fontSize: 14 }}>Web design leads, quotes, and payments — kept separate from your OpDesk SaaS revenue.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
        {[
          ['Total Requests', requests.length, '#6b7280'],
          ['Awaiting Quote', requests.filter(r => r.status === 'new').length, '#3b82f6'],
          ['Total Paid', `R${totalPaid.toLocaleString()}`, '#22c55e'],
          ['Active Recurring', `${recurringActive.length} · R${pendingRecurringValue.toLocaleString()}/mo`, '#D4A853'],
        ].map(([l, v, c]) => (
          <div key={l} style={{ background: '#1a1a1a', borderRadius: 12, padding: '16px 20px', border: '1px solid #222' }}>
            <div style={{ color: '#6b7280', fontSize: 11, textTransform: 'uppercase', marginBottom: 6 }}>{l}</div>
            <div style={{ color: c, fontSize: 22, fontWeight: 900 }}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {['all', 'new', 'quoted', 'paid', 'declined', 'archived'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            style={{
              background: filter === s ? '#D4A853' : '#1a1a1a', color: filter === s ? '#0F2540' : '#9ca3af',
              border: 'none', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontWeight: 600, fontSize: 12, textTransform: 'capitalize',
            }}>
            {s}
          </button>
        ))}
      </div>

      <div style={{ background: '#111', borderRadius: 12, border: '1px solid #222', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#0d0d0d' }}>
              {['Client', 'Project', 'Quote', 'Billing', 'Status', 'Date', ''].map(h => (
                <th key={h} style={{ padding: '9px 14px', textAlign: 'left', color: '#6b7280', fontSize: 11, textTransform: 'uppercase', borderBottom: '1px solid #222' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: 24, textAlign: 'center', color: '#6b7280' }}>No requests</td></tr>
            ) : filtered.map(r => (
              <tr key={r.id} style={{ borderBottom: '1px solid #1a1a1a', cursor: 'pointer' }} onClick={() => openRequest(r)}>
                <td style={{ padding: '10px 14px' }}>
                  <div style={{ color: 'white', fontWeight: 600 }}>{r.name}</div>
                  <div style={{ color: '#6b7280', fontSize: 12 }}>{r.business_name || r.email}</div>
                </td>
                <td style={{ padding: '10px 14px', color: '#9ca3af', textTransform: 'capitalize' }}>{r.project_type?.replace(/_/g, ' ')}</td>
                <td style={{ padding: '10px 14px', color: r.quote_amount ? '#D4A853' : '#4b5563', fontWeight: 700 }}>
                  {r.quote_amount ? `${r.currency} ${Number(r.quote_amount).toLocaleString()}` : '—'}
                </td>
                <td style={{ padding: '10px 14px', color: '#9ca3af', fontSize: 12, textTransform: 'capitalize' }}>
                  {r.billing_type === 'recurring' ? `${r.recurring_cadence || 'monthly'}` : 'One-off'}
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{ background: STATUS_COLORS[r.status] + '22', color: STATUS_COLORS[r.status], borderRadius: 999, padding: '2px 10px', fontSize: 11, fontWeight: 700, textTransform: 'capitalize' }}>{r.status}</span>
                </td>
                <td style={{ padding: '10px 14px', color: '#6b7280', fontSize: 12 }}>{new Date(r.created_at).toLocaleDateString('en-ZA')}</td>
                <td style={{ padding: '10px 14px' }}>
                  {r.payment_link && (
                    <button onClick={e => { e.stopPropagation(); copyLink(r.payment_link) }} title="Copy payment link" style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer' }}>
                      <Copy size={14} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 20 }}
          onClick={() => setSelected(null)}>
          <div style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 14, padding: 28, width: '100%', maxWidth: 560, maxHeight: '85vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 17, color: 'white' }}>{selected.name}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>{selected.email} {selected.phone ? `· ${selected.phone}` : ''}</div>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: 20 }}>×</button>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {clientMap[selected.id] ? (
                <span style={{ flex: 1, textAlign: 'center', background: '#22c55e22', color: '#22c55e', border: '1px solid #22c55e', borderRadius: 8, padding: '8px 0', fontSize: 12, fontWeight: 600 }}>
                  ✓ In Client Directory
                </span>
              ) : (
                <button onClick={() => promoteToClient(selected)} disabled={promoting}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#1a1a1a', color: '#D4A853', border: '1px solid #D4A853', borderRadius: 8, padding: '8px 0', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                  <UserPlus size={13} /> {promoting ? 'Adding…' : 'Promote to Client'}
                </button>
              )}
              {selected.quote_amount > 0 && (
                <a href={`/admin/opdesk-invoices?fromRequest=${selected.id}`}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#1a1a1a', color: '#3b82f6', border: '1px solid #3b82f6', borderRadius: 8, padding: '8px 0', cursor: 'pointer', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                  <FileText size={13} /> Create Invoice
                </a>
              )}
            </div>

            <div style={{ background: '#111', borderRadius: 8, padding: 14, marginBottom: 16, fontSize: 13, color: '#d1d5db' }}>
              <p style={{ margin: '0 0 6px' }}><strong>{selected.project_type?.replace(/_/g, ' ')}</strong> · {selected.page_count} pages {selected.ecommerce ? '· e-commerce' : ''}</p>
              <p style={{ margin: '0 0 6px' }}>Timeline: {selected.timeline?.replace(/_/g, ' ')} {selected.budget_range && `· Budget: ${selected.budget_range.replace(/_/g, ' ')}`}</p>
              {selected.features?.length > 0 && <p style={{ margin: '0 0 6px' }}>Features: {selected.features.join(', ')}</p>}
              {selected.details && <p style={{ margin: '6px 0 0', whiteSpace: 'pre-wrap', color: '#9ca3af' }}>{selected.details}</p>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={labelStyle}>Quote Amount (ZAR)</label>
                <input type="number" style={inputStyle} value={quoteForm.quote_amount} onChange={e => setQuoteForm({ ...quoteForm, quote_amount: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Billing Type</label>
                <select style={inputStyle} value={quoteForm.billing_type} onChange={e => setQuoteForm({ ...quoteForm, billing_type: e.target.value })}>
                  <option value="one_off">One-off project</option>
                  <option value="recurring">Recurring (maintenance/retainer)</option>
                </select>
              </div>
              {quoteForm.billing_type === 'recurring' && (
                <div>
                  <label style={labelStyle}>Cadence</label>
                  <select style={inputStyle} value={quoteForm.recurring_cadence} onChange={e => setQuoteForm({ ...quoteForm, recurring_cadence: e.target.value })}>
                    <option value="monthly">Monthly</option>
                    <option value="annual">Annual</option>
                  </select>
                </div>
              )}
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Quote Notes</label>
              <textarea style={{ ...inputStyle, resize: 'vertical' }} rows={3} value={quoteForm.quote_notes} onChange={e => setQuoteForm({ ...quoteForm, quote_notes: e.target.value })} />
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <button onClick={saveQuote} disabled={saving} style={{ flex: 1, background: '#D4A853', color: '#0F2540', fontWeight: 700, border: 'none', borderRadius: 8, padding: '10px 0', cursor: 'pointer' }}>
                {saving ? 'Saving…' : 'Save Quote'}
              </button>
              <button onClick={() => generateLink(selected.id)} disabled={generating || !quoteForm.quote_amount}
                style={{ flex: 1, background: '#3b82f622', color: '#3b82f6', fontWeight: 700, border: '1px solid #3b82f6', borderRadius: 8, padding: '10px 0', cursor: 'pointer' }}>
                {generating ? 'Generating…' : (selected.payment_link ? <><RefreshCw size={13} style={{ verticalAlign: 'middle' }} /> Regenerate Link</> : 'Generate Payment Link')}
              </button>
            </div>

            {selected.payment_link && (
              <div style={{ background: '#111', borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <span style={{ color: '#9ca3af', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{selected.payment_link}</span>
                <div style={{ display: 'flex', gap: 8, marginLeft: 8 }}>
                  <button onClick={() => copyLink(selected.payment_link)} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer' }}><Copy size={14} /></button>
                  <a href={selected.payment_link} target="_blank" rel="noopener noreferrer" style={{ color: '#22c55e' }}><ExternalLink size={14} /></a>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => updateStatus(selected.id, 'declined')} style={{ flex: 1, background: '#ef444422', color: '#ef4444', border: '1px solid #ef4444', borderRadius: 8, padding: '8px 0', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Mark Declined</button>
              <button onClick={() => updateStatus(selected.id, 'archived')} style={{ flex: 1, background: '#37415122', color: '#9ca3af', border: '1px solid #374151', borderRadius: 8, padding: '8px 0', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Archive</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Page() {
  return <SARollingRover />
}

export const dynamic = 'force-dynamic'
