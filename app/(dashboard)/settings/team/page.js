'use client'
import { BrandIcon } from '@/components/ui/BrandIcon'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { PageLoader } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { Modal } from '@/components/ui/Modal'
import { Input, Select } from '@/components/ui/FormField'
import { useToast, ToastContainer } from '@/components/ui/Toast'
import { LimitBanner } from '@/components/ui/LimitBanner'
import { checkLimit } from '@/lib/limits'
import { Plus, UserX, Crown } from 'lucide-react'

const emptyForm = { email: '', role: 'staff' }

export default function TeamPage() {
  const t = useTranslations('Team')
  const tCommon = useTranslations('Common')
  const { company, profile, needsCompany, isAdmin } = useAuth()
  const supabase = createClient()
  const toast = useToast()
  const [members, setMembers] = useState([])
  const [addons, setAddons] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [removingId, setRemovingId] = useState(null)

  async function load() {
    if (!company) { setLoading(false); return }
    setLoading(true)
    const [m, a] = await Promise.all([
      supabase.from('profiles').select('id, full_name, email, role, created_at').eq('company_id', company.id).order('created_at'),
      supabase.from('company_addons').select('addon_key, quantity, active').eq('company_id', company.id).eq('active', true),
    ])
    setMembers(m.data || [])
    setAddons(a.data || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [company])

  if (needsCompany) return <EmptyState icon={<BrandIcon name="companySetup" size={48} />} title={tCommon('needsCompanyTitle')} />
  if (loading) return <PageLoader />

  const seatsLimit = checkLimit('seats', members.length, { profile, company, companyAddons: addons })

  async function handleInvite(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/team/invite', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to send invite')
      toast.success(t('inviteSent', { email: form.email }))
      setModalOpen(false)
      setForm(emptyForm)
      load()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleRemove(member) {
    if (!confirm(t('confirmRemove', { name: member.full_name || member.email }))) return
    setRemovingId(member.id)
    try {
      const res = await fetch('/api/team/remove', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId: member.id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to remove')
      toast.success(t('memberRemoved'))
      load()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <div>
      <ToastContainer toasts={toast.toasts} remove={toast.remove} />
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('title')}</h1>
          <p className="page-subtitle">{t('subtitle')}</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
            <Plus size={16} /> {t('inviteTeammate')}
          </button>
        )}
      </div>

      <LimitBanner resourceKey="seats" limitInfo={seatsLimit} />

      <div className="card card-shadow" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="table">
          <thead>
            <tr>
              <th>{t('colName')}</th><th>{t('colEmail')}</th><th>{t('colRole')}</th>
              {isAdmin && <th></th>}
            </tr>
          </thead>
          <tbody>
            {members.map(m => (
              <tr key={m.id}>
                <td style={{ fontWeight: 600, color: 'var(--navy)' }}>
                  {m.full_name || t('unnamed')}
                  {m.id === profile.id && <span style={{ marginLeft: '0.5rem', fontSize: '0.6875rem', color: 'var(--gray-400)' }}>({t('you')})</span>}
                </td>
                <td style={{ color: 'var(--gray-500)' }}>{m.email}</td>
                <td>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 600, color: m.role === 'owner' ? 'var(--gold)' : 'var(--gray-500)', textTransform: 'capitalize' }}>
                    {m.role === 'owner' && <Crown size={12} />} {m.role}
                  </span>
                </td>
                {isAdmin && (
                  <td style={{ textAlign: 'right' }}>
                    {m.role !== 'owner' && m.id !== profile.id && (
                      <button onClick={() => handleRemove(m)} disabled={removingId === m.id}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)' }} title={t('removeAccess')}>
                        <UserX size={15} />
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={t('inviteTeammate')}
        footer={<>
          <button className="btn btn-outline" onClick={() => setModalOpen(false)}>{t('cancel')}</button>
          <button className="btn btn-primary" disabled={saving} onClick={handleInvite}>{saving ? t('sending') : t('sendInvite')}</button>
        </>}>
        <form onSubmit={handleInvite}>
          <Input label={t('emailAddress')} type="email" required placeholder="receptionist@example.com"
            value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          <Select label={t('role')} value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
            <option value="staff">{t('roleStaff')}</option>
            <option value="admin">{t('roleAdmin')}</option>
          </Select>
          <p style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginTop: '-0.25rem' }}>{t('inviteHint')}</p>
        </form>
      </Modal>
    </div>
  )
}

export const dynamic = 'force-dynamic'
