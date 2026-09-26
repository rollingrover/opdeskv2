'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Plus, FileDown, X, Trash2, ArrowUpRight } from 'lucide-react'

const DEFAULT_NOTES = 'RollingRover Web Design is a trading division of OpDesk (Pty) Ltd.'
const emptyForm = {
  client_id: '', guest_name: '', guest_business_name: '', guest_email: '', guest_phone: '', guest_address: '', guest_vat_number: '',
  invoice_type: 'tax', status: 'draft', currency: 'ZAR', vat_rate: 15, due_date: '',
  notes: DEFAULT_NOTES, line_items: [{ description: '', quantity: 1, unit_price: 0 }],
}

function OpDeskInvoicesContent() {
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [rows, setRows] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    const [{ data: company }, { data: clientRows }] = await Promise.all([
      supabase.from('companies').select('id').eq('is_internal', true).maybeSingle(),
      supabase.from('opdesk_clients').select('*').order('name'),
    ])
    setClients(clientRows || [])
    if (company) {
      const { data } = await supabase.from('invoices').select('*').eq('company_id', company.id).order('created_at', { ascending: false })
      setRows(data || [])
    }
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  // Deep-linked from the RollingRover leads page once a request is quoted
  // or paid — prefills the client's details and one line item at the
  // quoted amount, fully editable before saving.
  useEffect(() => {
    const requestId = searchParams.get('fromRequest')
    if (!requestId) return
    supabase.from('rollingrover_requests').select('*').eq('id', requestId).maybeSingle().then(({ data: req }) => {
      if (!req) return
      setForm(f => ({
        ...f,
        guest_name: req.name || '', guest_business_name: req.business_name || '',
        guest_email: req.email || '', guest_phone: req.phone || '',
        currency: req.currency || 'ZAR',
        line_items: [{ description: `Web Design — ${(req.project_type || 'project').replace(/_/g, ' ')}`, quantity: 1, unit_price: req.quote_amount || 0 }],
      }))
      setModalOpen(true)
    })
  }, [searchParams])

  const lineItemsTotal = form.line_items.reduce((sum, li) => sum + (Number(li.quantity) || 0) * (Number(li.unit_price) || 0), 0)

  function addLine() { setForm(f => ({ ...f, line_items: [...f.line_items, { description: '', quantity: 1, unit_price: 0 }] })) }
  function updateLine(i, field, value) { setForm(f => ({ ...f, line_items: f.line_items.map((li, li_i) => li_i === i ? { ...li, [field]: value } : li) })) }
  function removeLine(i) { setForm(f => ({ ...f, line_items: f.line_items.filter((_, li_i) => li_i !== i) })) }

  function selectClient(clientId) {
    const c = clients.find(c => c.id === clientId)
    if (!c) { setForm(f => ({ ...f, client_id: '' })); return }
    setForm(f => ({
      ...f, client_id: c.id, guest_name: c.name, guest_business_name: c.business_name || '',
      guest_email: c.email || '', guest_phone: c.phone || '', guest_address: c.address || '', guest_vat_number: c.vat_number || '',
    }))
  }

  function selectInvoiceType(type) {
    // "Invoice" specifically means not VAT-registered — VAT must be 0%,
    // not just defaulted, since charging VAT without being registered for
    // it is not just a UI inconsistency but actually against the law.
    setForm(f => ({ ...f, invoice_type: type, vat_rate: type === 'invoice' ? 0 : (f.vat_rate || 15) }))
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const res = await fetch('/api/admin/opdesk-invoices', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, line_items: form.line_items.filter(li => li.description) }),
    })
    const result = await res.json()
    setSaving(false)
    if (!res.ok) { setError(result.error); return }
    setModalOpen(false); setForm(emptyForm); load()
  }

  async function updateStatus(id, status) {
    await fetch('/api/admin/opdesk-invoices', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status, ...(status === 'paid' ? { amount_paid: rows.find(r => r.id === id)?.total } : {}) }),
    })
    load()
  }

  async function convertType(id, invoice_type) {
    await fetch('/api/admin/opdesk-invoices', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, invoice_type }),
    })
    load()
  }

  async function remove(id) {
    if (!confirm('Delete this invoice?')) return
    await supabase.from('invoices').delete().eq('id', id)
    load()
  }

  if (loading) return <div style={{ color: '#6b7280', padding: 40, textAlign: 'center' }}>Loading…</div>

  const inputStyle = { width: '100%', boxSizing: 'border-box', background: '#111', border: '1px solid #333', color: 'white', borderRadius: 8, padding: '9px 12px', fontSize: 14, marginBottom: 12 }
  const labelStyle = { display: 'block', color: '#9ca3af', fontSize: 12, marginBottom: 4 }
  const TYPE_LABEL = { tax: 'Tax Invoice', invoice: 'Invoice', proforma: 'Proforma' }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ color: 'white', fontWeight: 700, fontSize: 20, margin: 0 }}>OpDesk Invoices</h2>
          <p style={{ color: '#6b7280', fontSize: 13, margin: '2px 0 0' }}>Invoices issued by OpDesk (Pty) Ltd directly — e.g. RollingRover Web Design clients.</p>
        </div>
        <button onClick={() => { setForm(emptyForm); setModalOpen(true) }} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#D4A853', color: '#0F2540', fontWeight: 700, border: 'none', borderRadius: 8, padding: '10px 16px', cursor: 'pointer' }}>
          <Plus size={16} /> New Invoice
        </button>
      </div>

      <div style={{ background: '#1a1a1a', borderRadius: 12, border: '1px solid #222', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#0d0d0d' }}>
              {['Invoice #', 'Client', 'Type', 'Amount', 'Status', 'Date', ''].map(h => (
                <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: '#6b7280', fontSize: 11, textTransform: 'uppercase', borderBottom: '1px solid #222' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>No invoices yet.</td></tr>
            ) : rows.map(inv => (
              <tr key={inv.id} style={{ borderBottom: '1px solid #1a1a1a' }}>
                <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: 13, color: '#D4A853' }}>{inv.invoice_number}</td>
                <td style={{ padding: '10px 12px', color: 'white' }}>{inv.guest_name}</td>
                <td style={{ padding: '10px 12px' }}>
                  {inv.invoice_type === 'proforma' ? (
                    <select defaultValue="" onChange={e => e.target.value && convertType(inv.id, e.target.value)}
                      style={{ background: '#111', color: '#9ca3af', border: '1px solid #333', borderRadius: 6, padding: '4px 8px', fontSize: 12 }}>
                      <option value="">Proforma</option>
                      <option value="tax">→ Convert to Tax Invoice</option>
                      <option value="invoice">→ Convert to Invoice</option>
                    </select>
                  ) : (
                    <span style={{ color: '#9ca3af', fontSize: 13 }}>{TYPE_LABEL[inv.invoice_type] || inv.invoice_type}</span>
                  )}
                </td>
                <td style={{ padding: '10px 12px', color: '#9ca3af' }}>{inv.currency} {Number(inv.total).toLocaleString()}</td>
                <td style={{ padding: '10px 12px' }}>
                  <select value={inv.status} onChange={e => updateStatus(inv.id, e.target.value)}
                    style={{ background: '#111', color: '#9ca3af', border: '1px solid #333', borderRadius: 6, padding: '4px 8px', fontSize: 12 }}>
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </td>
                <td style={{ padding: '10px 12px', color: '#6b7280', fontSize: 13 }}>{new Date(inv.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <a href={`/api/pdf/invoice?invoiceId=${inv.id}`} target="_blank" rel="noopener noreferrer" style={{ color: '#6b7280', marginRight: 12 }}><FileDown size={15} /></a>
                  <button onClick={() => remove(inv.id)} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer' }}><Trash2 size={15} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#1a1a1a', borderRadius: 12, border: '1px solid #333', padding: 24, width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ color: 'white', margin: 0 }}>New OpDesk Invoice</h3>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave}>
              {clients.length > 0 && (
                <>
                  <label style={labelStyle}>Existing Client (optional — autofills details below)</label>
                  <select value={form.client_id} onChange={e => selectClient(e.target.value)} style={inputStyle}>
                    <option value="">— Enter details manually —</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}{c.business_name ? ` (${c.business_name})` : ''}</option>)}
                  </select>
                </>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
                <div>
                  <label style={labelStyle}>Client Name</label>
                  <input required value={form.guest_name} onChange={e => setForm({ ...form, guest_name: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Business Name (optional)</label>
                  <input value={form.guest_business_name} onChange={e => setForm({ ...form, guest_business_name: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Client Email</label>
                  <input type="email" value={form.guest_email} onChange={e => setForm({ ...form, guest_email: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Client Phone</label>
                  <input value={form.guest_phone} onChange={e => setForm({ ...form, guest_phone: e.target.value })} style={inputStyle} />
                </div>
              </div>
              <label style={labelStyle}>Client Address</label>
              <textarea rows={2} value={form.guest_address} onChange={e => setForm({ ...form, guest_address: e.target.value })} style={{ ...inputStyle, resize: 'vertical' }} />
              <label style={labelStyle}>Client VAT Number (optional)</label>
              <input value={form.guest_vat_number} onChange={e => setForm({ ...form, guest_vat_number: e.target.value })} style={inputStyle} />

              <label style={labelStyle}>Line Items</label>
              {form.line_items.map((li, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 0.6fr 0.9fr auto', gap: 6, marginBottom: 8 }}>
                  <input placeholder="Description" value={li.description} onChange={e => updateLine(i, 'description', e.target.value)} style={{ ...inputStyle, marginBottom: 0 }} />
                  <input type="number" min="1" value={li.quantity} onChange={e => updateLine(i, 'quantity', e.target.value)} style={{ ...inputStyle, marginBottom: 0 }} />
                  <input type="number" min="0" step="0.01" placeholder="Unit price" value={li.unit_price} onChange={e => updateLine(i, 'unit_price', e.target.value)} style={{ ...inputStyle, marginBottom: 0 }} />
                  <button type="button" onClick={() => removeLine(i)} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer' }}>×</button>
                </div>
              ))}
              <button type="button" onClick={addLine} style={{ background: 'none', border: '1px solid #333', color: '#D4A853', borderRadius: 6, padding: '6px 10px', fontSize: 12, cursor: 'pointer', marginBottom: 16 }}>+ Add Line</button>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                <div>
                  <label style={labelStyle}>Currency</label>
                  <select value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })} style={inputStyle}>
                    <option value="ZAR">ZAR</option><option value="USD">USD</option><option value="EUR">EUR</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>VAT % {form.invoice_type === 'invoice' && <span style={{ color: '#6b7280' }}>(locked — not VAT-registered)</span>}</label>
                  <input type="number" step="0.1" disabled={form.invoice_type === 'invoice'} value={form.vat_rate}
                    onChange={e => setForm({ ...form, vat_rate: e.target.value })} style={{ ...inputStyle, opacity: form.invoice_type === 'invoice' ? 0.5 : 1 }} />
                </div>
                <div>
                  <label style={labelStyle}>Type</label>
                  <select value={form.invoice_type} onChange={e => selectInvoiceType(e.target.value)} style={inputStyle}>
                    <option value="tax">Tax Invoice</option>
                    <option value="invoice">Invoice (not VAT-registered)</option>
                    <option value="proforma">Proforma</option>
                  </select>
                </div>
              </div>

              <label style={labelStyle}>Notes</label>
              <textarea rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} style={{ ...inputStyle, resize: 'vertical' }} />

              <p style={{ textAlign: 'right', color: '#D4A853', fontWeight: 700, marginBottom: 16 }}>
                Total (excl. VAT): {form.currency} {lineItemsTotal.toLocaleString()}
              </p>

              {error && <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 12 }}>{error}</p>}

              <button type="submit" disabled={saving} style={{ width: '100%', background: '#D4A853', color: '#0F2540', fontWeight: 700, border: 'none', borderRadius: 8, padding: '10px 0', cursor: 'pointer' }}>
                {saving ? 'Creating…' : 'Create Invoice'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default function OpDeskInvoicesPage() {
  return (
    <Suspense fallback={<div style={{ color: '#6b7280', padding: 40, textAlign: 'center' }}>Loading…</div>}>
      <OpDeskInvoicesContent />
    </Suspense>
  )
}

export const dynamic = 'force-dynamic'
