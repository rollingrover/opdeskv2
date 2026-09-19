'use client'
import { BrandIcon } from '@/components/ui/BrandIcon'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { PageLoader } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { useToast, ToastContainer } from '@/components/ui/Toast'
import { notify } from '@/lib/notify'
import { Check, Clock, Plus } from 'lucide-react'

export default function AddonsMarketplacePage() {
  const t = useTranslations('SettingsAddons')
  const tCommon = useTranslations('Common')
  const { company, profile, needsCompany } = useAuth()
  const supabase = createClient()
  const toast = useToast()
  const [catalog, setCatalog] = useState([])
  const [active, setActive] = useState([])
  const [pending, setPending] = useState([])
  const [loading, setLoading] = useState(true)
  const [requesting, setRequesting] = useState(null)

  async function load() {
    if (!company) { setLoading(false); return }
    setLoading(true)
    const [c, a, r] = await Promise.all([
      supabase.from('addon_pricing').select('*').order('addon_key'),
      supabase.from('company_addons').select('*').eq('company_id', company.id).eq('active', true),
      supabase.from('addon_requests').select('*').eq('company_id', company.id).eq('status', 'pending'),
    ])
    setCatalog(c.data || [])
    setActive(a.data || [])
    setPending(r.data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [company])

  async function requestAddon(addonKey) {
    setRequesting(addonKey)
    const { error } = await supabase.from('addon_requests').insert([{
      company_id: company.id, requested_by: profile.id, addon_key: addonKey, quantity: 1,
    }])
    if (error) { setRequesting(null); toast.error(error.message); return }
    // Also raised as a support ticket — addon_requests lives on its own
    // approval queue (see admin/companies/[id]), but a support ticket is
    // what actually shows up in the Support Queue admins check day to day,
    // so this makes sure a new request doesn't go unnoticed there.
    await supabase.from('support_tickets').insert([{
      company_id: company.id, submitted_by: profile.id, category: 'addon_request', priority: 'normal',
      subject: `Add-on request: ${addonLabel(addonKey)}`,
      description: `${profile.email || profile.full_name || 'A user'} requested the "${addonLabel(addonKey)}" add-on for ${company.name}. Approve or decline from Companies → ${company.name} → Add-on Requests.`,
    }])
    setRequesting(null)
    notify('addon_request_created', { companyName: company.name, requesterEmail: profile.email, addonKey, quantity: 1 })
    toast.success(t('requestSent'))
    load()
  }

  if (needsCompany) return <EmptyState icon={<BrandIcon name="companySetup" size={48} />} title={tCommon('needsCompanyTitle')} />
  if (loading) return <PageLoader />

  const isActive = key => active.some(a => a.addon_key === key)
  const isPending = key => pending.some(r => r.addon_key === key)
  const addonLabel = key => t.has(`labels.${key}`) ? t(`labels.${key}`) : key.replace(/_/g, ' ')

  return (
    <div>
      <ToastContainer toasts={toast.toasts} remove={toast.remove} />
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('title')}</h1>
          <p className="page-subtitle">{t('subtitle')}</p>
        </div>
      </div>

      <div style={{ background: 'var(--cream)', border: '1px solid var(--gray-100)', borderRadius: '0.75rem', padding: '0.875rem 1.25rem', marginBottom: '1.25rem', fontSize: '0.8125rem', color: 'var(--gray-500)' }}>
        {t('infoBanner', { active: t('active') })}
      </div>

      <div className="card card-shadow" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="table">
          <thead>
            <tr><th>{t('colAddon')}</th><th>{t('colPrice')}</th><th style={{ textAlign: 'right' }}>{t('colStatus')}</th></tr>
          </thead>
          <tbody>
            {catalog.map(a => {
              const isBundle = a.addon_key === 'hr_bundle'
              const bundleSavings = isBundle
                ? ['certifications', 'schedules_module', 'cost_to_company', 'leave']
                    .reduce((sum, k) => sum + (catalog.find(c => c.addon_key === k)?.monthly_price ? Number(catalog.find(c => c.addon_key === k).monthly_price) : 0), 0) - Number(a.monthly_price)
                : 0
              return (
              <tr key={a.addon_key} style={isBundle ? { background: 'var(--cream)' } : {}}>
                <td style={{ fontWeight: 600, color: 'var(--navy)' }}>
                  {addonLabel(a.addon_key)}
                  {isBundle && bundleSavings > 0 && (
                    <span style={{ marginLeft: '0.5rem', fontSize: '0.6875rem', fontWeight: 700, color: 'var(--teal)', background: 'white', border: '1px solid var(--teal)', borderRadius: '999px', padding: '0.0625rem 0.5rem' }}>
                      {company.currency} {bundleSavings.toLocaleString()}{t('saveSuffix')}
                    </span>
                  )}
                </td>
                <td style={{ color: 'var(--gray-500)' }}>{company.currency} {Number(a.monthly_price).toLocaleString()}{t('priceSuffix')}</td>
                <td style={{ textAlign: 'right' }}>
                  {isActive(a.addon_key) ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--teal)', fontWeight: 700, fontSize: '0.8125rem' }}>
                      <Check size={14} /> {t('active')}
                    </span>
                  ) : isPending(a.addon_key) ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--gold)', fontWeight: 700, fontSize: '0.8125rem' }}>
                      <Clock size={14} /> {t('requested')}
                    </span>
                  ) : (
                    <button className="btn btn-outline btn-sm" disabled={requesting === a.addon_key} onClick={() => requestAddon(a.addon_key)}>
                      <Plus size={14} /> {requesting === a.addon_key ? t('sending') : t('request')}
                    </button>
                  )}
                </td>
              </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export const dynamic = 'force-dynamic'
