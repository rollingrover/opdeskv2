'use client'
import { BrandIcon } from '@/components/ui/BrandIcon'
import { useEffect, useState } from 'react'
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
  const [weekOffset, setWeekOffset] = useState(0)

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
    toast.success('Shift scheduled')
    setModalOpen(false); setForm(emptyForm); load()
  }

  async function remove(id) {
    if (!confirm('Remove this shift?')) return
    const { error } = await supabase.from('shifts').delete().eq('id', id)
    if (error) { toast.error(error.message); return }
    toast.success('Shift removed')
    load()
  }

  if (needsCompany) return <EmptyState icon={<BrandIcon name="companySetup" size={48} />} title="Set up your company first" />
  if (loading) return <PageLoader />
  if (!access) return <ModuleLocked moduleKey="shifts" />

  return (
    <div>
      <ToastContainer toasts={toast.toasts} remove={toast.remove} />
      <div className="page-header">
        <div>
          <h1 className="page-title">Shifts</h1>
          <p className="page-subtitle">{shifts.length} shift{shifts.length === 1 ? '' : 's'} scheduled</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)} disabled={staff.length === 0}>
          <Plus size={16} /> Schedule Shift
        </button>
      </div>

      <div className="card card-shadow">
        {staff.length === 0 ? (
          <EmptyState icon={<BrandIcon name="addStaff" size={48} />} title="Add staff first" description="You need at least one active staff member before scheduling shifts." />
        ) : shifts.length === 0 ? (
          <EmptyState icon={<Clock size={40} color="var(--gray-400)" />} title="No shifts scheduled"
            description="Roster your guides, drivers and support staff."
            action={<button className="btn btn-primary btn-sm" onClick={() => setModalOpen(true)}>Schedule Shift</button>} />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Date</th><th>Staff</th><th>Time</th><th>Type</th><th>Role</th><th>Status</th></tr></thead>
              <tbody>
                {shifts.map(s => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 600, color: 'var(--navy)' }}>{s.shift_date ? new Date(s.shift_date).toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short' }) : '—'}</td>
                    <td>{s.staff?.full_name || '—'}</td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>
                      {s.start_time ? s.start_time.slice(0, 5) : '—'}{s.end_time ? ` – ${s.end_time.slice(0, 5)}` : ''}
                    </td>
                    <td style={{ textTransform: 'capitalize' }}>{s.shift_type?.replace(/_/g, ' ')}</td>
                    <td>{s.role || '—'}</td>
                    <td><StatusBadge status={s.status} /></td>
                    <td>
                      <button onClick={() => remove(s.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600 }}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Schedule Shift"
        footer={<>
          <button className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
          <button className="btn btn-primary" disabled={saving} onClick={handleSave}>{saving ? 'Saving…' : 'Schedule Shift'}</button>
        </>}>
        <form onSubmit={handleSave}>
          <Select label="Staff Member" required value={form.staff_id} onChange={e => setForm({ ...form, staff_id: e.target.value })}>
            <option value="">Select…</option>
            {staff.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
          </Select>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
            <Input label="Date" type="date" required value={form.shift_date} onChange={e => setForm({ ...form, shift_date: e.target.value })} />
            <Select label="Shift Type" value={form.shift_type} onChange={e => setForm({ ...form, shift_type: e.target.value })}>
              <option value="full_day">Full Day</option>
              <option value="morning">Morning</option>
              <option value="afternoon">Afternoon</option>
              <option value="night">Night</option>
            </Select>
            <Input label="Start Time" type="time" value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })} />
            <Input label="End Time" type="time" value={form.end_time} onChange={e => setForm({ ...form, end_time: e.target.value })} />
            <Input label="Role" placeholder="e.g. Guide, Driver" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} />
            <Select label="Status" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              <option value="scheduled">Scheduled</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </Select>
          </div>
          <Textarea label="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
        </form>
      </Modal>
    </div>
  )
}

export const dynamic = 'force-dynamic'
