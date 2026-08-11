'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { PageLoader } from '@/components/ui/Spinner'
import { Input, Select } from '@/components/ui/FormField'
import { useToast, ToastContainer } from '@/components/ui/Toast'
import { OPERATOR_TYPES, CURRENCIES, LANGUAGES } from '@/lib/constants'
import Link from 'next/link'
import { CreditCard, Package } from 'lucide-react'

export default function SettingsPage() {
  const { company, profile, needsCompany, reload, loading: authLoading } = useAuth()
  const supabase = createClient()
  const toast = useToast()
  const [form, setForm] = useState({
    name: '', operator_type: 'safari', currency: 'ZAR', language: 'en',
    country: 'ZA', timezone: 'Africa/Johannesburg', billing_email: '', phone: '',
  })
  const [saving, setSaving] = useState(false)

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
      toast.success('Company created!')
      await reload()
      return
    }

    const { error } = await supabase.from('companies').update({
      name: form.name, operator_type: form.operator_type, currency: form.currency,
      language: form.language, country: form.country, timezone: form.timezone,
      billing_email: form.billing_email, phone: form.phone,
    }).eq('id', company.id)
    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success('Settings saved')
    reload()
  }

  if (authLoading) return <PageLoader />

  return (
    <div>
      <ToastContainer toasts={toast.toasts} remove={toast.remove} />
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">{needsCompany || !company ? 'Set up your company to get started' : 'Manage your company profile'}</p>
        </div>
      </div>

      {!needsCompany && company && (
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          <Link href="/settings/billing" className="btn btn-outline btn-sm"><CreditCard size={15} /> Billing & Plan</Link>
          <Link href="/settings/addons" className="btn btn-outline btn-sm"><Package size={15} /> Add-ons</Link>
        </div>
      )}

      <div className="card card-shadow" style={{ maxWidth: 640 }}>
        <form onSubmit={handleSave}>
          <Input label="Company Name" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
            <Select label="Operator Type" value={form.operator_type} onChange={e => setForm({ ...form, operator_type: e.target.value })}>
              {OPERATOR_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </Select>
            <Select label="Currency" value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })}>
              {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code} — {c.name}</option>)}
            </Select>
            <Select label="Language" value={form.language} onChange={e => setForm({ ...form, language: e.target.value })}>
              {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
            </Select>
            <Input label="Country" value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} />
            <Input label="Billing Email" type="email" value={form.billing_email || ''} onChange={e => setForm({ ...form, billing_email: e.target.value })} />
            <Input label="Phone" value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} />
          </div>
          <button className="btn btn-primary" disabled={saving} type="submit">
            {saving ? 'Saving…' : (needsCompany || !company ? 'Create Company' : 'Save Changes')}
          </button>
        </form>
      </div>
    </div>
  )
}

export const dynamic = 'force-dynamic'
