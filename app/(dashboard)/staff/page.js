'use client'
import { BrandIcon } from '@/components/ui/BrandIcon'
import { useEffect, useState } from 'react'
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
    toast.success('Staff member added')
    setModalOpen(false)
    setForm(emptyForm)
    load()
  }

  if (needsCompany) {
    return <EmptyState icon={<BrandIcon name="companySetup" size={48} />} title="Set up your company first" description="Staff records need a company to belong to." />
  }
  if (loading) return <PageLoader />

  const guidesLimit = checkLimit('guides', staff.filter(s => s.staff_type === 'guide').length, { profile, company })

  return (
    <div>
      <ToastContainer toasts={toast.toasts} remove={toast.remove} />
      <LimitBanner resourceKey="guides" limitInfo={guidesLimit} />
      <div className="page-header">
        <div>
          <h1 className="page-title">Staff Members</h1>
          <p className="page-subtitle">{staff.length} staff member{staff.length === 1 ? '' : 's'}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={16} /> Add Staff
        </button>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {['Certifications', 'Cost to Company', 'Shifts', 'Leave'].map((label, i) => {
          const hrefs = ['/staff/certifications', '/staff/costs', '/staff/shifts', '/staff/leave']
          return <Link key={label} href={hrefs[i]} className="btn btn-outline btn-sm">{label}</Link>
        })}
      </div>

      <div className="card card-shadow">
        {staff.length === 0 ? (
          <EmptyState icon={<BrandIcon name="addStaff" size={48} />} title="No staff yet"
            description="Add your team members to start scheduling and tracking them."
            action={<button className="btn btn-primary btn-sm" onClick={() => setModalOpen(true)}>Add Staff</button>} />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Name</th><th>Type</th><th>Contact</th><th>Employment</th><th>Status</th></tr>
              </thead>
              <tbody>
                {staff.map(s => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 600, color: 'var(--navy)' }}>{s.full_name}</td>
                    <td style={{ textTransform: 'capitalize' }}>{s.staff_type?.replace(/_/g, ' ')}</td>
                    <td>
                      {s.email && <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--gray-500)' }}><Mail size={13} />{s.email}</div>}
                      {s.phone && <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--gray-500)' }}><Phone size={13} />{s.phone}</div>}
                    </td>
                    <td style={{ textTransform: 'capitalize' }}>{s.employment_type}</td>
                    <td><StatusBadge status={s.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Staff Member"
        footer={<>
          <button className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
          <button className="btn btn-primary" disabled={saving} onClick={handleSave}>{saving ? 'Saving…' : 'Add Staff'}</button>
        </>}>
        <form onSubmit={handleSave}>
          <Input label="Full Name" required value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
            <Select label="Staff Type" value={form.staff_type} onChange={e => setForm({ ...form, staff_type: e.target.value })}>
              {STAFF_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </Select>
            <Select label="Employment Type" value={form.employment_type} onChange={e => setForm({ ...form, employment_type: e.target.value })}>
              <option value="fulltime">Full-time</option>
              <option value="parttime">Part-time</option>
              <option value="contract">Contract</option>
              <option value="seasonal">Seasonal</option>
            </Select>
            <Input label="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            <Input label="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            <Input label="Start Date" type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} />
            <Select label="Status" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export const dynamic = 'force-dynamic'
