'use client'
import { BrandIcon } from '@/components/ui/BrandIcon'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { PageLoader } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { hasModuleAccess } from '@/lib/moduleAccess'
import { Lock } from 'lucide-react'
import Link from 'next/link'

export default function CommissionReportPage() {
  const t = useTranslations('CommissionReport')
  const tCommon = useTranslations('Common')
  const { company, profile, needsCompany } = useAuth()
  const supabase = createClient()
  const [rows, setRows] = useState([])
  const [addons, setAddons] = useState([])
  const [loading, setLoading] = useState(true)

  async function load() {
    if (!company) { setLoading(false); return }
    setLoading(true)
    const [inv, ad] = await Promise.all([
      supabase.from('invoices').select('id, invoice_number, guest_name, created_at, currency, line_items').eq('company_id', company.id).order('created_at', { ascending: false }),
      supabase.from('company_addons').select('addon_key, active').eq('company_id', company.id).eq('active', true),
    ])
    setAddons(ad.data || [])

    const commissionRows = []
    for (const inv of inv.data || []) {
      for (const li of inv.line_items || []) {
        if (li.commission_pct) {
          const saleAmount = Number(li.total) || 0
          const commissionAmount = +(saleAmount * Number(li.commission_pct) / 100).toFixed(2)
          commissionRows.push({
            invoiceId: inv.id, invoiceNumber: inv.invoice_number, guestName: inv.guest_name,
            date: inv.created_at, currency: inv.currency, description: li.description,
            saleAmount, commissionPct: li.commission_pct, commissionAmount,
          })
        }
      }
    }
    setRows(commissionRows)
    setLoading(false)
  }
  useEffect(() => { load() }, [company])

  if (needsCompany) return <EmptyState icon={<BrandIcon name="companySetup" size={48} />} title={tCommon('needsCompanyTitle')} />
  if (loading) return <PageLoader />

  const canView = hasModuleAccess('commission_reporting', { profile, company, companyAddons: addons })
  if (!canView) {
    return (
      <div>
        <div className="page-header">
          <div><h1 className="page-title">{t('title')}</h1><p className="page-subtitle">{t('subtitle')}</p></div>
        </div>
        <EmptyState icon={<Lock size={40} color="var(--gray-400)" />} title={t('lockedTitle')} description={t('lockedDesc')}
          action={<Link href="/settings/billing" className="btn btn-primary btn-sm">{t('viewPlans')}</Link>} />
      </div>
    )
  }

  const grandTotal = rows.reduce((sum, r) => sum + r.commissionAmount, 0)

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('title')}</h1>
          <p className="page-subtitle">{t('subtitle')}</p>
        </div>
      </div>

      <div className="card card-shadow" style={{ padding: '1rem 1.25rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.875rem', color: 'var(--gray-500)', fontWeight: 600 }}>{t('totalOwed')}</span>
        <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gold)' }}>{company.currency} {grandTotal.toLocaleString()}</span>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={<BrandIcon name="proformaInvoice" size={48} />} title={t('noCommissionsTitle')} description={t('noCommissionsDesc')} />
      ) : (
        <div className="card card-shadow" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table">
            <thead>
              <tr>
                <th>{t('colInvoice')}</th><th>{t('colGuest')}</th><th>{t('colDate')}</th>
                <th>{t('colLine')}</th><th>{t('colSaleAmount')}</th><th>{t('colPct')}</th><th style={{ textAlign: 'right' }}>{t('colCommission')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--navy)', fontWeight: 600 }}>{r.invoiceNumber}</td>
                  <td>{r.guestName || '—'}</td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>{new Date(r.date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td style={{ fontSize: '0.8125rem' }}>{r.description}</td>
                  <td>{r.currency} {r.saleAmount.toLocaleString()}</td>
                  <td>{r.commissionPct}%</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--gold)' }}>{r.currency} {r.commissionAmount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export const dynamic = 'force-dynamic'
