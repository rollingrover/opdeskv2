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
import { CalendarDays, Check, Plus, X } from 'lucide-react'

const emptyForm = { staff_id: '', leave_type: 'annual', start_date: '', end_date: '', notes: '' }

function daysBetween(a, b) {
  if (!a || !b) return null
  const d1 = new Date(a), d2 = new Date(b)
  return Math.round((d2 - d1) / 86400000) + 1
}

export default function LeavePage() {
  const { company, profile, needsCompany } = useAuth()
  const supabase = createClient()
  const toast = useToast()
  const [leave, setLeave] = useState([])
  const [staff, setStaff] = useState([])
  const [addons, setAddons] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  async function load() {
    if (!company) { setLoading(false); return }
    setLoading(true)
    const [l, s, a] = await Promise.all([
      supabase.from('staff_leave').select('*, staff(full_name)').eq('company_id', company.id).order('start_date', { ascending: false }),
      supabase.from('staff').select('id, full_name').eq('company_id', company.id).eq('status', 'active'),
      supabase.from('company_addons').select('addon_key, active').eq('company_id', company.id).eq('active', true),
    ])
    if (l.error) toast.error(l.error.message)
    setLeave(l.data || [])
    setStaff(s.data || [])
    setAddons(a.data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [company])

  const access = hasModuleAccess('leave', { profile, company, companyAddons: addons })

  async function handleSave(e) {
    e.preventDefault()
    if (!company) return
    setSaving(true)
    const days = daysBetween(form.start_date, form.end_date)
    const { error } = await supabase.from('staff_leave').insert([{ ...form, company_id: company.id, days, status: 'pending' }])
    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success('Leave request submitted')
    setModalOpen(false); setForm(emptyForm); load()
  }

  async function setStatus(id, status) {
    const payload = { status }
    if (status === 'approved') { payload.approved_by = profile.id; payload.approved_at = new Date().toISOString() }
    const { error } = await supabase.from('staff_leave').update(payload).eq('id', id)
    if (error) { toast.error(error.message); return }
    toast.success(`Leave ${status}`)
    load()
  }

  async function remove(id) {
    if (!confirm('Delete this leave record?')) return
    const { error } = await supabase.from('staff_leave').delete().eq('id', id)
    if (error) { toast.error(error.message); return }
    load()
  }

  if (needsCompany) return <EmptyState icon={<BrandIcon name="companySetup" size={48} />} title="Set up your company first" />
  if (loading) return <PageLoader />
  if (!access) return <ModuleLocked moduleKey="leave" />

  return (
    <div>
      <ToastContainer toasts={toast.toasts} remove={toast.remove} />
      <div className="page-header">
        <div>
          <h1 className="page-title">Leave</h1>
          <p className="page-subtitle">{leave.length} request{leave.length === 1 ? '' : 's'}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)} disabled={staff.length === 0}>
          <Plus size={16} /> Request Leave
        </button>
      </div>

      <div className="card card-shadow">
        {staff.length === 0 ? (
          <EmptyState icon={<BrandIcon name="addStaff" size={48} />} title="Add staff first" description="You need at least one active staff member before requesting leave." />
        ) : leave.length === 0 ? (
          <EmptyState icon={<CalendarDays size={40} color="var(--gray-400)" />} title="No leave requests yet"
            description="Track annual, sick and unpaid leave with an approval workflow."
            action={<button className="btn btn-primary btn-sm" onClick={() => setModalOpen(true)}>Request Leave</button>} />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Staff</th><th>Type</th><th>Dates</th><th>Days</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {leave.map(l => (
                  <tr key={l.id}>
                    <td style={{ fontWeight: 600, color: 'var(--navy)' }}>{l.staff?.full_name || '—'}</td>
                    <td style={{ textTransform: 'capitalize' }}>{l.leave_type}</td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>
                      {new Date(l.start_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })} – {new Date(l.end_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}
                    </td>
                    <td>{l.days}</td>
                    <td><StatusBadge status={l.status} /></td>
                    <td style={{ display: 'flex', gap: '0.5rem' }}>
                      {l.status === 'pending' && (
                        <>
                          <button onClick={() => setStatus(l.id, 'approved')} title="Approve" style={{ color: '#22c55e', background: 'none', border: 'none', cursor: 'pointer' }}><Check size={16} /></button>
                          <button onClick={() => setStatus(l.id, 'declined')} title="Decline" style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><X size={16} /></button>
                        </>
                      )}
                      <button onClick={() => remove(l.id)} style={{ color: 'var(--gray-400)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem' }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Request Leave"
        footer={<>
          <button className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
          <button className="btn btn-primary" disabled={saving} onClick={handleSave}>{saving ? 'Submitting…' : 'Submit Request'}</button>
        </>}>
        <form onSubmit={handleSave}>
          <Select label="Staff Member" required value={form.staff_id} onChange={e => setForm({ ...form, staff_id: e.target.value })}>
            <option value="">Select…</option>
            {staff.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
          </Select>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0 1rem' }}>
            <Select label="Leave Type" value={form.leave_type} onChange={e => setForm({ ...form, leave_type: e.target.value })}>
              <option value="annual">Annual</option>
              <option value="sick">Sick</option>
              <option value="unpaid">Unpaid</option>
              <option value="family">Family Responsibility</option>
            </Select>
            <Input label="Start Date" type="date" required value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} />
            <Input label="End Date" type="date" required value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} />
          </div>
          {form.start_date && form.end_date && (
            <p style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', margin: '-0.5rem 0 0.75rem' }}>
              {daysBetween(form.start_date, form.end_date)} day{daysBetween(form.start_date, form.end_date) === 1 ? '' : 's'}
            </p>
          )}
          <Textarea label="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
        </form>
      </Modal>
    </div>
  )
}

export const dynamic = 'force-dynamic'
