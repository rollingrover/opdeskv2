'use client'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { PageLoader } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { StatusBadge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/FormField'
import { useToast, ToastContainer } from '@/components/ui/Toast'
import { BrandIcon } from '@/components/ui/BrandIcon'

export default function InvoiceStatementsPage() {
  const t = useTranslations('ClientStatements')
  const tCommon = useTranslations('Common')
  const tInv = useTranslations('Invoices')
  const { company, needsCompany } = useAuth()
  const supabase = createClient()
  const toast = useToast()
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedClient, setSelectedClient] = useState('')

  async function load() {
    if (!company) { setLoading(false); return }
    setLoading(true)
    const { data, error } = await supabase.from('invoices').select('*, invoice_payments(*)').eq('company_id', company.id).order('created_at', { ascending: false })
    if (error) toast.error(error.message)
    setInvoices(data || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [company])

  if (needsCompany) return <EmptyState icon={<BrandIcon name="companySetup" size={48} />} title={tCommon('needsCompanyTitle')} />
  if (loading) return <PageLoader />

  const clientKey = inv => (inv.guest_email || inv.guest_name || 'unknown').toLowerCase()
  const clients = {}
  invoices.forEach(inv => {
    const key = clientKey(inv)
    if (!clients[key]) clients[key] = { name: inv.guest_name || inv.guest_email || t('unknownClient'), email: inv.guest_email, invoices: [] }
    clients[key].invoices.push(inv)
  })
  const clientList = Object.entries(clients).sort((a, b) => a[1].name.localeCompare(b[1].name))

  if (!selectedClient && clientList.length > 0) setSelectedClient(clientList[0][0])
  const active = clients[selectedClient]

  const totalInvoiced = active ? active.invoices.reduce((s, i) => s + Number(i.total), 0) : 0
  const totalPaid = active ? active.invoices.reduce((s, i) => s + Number(i.amount_paid || 0), 0) : 0
  const balance = totalInvoiced - totalPaid

  const typeLabel = (val) => ({ proforma: tInv('typeProforma'), tax: tInv('typeTax'), quotation: tInv('typeQuotation') }[val] || val)

  return (
    <div>
      <ToastContainer toasts={toast.toasts} remove={toast.remove} />
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('title')}</h1>
          <p className="page-subtitle">{t('subtitle')}</p>
        </div>
      </div>

      {clientList.length === 0 ? (
        <div className="card card-shadow">
          <EmptyState icon={<BrandIcon name="newInvoice" size={48} />} title={t('noInvoicesTitle')} description={t('noInvoicesDesc')} />
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '1.25rem', maxWidth: 320 }}>
            <Select label={t('client')} value={selectedClient} onChange={e => setSelectedClient(e.target.value)}>
              {clientList.map(([key, c]) => <option key={key} value={key}>{c.name}</option>)}
            </Select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
            <div className="card card-shadow"><div style={{ color: 'var(--gray-500)', fontSize: '0.75rem', textTransform: 'uppercase' }}>{t('totalInvoiced')}</div><div style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--navy)' }}>{company.currency} {totalInvoiced.toLocaleString()}</div></div>
            <div className="card card-shadow"><div style={{ color: 'var(--gray-500)', fontSize: '0.75rem', textTransform: 'uppercase' }}>{t('totalPaid')}</div><div style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--teal)' }}>{company.currency} {totalPaid.toLocaleString()}</div></div>
            <div className="card card-shadow"><div style={{ color: 'var(--gray-500)', fontSize: '0.75rem', textTransform: 'uppercase' }}>{t('balanceOwing')}</div><div style={{ fontSize: '1.375rem', fontWeight: 800, color: balance > 0 ? '#ef4444' : 'var(--teal)' }}>{company.currency} {balance.toLocaleString()}</div></div>
          </div>

          <div className="card card-shadow" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="table">
              <thead><tr><th>{t('colInvoice')}</th><th>{t('colDate')}</th><th>{t('colType')}</th><th>{t('colStatus')}</th><th style={{ textAlign: 'right' }}>{t('colTotal')}</th><th style={{ textAlign: 'right' }}>{t('colPaid')}</th><th style={{ textAlign: 'right' }}>{t('colBalance')}</th></tr></thead>
              <tbody>
                {active?.invoices.map(inv => {
                  const bal = Number(inv.total) - Number(inv.amount_paid || 0)
                  return (
                    <tr key={inv.id}>
                      <td style={{ fontFamily: 'monospace', color: 'var(--navy)' }}>{inv.invoice_number}</td>
                      <td>{new Date(inv.created_at).toLocaleDateString('en-ZA')}</td>
                      <td>{typeLabel(inv.invoice_type)}</td>
                      <td><StatusBadge status={inv.status} /></td>
                      <td style={{ textAlign: 'right' }}>{inv.currency} {Number(inv.total).toLocaleString()}</td>
                      <td style={{ textAlign: 'right', color: 'var(--teal)' }}>{inv.currency} {Number(inv.amount_paid || 0).toLocaleString()}</td>
                      <td style={{ textAlign: 'right', color: bal > 0 ? '#ef4444' : 'var(--teal)', fontWeight: 600 }}>{inv.currency} {bal.toLocaleString()}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

export const dynamic = 'force-dynamic'
