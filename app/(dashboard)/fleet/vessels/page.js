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
import { Plus, Ship } from 'lucide-react'
import Link from 'next/link'

const emptyForm = { name: '', make: '', model: '', year: '', registration: '', capacity: '', length_meters: '', home_port: '', status: 'available' }

export default function VesselsPage() {
  const { company, needsCompany } = useAuth()
  const supabase = createClient()
  const toast = useToast()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  async function load() {
    if (!company) { setLoading(false); return }
    setLoading(true)
    const { data, error } = await supabase.from('vessels').select('*').eq('company_id', company.id).order('name')
    if (error) toast.error(error.message)
    setRows(data || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [company])

  async function handleSave(e) {
    e.preventDefault()
    if (!company) return
    setSaving(true)
    const { error } = await supabase.from('vessels').insert([{
      ...form, company_id: company.id,
      year: form.year ? Number(form.year) : null,
      capacity: form.capacity ? Number(form.capacity) : null,
      length_meters: form.length_meters ? Number(form.length_meters) : null,
    }])
    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success('Vessel added')
    setModalOpen(false); setForm(emptyForm); load()
  }

  if (needsCompany) return <EmptyState icon={<BrandIcon name="companySetup" size={48} />} title="Set up your company first" />
  if (loading) return <PageLoader />

  return (
    <div>
      <ToastContainer toasts={toast.toasts} remove={toast.remove} />
      <div className="page-header">
        <div>
          <h1 className="page-title">Vessels</h1>
          <p className="page-subtitle">{rows.length} vessel{rows.length === 1 ? '' : 's'} · <Link href="/fleet/vehicles" style={{ color: 'var(--gold)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>View Vehicles <BrandIcon name="arrowRight" size={11} /></Link></p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}><Plus size={16} /> Add Vessel</button>
      </div>

      <div className="card card-shadow">
        {rows.length === 0 ? (
          <EmptyState icon={<BrandIcon name="noVessels" size={48} />} title="No vessels yet" description="Add your fishing boats or charter vessels."
            action={<button className="btn btn-primary btn-sm" onClick={() => setModalOpen(true)}>Add Vessel</button>} />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Vessel</th><th>Make/Model</th><th>Registration</th><th>Capacity</th><th>Home Port</th><th>Status</th></tr></thead>
              <tbody>
                {rows.map(v => (
                  <tr key={v.id}>
                    <td style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'var(--navy)' }}><Ship size={15} />{v.name}</td>
                    <td>{[v.make, v.model, v.year].filter(Boolean).join(' ') || '—'}</td>
                    <td style={{ fontFamily: 'monospace' }}>{v.registration || '—'}</td>
                    <td>{v.capacity ?? '—'}</td>
                    <td>{v.home_port || '—'}</td>
                    <td><StatusBadge status={v.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Vessel"
        footer={<>
          <button className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
          <button className="btn btn-primary" disabled={saving} onClick={handleSave}>{saving ? 'Saving…' : 'Add Vessel'}</button>
        </>}>
        <form onSubmit={handleSave}>
          <Input label="Vessel Name" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
            <Input label="Make" value={form.make} onChange={e => setForm({ ...form, make: e.target.value })} />
            <Input label="Model" value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} />
            <Input label="Year" type="number" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} />
            <Input label="Registration" value={form.registration} onChange={e => setForm({ ...form, registration: e.target.value })} />
            <Input label="Capacity" type="number" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} />
            <Input label="Length (m)" type="number" step="0.1" value={form.length_meters} onChange={e => setForm({ ...form, length_meters: e.target.value })} />
            <Input label="Home Port" value={form.home_port} onChange={e => setForm({ ...form, home_port: e.target.value })} />
            <Select label="Status" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              <option value="available">Available</option>
              <option value="in_use">In Use</option>
              <option value="maintenance">Maintenance</option>
            </Select>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export const dynamic = 'force-dynamic'
