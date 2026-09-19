'use client'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { PageLoader } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { ModuleLocked } from '@/components/ui/ModuleLocked'
import { Modal } from '@/components/ui/Modal'
import { Input, Select } from '@/components/ui/FormField'
import { useToast, ToastContainer } from '@/components/ui/Toast'
import { BrandIcon } from '@/components/ui/BrandIcon'
import { hasModuleAccess } from '@/lib/moduleAccess'
import { Plus, FileDown, Send } from 'lucide-react'

const emptyPayment = { amount: '', payment_date: new Date().toISOString().slice(0, 10), method: 'cash', reference: '', notes: '' }

export default function StatementsPage() {
  const t = useTranslations('DeliveryStatements')
  const tOrders = useTranslations('DeliveryOrders')
  const tCommon = useTranslations('Common')
  const { company, profile, needsCompany } = useAuth()
  const supabase = createClient()
  const toast = useToast()
  const [clients, setClients] = useState([])
  const [selectedClient, setSelectedClient] = useState('')
  const [orders, setOrders] = useState([])
  const [payments, setPayments] = useState([])
  const [addons, setAddons] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyPayment)
  const [saving, setSaving] = useState(false)
  const [sending, setSending] = useState(false)

  async function loadClients() {
    if (!company) { setLoading(false); return }
    setLoading(true)
    const [c, a] = await Promise.all([
      supabase.from('delivery_clients').select('id, name').eq('company_id', company.id).order('name'),
      supabase.from('company_addons').select('addon_key, active').eq('company_id', company.id).eq('active', true),
    ])
    setClients(c.data || [])
    setAddons(a.data || [])
    if (c.data?.length && !selectedClient) setSelectedClient(c.data[0].id)
    setLoading(false)
  }
  useEffect(() => { loadClients() }, [company])

  async function loadStatement() {
    if (!selectedClient) return
    const [o, p] = await Promise.all([
      supabase.from('delivery_orders').select('*, delivery_order_items(quantity, unit_sell_price)').eq('client_id', selectedClient).order('order_date', { ascending: false }),
      supabase.from('delivery_client_payments').select('*').eq('client_id', selectedClient).order('payment_date', { ascending: false }),
    ])
    setOrders(o.data || [])
    setPayments(p.data || [])
  }
  useEffect(() => { loadStatement() }, [selectedClient])

  const access = hasModuleAccess('delivery_management', { profile, company, companyAddons: addons })

  async function sendStatement() {
    if (!selectedClient) return
    setSending(true)
    try {
      const res = await fetch('/api/statements/send', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: selectedClient }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to send')
      toast.success(data.bccSent ? t('statementSentBcc') : t('statementSent'))
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSending(false)
    }
  }

  async function savePayment(e) {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase.from('delivery_client_payments').insert([{
      company_id: company.id, client_id: selectedClient, amount: Number(form.amount) || 0,
      payment_date: form.payment_date, method: form.method, reference: form.reference, notes: form.notes,
    }])
    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success(t('paymentRecorded'))
    setModalOpen(false); setForm(emptyPayment); loadStatement()
  }

  if (needsCompany) return <EmptyState icon={<BrandIcon name="companySetup" size={48} />} title={tCommon('needsCompanyTitle')} />
  if (loading) return <PageLoader />
  if (!access) return <ModuleLocked moduleKey="delivery_management" />

  const totalInvoiced = orders.reduce((s, o) => s + (o.delivery_order_items || []).reduce((si, li) => si + li.quantity * li.unit_sell_price, 0), 0)
  const totalPaid = payments.reduce((s, p) => s + Number(p.amount), 0)
  const balance = totalInvoiced - totalPaid

  const statusLabel = (val) => tOrders(`orderStatuses.${val}`)
  const methodLabel = (val) => ({ cash: t('methodCash'), eft: t('methodEft'), card: t('methodCard'), other: t('methodOther') }[val] || val)

  return (
    <div>
      <ToastContainer toasts={toast.toasts} remove={toast.remove} />
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('title')}</h1>
          <p className="page-subtitle">{t('subtitle')}</p>
        </div>
        {selectedClient && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <a href={`/api/pdf/statement?clientId=${selectedClient}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
              <FileDown size={16} /> {t('downloadPdf')}
            </a>
            <button className="btn btn-outline" disabled={sending} onClick={sendStatement}>
              <Send size={16} /> {sending ? t('sending') : t('sendToClient')}
            </button>
            <button className="btn btn-primary" onClick={() => setModalOpen(true)}><Plus size={16} /> {t('recordPayment')}</button>
          </div>
        )}
      </div>

      {clients.length === 0 ? (
        <div className="card card-shadow">
          <EmptyState icon={<BrandIcon name="delivery" size={48} />} title={t('addClientFirstTitle')} description={t('addClientFirstDesc')} />
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '1.25rem', maxWidth: 320 }}>
            <Select label={t('client')} value={selectedClient} onChange={e => setSelectedClient(e.target.value)}>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
            <div className="card card-shadow"><div style={{ color: 'var(--gray-500)', fontSize: '0.75rem', textTransform: 'uppercase' }}>{t('totalInvoiced')}</div><div style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--navy)' }}>{company.currency} {totalInvoiced.toLocaleString()}</div></div>
            <div className="card card-shadow"><div style={{ color: 'var(--gray-500)', fontSize: '0.75rem', textTransform: 'uppercase' }}>{t('totalPaid')}</div><div style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--teal)' }}>{company.currency} {totalPaid.toLocaleString()}</div></div>
            <div className="card card-shadow"><div style={{ color: 'var(--gray-500)', fontSize: '0.75rem', textTransform: 'uppercase' }}>{t('balanceOwing')}</div><div style={{ fontSize: '1.375rem', fontWeight: 800, color: balance > 0 ? '#ef4444' : 'var(--teal)' }}>{company.currency} {balance.toLocaleString()}</div></div>
          </div>

          <div className="card card-shadow" style={{ padding: 0, overflow: 'hidden', marginBottom: '1.25rem' }}>
            <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--gray-100)' }}><h3 style={{ margin: 0, fontSize: '0.9375rem', color: 'var(--navy)' }}>{t('ordersHeading')}</h3></div>
            {orders.length === 0 ? <div style={{ padding: '1.5rem', color: 'var(--gray-400)', textAlign: 'center' }}>{t('noOrdersYet')}</div> : (
              <table className="table">
                <thead><tr><th>{t('colOrder')}</th><th>{t('colDate')}</th><th>{t('colStatus')}</th><th style={{ textAlign: 'right' }}>{t('colAmount')}</th></tr></thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id}>
                      <td style={{ fontFamily: 'monospace', color: 'var(--navy)' }}>{o.order_ref}</td>
                      <td>{new Date(o.order_date).toLocaleDateString('en-ZA')}</td>
                      <td>{statusLabel(o.status)}</td>
                      <td style={{ textAlign: 'right' }}>{company.currency} {(o.delivery_order_items || []).reduce((s, li) => s + li.quantity * li.unit_sell_price, 0).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="card card-shadow" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--gray-100)' }}><h3 style={{ margin: 0, fontSize: '0.9375rem', color: 'var(--navy)' }}>{t('paymentsHeading')}</h3></div>
            {payments.length === 0 ? <div style={{ padding: '1.5rem', color: 'var(--gray-400)', textAlign: 'center' }}>{t('noPaymentsRecorded')}</div> : (
              <table className="table">
                <thead><tr><th>{t('colDate')}</th><th>{t('colMethod')}</th><th>{t('colReference')}</th><th style={{ textAlign: 'right' }}>{t('colAmount')}</th></tr></thead>
                <tbody>
                  {payments.map(p => (
                    <tr key={p.id}>
                      <td>{new Date(p.payment_date).toLocaleDateString('en-ZA')}</td>
                      <td>{methodLabel(p.method)}</td>
                      <td style={{ color: 'var(--gray-500)' }}>{p.reference || '—'}</td>
                      <td style={{ textAlign: 'right', color: 'var(--teal)', fontWeight: 600 }}>{company.currency} {Number(p.amount).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={t('recordPayment')}
        footer={<>
          <button className="btn btn-outline" onClick={() => setModalOpen(false)}>{t('cancel')}</button>
          <button className="btn btn-primary" disabled={saving} onClick={savePayment}>{saving ? t('saving') : t('recordPayment')}</button>
        </>}>
        <form onSubmit={savePayment}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
            <Input label={`${t('amount')} (${company?.currency})`} type="number" step="0.01" required value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
            <Input label={t('paymentDate')} type="date" required value={form.payment_date} onChange={e => setForm({ ...form, payment_date: e.target.value })} />
            <Select label={t('method')} value={form.method} onChange={e => setForm({ ...form, method: e.target.value })}>
              <option value="cash">{t('methodCash')}</option>
              <option value="eft">{t('methodEft')}</option>
              <option value="card">{t('methodCard')}</option>
              <option value="other">{t('methodOther')}</option>
            </Select>
            <Input label={t('reference')} value={form.reference} onChange={e => setForm({ ...form, reference: e.target.value })} />
          </div>
        </form>
      </Modal>
    </div>
  )
}

export const dynamic = 'force-dynamic'
