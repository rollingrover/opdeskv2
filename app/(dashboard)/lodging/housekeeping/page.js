'use client'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { PageLoader } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { Modal } from '@/components/ui/Modal'
import { Input, Select, Textarea } from '@/components/ui/FormField'
import { useToast, ToastContainer } from '@/components/ui/Toast'
import { BrandIcon } from '@/components/ui/BrandIcon'
import { Check, Plus, Sparkles } from 'lucide-react'
import Link from 'next/link'

const TASK_TYPE_VALUES = ['clean', 'turnover', 'inspection', 'maintenance']
const STATUS_VALUES = [
  { value: 'pending', color: '#6b7280' },
  { value: 'in_progress', color: 'var(--gold)' },
  { value: 'completed', color: 'var(--teal)' },
]

const emptyForm = { room_id: '', assigned_to: '', task_type: 'clean', scheduled_for: '', notes: '' }

export default function HousekeepingPage() {
  const t = useTranslations('Housekeeping')
  const tCommon = useTranslations('Common')
  const tSidebar = useTranslations('Sidebar')
  const tStaff = useTranslations('Staff')
  const { company, needsCompany } = useAuth()
  const supabase = createClient()
  const toast = useToast()
  const [tasks, setTasks] = useState([])
  const [rooms, setRooms] = useState([])
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  async function load() {
    if (!company) { setLoading(false); return }
    setLoading(true)
    const [t, r, s] = await Promise.all([
      supabase.from('housekeeping_tasks').select('*, rooms(name), staff(full_name)').eq('company_id', company.id).order('scheduled_for', { ascending: true, nullsFirst: false }),
      supabase.from('rooms').select('id, name').eq('company_id', company.id).order('name'),
      supabase.from('staff').select('id, full_name').eq('company_id', company.id).eq('status', 'active'),
    ])
    if (t.error) toast.error(t.error.message)
    setTasks(t.data || [])
    setRooms(r.data || [])
    setStaff(s.data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [company])

  async function handleSave(e) {
    e.preventDefault()
    if (!company) return
    setSaving(true)
    const { error } = await supabase.from('housekeeping_tasks').insert([{
      ...form, company_id: company.id,
      assigned_to: form.assigned_to || null,
      scheduled_for: form.scheduled_for ? new Date(form.scheduled_for).toISOString() : null,
    }])
    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success(t('taskAdded'))
    setModalOpen(false); setForm(emptyForm); load()
  }

  async function setStatus(id, status) {
    const payload = { status }
    if (status === 'completed') payload.completed_at = new Date().toISOString()
    const { error } = await supabase.from('housekeeping_tasks').update(payload).eq('id', id)
    if (error) { toast.error(error.message); return }
    load()
  }

  if (needsCompany) return <EmptyState icon={<BrandIcon name="companySetup" size={48} />} title={tCommon('needsCompanyTitle')} />
  if (loading) return <PageLoader />

  return (
    <div>
      <ToastContainer toasts={toast.toasts} remove={toast.remove} />
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('title')}</h1>
          <p className="page-subtitle">{tasks.length} {tasks.length === 1 ? t('taskSingular') : t('taskPlural')} · <Link href="/lodging" style={{ color: 'var(--gold)' }}>{tSidebar('items.roomOverview')} →</Link></p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)} disabled={rooms.length === 0}>
          <Plus size={16} /> {t('newTask')}
        </button>
      </div>

      {rooms.length === 0 ? (
        <div className="card card-shadow">
          <EmptyState icon={<BrandIcon name="noRooms" size={40} />} title={t('addRoomsFirstTitle')} description={t('addRoomsFirstDesc')} />
        </div>
      ) : tasks.length === 0 ? (
        <div className="card card-shadow">
          <EmptyState icon={<Sparkles size={40} color="var(--gray-400)" />} title={t('noTasksTitle')}
            description={t('noTasksDesc')}
            action={<button className="btn btn-primary btn-sm" onClick={() => setModalOpen(true)}>{t('newTask')}</button>} />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          {STATUS_VALUES.map(col => (
            <div key={col.value}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: col.color }} />
                <span style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--navy)' }}>{t(`statuses.${col.value}`)}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>({tasks.filter(x => x.status === col.value).length})</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {tasks.filter(x => x.status === col.value).map(x => (
                  <div key={x.id} className="card card-shadow" style={{ padding: '0.875rem' }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '0.875rem', color: 'var(--navy)' }}>{x.rooms?.name || t('room')}</p>
                    <p style={{ margin: '0.125rem 0 0', fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                      {t(`taskTypes.${x.task_type}`)}
                      {x.staff?.full_name ? ` · ${x.staff.full_name}` : ''}
                    </p>
                    {x.scheduled_for && (
                      <p style={{ margin: '0.125rem 0 0', fontSize: '0.6875rem', color: 'var(--gray-400)' }}>
                        {new Date(x.scheduled_for).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                    {col.value !== 'completed' && (
                      <button
                        onClick={() => setStatus(x.id, col.value === 'pending' ? 'in_progress' : 'completed')}
                        className="btn btn-outline btn-sm" style={{ marginTop: '0.625rem', width: '100%', justifyContent: 'center' }}>
                        {col.value === 'pending' ? t('start') : <><Check size={13} /> {t('markComplete')}</>}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={t('newTask')}
        footer={<>
          <button className="btn btn-outline" onClick={() => setModalOpen(false)}>{tStaff('cancel')}</button>
          <button className="btn btn-primary" disabled={saving} onClick={handleSave}>{saving ? tStaff('saving') : t('createTask')}</button>
        </>}>
        <form onSubmit={handleSave}>
          <Select label={t('room')} required value={form.room_id} onChange={e => setForm({ ...form, room_id: e.target.value })}>
            <option value="">{tStaff('select')}</option>
            {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </Select>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
            <Select label={t('taskType')} value={form.task_type} onChange={e => setForm({ ...form, task_type: e.target.value })}>
              {TASK_TYPE_VALUES.map(v => <option key={v} value={v}>{t(`taskTypes.${v}`)}</option>)}
            </Select>
            <Select label={t('assignTo')} value={form.assigned_to} onChange={e => setForm({ ...form, assigned_to: e.target.value })}>
              <option value="">{t('unassigned')}</option>
              {staff.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
            </Select>
            <Input label={t('scheduledFor')} type="datetime-local" value={form.scheduled_for} onChange={e => setForm({ ...form, scheduled_for: e.target.value })} />
          </div>
          <Textarea label={tStaff('notes')} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
        </form>
      </Modal>
    </div>
  )
}

export const dynamic = 'force-dynamic'
