'use client'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { PageLoader } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { useToast, ToastContainer } from '@/components/ui/Toast'
import { Repeat, Plus, Trash2 } from 'lucide-react'

// Recurring invoices: e.g. web hosting R50/month or a domain R100/year. A
// daily job issues each invoice on its date, emails it (PDF attached, your
// bookkeeper in BCC) and schedules the next one.
const today = () => new Date().toISOString().slice(0, 10)
const EMPTY = { client_name: '', client_email: '', client_business_name: '', cadence: 'monthly', next_issue_date: today(), invoice_type: 'tax',
  vat_rate: 0, due_days: 7, auto_send: true, active: true, notes: '', line_items: [{ description: '', quantity: 1, unit_price: 0 }] }

export default function RecurringInvoicesPage() {
  const t = useTranslations('Recurring')
  const { company } = useAuth()
  const supabase = createClient()
  const toast = useToast()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)

  async function fetchRows() { return supabase.from('recurring_invoices').select('*').eq('company_id', company.id).order('next_issue_date') }
  function apply({ data, error }) { if (error) toast.error(error.message); setRows(data || []); setLoading(false) }
  async function load() { apply(await fetchRows()) }
  useEffect(() => {
    if (!company) return
    let alive = true
    fetchRows().then(r => { if (alive) apply(r) })
    return () => { alive = false }
  }, [company]) // eslint-disable-line react-hooks/exhaustive-deps

  const amount = r => (r.line_items || []).reduce((s, li) => s + (Number(li.quantity) || 1) * (Number(li.unit_price) || 0), 0) * (1 + (Number(r.vat_rate) || 0) / 100)
  const setLine = (i, k, v) => setForm(f => ({ ...f, line_items: f.line_items.map((li, j) => (j === i ? { ...li, [k]: v } : li)) }))

  async function save() {
    if (!form.client_name || !form.line_items.some(li => li.description && Number(li.unit_price) > 0)) { toast.error(t('needClientAndLine')); return }
    setSaving(true)
    const payload = {
      ...form, company_id: company.id, currency: form.currency || company.currency || 'ZAR',
      vat_rate: Number(form.vat_rate) || 0, due_days: Number(form.due_days) || 0,
      line_items: form.line_items.filter(li => li.description).map(li => ({ description: li.description, quantity: Number(li.quantity) || 1, unit_price: Number(li.unit_price) || 0 })),
      updated_at: new Date().toISOString(),
    }
    const q = form.id ? supabase.from('recurring_invoices').update(payload).eq('id', form.id) : supabase.from('recurring_invoices').insert([payload])
    const { error } = await q
    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success(t('saved')); setForm(null); load()
  }
  async function remove(id) {
    if (!confirm(t('confirmDelete'))) return
    const { error } = await supabase.from('recurring_invoices').delete().eq('id', id)
    if (error) toast.error(error.message); else { setForm(null); load() }
  }

  if (!company || loading) return <PageLoader />
  const fld = { display: 'flex', flexDirection: 'column', gap: 4, fontSize: '0.8125rem', fontWeight: 600, color: 'var(--gray-600)' }
  return (
    <div>
      <ToastContainer toasts={toast.toasts} remove={toast.remove} />
      <div className="page-header">
        <div><h1 className="page-title">{t('title')}</h1><p className="page-subtitle">{t('subtitle')}</p></div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link href="/invoices" className="btn btn-outline">{t('backToInvoices')}</Link>
          <button className="btn btn-primary" onClick={() => setForm({ ...EMPTY, currency: company.currency || 'ZAR' })}><Plus size={16} /> {t('add')}</button>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="card card-shadow"><EmptyState icon={<Repeat size={40} color="var(--gray-400)" />} title={t('empty')} description={t('emptyDesc')} /></div>
      ) : (
        <div className="card card-shadow" style={{ padding: 0, overflowX: 'auto' }}>
          <table className="table">
            <thead><tr><th>{t('client')}</th><th>{t('items')}</th><th>{t('cadence')}</th><th style={{ textAlign: 'right' }}>{t('amount')}</th><th>{t('nextInvoice')}</th><th>{t('status')}</th><th /></tr></thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id} style={{ opacity: r.active ? 1 : 0.55 }}>
                  <td><strong>{r.client_name}</strong><div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{r.client_email || t('noEmail')}</div></td>
                  <td style={{ fontSize: '0.875rem' }}>{(r.line_items || []).map(li => li.description).join(', ')}</td>
                  <td>{t(`cadence_${r.cadence}`)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700 }}>{r.currency} {amount(r).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</td>
                  <td>{r.next_issue_date}</td>
                  <td style={{ fontSize: '0.8125rem' }}>{!r.active ? t('paused') : r.auto_send && r.client_email ? t('autoEmail') : t('draftOnly')}</td>
                  <td><button className="btn btn-outline btn-sm" onClick={() => setForm({ ...EMPTY, ...r })}>{t('edit')}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', marginTop: '0.75rem' }}>{t('howItWorks')}</p>

      {form && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 60, display: 'grid', placeItems: 'center', padding: '1rem' }} onClick={() => setForm(null)}>
          <div className="card" style={{ width: 'min(640px, 100%)', maxHeight: '92vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ marginTop: 0, fontSize: '1.125rem' }}>{form.id ? t('editSchedule') : t('add')}</h2>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <label style={fld}>{t('clientName')} *<input value={form.client_name} onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))} /></label>
                <label style={fld}>{t('clientEmail')}<input type="email" value={form.client_email || ''} onChange={e => setForm(f => ({ ...f, client_email: e.target.value }))} /></label>
              </div>
              <div>
                <div style={{ ...fld, marginBottom: 6 }}>{t('lines')}</div>
                {form.line_items.map((li, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 70px 110px 34px', gap: '0.5rem', marginBottom: 6 }}>
                    <input placeholder={t('linePlaceholder')} value={li.description} onChange={e => setLine(i, 'description', e.target.value)} />
                    <input type="number" min="1" value={li.quantity} onChange={e => setLine(i, 'quantity', e.target.value)} />
                    <input type="number" min="0" step="0.01" value={li.unit_price} onChange={e => setLine(i, 'unit_price', e.target.value)} />
                    <button className="btn btn-outline btn-sm" onClick={() => setForm(f => ({ ...f, line_items: f.line_items.filter((_, j) => j !== i) }))}><Trash2 size={13} /></button>
                  </div>
                ))}
                <button className="btn btn-outline btn-sm" onClick={() => setForm(f => ({ ...f, line_items: [...f.line_items, { description: '', quantity: 1, unit_price: 0 }] }))}><Plus size={13} /> {t('addLine')}</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                <label style={fld}>{t('cadence')}<select value={form.cadence} onChange={e => setForm(f => ({ ...f, cadence: e.target.value }))}><option value="monthly">{t('cadence_monthly')}</option><option value="annual">{t('cadence_annual')}</option></select></label>
                <label style={fld}>{t('nextInvoice')}<input type="date" value={form.next_issue_date} onChange={e => setForm(f => ({ ...f, next_issue_date: e.target.value }))} /></label>
                <label style={fld}>{t('dueDays')}<input type="number" min="0" max="90" value={form.due_days} onChange={e => setForm(f => ({ ...f, due_days: e.target.value }))} /></label>
                <label style={fld}>{t('invoiceType')}<select value={form.invoice_type} onChange={e => setForm(f => ({ ...f, invoice_type: e.target.value }))}><option value="tax">{t('typeTax')}</option><option value="proforma">{t('typeProforma')}</option></select></label>
                <label style={fld}>{t('vatRate')}<input type="number" min="0" max="100" step="0.01" value={form.vat_rate} onChange={e => setForm(f => ({ ...f, vat_rate: e.target.value }))} /></label>
              </div>
              <label style={{ display: 'flex', gap: 8, fontSize: '0.875rem' }}><input type="checkbox" checked={form.auto_send} onChange={e => setForm(f => ({ ...f, auto_send: e.target.checked }))} /> {t('autoSend')}</label>
              <label style={{ display: 'flex', gap: 8, fontSize: '0.875rem' }}><input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} /> {t('activeLabel')}</label>
              <label style={fld}>{t('notes')}<textarea rows={2} value={form.notes || ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></label>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', marginTop: '1rem' }}>
              {form.id ? <button className="btn btn-outline" style={{ color: '#b91c1c' }} onClick={() => remove(form.id)}>{t('delete')}</button> : <span />}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-outline" onClick={() => setForm(null)}>{t('cancel')}</button>
                <button className="btn btn-primary" disabled={saving} onClick={save}>{saving ? t('saving') : t('save')}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export const dynamic = 'force-dynamic'
