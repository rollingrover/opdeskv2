'use client'
import { BrandIcon } from '@/components/ui/BrandIcon'
import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { PageLoader } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { Modal } from '@/components/ui/Modal'
import { Input, Select } from '@/components/ui/FormField'
import { useToast, ToastContainer } from '@/components/ui/Toast'
import { OPERATOR_TYPES, CURRENCIES } from '@/lib/constants'
import { Plus, MapPin } from 'lucide-react'

const emptyForm = { name: '', operator_type: 'safari', currency: 'ZAR', package_slug: 'basic', billing_email: '', phone: '' }

function LocationsContent() {
  const t = useTranslations('Locations')
  const tCommon = useTranslations('Common')
  const { company, profile, needsCompany, isOwner, reload } = useAuth()
  const supabase = createClient()
  const toast = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [locations, setLocations] = useState([])
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [switchingId, setSwitchingId] = useState(null)

  async function load() {
    if (!company) { setLoading(false); return }
    setLoading(true)
    const [locs, pkgs] = await Promise.all([
      company.organization_id
        ? supabase.from('companies').select('id, name, operator_type, package_id, location_discount_pct').eq('organization_id', company.organization_id).order('name')
        : Promise.resolve({ data: [company] }),
      supabase.from('marketing_packages').select('slug, name, monthly_price').eq('active', true).order('sort_order'),
    ])
    setLocations(locs.data || [])
    setPackages(pkgs.data || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [company])

  useEffect(() => {
    if (searchParams.get('add') === '1' && company?.package?.slug === 'enterprise' && isOwner) setModalOpen(true)
  }, [searchParams, company, isOwner])

  if (needsCompany) return <EmptyState icon={<BrandIcon name="companySetup" size={48} />} title={tCommon('needsCompanyTitle')} />
  if (loading) return <PageLoader />

  const isEnterprise = company?.package?.slug === 'enterprise'

  async function handleAdd(e) {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase.rpc('link_new_location', {
      p_name: form.name, p_operator_type: form.operator_type, p_currency: form.currency,
      p_language: company.language || 'en', p_country: company.country || 'ZA', p_timezone: company.timezone || 'Africa/Johannesburg',
      p_billing_email: form.billing_email || null, p_phone: form.phone || null, p_email: profile.email || null,
      p_package_slug: form.package_slug,
    })
    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success(t('locationAdded'))
    setModalOpen(false)
    setForm(emptyForm)
    load()
  }

  async function switchTo(id) {
    if (id === company.id || switchingId) return
    setSwitchingId(id)
    const { error } = await supabase.rpc('switch_active_company', { p_company_id: id })
    setSwitchingId(null)
    if (error) { toast.error(error.message); return }
    await reload()
    router.push('/dashboard')
  }

  const selectedPkg = packages.find(p => p.slug === form.package_slug)
  const discountedPrice = selectedPkg ? (Number(selectedPkg.monthly_price) * 0.8).toLocaleString() : null

  return (
    <div>
      <ToastContainer toasts={toast.toasts} remove={toast.remove} />
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('title')}</h1>
          <p className="page-subtitle">{t('subtitle')}</p>
        </div>
        {isOwner && isEnterprise && (
          <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
            <Plus size={16} /> {t('addLocation')}
          </button>
        )}
      </div>

      {!isEnterprise && (
        <div style={{ background: 'var(--cream)', border: '1px solid var(--gray-100)', borderRadius: '0.75rem', padding: '0.875rem 1.25rem', marginBottom: '1.25rem', fontSize: '0.8125rem', color: 'var(--gray-500)' }}>
          {t('needsEnterprise')}
        </div>
      )}

      <div className="card card-shadow" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="table">
          <thead><tr><th>{t('colName')}</th><th>{t('colType')}</th><th style={{ textAlign: 'right' }}></th></tr></thead>
          <tbody>
            {locations.map(loc => (
              <tr key={loc.id}>
                <td style={{ fontWeight: 600, color: 'var(--navy)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MapPin size={14} color="var(--gray-400)" /> {loc.name}
                  {loc.id === company.id && <span style={{ fontSize: '0.6875rem', color: 'var(--gray-400)' }}>({t('current')})</span>}
                  {loc.location_discount_pct > 0 && <span style={{ fontSize: '0.6875rem', color: 'var(--gold)' }}>−{loc.location_discount_pct}%</span>}
                </td>
                <td style={{ textTransform: 'capitalize', color: 'var(--gray-500)' }}>{loc.operator_type}</td>
                <td style={{ textAlign: 'right' }}>
                  {loc.id !== company.id && (
                    <button className="btn btn-outline btn-sm" disabled={switchingId === loc.id} onClick={() => switchTo(loc.id)}>
                      {switchingId === loc.id ? t('switching') : t('switchTo')}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={t('addLocation')}
        footer={<>
          <button className="btn btn-outline" onClick={() => setModalOpen(false)}>{t('cancel')}</button>
          <button className="btn btn-primary" disabled={saving} onClick={handleAdd}>{saving ? t('adding') : t('addLocation')}</button>
        </>}>
        <form onSubmit={handleAdd}>
          <Input label={t('locationName')} required placeholder={t('locationNamePlaceholder')} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
            <Select label={t('operatorType')} value={form.operator_type} onChange={e => setForm({ ...form, operator_type: e.target.value })}>
              {OPERATOR_TYPES.map(ot => <option key={ot.value} value={ot.value}>{ot.value}</option>)}
            </Select>
            <Select label={t('currency')} value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })}>
              {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
            </Select>
          </div>
          <Select label={t('planForThisLocation')} value={form.package_slug} onChange={e => setForm({ ...form, package_slug: e.target.value })}>
            {packages.map(p => <option key={p.slug} value={p.slug}>{p.name} — {company.currency}{p.monthly_price}/mo</option>)}
          </Select>
          {discountedPrice && (
            <p style={{ fontSize: '0.75rem', color: 'var(--gold)', marginTop: '-0.5rem', marginBottom: '0.75rem' }}>
              {t('discountNote', { price: `${company.currency}${discountedPrice}` })}
            </p>
          )}
          <Input label={t('billingEmail')} type="email" value={form.billing_email} onChange={e => setForm({ ...form, billing_email: e.target.value })} />
          <Input label={t('phone')} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
        </form>
      </Modal>
    </div>
  )
}

export default function LocationsPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <LocationsContent />
    </Suspense>
  )
}

export const dynamic = 'force-dynamic'
