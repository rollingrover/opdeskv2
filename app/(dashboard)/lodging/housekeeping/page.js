'use client'
import { useEffect, useState } from 'react'
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

const TASK_TYPES = [
  { value: 'clean', label: 'Full Clean' },
  { value: 'turnover', label: 'Guest Turnover' },
  { value: 'inspection', label: 'Inspection' },
  { value: 'maintenance', label: 'Maintenance Request' },
]
const STATUS_COLUMNS = [
  { value: 'pending', label: 'Pending', color: '#6b7280' },
  { value: 'in_progress', label: 'In Progress', color: 'var(--gold)' },
  { value: 'completed', label: 'Completed', color: 'var(--teal)' },
]

const emptyForm = { room_id: '', assigned_to: '', task_type: 'clean', scheduled_for: '', notes: '' }

export default function HousekeepingPage() {
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
    toast.success('Task added')
    setModalOpen(false); setForm(emptyForm); load()
  }

  async function setStatus(id, status) {
    const payload = { status }
    if (status === 'completed') payload.completed_at = new Date().toISOString()
    const { error } = await supabase.from('housekeeping_tasks').update(payload).eq('id', id)
    if (error) { toast.error(error.message); return }
    load()
  }

  if (needsCompany) return <EmptyState icon={<BrandIcon name="companySetup" size={48} />} title="Set up your company first" />
  if (loading) return <PageLoader />

  return (
    <div>
      <ToastContainer toasts={toast.toasts} remove={toast.remove} />
      <div className="page-header">
        <div>
          <h1 className="page-title">Housekeeping</h1>
          <p className="page-subtitle">{tasks.length} task{tasks.length === 1 ? '' : 's'} · <Link href="/lodging" style={{ color: 'var(--gold)' }}>Room Overview →</Link></p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)} disabled={rooms.length === 0}>
          <Plus size={16} /> New Task
        </button>
      </div>

      {rooms.length === 0 ? (
        <div className="card card-shadow">
          <EmptyState icon={<BrandIcon name="noRooms" size={40} />} title="Add rooms first" description="You need at least one room before scheduling housekeeping tasks." />
        </div>
      ) : tasks.length === 0 ? (
        <div className="card card-shadow">
          <EmptyState icon={<Sparkles size={40} color="var(--gray-400)" />} title="No housekeeping tasks yet"
            description="Track cleaning, turnover, inspection and maintenance tasks per room."
            action={<button className="btn btn-primary btn-sm" onClick={() => setModalOpen(true)}>New Task</button>} />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          {STATUS_COLUMNS.map(col => (
            <div key={col.value}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: col.color }} />
                <span style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--navy)' }}>{col.label}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>({tasks.filter(t => t.status === col.value).length})</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {tasks.filter(t => t.status === col.value).map(t => (
                  <div key={t.id} className="card card-shadow" style={{ padding: '0.875rem' }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '0.875rem', color: 'var(--navy)' }}>{t.rooms?.name || 'Room'}</p>
                    <p style={{ margin: '0.125rem 0 0', fontSize: '0.75rem', color: 'var(--gray-500)', textTransform: 'capitalize' }}>
                      {TASK_TYPES.find(tt => tt.value === t.task_type)?.label || t.task_type}
                      {t.staff?.full_name ? ` · ${t.staff.full_name}` : ''}
                    </p>
                    {t.scheduled_for && (
                      <p style={{ margin: '0.125rem 0 0', fontSize: '0.6875rem', color: 'var(--gray-400)' }}>
                        {new Date(t.scheduled_for).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                    {col.value !== 'completed' && (
                      <button
                        onClick={() => setStatus(t.id, col.value === 'pending' ? 'in_progress' : 'completed')}
                        className="btn btn-outline btn-sm" style={{ marginTop: '0.625rem', width: '100%', justifyContent: 'center' }}>
                        {col.value === 'pending' ? 'Start' : <><Check size={13} /> Mark Complete</>}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Housekeeping Task"
        footer={<>
          <button className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
          <button className="btn btn-primary" disabled={saving} onClick={handleSave}>{saving ? 'Saving…' : 'Create Task'}</button>
        </>}>
        <form onSubmit={handleSave}>
          <Select label="Room" required value={form.room_id} onChange={e => setForm({ ...form, room_id: e.target.value })}>
            <option value="">Select…</option>
            {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </Select>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
            <Select label="Task Type" value={form.task_type} onChange={e => setForm({ ...form, task_type: e.target.value })}>
              {TASK_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </Select>
            <Select label="Assign To" value={form.assigned_to} onChange={e => setForm({ ...form, assigned_to: e.target.value })}>
              <option value="">Unassigned</option>
              {staff.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
            </Select>
            <Input label="Scheduled For" type="datetime-local" value={form.scheduled_for} onChange={e => setForm({ ...form, scheduled_for: e.target.value })} />
          </div>
          <Textarea label="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
        </form>
      </Modal>
    </div>
  )
}

export const dynamic = 'force-dynamic'
