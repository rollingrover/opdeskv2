'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { PageLoader } from '@/components/ui/Spinner'
import { useToast, ToastContainer } from '@/components/ui/Toast'
import { Lock } from 'lucide-react'

// Operator email notifications (paid plans): daily digest, reminders before
// each confirmed booking with a start time, and compliance alerts.
export default function NotificationSettingsPage() {
  const t = useTranslations('NotificationSettings')
  const { company, reload } = useAuth()
  const supabase = createClient()
  const toast = useToast()
  const [override, setOverride] = useState({})
  const [saving, setSaving] = useState(false)
  if (!company) return <PageLoader />
  const v = k => (k in override ? override[k] : company[k])
  const set = (k, val) => setOverride(o => ({ ...o, [k]: val }))
  const paid = company.subscription_tier !== 'free'

  async function save() {
    setSaving(true)
    const { error } = await supabase.from('companies').update(override).eq('id', company.id)
    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success(t('saved')); setOverride({}); reload?.()
  }

  const row = (k, title, desc, children = null) => (
    <div key={k} className="card card-shadow" style={{ marginBottom: '0.875rem' }}>
      <label style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', cursor: 'pointer' }}>
        <input type="checkbox" checked={!!v(k)} onChange={e => set(k, e.target.checked)} style={{ marginTop: 4 }} />
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontWeight: 700, color: 'var(--navy)' }}>{title}</p>
          <p style={{ margin: '2px 0 0', fontSize: '0.8125rem', color: 'var(--gray-500)' }}>{desc}</p>
          {children}
        </div>
      </label>
    </div>
  )

  return (
    <div style={{ maxWidth: 720 }}>
      <ToastContainer toasts={toast.toasts} remove={toast.remove} />
      <div className="page-header"><div><h1 className="page-title">{t('title')}</h1><p className="page-subtitle">{t('subtitle', { email: company.email || '—' })}</p></div></div>
      {!paid && (
        <div className="card card-shadow" style={{ marginBottom: '1rem', borderLeft: '4px solid var(--gold)', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Lock size={18} color="var(--gold)" /><span style={{ flex: 1, fontSize: '0.9rem' }}>{t('freeBanner')}</span>
          <Link href="/settings/billing" className="btn btn-primary btn-sm">{t('upgrade')}</Link>
        </div>
      )}
      {row('notify_daily_digest', t('digest'), t('digestDesc'), (
        <div style={{ marginTop: 8, fontSize: '0.8125rem' }}>{t('sendAt')}{' '}
          <select value={v('notify_digest_hour')} onChange={e => set('notify_digest_hour', Number(e.target.value))} onClick={e => e.preventDefault()}>
            {Array.from({ length: 24 }, (_, h) => <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>)}
          </select>{' '}({company.timezone || 'Africa/Johannesburg'})
        </div>
      ))}
      {row('notify_booking_reminder', t('reminder'), t('reminderDesc'), (
        <div style={{ marginTop: 8, fontSize: '0.8125rem' }}>{t('sendBefore')}{' '}
          <select value={v('notify_reminder_minutes')} onChange={e => set('notify_reminder_minutes', Number(e.target.value))} onClick={e => e.preventDefault()}>
            {[30, 60, 120, 180].map(m => <option key={m} value={m}>{m < 60 ? `${m} min` : `${m / 60} h`}</option>)}
          </select>
        </div>
      ))}
      {row('notify_assigned_staff', t('staff'), t('staffDesc'))}
      {row('notify_compliance', t('compliance'), t('complianceDesc'))}
      <button className="btn btn-primary" disabled={saving || !Object.keys(override).length} onClick={save}>{saving ? t('saving') : t('save')}</button>
    </div>
  )
}

export const dynamic = 'force-dynamic'
