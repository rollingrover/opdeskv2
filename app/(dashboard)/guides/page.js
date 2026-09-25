'use client'
import { BrandIcon } from '@/components/ui/BrandIcon'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { PageLoader } from '@/components/ui/Spinner'
import { StatusBadge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/FormField'
import { useToast, ToastContainer } from '@/components/ui/Toast'
import { Plus, Mail, Phone, Compass } from 'lucide-react'
import Link from 'next/link'

const emptyForm = { full_name: '', phone: '', email: '' }

export default function GuidesPage() {
  const t = useTranslations('Guides')
  const tStaff = useTranslations('Staff')
  const tStatus = useTranslations('StatusBadge')
  const tCommon = useTranslations('Common')
  const { company, needsCompany } = useAuth()
  const supabase = createClient()
  const toast = useToast()
  const [guides, setGuides] = useState([])
  const [assignmentCounts, setAssignmentCounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  async function load() {
    if (!company) { setLoading(false); return }
    setLoading(true)
    const [g, b] = await Promise.all([
      supabase.from('staff').select('*').eq('company_id', company.id).eq('staff_type', 'guide').order('full_name'),
      // Upcoming assignment count per guide — a quick "who's busy" signal,
      // not a full schedule view (that's what the booking calendar is for).
      supabase.from('bookings').select('guide_id').eq('company_id', company.id).not('guide_id', 'is', null)
        .gte('start_date', new Date().toISOString().slice(0, 10)).neq('status', 'cancelled'),
    ])
    if (g.error) toast.error(g.error.message)
    setGuides(g.data || [])
    const counts = {}
    for (const row of b.data || []) counts[row.guide_id] = (counts[row.guide_id] || 0) + 1
    setAssignmentCounts(counts)
    setLoading(false)
  }
  useEffect(() => { load() }, [company])

  async function handleSave(e) {
    e.preventDefault()
    if (!company) return
    setSaving(true)
    const { error } = await supabase.from('staff').insert([{ ...form, company_id: company.id, staff_type: 'guide', employment_type: 'fulltime', status: 'active' }])
    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success(t('guideAdded'))
    setModalOpen(false); setForm(emptyForm); load()
  }

  if (needsCompany) return <EmptyState icon={<BrandIcon name="companySetup" size={48} />} title={tCommon('needsCompanyTitle')} />
  if (loading) return <PageLoader />

  return (
    <div>
      <ToastContainer toasts={toast.toasts} remove={toast.remove} />
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('title')}</h1>
          <p className="page-subtitle">
            {guides.length} {guides.length === 1 ? t('guideSingular') : t('guidePlural')} ·{' '}
            <Link href="/staff" style={{ color: 'var(--gold)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>{t('manageInStaff')} <BrandIcon name="arrowRight" size={11} /></Link>
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}><Plus size={16} /> {t('addGuide')}</button>
      </div>

      <div className="card card-shadow">
        {guides.length === 0 ? (
          <EmptyState icon={<Compass size={48} color="var(--gray-300)" />} title={t('noGuidesTitle')} description={t('noGuidesDesc')}
            action={<button className="btn btn-primary btn-sm" onClick={() => setModalOpen(true)}>{t('addGuide')}</button>} />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>{tStaff('colName')}</th><th>{tStaff('colContact')}</th><th>{t('colUpcoming')}</th><th>{tStaff('colStatus')}</th></tr></thead>
              <tbody>
                {guides.map(g => (
                  <tr key={g.id}>
                    <td style={{ fontWeight: 600, color: 'var(--navy)' }}>{g.full_name}</td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>
                      {g.email && <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Mail size={12} />{g.email}</div>}
                      {g.phone && <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Phone size={12} />{g.phone}</div>}
                      {!g.email && !g.phone && '—'}
                    </td>
                    <td>{assignmentCounts[g.id] || 0}</td>
                    <td><StatusBadge status={g.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={t('addGuide')}
        footer={<>
          <button className="btn btn-outline" onClick={() => setModalOpen(false)}>{t('cancel')}</button>
          <button className="btn btn-primary" disabled={saving} onClick={handleSave}>{saving ? t('saving') : t('addGuide')}</button>
        </>}>
        <form onSubmit={handleSave}>
          <Input label={tStaff('fullName')} required value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} />
          <Input label={tStaff('phone')} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          <Input label={tStaff('email')} type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          <p style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginTop: '0.5rem' }}>{t('addGuideHint')}</p>
        </form>
      </Modal>
    </div>
  )
}

export const dynamic = 'force-dynamic'
