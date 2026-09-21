'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { MarketingNav } from '@/components/marketing/MarketingNav'
import { MarketingFooter } from '@/components/marketing/MarketingFooter'
import { Input, Select, Textarea } from '@/components/ui/FormField'
import { Check } from 'lucide-react'

// key = stable identifier for translation lookup; enValue = what actually
// gets stored in the database, always in English regardless of the UI
// language, since the superadmin RollingRover panel displays this field
// directly (features.join(', ')) and expects consistent, readable text.
const FEATURE_OPTIONS = [
  { key: 'online_booking', enValue: 'Online booking system' },
  { key: 'blog', enValue: 'Blog' },
  { key: 'multi_language', enValue: 'Multi-language support' },
  { key: 'membership', enValue: 'Membership / login area' },
  { key: 'animations', enValue: 'Custom animations' },
  { key: 'seo', enValue: 'SEO package' },
  { key: 'payments', enValue: 'Payment integration' },
  { key: 'gallery', enValue: 'Photo gallery' },
]

const emptyForm = {
  name: '', email: '', phone: '', business_name: '',
  project_type: 'new_website', page_count: '1-5', ecommerce: false,
  features: [], timeline: 'flexible', budget_range: '', details: '',
}

export default function WebDesignRequestPage() {
  const t = useTranslations('WebDesign')
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  function toggleFeature(enValue) {
    setForm(prev => ({
      ...prev,
      features: prev.features.includes(enValue) ? prev.features.filter(x => x !== enValue) : [...prev.features, enValue],
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    const supabase = createClient()
    const { error: err } = await supabase.from('rollingrover_requests').insert([form])
    setSubmitting(false)
    if (err) { setError(t('errorMessage')); return }
    setSubmitted(true)
  }

  const inputWrap = { marginBottom: '1rem' }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      <MarketingNav />

      <section style={{ background: 'linear-gradient(135deg, var(--navy) 0%, #1a3a5c 55%, #1B8A8F 100%)', padding: '4rem 2rem 3rem', textAlign: 'center', color: 'white' }}>
        <p style={{ fontSize: '0.875rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '1rem' }}>
          {t('eyebrow')}
        </p>
        <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 'clamp(2rem, 4.5vw, 2.75rem)', fontWeight: 900, color: 'white', margin: '0 auto 1rem', maxWidth: '680px' }}>
          {t('heroTitle')}
        </h1>
        <p style={{ fontSize: '1.0625rem', color: 'rgba(255,255,255,0.8)', maxWidth: '560px', margin: '0 auto' }}>
          {t('heroSubtitle')}
        </p>
      </section>

      <section style={{ padding: '3rem 2rem', maxWidth: '640px', margin: '0 auto' }}>
        {submitted ? (
          <div className="card card-lg card-shadow" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <div style={{ background: 'var(--cream)', borderRadius: '50%', padding: '0.875rem' }}>
                <Check size={32} color="var(--teal)" />
              </div>
            </div>
            <h2 style={{ color: 'var(--navy)', marginBottom: '0.5rem' }}>{t('thanksTitle')}</h2>
            <p style={{ color: 'var(--gray-500)' }}>{t('thanksBody', { email: form.email })}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card card-lg card-shadow">
            <div style={inputWrap}><Input label={t('yourName')} required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
              <Input label={t('email')} type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              <Input label={t('phone')} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>
            <Input label={t('businessName')} value={form.business_name} onChange={e => setForm({ ...form, business_name: e.target.value })} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
              <Select label={t('projectType')} value={form.project_type} onChange={e => setForm({ ...form, project_type: e.target.value })}>
                <option value="new_website">{t('projectTypes.new_website')}</option>
                <option value="redesign">{t('projectTypes.redesign')}</option>
                <option value="ecommerce">{t('projectTypes.ecommerce')}</option>
                <option value="landing_page">{t('projectTypes.landing_page')}</option>
                <option value="web_app">{t('projectTypes.web_app')}</option>
              </Select>
              <Select label={t('pageCount')} value={form.page_count} onChange={e => setForm({ ...form, page_count: e.target.value })}>
                <option value="1">{t('pageCounts.1')}</option>
                <option value="1-5">{t('pageCounts.1-5')}</option>
                <option value="6-10">{t('pageCounts.6-10')}</option>
                <option value="10+">{t('pageCounts.10+')}</option>
              </Select>
              <Select label={t('timeline')} value={form.timeline} onChange={e => setForm({ ...form, timeline: e.target.value })}>
                <option value="asap">{t('timelines.asap')}</option>
                <option value="1_month">{t('timelines.1_month')}</option>
                <option value="2_3_months">{t('timelines.2_3_months')}</option>
                <option value="flexible">{t('timelines.flexible')}</option>
              </Select>
              <Select label={t('budgetRange')} value={form.budget_range} onChange={e => setForm({ ...form, budget_range: e.target.value })}>
                <option value="">{t('budgets.none')}</option>
                <option value="under_10k">{t('budgets.under_10k')}</option>
                <option value="10k_25k">{t('budgets.10k_25k')}</option>
                <option value="25k_50k">{t('budgets.25k_50k')}</option>
                <option value="50k_plus">{t('budgets.50k_plus')}</option>
              </Select>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.5rem 0 1rem', fontSize: '0.875rem', color: 'var(--navy)', cursor: 'pointer' }}>
              <input type="checkbox" checked={form.ecommerce} onChange={e => setForm({ ...form, ecommerce: e.target.checked })} />
              {t('ecommerceCheckbox')}
            </label>

            <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{t('featuresHeading')}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.25rem' }}>
              {FEATURE_OPTIONS.map(f => (
                <label key={f.key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--gray-600, #4b5563)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.features.includes(f.enValue)} onChange={() => toggleFeature(f.enValue)} />
                  {t(`features.${f.key}`)}
                </label>
              ))}
            </div>

            <Textarea label={t('detailsLabel')} rows={5} value={form.details} onChange={e => setForm({ ...form, details: e.target.value })} />

            {error && <p style={{ color: '#ef4444', fontSize: '0.875rem', marginBottom: '1rem' }}>{error}</p>}
            <button type="submit" className="btn btn-primary btn-lg" disabled={submitting} style={{ width: '100%', justifyContent: 'center' }}>
              {submitting ? t('sending') : t('submit')}
            </button>
          </form>
        )}
      </section>

      <MarketingFooter />
    </div>
  )
}
