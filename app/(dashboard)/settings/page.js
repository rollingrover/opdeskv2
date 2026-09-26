'use client'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { PageLoader } from '@/components/ui/Spinner'
import { Input, Select } from '@/components/ui/FormField'
import { useToast, ToastContainer } from '@/components/ui/Toast'
import { OPERATOR_TYPES, CURRENCIES, LANGUAGES } from '@/lib/constants'
import Link from 'next/link'
import { CreditCard, Package, Upload } from 'lucide-react'

export default function SettingsPage() {
  const t = useTranslations('SettingsMain')
  const { company, profile, needsCompany, reload, loading: authLoading } = useAuth()
  const supabase = createClient()
  const toast = useToast()
  const [form, setForm] = useState({
    name: '', operator_type: 'safari', currency: 'ZAR', language: 'en',
    country: 'ZA', timezone: 'Africa/Johannesburg', billing_email: '', phone: '',
    bookkeeper_email: '', address: '', vat_number: '', registration_number: '', website: '',
    bank_name: '', bank_account_number: '', bank_branch_code: '', bank_account_type: '',
  })
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)

  useEffect(() => {
    if (company) {
      setForm(f => ({ ...f, ...company }))
    }
  }, [company])

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)

    if (needsCompany || !company) {
      // Same RLS timing problem as signup: a raw insert().select() here fails
      // because this profile has no company_id yet at the moment of insert,
      // so it can't "see" the row it just created to hand it back. The RPC
      // does the insert + profile-link atomically as a security-definer call,
      // sidestepping the chicken-and-egg entirely.
      const { data: comp, error: compErr } = await supabase.rpc('create_my_company', {
        p_name: form.name, p_operator_type: form.operator_type, p_currency: form.currency,
        p_language: form.language, p_country: form.country, p_timezone: form.timezone,
        p_billing_email: form.billing_email || null, p_phone: form.phone || null,
        p_email: profile?.email || null,
      })
      setSaving(false)
      if (compErr) { toast.error(compErr.message); return }
      toast.success(t('companyCreated'))
      await reload()
      return
    }

    const { error } = await supabase.from('companies').update({
      name: form.name, operator_type: form.operator_type, currency: form.currency,
      language: form.language, country: form.country, timezone: form.timezone,
      billing_email: form.billing_email, phone: form.phone,
      bookkeeper_email: form.bookkeeper_email || null,
      address: form.address || null, vat_number: form.vat_number || null,
      registration_number: form.registration_number || null, website: form.website || null,
      bank_name: form.bank_name || null, bank_account_number: form.bank_account_number || null,
      bank_branch_code: form.bank_branch_code || null, bank_account_type: form.bank_account_type || null,
    }).eq('id', company.id)
    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success(t('settingsSaved'))
    reload()
  }

  async function uploadLogo(e) {
    const file = e.target.files?.[0]
    if (!file || !company) return
    if (file.size > 5 * 1024 * 1024) { toast.error(t('logoTooLarge')); return }
    if (!['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'].includes(file.type)) {
      toast.error(t('logoWrongType')); return
    }
    setUploadingLogo(true)
    const ext = file.name.split('.').pop()
    const path = `${company.id}/logo.${ext}`
    const { error: uploadErr } = await supabase.storage.from('logos').upload(path, file, { upsert: true })
    if (uploadErr) { setUploadingLogo(false); toast.error(uploadErr.message); return }
    const { data: urlData } = supabase.storage.from('logos').getPublicUrl(path)
    const { error: dbErr } = await supabase.from('companies').update({ logo_url: urlData.publicUrl }).eq('id', company.id)
    setUploadingLogo(false)
    if (dbErr) { toast.error(dbErr.message); return }
    toast.success(t('logoUpdated'))
    reload?.()
    e.target.value = ''
  }

  if (authLoading) return <PageLoader />

  return (
    <div>
      <ToastContainer toasts={toast.toasts} remove={toast.remove} />
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('title')}</h1>
          <p className="page-subtitle">{needsCompany || !company ? t('setupSubtitle') : t('manageSubtitle')}</p>
        </div>
      </div>

      {!needsCompany && company && (
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          <Link href="/settings/billing" className="btn btn-outline btn-sm"><CreditCard size={15} /> {t('billingAndPlan')}</Link>
          <Link href="/settings/addons" className="btn btn-outline btn-sm"><Package size={15} /> {t('addons')}</Link>
        </div>
      )}

      <div className="card card-shadow" style={{ maxWidth: 640 }}>
        <form onSubmit={handleSave}>
          <Input label={t('companyName')} required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
            <Select label={t('operatorType')} value={form.operator_type} onChange={e => setForm({ ...form, operator_type: e.target.value })}>
              {OPERATOR_TYPES.map(ot => <option key={ot.value} value={ot.value}>{t(`operatorTypes.${ot.value}`)}</option>)}
            </Select>
            <Select label={t('currency')} value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })}>
              {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code} — {c.name}</option>)}
            </Select>
            <Select label={t('language')} value={form.language} onChange={e => setForm({ ...form, language: e.target.value })}>
              {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
            </Select>
            <Input label={t('country')} value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} />
            <Input label={t('billingEmail')} type="email" value={form.billing_email || ''} onChange={e => setForm({ ...form, billing_email: e.target.value })} />
            <Input label={t('phone')} value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} />
          </div>
          {!needsCompany && company && (
            <div style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--gray-100)' }}>
              <label className="label">{t('registrationBilling')}</label>
              <p style={{ fontSize: '0.8125rem', color: 'var(--gray-400)', marginTop: '-0.25rem', marginBottom: '0.5rem' }}>
                {t('registrationBillingDesc')}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
                <Input label={t('vatNumber')} value={form.vat_number || ''} onChange={e => setForm({ ...form, vat_number: e.target.value })} />
                <Input label={t('registrationNumber')} value={form.registration_number || ''} onChange={e => setForm({ ...form, registration_number: e.target.value })} />
                <Input label={t('website')} placeholder="https://" value={form.website || ''} onChange={e => setForm({ ...form, website: e.target.value })} />
              </div>
              <Input label={t('address')} value={form.address || ''} onChange={e => setForm({ ...form, address: e.target.value })} />

              <label className="label" style={{ marginTop: '0.75rem' }}>{t('bankingDetails')}</label>
              <p style={{ fontSize: '0.8125rem', color: 'var(--gray-400)', marginTop: '-0.25rem', marginBottom: '0.5rem' }}>
                {t('bankingDetailsDesc')}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
                <Input label={t('bankName')} value={form.bank_name || ''} onChange={e => setForm({ ...form, bank_name: e.target.value })} />
                <Input label={t('bankAccountType')} value={form.bank_account_type || ''} onChange={e => setForm({ ...form, bank_account_type: e.target.value })} />
                <Input label={t('bankAccountNumber')} value={form.bank_account_number || ''} onChange={e => setForm({ ...form, bank_account_number: e.target.value })} />
                <Input label={t('bankBranchCode')} value={form.bank_branch_code || ''} onChange={e => setForm({ ...form, bank_branch_code: e.target.value })} />
              </div>
            </div>
          )}
          {!needsCompany && company && (
            <div style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--gray-100)' }}>
              <label className="label">{t('companyLogo')}</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                {company.logo_url ? (
                  <img src={company.logo_url} alt="Company logo" style={{ height: 48, maxWidth: 120, objectFit: 'contain', borderRadius: '0.375rem', border: '1px solid var(--gray-100)', padding: '0.375rem' }} />
                ) : (
                  <div style={{ height: 48, width: 48, borderRadius: '0.375rem', background: 'var(--gray-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Upload size={18} color="var(--gray-300)" />
                  </div>
                )}
                <label className="btn btn-outline btn-sm" style={{ cursor: 'pointer' }}>
                  {uploadingLogo ? t('uploading') : company.logo_url ? t('replaceLogo') : t('uploadLogo')}
                  <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={uploadLogo} disabled={uploadingLogo} style={{ display: 'none' }} />
                </label>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--gray-400)', marginTop: '-0.25rem' }}>
                {t('logoAppearsOn')}
              </p>
            </div>
          )}
          {!needsCompany && company && (
            <div style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--gray-100)' }}>
              <Input label={t('bookkeeperEmail')} type="email" placeholder="bookkeeper@example.com"
                value={form.bookkeeper_email || ''} onChange={e => setForm({ ...form, bookkeeper_email: e.target.value })} />
              <p style={{ fontSize: '0.8125rem', color: 'var(--gray-400)', marginTop: '-0.5rem' }}>
                {t('bookkeeperDesc')}
              </p>
            </div>
          )}
          <button className="btn btn-primary" disabled={saving} type="submit">
            {saving ? t('saving') : (needsCompany || !company ? t('createCompany') : t('saveChanges'))}
          </button>
        </form>
      </div>
    </div>
  )
}

export const dynamic = 'force-dynamic'
