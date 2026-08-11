'use client'
import { BrandIcon } from '@/components/ui/BrandIcon'
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { PageLoader } from '@/components/ui/Spinner'
import { StatusBadge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { Modal } from '@/components/ui/Modal'
import { Input, Select } from '@/components/ui/FormField'
import { useToast, ToastContainer } from '@/components/ui/Toast'
import { Plus, FileText } from 'lucide-react'

const emptyForm = { guest_name: '', guest_email: '', invoice_type: 'proforma', status: 'draft', subtotal: 0, vat_rate: 15, due_date: '' }

export default function InvoicesPage() {
  const { company, needsCompany } = useAuth()
  const supabase = createClient()
  const toast = useToast()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  async function load() {
    if (!company) { setLoading(false); return }
    setLoading(true)
    const { data, error } = await supabase.from('invoices').select('*').eq('company_id', company.id).order('created_at', { ascending: false })
    if (error) toast.error(error.message)
    setRows(data || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [company])

  async function handleSave(e) {
    e.preventDefault()
    if (!company) return
    setSaving(true)
    const subtotal = Number(form.subtotal) || 0
    const vatRate = Number(form.vat_rate) || 0
    const vatAmount = +(subtotal * vatRate / 100).toFixed(2)
    const total = +(subtotal + vatAmount).toFixed(2)
    const invoiceNumber = 'INV-' + Date.now().toString(36).toUpperCase()
    const { error } = await supabase.from('invoices').insert([{
      ...form, company_id: company.id, currency: company.currency,
      invoice_number: invoiceNumber, subtotal, vat_rate: vatRate,
      vat_amount: vatAmount, total, due_date: form.due_date || null,
    }])
    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success('Invoice created')
    setModalOpen(false); setForm(emptyForm); load()
  }

  if (needsCompany) return <EmptyState icon={<BrandIcon name="companySetup" size={48} />} title="Set up your company first" />
  if (loading) return <PageLoader />

  return (
    <div>
      <ToastContainer toasts={toast.toasts} remove={toast.remove} />
      <div className="page-header">
        <div>
          <h1 className="page-title">Invoices</h1>
          <p className="page-subtitle">{rows.length} invoice{rows.length === 1 ? '' : 's'}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}><Plus size={16} /> New Invoice</button>
      </div>

      <div className="card card-shadow">
        {rows.length === 0 ? (
          <EmptyState icon={<BrandIcon name="newInvoice" size={48} />} title="No invoices yet" description="Create pro forma or tax invoices for your guests."
            action={<button className="btn btn-primary btn-sm" onClick={() => setModalOpen(true)}>New Invoice</button>} />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Invoice #</th><th>Guest</th><th>Type</th><th>Total</th><th>Due</th><th>Status</th></tr></thead>
              <tbody>
                {rows.map(inv => (
                  <tr key={inv.id}>
                    <td style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'monospace', fontWeight: 600, color: 'var(--navy)' }}><FileText size={14} />{inv.invoice_number}</td>
                    <td>{inv.guest_name || '—'}</td>
                    <td style={{ textTransform: 'capitalize' }}>{inv.invoice_type}</td>
                    <td>{inv.currency} {Number(inv.total).toLocaleString()}</td>
                    <td>{inv.due_date ? new Date(inv.due_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' }) : '—'}</td>
                    <td><StatusBadge status={inv.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Invoice"
        footer={<>
          <button className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
          <button className="btn btn-primary" disabled={saving} onClick={handleSave}>{saving ? 'Saving…' : 'Create Invoice'}</button>
        </>}>
        <form onSubmit={handleSave}>
          <Input label="Guest Name" required value={form.guest_name} onChange={e => setForm({ ...form, guest_name: e.target.value })} />
          <Input label="Guest Email" type="email" value={form.guest_email} onChange={e => setForm({ ...form, guest_email: e.target.value })} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
            <Select label="Type" value={form.invoice_type} onChange={e => setForm({ ...form, invoice_type: e.target.value })}>
              <option value="proforma">Pro Forma</option>
              <option value="tax">Tax Invoice</option>
            </Select>
            <Select label="Status" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
            </Select>
            <Input label={`Subtotal (${company.currency})`} type="number" step="0.01" value={form.subtotal} onChange={e => setForm({ ...form, subtotal: e.target.value })} />
            <Input label="VAT Rate (%)" type="number" step="0.1" value={form.vat_rate} onChange={e => setForm({ ...form, vat_rate: e.target.value })} />
            <Input label="Due Date" type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} />
          </div>
        </form>
      </Modal>
    </div>
  )
}

export const dynamic = 'force-dynamic'
