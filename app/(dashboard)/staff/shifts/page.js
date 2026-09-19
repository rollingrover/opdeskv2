'use client'
import { BrandIcon } from '@/components/ui/BrandIcon'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { PageLoader } from '@/components/ui/Spinner'
import { StatusBadge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { ModuleLocked } from '@/components/ui/ModuleLocked'
import { Modal } from '@/components/ui/Modal'
import { Input, Select, Textarea } from '@/components/ui/FormField'
import { useToast, ToastContainer } from '@/components/ui/Toast'
import { hasModuleAccess } from '@/lib/moduleAccess'
import { Clock, Plus } from 'lucide-react'

const emptyForm = { staff_id: '', shift_date: '', start_time: '', end_time: '', shift_type: 'full_day', role: '', status: 'scheduled', notes: '' }

export default function ShiftsPage() {
  const t = useTranslations('Shifts')
  const tCommon = useTranslations('Common')
  const tStaff = useTranslations('Staff')
  const tStatus = useTranslations('StatusBadge')
  const { company, profile, needsCompany } = useAuth()
  const supabase = createClient()
  const toast = useToast()
  const [shifts, setShifts] = useState([])
  const [staff, setStaff] = useState([])
  const [addons, setAddons] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  async function load() {
    if (!company) { setLoading(false); return }
    setLoading(true)
    const [sh, s, a] = await Promise.all([
      supabase.from('shifts').select('*, staff(full_name)').eq('company_id', company.id).order('shift_date', { ascending: false }).limit(100),
      supabase.from('staff').select('id, full_name').eq('company_id', company.id).eq('status', 'active'),
      supabase.from('company_addons').select('addon_key, active').eq('company_id', company.id).eq('active', true),
    ])
    if (sh.error) toast.error(sh.error.message)
    setShifts(sh.data || [])
    setStaff(s.data || [])
    setAddons(a.data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [company])

  const access = hasModuleAccess('shifts', { profile, company, companyAddons: addons })

  async function handleSave(e) {
    e.preventDefault()
    if (!company) return
    setSaving(true)
    const { error } = await supabase.from('shifts').insert([{
      ...form, company_id: company.id,
      start_time: form.start_time || null, end_time: form.end_time || null,
    }])
    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success(t('shiftScheduled'))
    setModalOpen(false); setForm(emptyForm); load()
  }

  async function remove(id) {
    if (!confirm(t('confirmRemove'))) return
    const { error } = await supabase.from('shifts').delete().eq('id', id)
    if (error) { toast.error(error.message); return }
    toast.success(t('shiftRemoved'))
    load()
  }

  if (needsCompany) return <EmptyState icon={<BrandIcon name="companySetup" size={48} />} title={tCommon('needsCompanyTitle')} />
  if (loading) return <PageLoader />
  if (!access) return <ModuleLocked moduleKey="shifts" />

  const shiftTypeLabel = (val) => ({ full_day: t('types.full_day'), morning: t('types.morning'), afternoon: t('types.afternoon'), night: t('types.night') }[val] || val)

  return (
    <div>
      <ToastContainer toasts={toast.toasts} remove={toast.remove} />
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('title')}</h1>
          <p className="page-subtitle">{shifts.length} {t('shiftsScheduledSuffix')}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)} disabled={staff.length === 0}>
          <Plus size={16} /> {t('scheduleShift')}
        </button>
      </div>

      <div className="card card-shadow">
        {staff.length === 0 ? (
          <EmptyState icon={<BrandIcon name="addStaff" size={48} />} title={t('addStaffFirstTitle')} description={t('addStaffFirstDesc')} />
        ) : shifts.length === 0 ? (
          <EmptyState icon={<Clock size={40} color="var(--gray-400)" />} title={t('noShiftsTitle')}
            description={t('noShiftsDesc')}
            action={<button className="btn btn-primary btn-sm" onClick={() => setModalOpen(true)}>{t('scheduleShift')}</button>} />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>{t('colDate')}</th><th>{t('colStaff')}</th><th>{t('colTime')}</th><th>{t('colType')}</th><th>{t('colRole')}</th><th>{t('colStatus')}</th></tr></thead>
              <tbody>
                {shifts.map(s => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 600, color: 'var(--navy)' }}>{s.shift_date ? new Date(s.shift_date).toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short' }) : '—'}</td>
                    <td>{s.staff?.full_name || '—'}</td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>
                      {s.start_time ? s.start_time.slice(0, 5) : '—'}{s.end_time ? ` – ${s.end_time.slice(0, 5)}` : ''}
                    </td>
                    <td>{shiftTypeLabel(s.shift_type)}</td>
                    <td>{s.role || '—'}</td>
                    <td><StatusBadge status={s.status} /></td>
                    <td>
                      <button onClick={() => remove(s.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600 }}>
                        {t('remove')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={t('scheduleShift')}
        footer={<>
          <button className="btn btn-outline" onClick={() => setModalOpen(false)}>{tStaff('cancel')}</button>
          <button className="btn btn-primary" disabled={saving} onClick={handleSave}>{saving ? tStaff('saving') : t('scheduleShift')}</button>
        </>}>
        <form onSubmit={handleSave}>
          <Select label={tStaff('staffMember')} required value={form.staff_id} onChange={e => setForm({ ...form, staff_id: e.target.value })}>
            <option value="">{tStaff('select')}</option>
            {staff.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
          </Select>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
            <Input label={t('date')} type="date" required value={form.shift_date} onChange={e => setForm({ ...form, shift_date: e.target.value })} />
            <Select label={t('shiftType')} value={form.shift_type} onChange={e => setForm({ ...form, shift_type: e.target.value })}>
              <option value="full_day">{t('types.full_day')}</option>
              <option value="morning">{t('types.morning')}</option>
              <option value="afternoon">{t('types.afternoon')}</option>
              <option value="night">{t('types.night')}</option>
            </Select>
            <Input label={t('startTime')} type="time" value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })} />
            <Input label={t('endTime')} type="time" value={form.end_time} onChange={e => setForm({ ...form, end_time: e.target.value })} />
            <Input label={t('role')} placeholder={t('rolePlaceholder')} value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} />
            <Select label={tStaff('status')} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              <option value="scheduled">{tStatus('scheduled')}</option>
              <option value="confirmed">{tStatus('confirmed')}</option>
              <option value="completed">{tStatus('completed')}</option>
              <option value="cancelled">{tStatus('cancelled')}</option>
            </Select>
          </div>
          <Textarea label={tStaff('notes')} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
        </form>
      </Modal>
    </div>
  )
}

export const dynamic = 'force-dynamic'
