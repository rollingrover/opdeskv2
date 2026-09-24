'use client'
import { BrandIcon } from '@/components/ui/BrandIcon'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { PageLoader } from '@/components/ui/Spinner'
import { StatusBadge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { Modal } from '@/components/ui/Modal'
import { Input, Select } from '@/components/ui/FormField'
import { useToast, ToastContainer } from '@/components/ui/Toast'
import { Plus, FileText, FileDown, Send, CreditCard, X } from 'lucide-react'
import { hasModuleAccess } from '@/lib/moduleAccess'

const emptyForm = { guest_name: '', guest_email: '', guest_address: '', guest_vat_number: '', invoice_type: 'proforma', status: 'draft', subtotal: 0, vat_rate: 15, due_date: '', line_items: [], booking_id: null }
const emptyPayment = { amount: '', payment_date: new Date().toISOString().slice(0, 10), method: 'eft', reference: '' }

function InvoicesContent() {
  const t = useTranslations('Invoices')
  const tCommon = useTranslations('Common')
  const tStatus = useTranslations('StatusBadge')
  const { company, profile, needsCompany } = useAuth()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const toast = useToast()
  const [rows, setRows] = useState([])
  const [rateSheetItems, setRateSheetItems] = useState([])
  const [addons, setAddons] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [sending, setSending] = useState(null)

  const [paymentModalInvoice, setPaymentModalInvoice] = useState(null)
  const [paymentHistory, setPaymentHistory] = useState([])
  const [paymentForm, setPaymentForm] = useState(emptyPayment)
  const [savingPayment, setSavingPayment] = useState(false)

  async function load() {
    if (!company) { setLoading(false); return }
    setLoading(true)
    const [inv, rs, ad] = await Promise.all([
      supabase.from('invoices').select('*').eq('company_id', company.id).order('created_at', { ascending: false }),
      supabase.from('rate_sheet_items').select('*').eq('company_id', company.id).eq('active', true).order('sort_order').order('name'),
      supabase.from('company_addons').select('addon_key, active').eq('company_id', company.id).eq('active', true),
    ])
    if (inv.error) toast.error(inv.error.message)
    setRows(inv.data || [])
    setRateSheetItems(rs.data || [])
    setAddons(ad.data || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [company])

  // Deep-linked from a booking's "Generate Invoice" button. The booking's
  // own service (its flat duration-based price) becomes one line item at
  // the same price for every guest — that never varies by residency. Any
  // park/entry fee rate sheet items ARE residency-priced, so if the
  // booking recorded a residency breakdown, matching fee lines are
  // suggested (one per non-zero residency bucket) — fully editable/
  // removable before saving, never forced onto the invoice.
  useEffect(() => {
    const bookingId = searchParams.get('fromBooking')
    if (!bookingId || !company) return
    let cancelled = false
    ;(async () => {
      const { data: booking } = await supabase.from('bookings').select('*').eq('id', bookingId).eq('company_id', company.id).maybeSingle()
      if (!booking || cancelled) return
      const [{ data: bt }, { data: parkFees }] = await Promise.all([
        supabase.from('booking_types').select('name').eq('company_id', company.id).eq('slug', booking.booking_type).maybeSingle(),
        supabase.from('rate_sheet_items').select('*').eq('company_id', company.id).eq('is_park_fee', true).eq('active', true),
      ])
      if (cancelled) return

      const lines = [{
        description: `${bt?.name || booking.booking_type} — ${booking.guest_count} guest(s)`,
        quantity: booking.guest_count, unit_price: booking.unit_price || 0,
      }]
      const residencyBuckets = [
        ['local', booking.guest_count_local], ['sadc', booking.guest_count_sadc], ['international', booking.guest_count_international],
      ]
      for (const [residency, count] of residencyBuckets) {
        if (!count) continue
        const fee = (parkFees || []).find(f => f.residency === residency)
        if (fee) {
          lines.push({
            description: `${fee.name} (${residency})`, quantity: count, unit_price: fee.unit_price,
            residency, rate_sheet_item_id: fee.id,
          })
        }
      }

      setForm(f => ({
        ...f, guest_name: booking.guest_name || '', guest_email: booking.guest_email || '', guest_phone: booking.guest_phone || '',
        booking_id: booking.id, line_items: lines,
      }))
      setModalOpen(true)
    })()
    return () => { cancelled = true }
  }, [searchParams, company])

  const canRateSheet = hasModuleAccess('rate_sheet', { profile, company, companyAddons: addons })
  const lineItemsTotal = form.line_items.reduce((sum, li) => sum + (Number(li.quantity) || 0) * (Number(li.unit_price) || 0), 0)

  async function handleSave(e) {
    e.preventDefault()
    if (!company) return
    setSaving(true)
    const subtotal = form.line_items.length > 0 ? lineItemsTotal : (Number(form.subtotal) || 0)
    const vatRate = Number(form.vat_rate) || 0
    const vatAmount = +(subtotal * vatRate / 100).toFixed(2)
    const total = +(subtotal + vatAmount).toFixed(2)
    const invoiceNumber = 'INV-' + Date.now().toString(36).toUpperCase()
    const { error } = await supabase.from('invoices').insert([{
      ...form, company_id: company.id, currency: company.currency,
      invoice_number: invoiceNumber, subtotal, vat_rate: vatRate,
      vat_amount: vatAmount, total, due_date: form.due_date || null,
      line_items: form.line_items.map(li => ({
        description: li.description, quantity: Number(li.quantity) || 1, unit_price: Number(li.unit_price) || 0,
        total: (Number(li.quantity) || 1) * (Number(li.unit_price) || 0),
        residency: li.residency || null, guest_category: li.guest_category || null,
        commission_pct: li.commission_pct || null, rate_sheet_item_id: li.rate_sheet_item_id || null,
      })),
    }])
    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success(t('invoiceCreated'))
    setModalOpen(false); setForm(emptyForm); load()
  }

  function addLineFromRateSheet(itemId) {
    const item = rateSheetItems.find(r => r.id === itemId)
    if (!item) return
    setForm(f => ({
      ...f, line_items: [...f.line_items, {
        description: item.name, quantity: 1, unit_price: item.unit_price,
        residency: item.residency, guest_category: item.guest_category,
        commission_pct: item.commission_enabled ? item.commission_pct : null, rate_sheet_item_id: item.id,
      }],
    }))
  }

  function addCustomLine() {
    setForm(f => ({ ...f, line_items: [...f.line_items, { description: '', quantity: 1, unit_price: 0 }] }))
  }

  function updateLine(index, field, value) {
    setForm(f => ({ ...f, line_items: f.line_items.map((li, i) => i === index ? { ...li, [field]: value } : li) }))
  }

  function removeLine(index) {
    setForm(f => ({ ...f, line_items: f.line_items.filter((_, i) => i !== index) }))
  }

  async function openPaymentModal(invoice) {
    setPaymentModalInvoice(invoice)
    setPaymentForm(emptyPayment)
    const { data } = await supabase.from('invoice_payments').select('*').eq('invoice_id', invoice.id).order('payment_date', { ascending: false })
    setPaymentHistory(data || [])
  }

  async function savePayment(e) {
    e.preventDefault()
    setSavingPayment(true)
    const { error } = await supabase.from('invoice_payments').insert([{
      company_id: company.id, invoice_id: paymentModalInvoice.id,
      amount: Number(paymentForm.amount) || 0, payment_date: paymentForm.payment_date,
      method: paymentForm.method, reference: paymentForm.reference,
    }])
    setSavingPayment(false)
    if (error) { toast.error(error.message); return }
    toast.success(t('paymentRecorded'))
    setPaymentForm(emptyPayment)
    openPaymentModal(paymentModalInvoice) // refresh history + trigger-synced totals
    load()
  }

  async function sendInvoice(invoice) {
    if (!invoice.guest_email) { toast.error(t('noEmailOnFile')); return }
    setSending(invoice.id)
    try {
      const res = await fetch('/api/invoices/send', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: invoice.id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to send')
      toast.success(data.bccSent ? t('invoiceSentBcc') : t('invoiceSent'))
      load()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSending(null)
    }
  }

  if (needsCompany) return <EmptyState icon={<BrandIcon name="companySetup" size={48} />} title={tCommon('needsCompanyTitle')} />
  if (loading) return <PageLoader />

  return (
    <div>
      <ToastContainer toasts={toast.toasts} remove={toast.remove} />
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('title')}</h1>
          <p className="page-subtitle">{rows.length} {rows.length === 1 ? t('invoiceSingular') : t('invoicePlural')}</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm(emptyForm); setModalOpen(true) }}><Plus size={16} /> {t('newInvoice')}</button>
      </div>

      <div className="card card-shadow">
        {rows.length === 0 ? (
          <EmptyState icon={<BrandIcon name="newInvoice" size={48} />} title={t('noInvoicesTitle')} description={t('noInvoicesDesc')}
            action={<button className="btn btn-primary btn-sm" onClick={() => { setForm(emptyForm); setModalOpen(true) }}>{t('newInvoice')}</button>} />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>{t('colNumber')}</th><th>{t('colGuest')}</th><th>{t('colType')}</th><th>{t('colTotal')}</th><th>{t('colBalance')}</th><th>{t('colDue')}</th><th>{t('colStatus')}</th><th></th></tr></thead>
              <tbody>
                {rows.map(inv => {
                  const balance = Number(inv.total) - Number(inv.amount_paid || 0)
                  return (
                    <tr key={inv.id}>
                      <td style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'monospace', fontWeight: 600, color: 'var(--navy)' }}><FileText size={14} />{inv.invoice_number}</td>
                      <td>{inv.guest_name || '—'}</td>
                      <td>{inv.invoice_type === 'proforma' ? t('typeProforma') : t('typeTax')}</td>
                      <td>{inv.currency} {Number(inv.total).toLocaleString()}</td>
                      <td style={{ color: balance > 0 ? '#ef4444' : 'var(--teal)', fontWeight: 600 }}>{inv.currency} {balance.toLocaleString()}</td>
                      <td>{inv.due_date ? new Date(inv.due_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' }) : '—'}</td>
                      <td><StatusBadge status={inv.status} /></td>
                      <td style={{ display: 'flex', gap: '0.375rem' }}>
                        <button onClick={() => openPaymentModal(inv)} className="btn btn-outline btn-sm" title={t('recordPayment')}><CreditCard size={13} /></button>
                        <a href={`/api/pdf/invoice?invoiceId=${inv.id}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm" title={t('downloadPdf')}><FileDown size={13} /></a>
                        <button onClick={() => sendInvoice(inv)} disabled={sending === inv.id} className="btn btn-outline btn-sm" title={t('sendToGuest')}><Send size={13} /></button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setForm(emptyForm) }} title={t('newInvoice')}
        footer={<>
          <button className="btn btn-outline" onClick={() => setModalOpen(false)}>{t('cancel')}</button>
          <button className="btn btn-primary" disabled={saving} onClick={handleSave}>{saving ? t('saving') : t('createInvoice')}</button>
        </>}>
        <form onSubmit={handleSave}>
          <Input label={t('guestName')} required value={form.guest_name} onChange={e => setForm({ ...form, guest_name: e.target.value })} />
          <Input label={t('guestEmail')} type="email" value={form.guest_email} onChange={e => setForm({ ...form, guest_email: e.target.value })} />
          <Input label={t('guestAddress')} value={form.guest_address} onChange={e => setForm({ ...form, guest_address: e.target.value })} />
          <Input label={t('guestVatNumber')} value={form.guest_vat_number} onChange={e => setForm({ ...form, guest_vat_number: e.target.value })} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
            <Select label={t('type')} value={form.invoice_type} onChange={e => setForm({ ...form, invoice_type: e.target.value })}>
              <option value="proforma">{t('typeProforma')}</option>
              <option value="tax">{t('typeTax')}</option>
            </Select>
            <Select label={t('status')} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              <option value="draft">{tStatus('draft')}</option>
              <option value="sent">{tStatus('sent')}</option>
            </Select>
          </div>

          {canRateSheet && (
            <div style={{ marginTop: '0.5rem', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--gray-700)' }}>{t('lineItems')}</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {rateSheetItems.length > 0 && (
                    <select onChange={e => { if (e.target.value) { addLineFromRateSheet(e.target.value); e.target.value = '' } }}
                      defaultValue="" style={{ fontSize: '0.75rem', padding: '0.3rem 0.5rem', border: '1px solid var(--gray-200)', borderRadius: '0.375rem' }}>
                      <option value="" disabled>{t('addFromRateSheet')}</option>
                      {rateSheetItems.map(item => <option key={item.id} value={item.id}>{item.name} — {company.currency}{item.unit_price}</option>)}
                    </select>
                  )}
                  <button type="button" className="btn btn-outline btn-sm" onClick={addCustomLine}>+ {t('addCustomLine')}</button>
                </div>
              </div>
              {form.line_items.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.5rem' }}>
                  {form.line_items.map((li, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 0.6fr 0.9fr 0.9fr auto', gap: '0.4rem', alignItems: 'center' }}>
                      <input value={li.description} placeholder={t('lineDescription')} onChange={e => updateLine(i, 'description', e.target.value)}
                        style={{ padding: '0.35rem 0.5rem', border: '1px solid var(--gray-200)', borderRadius: '0.375rem', fontSize: '0.8125rem' }} />
                      <input type="number" min="1" value={li.quantity} onChange={e => updateLine(i, 'quantity', e.target.value)}
                        style={{ padding: '0.35rem 0.5rem', border: '1px solid var(--gray-200)', borderRadius: '0.375rem', fontSize: '0.8125rem' }} />
                      <input type="number" min="0" step="0.01" value={li.unit_price} onChange={e => updateLine(i, 'unit_price', e.target.value)}
                        style={{ padding: '0.35rem 0.5rem', border: '1px solid var(--gray-200)', borderRadius: '0.375rem', fontSize: '0.8125rem' }} />
                      <span style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>{company.currency} {((Number(li.quantity) || 0) * (Number(li.unit_price) || 0)).toLocaleString()}</span>
                      <button type="button" onClick={() => removeLine(i)} style={{ background: 'none', border: 'none', color: 'var(--gray-400)', cursor: 'pointer' }}><X size={15} /></button>
                    </div>
                  ))}
                  <p style={{ textAlign: 'right', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--navy)', margin: '0.25rem 0 0' }}>
                    {t('lineItemsSubtotal')}: {company.currency} {lineItemsTotal.toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
            <Input label={`${t('subtotal')} (${company.currency})`} type="number" step="0.01" disabled={form.line_items.length > 0}
              value={form.line_items.length > 0 ? lineItemsTotal : form.subtotal}
              onChange={e => setForm({ ...form, subtotal: e.target.value })}
              hint={form.line_items.length > 0 ? t('subtotalFromLines') : undefined} />
            <Input label={t('vatRate')} type="number" step="0.1" value={form.vat_rate} onChange={e => setForm({ ...form, vat_rate: e.target.value })} />
            <Input label={t('dueDate')} type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} />
          </div>
        </form>
      </Modal>

      <Modal open={!!paymentModalInvoice} onClose={() => setPaymentModalInvoice(null)} title={`${t('paymentsFor')} — ${paymentModalInvoice?.invoice_number || ''}`}
        footer={<>
          <button className="btn btn-outline" onClick={() => setPaymentModalInvoice(null)}>{t('close')}</button>
          <button className="btn btn-primary" disabled={savingPayment} onClick={savePayment}>{savingPayment ? t('saving') : t('recordPayment')}</button>
        </>}>
        {paymentModalInvoice && (
          <>
            <div style={{ background: 'var(--cream)', borderRadius: '0.5rem', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
              {t('total')}: <strong>{paymentModalInvoice.currency} {Number(paymentModalInvoice.total).toLocaleString()}</strong> ·
              {' '}{t('paid')}: <strong style={{ color: 'var(--teal)' }}>{paymentModalInvoice.currency} {Number(paymentModalInvoice.amount_paid || 0).toLocaleString()}</strong> ·
              {' '}{t('balance')}: <strong style={{ color: (Number(paymentModalInvoice.total) - Number(paymentModalInvoice.amount_paid || 0)) > 0 ? '#ef4444' : 'var(--teal)' }}>
                {paymentModalInvoice.currency} {(Number(paymentModalInvoice.total) - Number(paymentModalInvoice.amount_paid || 0)).toLocaleString()}
              </strong>
            </div>

            {paymentHistory.length > 0 && (
              <table className="table" style={{ marginBottom: '1rem' }}>
                <thead><tr><th>{t('colDate')}</th><th>{t('colMethod')}</th><th>{t('colReference')}</th><th style={{ textAlign: 'right' }}>{t('colAmount')}</th></tr></thead>
                <tbody>
                  {paymentHistory.map(p => (
                    <tr key={p.id}>
                      <td>{new Date(p.payment_date).toLocaleDateString('en-ZA')}</td>
                      <td>{{eft:t('methodEft'),cash:t('methodCash'),card:t('methodCard'),other:t('methodOther')}[p.method] || p.method}</td>
                      <td style={{ color: 'var(--gray-500)' }}>{p.reference || '—'}</td>
                      <td style={{ textAlign: 'right', color: 'var(--teal)', fontWeight: 600 }}>{paymentModalInvoice.currency} {Number(p.amount).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <form onSubmit={savePayment}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
                <Input label={`${t('amount')} (${paymentModalInvoice.currency})`} type="number" step="0.01" required value={paymentForm.amount} onChange={e => setPaymentForm({ ...paymentForm, amount: e.target.value })} />
                <Input label={t('paymentDate')} type="date" required value={paymentForm.payment_date} onChange={e => setPaymentForm({ ...paymentForm, payment_date: e.target.value })} />
                <Select label={t('method')} value={paymentForm.method} onChange={e => setPaymentForm({ ...paymentForm, method: e.target.value })}>
                  <option value="eft">{t('methodEft')}</option>
                  <option value="cash">{t('methodCash')}</option>
                  <option value="card">{t('methodCard')}</option>
                  <option value="other">{t('methodOther')}</option>
                </Select>
                <Input label={t('reference')} value={paymentForm.reference} onChange={e => setPaymentForm({ ...paymentForm, reference: e.target.value })} />
              </div>
            </form>
          </>
        )}
      </Modal>
    </div>
  )
}

export default function InvoicesPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <InvoicesContent />
    </Suspense>
  )
}

export const dynamic = 'force-dynamic'
