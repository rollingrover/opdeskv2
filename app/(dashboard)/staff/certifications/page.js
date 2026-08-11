'use client'
import { BrandIcon } from '@/components/ui/BrandIcon'
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { PageLoader } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { ModuleLocked } from '@/components/ui/ModuleLocked'
import { Modal } from '@/components/ui/Modal'
import { Input, Select, Textarea } from '@/components/ui/FormField'
import { useToast, ToastContainer } from '@/components/ui/Toast'
import { hasModuleAccess } from '@/lib/moduleAccess'
import { AlertTriangle, Award, Plus } from 'lucide-react'

const CERT_TYPES = ['FGASA', 'PDP', 'Skippers Ticket', 'First Aid', 'Firearm Competency', 'Trail Guide Licence', 'Other']
const emptyForm = { staff_id: '', cert_type: '', cert_number: '', issuing_body: '', issue_date: '', expiry_date: '', notes: '' }

export default function CertificationsPage() {
  const { company, profile, needsCompany } = useAuth()
  const supabase = createClient()
  const toast = useToast()
  const [certs, setCerts] = useState([])
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
      supabase.from('staff_certifications').select('*, staff(full_name)').eq('company_id', company.id).order('expiry_date'),
      supabase.from('staff').select('id, full_name').eq('company_id', company.id).eq('status', 'active'),
      supabase.from('company_addons').select('addon_key, active').eq('company_id', company.id).eq('active', true),
    ])
    if (c.error) toast.error(c.error.message)
    setCerts(c.data || [])
    setStaff(s.data || [])
    setAddons(a.data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [company])

  const access = hasModuleAccess('certifications', { profile, company, companyAddons: addons })

  async function handleSave(e) {
    e.preventDefault()
    if (!company) return
    setSaving(true)
    const { error } = await supabase.from('staff_certifications').insert([{
      ...form, company_id: company.id,
      issue_date: form.issue_date || null, expiry_date: form.expiry_date || null,
    }])
    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success('Certification added')
    setModalOpen(false); setForm(emptyForm); load()
  }

  async function remove(id) {
    if (!confirm('Delete this certification record?')) return
    const { error } = await supabase.from('staff_certifications').delete().eq('id', id)
    if (error) { toast.error(error.message); return }
    toast.success('Deleted')
    load()
  }

  if (needsCompany) return <EmptyState icon={<BrandIcon name="companySetup" size={48} />} title="Set up your company first" />
  if (loading) return <PageLoader />
  if (!access) return <ModuleLocked moduleKey="certifications" />

  const today = new Date()
  const in30 = new Date(); in30.setDate(in30.getDate() + 30)

  function expiryStatus(dateStr) {
    if (!dateStr) return null
    const d = new Date(dateStr)
    if (d < today) return { label: 'Expired', color: '#ef4444' }
    if (d < in30) return { label: 'Expiring soon', color: '#f59e0b' }
    return { label: 'Valid', color: '#22c55e' }
  }

  return (
    <div>
      <ToastContainer toasts={toast.toasts} remove={toast.remove} />
      <div className="page-header">
        <div>
          <h1 className="page-title">Certifications</h1>
          <p className="page-subtitle">{certs.length} record{certs.length === 1 ? '' : 's'}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)} disabled={staff.length === 0}>
          <Plus size={16} /> Add Certification
        </button>
      </div>

      <div className="card card-shadow">
        {staff.length === 0 ? (
          <EmptyState icon={<BrandIcon name="addStaff" size={48} />} title="Add staff first" description="You need at least one active staff member before adding a certification." />
        ) : certs.length === 0 ? (
          <EmptyState icon={<Award size={40} color="var(--gray-400)" />} title="No certifications yet"
            description="Track FGASA, PDP, skippers tickets, first aid and other qualifications with expiry alerts."
            action={<button className="btn btn-primary btn-sm" onClick={() => setModalOpen(true)}>Add Certification</button>} />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Staff</th><th>Type</th><th>Cert #</th><th>Issuing Body</th><th>Expiry</th><th>Status</th></tr></thead>
              <tbody>
                {certs.map(c => {
                  const st = expiryStatus(c.expiry_date)
                  return (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 600, color: 'var(--navy)' }}>{c.staff?.full_name || '—'}</td>
                      <td>{c.cert_type}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.8125rem' }}>{c.cert_number || '—'}</td>
                      <td>{c.issuing_body || '—'}</td>
                      <td>{c.expiry_date ? new Date(c.expiry_date).toLocaleDateString('en-ZA') : '—'}</td>
                      <td>
                        {st && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: st.color, fontSize: '0.75rem', fontWeight: 700 }}>
                            {st.label === 'Expired' && <AlertTriangle size={12} />} {st.label}
                          </span>
                        )}
                      </td>
                      <td>
                        <button onClick={() => remove(c.id)} style={{ color: 'var(--red, #ef4444)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600 }}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Certification"
        footer={<>
          <button className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
          <button className="btn btn-primary" disabled={saving} onClick={handleSave}>{saving ? 'Saving…' : 'Add Certification'}</button>
        </>}>
        <form onSubmit={handleSave}>
          <Select label="Staff Member" required value={form.staff_id} onChange={e => setForm({ ...form, staff_id: e.target.value })}>
            <option value="">Select…</option>
            {staff.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
          </Select>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
            <Select label="Certification Type" required value={form.cert_type} onChange={e => setForm({ ...form, cert_type: e.target.value })}>
              <option value="">Select…</option>
              {CERT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </Select>
            <Input label="Certificate Number" value={form.cert_number} onChange={e => setForm({ ...form, cert_number: e.target.value })} />
            <Input label="Issuing Body" value={form.issuing_body} onChange={e => setForm({ ...form, issuing_body: e.target.value })} />
            <Input label="Issue Date" type="date" value={form.issue_date} onChange={e => setForm({ ...form, issue_date: e.target.value })} />
            <Input label="Expiry Date" type="date" value={form.expiry_date} onChange={e => setForm({ ...form, expiry_date: e.target.value })} />
          </div>
          <Textarea label="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
        </form>
      </Modal>
    </div>
  )
}

export const dynamic = 'force-dynamic'
