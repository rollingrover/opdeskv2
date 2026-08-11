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
import { Plus, Truck } from 'lucide-react'
import Link from 'next/link'

const emptyForm = { name: '', make: '', model: '', year: '', registration: '', capacity: '', status: 'available' }

export default function VehiclesPage() {
  const { company, profile, needsCompany } = useAuth()
  const supabase = createClient()
  const toast = useToast()
  const [rows, setRows] = useState([])
  const [addons, setAddons] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  async function load() {
    if (!company) { setLoading(false); return }
    setLoading(true)
    const [v, a] = await Promise.all([
      supabase.from('vehicles').select('*').eq('company_id', company.id).order('name'),
      supabase.from('company_addons').select('addon_key, quantity, active').eq('company_id', company.id).eq('active', true),
    ])
    if (v.error) toast.error(v.error.message)
    setRows(v.data || [])
    setAddons(a.data || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [company])

  async function handleSave(e) {
    e.preventDefault()
    if (!company) return
    setSaving(true)
    const { error } = await supabase.from('vehicles').insert([{
      ...form, company_id: company.id,
      year: form.year ? Number(form.year) : null,
      capacity: form.capacity ? Number(form.capacity) : null,
    }])
    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success('Vehicle added')
    setModalOpen(false); setForm(emptyForm); load()
  }

  if (needsCompany) return <EmptyState icon={<BrandIcon name="companySetup" size={48} />} title="Set up your company first" />
  if (loading) return <PageLoader />

  const vehiclesLimit = checkLimit('vehicles', rows.length, { profile, company, companyAddons: addons })

  return (
    <div>
      <ToastContainer toasts={toast.toasts} remove={toast.remove} />
      <LimitBanner resourceKey="vehicles" limitInfo={vehiclesLimit} />
      <div className="page-header">
        <div>
          <h1 className="page-title">Vehicles</h1>
          <p className="page-subtitle">{rows.length} vehicle{rows.length === 1 ? '' : 's'} · <Link href="/fleet/vessels" style={{ color: 'var(--gold)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>View Vessels <BrandIcon name="arrowRight" size={11} /></Link></p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}><Plus size={16} /> Add Vehicle</button>
      </div>

      <div className="card card-shadow">
        {rows.length === 0 ? (
          <EmptyState icon={<BrandIcon name="noVehicles" size={48} />} title="No vehicles yet" description="Add your game vehicles, shuttles or transfer vehicles."
            action={<button className="btn btn-primary btn-sm" onClick={() => setModalOpen(true)}>Add Vehicle</button>} />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Vehicle</th><th>Make/Model</th><th>Registration</th><th>Capacity</th><th>Status</th></tr></thead>
              <tbody>
                {rows.map(v => (
                  <tr key={v.id}>
                    <td style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'var(--navy)' }}><Truck size={15} />{v.name}</td>
                    <td>{[v.make, v.model, v.year].filter(Boolean).join(' ') || '—'}</td>
                    <td style={{ fontFamily: 'monospace' }}>{v.registration || '—'}</td>
                    <td>{v.capacity ?? '—'}</td>
                    <td><StatusBadge status={v.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Vehicle"
        footer={<>
          <button className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
          <button className="btn btn-primary" disabled={saving} onClick={handleSave}>{saving ? 'Saving…' : 'Add Vehicle'}</button>
        </>}>
        <form onSubmit={handleSave}>
          <Input label="Vehicle Name" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
            <Input label="Make" value={form.make} onChange={e => setForm({ ...form, make: e.target.value })} />
            <Input label="Model" value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} />
            <Input label="Year" type="number" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} />
            <Input label="Registration" value={form.registration} onChange={e => setForm({ ...form, registration: e.target.value })} />
            <Input label="Capacity" type="number" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} />
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
