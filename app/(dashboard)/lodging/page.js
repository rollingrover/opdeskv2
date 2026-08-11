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
import { ROOM_TYPES } from '@/lib/constants'
import { Plus, Bed } from 'lucide-react'
import Link from 'next/link'

const emptyForm = { name: '', room_type: 'double', floor: '', capacity: 2, rate_per_night: 0, status: 'available' }

export default function LodgingPage() {
  const { company, profile, needsCompany } = useAuth()
  const supabase = createClient()
  const toast = useToast()
  const [rooms, setRooms] = useState([])
  const [addons, setAddons] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  async function load() {
    if (!company) { setLoading(false); return }
    setLoading(true)
    const [r, a] = await Promise.all([
      supabase.from('rooms').select('*').eq('company_id', company.id).order('name'),
      supabase.from('company_addons').select('addon_key, quantity, active').eq('company_id', company.id).eq('active', true),
    ])
    if (r.error) toast.error(r.error.message)
    setRooms(r.data || [])
    setAddons(a.data || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [company])

  async function handleSave(e) {
    e.preventDefault()
    if (!company) return
    setSaving(true)
    const { error } = await supabase.from('rooms').insert([{
      ...form, company_id: company.id, currency: company.currency,
      floor: form.floor ? Number(form.floor) : null,
      capacity: Number(form.capacity) || 1,
      rate_per_night: Number(form.rate_per_night) || 0,
    }])
    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success('Room added')
    setModalOpen(false); setForm(emptyForm); load()
  }

  if (needsCompany) return <EmptyState icon={<BrandIcon name="companySetup" size={48} />} title="Set up your company first" />
  if (loading) return <PageLoader />

  const occupied = rooms.filter(r => r.status === 'occupied').length
  const roomsLimit = checkLimit('rooms', rooms.length, { profile, company, companyAddons: addons })

  return (
    <div>
      <ToastContainer toasts={toast.toasts} remove={toast.remove} />
      <LimitBanner resourceKey="rooms" limitInfo={roomsLimit} />
      <div className="page-header">
        <div>
          <h1 className="page-title">Room Overview</h1>
          <p className="page-subtitle">{occupied}/{rooms.length} occupied tonight</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link href="/lodging/housekeeping" className="btn btn-outline btn-sm">Housekeeping</Link>
          <Link href="/lodging/guests" className="btn btn-outline btn-sm">Guests</Link>
          <button className="btn btn-primary" onClick={() => setModalOpen(true)}><Plus size={16} /> Add Room</button>
        </div>
      </div>

      {rooms.length === 0 ? (
        <div className="card card-shadow">
          <EmptyState icon={<BrandIcon name="noRooms" size={48} />} title="No rooms yet" description="Add your rooms to start tracking occupancy."
            action={<button className="btn btn-primary btn-sm" onClick={() => setModalOpen(true)}>Add Room</button>} />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
          {rooms.map(r => (
            <div key={r.id} className="card card-shadow">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Bed size={16} color="var(--gold)" />
                  <span style={{ fontWeight: 700, color: 'var(--navy)' }}>{r.name}</span>
                </div>
                <StatusBadge status={r.status} />
              </div>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--gray-500)', textTransform: 'capitalize' }}>{r.room_type?.replace(/_/g, ' ')} · sleeps {r.capacity}</p>
              <p style={{ margin: '0.375rem 0 0', fontSize: '0.875rem', fontWeight: 600, color: 'var(--navy)' }}>{r.currency} {Number(r.rate_per_night).toLocaleString()}/night</p>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Room"
        footer={<>
          <button className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
          <button className="btn btn-primary" disabled={saving} onClick={handleSave}>{saving ? 'Saving…' : 'Add Room'}</button>
        </>}>
        <form onSubmit={handleSave}>
          <Input label="Room Name" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
            <Select label="Room Type" value={form.room_type} onChange={e => setForm({ ...form, room_type: e.target.value })}>
              {ROOM_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </Select>
            <Input label="Floor" type="number" value={form.floor} onChange={e => setForm({ ...form, floor: e.target.value })} />
            <Input label="Capacity" type="number" min="1" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} />
            <Input label={`Rate / Night (${company.currency})`} type="number" step="0.01" value={form.rate_per_night} onChange={e => setForm({ ...form, rate_per_night: e.target.value })} />
            <Select label="Status" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="maintenance">Maintenance</option>
            </Select>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export const dynamic = 'force-dynamic'
