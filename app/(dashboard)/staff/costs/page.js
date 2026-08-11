'use client'
import { BrandIcon } from '@/components/ui/BrandIcon'
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { PageLoader } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { ModuleLocked } from '@/components/ui/ModuleLocked'
import { Modal } from '@/components/ui/Modal'
import { Input, Select } from '@/components/ui/FormField'
import { useToast, ToastContainer } from '@/components/ui/Toast'
import { hasModuleAccess } from '@/lib/moduleAccess'
import { DollarSign, Plus } from 'lucide-react'

const emptyForm = {
  staff_id: '', effective_from: '', basic_salary: 0, housing_allowance: 0,
  transport_allowance: 0, meal_allowance: 0, other_allowances: 0,
  uif_employee: 0, paye: 0, medical_aid_employee: 0, other_deductions: 0,
  uif_employer: 0, medical_aid_employer: 0, notes: '',
}

export default function CostToCompanyPage() {
  const { company, profile, needsCompany } = useAuth()
  const supabase = createClient()
  const toast = useToast()
  const [costs, setCosts] = useState([])
  const [staff, setStaff] = useState([])
  const [addons, setAddons] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  async function load() {
    if (!company) { setLoading(false); return }
    setLoading(true)
    const [c, s, a] = await Promise.all([
      supabase.from('staff_cost').select('*, staff(full_name)').eq('company_id', company.id).order('effective_from', { ascending: false }),
      supabase.from('staff').select('id, full_name').eq('company_id', company.id).eq('status', 'active'),
      supabase.from('company_addons').select('addon_key, active').eq('company_id', company.id).eq('active', true),
    ])
    if (c.error) toast.error(c.error.message)
    setCosts(c.data || [])
    setStaff(s.data || [])
    setAddons(a.data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [company])

  const access = hasModuleAccess('costs', { profile, company, companyAddons: addons })

  async function handleSave(e) {
    e.preventDefault()
    if (!company) return
    setSaving(true)
    // gross_salary / total_deductions / net_take_home / cost_to_company are
    // generated columns in this table — Postgres computes them, we never
    // write to them directly.
    const payload = { ...form, company_id: company.id, currency: company.currency }
    ;['basic_salary','housing_allowance','transport_allowance','meal_allowance','other_allowances',
      'uif_employee','paye','medical_aid_employee','other_deductions','uif_employer','medical_aid_employer']
      .forEach(k => { payload[k] = Number(payload[k]) || 0 })
    const { error } = await supabase.from('staff_cost').insert([payload])
    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success('Cost record added')
    setModalOpen(false); setForm(emptyForm); load()
  }

  async function remove(id) {
    if (!confirm('Delete this cost record?')) return
    const { error } = await supabase.from('staff_cost').delete().eq('id', id)
    if (error) { toast.error(error.message); return }
    toast.success('Deleted')
    load()
  }

  if (needsCompany) return <EmptyState icon={<BrandIcon name="companySetup" size={48} />} title="Set up your company first" />
  if (loading) return <PageLoader />
  if (!access) return <ModuleLocked moduleKey="costs" />

  const totalCTC = costs.reduce((sum, c) => sum + (Number(c.cost_to_company) || 0), 0)

  return (
    <div>
      <ToastContainer toasts={toast.toasts} remove={toast.remove} />
      <div className="page-header">
        <div>
          <h1 className="page-title">Cost to Company</h1>
          <p className="page-subtitle">
            {costs.length} record{costs.length === 1 ? '' : 's'} · {company.currency} {totalCTC.toLocaleString()}/mo total CTC
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)} disabled={staff.length === 0}>
          <Plus size={16} /> Add Cost Record
        </button>
      </div>

      <div className="card card-shadow">
        {staff.length === 0 ? (
          <EmptyState icon={<BrandIcon name="addStaff" size={48} />} title="Add staff first" description="You need at least one active staff member before adding payroll records." />
        ) : costs.length === 0 ? (
          <EmptyState icon={<DollarSign size={40} color="var(--gray-400)" />} title="No cost records yet"
            description="Track basic salary, allowances, deductions and true cost-to-company per staff member."
            action={<button className="btn btn-primary btn-sm" onClick={() => setModalOpen(true)}>Add Cost Record</button>} />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Staff</th><th>Effective From</th><th>Basic Salary</th><th>Gross</th><th>Net Take-Home</th><th>Cost to Company</th></tr></thead>
              <tbody>
                {costs.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600, color: 'var(--navy)' }}>{c.staff?.full_name || '—'}</td>
                    <td>{c.effective_from ? new Date(c.effective_from).toLocaleDateString('en-ZA') : '—'}</td>
                    <td>{c.currency} {Number(c.basic_salary).toLocaleString()}</td>
                    <td>{c.currency} {Number(c.gross_salary).toLocaleString()}</td>
                    <td style={{ color: 'var(--teal)', fontWeight: 600 }}>{c.currency} {Number(c.net_take_home).toLocaleString()}</td>
                    <td style={{ color: 'var(--gold)', fontWeight: 700 }}>{c.currency} {Number(c.cost_to_company).toLocaleString()}</td>
                    <td>
                      <button onClick={() => remove(c.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600 }}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Cost Record" size="lg"
        footer={<>
          <button className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
          <button className="btn btn-primary" disabled={saving} onClick={handleSave}>{saving ? 'Saving…' : 'Add Record'}</button>
        </>}>
        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
            <Select label="Staff Member" required value={form.staff_id} onChange={e => setForm({ ...form, staff_id: e.target.value })}>
              <option value="">Select…</option>
              {staff.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
            </Select>
            <Input label="Effective From" type="date" required value={form.effective_from} onChange={e => setForm({ ...form, effective_from: e.target.value })} />
          </div>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', margin: '0.75rem 0 0.375rem' }}>Earnings ({company.currency})</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0 1rem' }}>
            <Input label="Basic Salary" type="number" step="0.01" value={form.basic_salary} onChange={e => setForm({ ...form, basic_salary: e.target.value })} />
            <Input label="Housing Allowance" type="number" step="0.01" value={form.housing_allowance} onChange={e => setForm({ ...form, housing_allowance: e.target.value })} />
            <Input label="Transport Allowance" type="number" step="0.01" value={form.transport_allowance} onChange={e => setForm({ ...form, transport_allowance: e.target.value })} />
            <Input label="Meal Allowance" type="number" step="0.01" value={form.meal_allowance} onChange={e => setForm({ ...form, meal_allowance: e.target.value })} />
            <Input label="Other Allowances" type="number" step="0.01" value={form.other_allowances} onChange={e => setForm({ ...form, other_allowances: e.target.value })} />
          </div>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', margin: '0.75rem 0 0.375rem' }}>Employee Deductions</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0 1rem' }}>
            <Input label="UIF" type="number" step="0.01" value={form.uif_employee} onChange={e => setForm({ ...form, uif_employee: e.target.value })} />
            <Input label="PAYE" type="number" step="0.01" value={form.paye} onChange={e => setForm({ ...form, paye: e.target.value })} />
            <Input label="Medical Aid" type="number" step="0.01" value={form.medical_aid_employee} onChange={e => setForm({ ...form, medical_aid_employee: e.target.value })} />
            <Input label="Other Deductions" type="number" step="0.01" value={form.other_deductions} onChange={e => setForm({ ...form, other_deductions: e.target.value })} />
          </div>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', margin: '0.75rem 0 0.375rem' }}>Employer Contributions</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
            <Input label="UIF (Employer)" type="number" step="0.01" value={form.uif_employer} onChange={e => setForm({ ...form, uif_employer: e.target.value })} />
            <Input label="Medical Aid (Employer)" type="number" step="0.01" value={form.medical_aid_employer} onChange={e => setForm({ ...form, medical_aid_employer: e.target.value })} />
          </div>
        </form>
      </Modal>
    </div>
  )
}

export const dynamic = 'force-dynamic'
