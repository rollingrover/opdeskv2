'use client'
import { BrandIcon } from '@/components/ui/BrandIcon'
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { PageLoader } from '@/components/ui/Spinner'
import { StatusBadge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { ModuleLocked } from '@/components/ui/ModuleLocked'
import { Modal } from '@/components/ui/Modal'
import { Input, Select, Textarea } from '@/components/ui/FormField'
import { useToast, ToastContainer } from '@/components/ui/Toast'
import { hasModuleAccess } from '@/lib/moduleAccess'
import { Plus, FileText, ArrowRightCircle } from 'lucide-react'

const emptyForm = {
  guest_name: '', guest_email: '', subtotal: 0, vat_rate: 15,
  valid_until: '', notes: '',
}

export default function QuotationsPage() {
  const { company, profile, needsCompany } = useAuth()
  const supabase = createClient()
  const toast = useToast()
  const [rows, setRows] = useState([])
  const [addons, setAddons] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  async function load() {
    if (!company) { setLoading(false); return }
    setLoading(true)
    const [q, a] = await Promise.all([
      supabase.from('invoices').select('*').eq('company_id', company.id).eq('invoice_type', 'quotation').order('created_at', { ascending: false }),
      supabase.from('company_addons').select('addon_key, active').eq('company_id', company.id).eq('active', true),
    ])
    if (q.error) toast.error(q.error.message)
    setRows(q.data || [])
    setAddons(a.data || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [company])

  const access = hasModuleAccess('quotations', { profile, company, companyAddons: addons })

  async function handleSave(e) {
    e.preventDefault()
    if (!company) return
    setSaving(true)
    const subtotal = Number(form.subtotal) || 0
    const vatRate = Number(form.vat_rate) || 0
    const vatAmount = +(subtotal * vatRate / 100).toFixed(2)
    const total = +(subtotal + vatAmount).toFixed(2)
    const quoteNumber = 'QUO-' + Date.now().toString(36).toUpperCase()
    const { error } = await supabase.from('invoices').insert([{
      guest_name: form.guest_name, guest_email: form.guest_email, notes: form.notes,
      company_id: company.id, currency: company.currency, invoice_type: 'quotation', status: 'draft',
      invoice_number: quoteNumber, subtotal, vat_rate: vatRate, vat_amount: vatAmount, total,
      valid_until: form.valid_until || null,
    }])
    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success('Quotation created')
    setModalOpen(false); setForm(emptyForm); load()
  }

  async function setStatus(id, status) {
    const { error } = await supabase.from('invoices').update({ status }).eq('id', id)
    if (error) { toast.error(error.message); return }
    load()
  }

  async function convertToInvoice(quote) {
    if (!confirm(`Convert quotation ${quote.invoice_number} into a pro forma invoice?`)) return
    const invoiceNumber = 'INV-' + Date.now().toString(36).toUpperCase()
    const { error } = await supabase.from('invoices').insert([{
      company_id: company.id, currency: quote.currency, invoice_type: 'proforma', status: 'draft',
      invoice_number: invoiceNumber, guest_name: quote.guest_name, guest_email: quote.guest_email,
      subtotal: quote.subtotal, vat_rate: quote.vat_rate, vat_amount: quote.vat_amount, total: quote.total,
      notes: quote.notes ? `Converted from quotation ${quote.invoice_number}. ${quote.notes}` : `Converted from quotation ${quote.invoice_number}.`,
    }])
    if (error) { toast.error(error.message); return }
    await setStatus(quote.id, 'accepted')
    toast.success('Converted to a pro forma invoice — find it under Invoices')
  }

  if (needsCompany) return <EmptyState icon={<BrandIcon name="companySetup" size={48} />} title="Set up your company first" />
  if (loading) return <PageLoader />
  if (!access) return <ModuleLocked moduleKey="quotations" />

  return (
    <div>
      <ToastContainer toasts={toast.toasts} remove={toast.remove} />
      <div className="page-header">
        <div>
          <h1 className="page-title">Quotations</h1>
          <p className="page-subtitle">{rows.length} quote{rows.length === 1 ? '' : 's'}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}><Plus size={16} /> New Quotation</button>
      </div>

      <div className="card card-shadow">
        {rows.length === 0 ? (
          <EmptyState icon={<BrandIcon name="newInvoice" size={48} />} title="No quotations yet"
            description="Send a client a quote before they've committed to a booking — convert it to an invoice once they accept."
            action={<button className="btn btn-primary btn-sm" onClick={() => setModalOpen(true)}>New Quotation</button>} />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Quote #</th><th>Client</th><th>Total</th><th>Valid Until</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {rows.map(q => {
                  const expired = q.valid_until && new Date(q.valid_until) < new Date() && !['accepted', 'declined'].includes(q.status)
                  return (
                    <tr key={q.id}>
                      <td style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'monospace', fontWeight: 600, color: 'var(--navy)' }}><FileText size={14} />{q.invoice_number}</td>
                      <td>{q.guest_name || '—'}</td>
                      <td>{q.currency} {Number(q.total).toLocaleString()}</td>
                      <td style={{ color: expired ? '#ef4444' : 'inherit' }}>
                        {q.valid_until ? new Date(q.valid_until).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' }) : '—'}
                        {expired && ' (expired)'}
                      </td>
                      <td><StatusBadge status={expired ? 'expired' : q.status} /></td>
                      <td style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        {q.status === 'draft' && (
                          <button onClick={() => setStatus(q.id, 'sent')} className="btn btn-outline btn-sm">Mark Sent</button>
                        )}
                        {q.status === 'sent' && !expired && (
                          <>
                            <button onClick={() => convertToInvoice(q)} className="btn btn-primary btn-sm">
                              <ArrowRightCircle size={13} /> Accept &amp; Convert
                            </button>
                            <button onClick={() => setStatus(q.id, 'declined')} className="btn btn-outline btn-sm">Declined</button>
                          </>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Quotation"
        footer={<>
          <button className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
          <button className="btn btn-primary" disabled={saving} onClick={handleSave}>{saving ? 'Saving…' : 'Create Quotation'}</button>
        </>}>
        <form onSubmit={handleSave}>
          <Input label="Client Name" required value={form.guest_name} onChange={e => setForm({ ...form, guest_name: e.target.value })} />
          <Input label="Client Email" type="email" value={form.guest_email} onChange={e => setForm({ ...form, guest_email: e.target.value })} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
            <Input label={`Subtotal (${company.currency})`} type="number" step="0.01" value={form.subtotal} onChange={e => setForm({ ...form, subtotal: e.target.value })} />
            <Input label="VAT Rate (%)" type="number" step="0.1" value={form.vat_rate} onChange={e => setForm({ ...form, vat_rate: e.target.value })} />
            <Input label="Valid Until" type="date" value={form.valid_until} onChange={e => setForm({ ...form, valid_until: e.target.value })} />
          </div>
          <Textarea label="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
        </form>
      </Modal>
    </div>
  )
}

export const dynamic = 'force-dynamic'
