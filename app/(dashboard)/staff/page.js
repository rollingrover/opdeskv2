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
import { Input, Select } from '@/components/ui/FormField'
import { useToast, ToastContainer } from '@/components/ui/Toast'
import { LimitBanner } from '@/components/ui/LimitBanner'
import { checkLimit } from '@/lib/limits'
import { STAFF_TYPES } from '@/lib/constants'
import { Plus, Mail, Phone } from 'lucide-react'
import Link from 'next/link'

const emptyForm = {
  full_name: '', staff_type: 'guide', employment_type: 'fulltime',
  status: 'active', phone: '', email: '', start_date: '',
}

export default function StaffPage() {
  const t = useTranslations('Staff')
  const tSidebar = useTranslations('Sidebar')
  const tStatus = useTranslations('StatusBadge')
  const tCommon = useTranslations('Common')
  const { company, profile, needsCompany } = useAuth()
  const supabase = createClient()
  const toast = useToast()
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  async function load() {
    if (!company) { setLoading(false); return }
    setLoading(true)
    const { data, error } = await supabase
      .from('staff').select('*').eq('company_id', company.id).order('full_name')
    if (error) toast.error(error.message)
    setStaff(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [company])

  async function handleSave(e) {
    e.preventDefault()
    if (!company) return
    setSaving(true)
    const { error } = await supabase.from('staff').insert([{ ...form, company_id: company.id, start_date: form.start_date || null }])
    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success(t('staffAdded'))
    setModalOpen(false)
    setForm(emptyForm)
    load()
  }

  if (needsCompany) {
    return <EmptyState icon={<BrandIcon name="companySetup" size={48} />} title={tCommon('needsCompanyTitle')} description={t('needsCompanyDesc')} />
  }
  if (loading) return <PageLoader />

  const guidesLimit = checkLimit('guides', staff.filter(s => s.staff_type === 'guide').length, { profile, company })
  const staffTypeLabel = (val) => STAFF_TYPES.some(x => x.value === val) ? t(`types.${val}`) : val

  return (
    <div>
      <ToastContainer toasts={toast.toasts} remove={toast.remove} />
      <LimitBanner resourceKey="guides" limitInfo={guidesLimit} />
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('title')}</h1>
          <p className="page-subtitle">{staff.length} {staff.length === 1 ? t('staffMemberSingular') : t('staffMemberPlural')}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={16} /> {t('addStaff')}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {[
          { href: '/staff/certifications', key: 'certifications' },
          { href: '/staff/costs', key: 'costToCompany' },
          { href: '/staff/shifts', key: 'shifts' },
          { href: '/staff/leave', key: 'leave' },
        ].map(item => (
          <Link key={item.href} href={item.href} className="btn btn-outline btn-sm">
            {tSidebar(`items.${item.key}`)}
          </Link>
        ))}
      </div>

      <div className="card card-shadow">
        {staff.length === 0 ? (
          <EmptyState icon={<BrandIcon name="addStaff" size={48} />} title={t('noStaffTitle')}
            description={t('noStaffDesc')}
            action={<button className="btn btn-primary btn-sm" onClick={() => setModalOpen(true)}>{t('addStaff')}</button>} />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>{t('colName')}</th><th>{t('colType')}</th><th>{t('colContact')}</th><th>{t('colEmployment')}</th><th>{t('colStatus')}</th></tr>
              </thead>
              <tbody>
                {staff.map(s => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 600, color: 'var(--navy)' }}>{s.full_name}</td>
                    <td>{staffTypeLabel(s.staff_type)}</td>
                    <td>
                      {s.email && <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--gray-500)' }}><Mail size={13} />{s.email}</div>}
                      {s.phone && <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--gray-500)' }}><Phone size={13} />{s.phone}</div>}
                    </td>
                    <td>{{fulltime:t('employmentFulltime'),parttime:t('employmentParttime'),contract:t('employmentContract'),seasonal:t('employmentSeasonal')}[s.employment_type] || s.employment_type}</td>
                    <td><StatusBadge status={s.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={t('addStaffMember')}
        footer={<>
          <button className="btn btn-outline" onClick={() => setModalOpen(false)}>{t('cancel')}</button>
          <button className="btn btn-primary" disabled={saving} onClick={handleSave}>{saving ? t('saving') : t('addStaff')}</button>
        </>}>
        <form onSubmit={handleSave}>
          <Input label={t('fullName')} required value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
            <Select label={t('staffType')} value={form.staff_type} onChange={e => setForm({ ...form, staff_type: e.target.value })}>
              {STAFF_TYPES.map(x => <option key={x.value} value={x.value}>{t(`types.${x.value}`)}</option>)}
            </Select>
            <Select label={t('employmentType')} value={form.employment_type} onChange={e => setForm({ ...form, employment_type: e.target.value })}>
              <option value="fulltime">{t('employmentFulltime')}</option>
              <option value="parttime">{t('employmentParttime')}</option>
              <option value="contract">{t('employmentContract')}</option>
              <option value="seasonal">{t('employmentSeasonal')}</option>
            </Select>
            <Input label={t('phone')} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            <Input label={t('email')} type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            <Input label={t('startDate')} type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} />
            <Select label={t('status')} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              <option value="active">{tStatus('active')}</option>
              <option value="inactive">{tStatus('inactive')}</option>
            </Select>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export const dynamic = 'force-dynamic'
