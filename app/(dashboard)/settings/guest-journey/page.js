'use client'
import { BrandIcon } from '@/components/ui/BrandIcon'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { PageLoader } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input, Textarea } from '@/components/ui/FormField'
import { useToast, ToastContainer } from '@/components/ui/Toast'
import { Mail, MapPin, Star } from 'lucide-react'

const DEFAULTS = {
  confirmation_enabled: true, confirmation_subject: '', confirmation_body: '',
  prearrival_enabled: true, prearrival_days_before: 3, prearrival_subject: '', prearrival_body: '',
  postcheckout_enabled: true, postcheckout_days_after: 1, postcheckout_subject: '', postcheckout_body: '',
  review_link: '',
}

export default function GuestJourneyPage() {
  const t = useTranslations('GuestJourney')
  const tCommon = useTranslations('Common')
  const { company, needsCompany } = useAuth()
  const supabase = createClient()
  const toast = useToast()
  const [form, setForm] = useState(DEFAULTS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  async function load() {
    if (!company) { setLoading(false); return }
    setLoading(true)
    let { data } = await supabase.from('guest_journey_settings').select('*').eq('company_id', company.id).maybeSingle()
    if (!data) {
      // First visit for this company — insert with just company_id so the
      // table's own column defaults (the actual default template text)
      // populate, rather than showing blank fields until the first save.
      const inserted = await supabase.from('guest_journey_settings').insert([{ company_id: company.id }]).select().maybeSingle()
      data = inserted.data
    }
    if (data) setForm({ ...DEFAULTS, ...data })
    setLoading(false)
  }
  useEffect(() => { load() }, [company])

  if (needsCompany) return <EmptyState icon={<BrandIcon name="companySetup" size={48} />} title={tCommon('needsCompanyTitle')} />
  if (loading) return <PageLoader />

  async function handleSave() {
    setSaving(true)
    const payload = { ...form, company_id: company.id, updated_at: new Date().toISOString() }
    delete payload.created_at
    const { error } = await supabase.from('guest_journey_settings').upsert([payload], { onConflict: 'company_id' })
    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success(t('saved'))
  }

  const cardStyle = { marginBottom: '1.25rem' }
  const rowStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }

  return (
    <div>
      <ToastContainer toasts={toast.toasts} remove={toast.remove} />
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('title')}</h1>
          <p className="page-subtitle">{t('subtitle')}</p>
        </div>
        <button className="btn btn-primary" disabled={saving} onClick={handleSave}>{saving ? t('saving') : t('save')}</button>
      </div>

      <p style={{ fontSize: '0.8125rem', color: 'var(--gray-400)', marginBottom: '1.25rem' }}>{t('variablesHint')}</p>

      <div className="card card-shadow" style={cardStyle}>
        <div style={rowStyle}>
          <div style={{ display: 'flex', gap: '0.625rem' }}>
            <Mail size={18} color="var(--gold)" style={{ marginTop: '0.125rem' }} />
            <div>
              <p style={{ margin: 0, fontWeight: 700, color: 'var(--navy)' }}>{t('confirmationTitle')}</p>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--gray-400)' }}>{t('confirmationDesc')}</p>
            </div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', flexShrink: 0 }}>
            <input type="checkbox" checked={form.confirmation_enabled} onChange={e => setForm({ ...form, confirmation_enabled: e.target.checked })} />
            <span style={{ fontSize: '0.8125rem' }}>{t('enabled')}</span>
          </label>
        </div>
        {form.confirmation_enabled && (
          <>
            <Input label={t('subject')} value={form.confirmation_subject} onChange={e => setForm({ ...form, confirmation_subject: e.target.value })} />
            <Textarea label={t('message')} rows={5} value={form.confirmation_body} onChange={e => setForm({ ...form, confirmation_body: e.target.value })} />
          </>
        )}
      </div>

      <div className="card card-shadow" style={cardStyle}>
        <div style={rowStyle}>
          <div style={{ display: 'flex', gap: '0.625rem' }}>
            <MapPin size={18} color="var(--gold)" style={{ marginTop: '0.125rem' }} />
            <div>
              <p style={{ margin: 0, fontWeight: 700, color: 'var(--navy)' }}>{t('prearrivalTitle')}</p>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--gray-400)' }}>{t('prearrivalDesc')}</p>
            </div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', flexShrink: 0 }}>
            <input type="checkbox" checked={form.prearrival_enabled} onChange={e => setForm({ ...form, prearrival_enabled: e.target.checked })} />
            <span style={{ fontSize: '0.8125rem' }}>{t('enabled')}</span>
          </label>
        </div>
        {form.prearrival_enabled && (
          <>
            <Input label={t('daysBefore')} type="number" min="0" max="30" value={form.prearrival_days_before}
              onChange={e => setForm({ ...form, prearrival_days_before: e.target.value })} />
            <Input label={t('subject')} value={form.prearrival_subject} onChange={e => setForm({ ...form, prearrival_subject: e.target.value })} />
            <Textarea label={t('message')} rows={5} value={form.prearrival_body} onChange={e => setForm({ ...form, prearrival_body: e.target.value })} />
          </>
        )}
      </div>

      <div className="card card-shadow" style={cardStyle}>
        <div style={rowStyle}>
          <div style={{ display: 'flex', gap: '0.625rem' }}>
            <Star size={18} color="var(--gold)" style={{ marginTop: '0.125rem' }} />
            <div>
              <p style={{ margin: 0, fontWeight: 700, color: 'var(--navy)' }}>{t('postcheckoutTitle')}</p>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--gray-400)' }}>{t('postcheckoutDesc')}</p>
            </div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', flexShrink: 0 }}>
            <input type="checkbox" checked={form.postcheckout_enabled} onChange={e => setForm({ ...form, postcheckout_enabled: e.target.checked })} />
            <span style={{ fontSize: '0.8125rem' }}>{t('enabled')}</span>
          </label>
        </div>
        {form.postcheckout_enabled && (
          <>
            <Input label={t('daysAfter')} type="number" min="0" max="30" value={form.postcheckout_days_after}
              onChange={e => setForm({ ...form, postcheckout_days_after: e.target.value })} />
            <Input label={t('reviewLink')} placeholder="https://g.page/r/..." value={form.review_link || ''} onChange={e => setForm({ ...form, review_link: e.target.value })} hint={t('reviewLinkHint')} />
            <Input label={t('subject')} value={form.postcheckout_subject} onChange={e => setForm({ ...form, postcheckout_subject: e.target.value })} />
            <Textarea label={t('message')} rows={5} value={form.postcheckout_body} onChange={e => setForm({ ...form, postcheckout_body: e.target.value })} />
          </>
        )}
      </div>
    </div>
  )
}

export const dynamic = 'force-dynamic'
