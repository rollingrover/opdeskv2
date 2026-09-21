'use client'
import { BrandIcon } from '@/components/ui/BrandIcon'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { PageLoader } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/FormField'
import { useToast, ToastContainer } from '@/components/ui/Toast'
import { Copy, ExternalLink, Lock } from 'lucide-react'
import Link from 'next/link'

function slugify(name) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export default function BookingWidgetPage() {
  const t = useTranslations('BookingWidget')
  const tCommon = useTranslations('Common')
  const { company, needsCompany, reload } = useAuth()
  const supabase = createClient()
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ widget_enabled: false, slug: '' })

  useEffect(() => {
    if (!company) { setLoading(false); return }
    setForm({ widget_enabled: company.widget_enabled || false, slug: company.slug || slugify(company.name) })
    setLoading(false)
  }, [company])

  if (needsCompany) return <EmptyState icon={<BrandIcon name="companySetup" size={48} />} title={tCommon('needsCompanyTitle')} />
  if (loading) return <PageLoader />

  // Available on Professional and Enterprise — the direct-booking widget
  // is positioned as a step up from the core booking/invoicing toolkit
  // every tier already gets, matching how multi-location is gated.
  const eligible = ['professional', 'enterprise'].includes(company.package?.slug)

  async function save(e) {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase.from('companies').update({
      widget_enabled: form.widget_enabled,
      slug: form.slug || slugify(company.name),
    }).eq('id', company.id)
    setSaving(false)
    if (error) { toast.error(error.code === '23505' ? t('urlTaken') : error.message); return }
    toast.success(t('saved'))
    reload?.()
  }

  const embedUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/book/${form.slug || slugify(company.name)}`
  const embedCode = `<iframe src="${embedUrl}" style="width:100%; max-width:480px; height:720px; border:none;" title="Book with ${company.name}"></iframe>`

  function copyEmbed() {
    navigator.clipboard.writeText(embedCode)
    toast.success(t('copied'))
  }

  if (!eligible) {
    return (
      <div>
        <div className="page-header">
          <div>
            <h1 className="page-title">{t('title')}</h1>
            <p className="page-subtitle">{t('subtitle')}</p>
          </div>
        </div>
        <EmptyState icon={<Lock size={40} color="var(--gray-400)" />} title={t('lockedTitle')} description={t('lockedDesc')}
          action={<Link href="/settings/billing" className="btn btn-primary btn-sm">{t('viewPlans')}</Link>} />
      </div>
    )
  }

  return (
    <div>
      <ToastContainer toasts={toast.toasts} remove={toast.remove} />
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('title')}</h1>
          <p className="page-subtitle">{t('subtitle')}</p>
        </div>
      </div>

      <div style={{ background: 'var(--cream)', border: '1px solid var(--gray-100)', borderRadius: '0.75rem', padding: '0.875rem 1.125rem', marginBottom: '1.25rem', fontSize: '0.8125rem', color: 'var(--gray-500)' }}>
        {t('infoBanner')}
      </div>

      <form onSubmit={save} className="card card-shadow" style={{ marginBottom: '1.25rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem', cursor: 'pointer' }}>
          <input type="checkbox" checked={form.widget_enabled} onChange={e => setForm({ ...form, widget_enabled: e.target.checked })} />
          <div>
            <p style={{ margin: 0, fontWeight: 700, color: 'var(--navy)' }}>{t('enableWidget')}</p>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--gray-500)' }}>{t('enableWidgetDesc')}</p>
          </div>
        </label>

        <Input label={t('widgetUrl')} value={form.slug} onChange={e => setForm({ ...form, slug: slugify(e.target.value) })} placeholder={slugify(company.name)} />
        <p style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginTop: '-0.5rem', marginBottom: '1rem' }}>
          opdesk.app/book/<strong>{form.slug || slugify(company.name)}</strong>
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? t('saving') : t('save')}</button>
          {form.widget_enabled && (
            <a href={`/book/${form.slug || slugify(company.name)}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
              <ExternalLink size={14} /> {t('previewWidget')}
            </a>
          )}
        </div>
      </form>

      {form.widget_enabled && (
        <div className="card card-shadow">
          <h3 style={{ margin: '0 0 0.5rem', fontSize: '0.9375rem', color: 'var(--navy)' }}>{t('embedHeading')}</h3>
          <p style={{ margin: '0 0 0.75rem', fontSize: '0.8125rem', color: 'var(--gray-500)' }}>{t('embedDesc')}</p>
          <div style={{ position: 'relative' }}>
            <pre style={{ background: 'var(--gray-900, #111827)', color: '#e5e7eb', borderRadius: '0.5rem', padding: '0.875rem 1rem', fontSize: '0.75rem', overflowX: 'auto', margin: 0 }}>
              <code>{embedCode}</code>
            </pre>
            <button onClick={copyEmbed} className="btn btn-outline btn-sm" style={{ position: 'absolute', top: '0.5rem', right: '0.5rem' }}>
              <Copy size={13} /> {t('copy')}
            </button>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginTop: '0.75rem' }}>
            {t('embedHint')} <Link href="/settings/booking-types" style={{ color: 'var(--gold)' }}>{t('manageTypes')}</Link>
          </p>
        </div>
      )}
    </div>
  )
}

export const dynamic = 'force-dynamic'
