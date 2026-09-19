'use client'
import { useEffect, useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { PageLoader } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { ModuleLocked } from '@/components/ui/ModuleLocked'
import { useToast, ToastContainer } from '@/components/ui/Toast'
import { BrandIcon } from '@/components/ui/BrandIcon'
import { hasModuleAccess } from '@/lib/moduleAccess'
import { TrendingUp, TrendingDown, Lock } from 'lucide-react'

const LOCALE_MAP = { en: 'en-ZA', af: 'af-ZA', fr: 'fr-FR', pt: 'pt-PT', de: 'de-DE' }

export default function LogisticsReportsPage() {
  const t = useTranslations('DeliveryReports')
  const tCommon = useTranslations('Common')
  const locale = useLocale()
  const { company, profile, needsCompany } = useAuth()
  const supabase = createClient()
  const toast = useToast()
  const [orders, setOrders] = useState([])
  const [addons, setAddons] = useState([])
  const [loading, setLoading] = useState(true)

  async function load() {
    if (!company) { setLoading(false); return }
    setLoading(true)
    const [o, a] = await Promise.all([
      supabase.from('delivery_orders').select('*, delivery_clients(name), delivery_order_items(quantity, unit_cost_price, unit_sell_price), delivery_order_workers(cost)').eq('company_id', company.id).order('order_date'),
      supabase.from('company_addons').select('addon_key, active').eq('company_id', company.id).eq('active', true),
    ])
    if (o.error) toast.error(o.error.message)
    setOrders(o.data || [])
    setAddons(a.data || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [company])

  const access = hasModuleAccess('delivery_management', { profile, company, companyAddons: addons })
  const hasAdvancedReporting = !!company?.package?.limits?.advanced_reporting
  const dateLocale = LOCALE_MAP[locale] || 'en-ZA'

  if (needsCompany) return <EmptyState icon={<BrandIcon name="companySetup" size={48} />} title={tCommon('needsCompanyTitle')} />
  if (loading) return <PageLoader />
  if (!access) return <ModuleLocked moduleKey="delivery_management" />

  if (!hasAdvancedReporting) {
    return (
      <div>
        <div className="page-header">
          <div>
            <h1 className="page-title">{t('title')}</h1>
            <p className="page-subtitle">{t('subtitle')}</p>
          </div>
        </div>
        <div className="card card-shadow">
          <EmptyState icon={<Lock size={40} color="var(--gray-400)" />} title={t('lockedTitle')}
            description={t('lockedDesc')} />
        </div>
      </div>
    )
  }

  function orderMetrics(o) {
    const revenue = (o.delivery_order_items || []).reduce((s, li) => s + li.quantity * li.unit_sell_price, 0)
    const stockCost = (o.delivery_order_items || []).reduce((s, li) => s + li.quantity * li.unit_cost_price, 0)
    const workerCost = (o.delivery_order_workers || []).reduce((s, w) => s + Number(w.cost), 0)
    const cost = stockCost + workerCost + Number(o.vehicle_cost_estimate || 0)
    return { revenue, cost, profit: revenue - cost }
  }

  // Profit by month
  const byMonth = {}
  orders.forEach(o => {
    const key = new Date(o.order_date).toLocaleDateString(dateLocale, { month: 'short', year: 'numeric' })
    const { revenue, cost, profit } = orderMetrics(o)
    if (!byMonth[key]) byMonth[key] = { revenue: 0, cost: 0, profit: 0 }
    byMonth[key].revenue += revenue
    byMonth[key].cost += cost
    byMonth[key].profit += profit
  })
  const monthRows = Object.entries(byMonth)

  // Profit by client
  const byClient = {}
  orders.forEach(o => {
    const name = o.delivery_clients?.name || t('unknownClient')
    const { revenue, cost, profit } = orderMetrics(o)
    if (!byClient[name]) byClient[name] = { revenue: 0, cost: 0, profit: 0, orders: 0 }
    byClient[name].revenue += revenue
    byClient[name].cost += cost
    byClient[name].profit += profit
    byClient[name].orders += 1
  })
  const clientRows = Object.entries(byClient).sort((a, b) => b[1].profit - a[1].profit)

  return (
    <div>
      <ToastContainer toasts={toast.toasts} remove={toast.remove} />
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('title')}</h1>
          <p className="page-subtitle">{t('subtitle')}</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="card card-shadow">
          <EmptyState icon={<BrandIcon name="delivery" size={48} />} title={t('noOrdersTitle')} description={t('noOrdersDesc')} />
        </div>
      ) : (
        <>
          <div className="card card-shadow" style={{ padding: 0, overflow: 'hidden', marginBottom: '1.25rem' }}>
            <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--gray-100)' }}><h3 style={{ margin: 0, fontSize: '0.9375rem', color: 'var(--navy)' }}>{t('profitByMonth')}</h3></div>
            <table className="table">
              <thead><tr><th>{t('colMonth')}</th><th style={{ textAlign: 'right' }}>{t('colRevenue')}</th><th style={{ textAlign: 'right' }}>{t('colCost')}</th><th style={{ textAlign: 'right' }}>{t('colProfit')}</th></tr></thead>
              <tbody>
                {monthRows.map(([month, m]) => (
                  <tr key={month}>
                    <td style={{ fontWeight: 600, color: 'var(--navy)' }}>{month}</td>
                    <td style={{ textAlign: 'right' }}>{company.currency} {m.revenue.toLocaleString()}</td>
                    <td style={{ textAlign: 'right', color: 'var(--gray-500)' }}>{company.currency} {m.cost.toLocaleString()}</td>
                    <td style={{ textAlign: 'right' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontWeight: 700, color: m.profit >= 0 ? 'var(--teal)' : '#ef4444' }}>
                        {m.profit >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />} {company.currency} {m.profit.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card card-shadow" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--gray-100)' }}><h3 style={{ margin: 0, fontSize: '0.9375rem', color: 'var(--navy)' }}>{t('clientProfitability')}</h3></div>
            <table className="table">
              <thead><tr><th>{t('colClient')}</th><th>{t('colOrders')}</th><th style={{ textAlign: 'right' }}>{t('colRevenue')}</th><th style={{ textAlign: 'right' }}>{t('colProfit')}</th><th style={{ textAlign: 'right' }}>{t('colMargin')}</th></tr></thead>
              <tbody>
                {clientRows.map(([name, c]) => (
                  <tr key={name}>
                    <td style={{ fontWeight: 600, color: 'var(--navy)' }}>{name}</td>
                    <td style={{ color: 'var(--gray-500)' }}>{c.orders}</td>
                    <td style={{ textAlign: 'right' }}>{company.currency} {c.revenue.toLocaleString()}</td>
                    <td style={{ textAlign: 'right', color: c.profit >= 0 ? 'var(--teal)' : '#ef4444', fontWeight: 700 }}>{company.currency} {c.profit.toLocaleString()}</td>
                    <td style={{ textAlign: 'right', color: 'var(--gray-500)' }}>{c.revenue > 0 ? Math.round(c.profit / c.revenue * 100) : 0}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

export const dynamic = 'force-dynamic'
