'use client'
import { BrandIcon } from '@/components/ui/BrandIcon'
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { PageLoader } from '@/components/ui/Spinner'
import { StatusBadge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { Modal } from '@/components/ui/Modal'
import { Input, Select, Textarea } from '@/components/ui/FormField'
import { useToast, ToastContainer } from '@/components/ui/Toast'
import { LimitBanner } from '@/components/ui/LimitBanner'
import { checkLimit } from '@/lib/limits'
import { BOOKING_STATUSES } from '@/lib/constants'
import { Plus } from 'lucide-react'

const emptyForm = {
  guest_name: '', guest_email: '', guest_phone: '', guest_count: 1,
  start_date: '', end_date: '', booking_type: 'tour', status: 'pending',
  amount_total: 0, amount_paid: 0, notes: '',
  guide_id: '', driver_id: '', vehicle_id: '', vessel_id: '', room_id: '',
}

export default function BookingsPage() {
  const { company, profile, needsCompany } = useAuth()
  const supabase = createClient()
  const toast = useToast()
  const [bookings, setBookings] = useState([])
  const [staff, setStaff] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [vessels, setVessels] = useState([])
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  async function load() {
    if (!company) { setLoading(false); return }
    setLoading(true)
    const [b, s, v, ve, r] = await Promise.all([
      supabase.from('bookings').select('*').eq('company_id', company.id).order('start_date', { ascending: false }).limit(200),
      supabase.from('staff').select('id, full_name, staff_type').eq('company_id', company.id).eq('status', 'active'),
      supabase.from('vehicles').select('id, name, status').eq('company_id', company.id),
      supabase.from('vessels').select('id, name, status').eq('company_id', company.id),
      supabase.from('rooms').select('id, name, status').eq('company_id', company.id),
    ])
    if (b.error) toast.error(b.error.message)
    setBookings(b.data || [])
    setStaff(s.data || [])
    setVehicles(v.data || [])
    setVessels(ve.data || [])
    setRooms(r.data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [company])

  const guides = staff.filter(s => s.staff_type === 'guide')
  const drivers = staff.filter(s => s.staff_type === 'driver')

  async function handleSave(e) {
    e.preventDefault()
    if (!company) return
    setSaving(true)
    const ref = 'BK-' + Date.now().toString(36).toUpperCase()
    const { error } = await supabase.from('bookings').insert([{
      ...form,
      company_id: company.id,
      booking_ref: ref,
      guest_count: Number(form.guest_count) || 1,
      amount_total: Number(form.amount_total) || 0,
      amount_paid: Number(form.amount_paid) || 0,
      end_date: form.end_date || form.start_date,
      guide_id: form.guide_id || null,
      driver_id: form.driver_id || null,
      vehicle_id: form.vehicle_id || null,
      vessel_id: form.vessel_id || null,
      room_id: form.room_id || null,
    }])
    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success('Booking created')
    setModalOpen(false)
    setForm(emptyForm)
    load()
  }

  if (needsCompany) {
    return <EmptyState icon={<BrandIcon name="companySetup" size={48} />} title="Set up your company first" description="Bookings need a company to belong to." />
  }
  if (loading) return <PageLoader />

  const now = new Date()
  const thisMonthCount = bookings.filter(b => {
    const d = new Date(b.created_at || b.start_date)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length
  const bookingsLimit = checkLimit('bookings_per_month', thisMonthCount, { profile, company })

  return (
    <div>
      <ToastContainer toasts={toast.toasts} remove={toast.remove} />
      <LimitBanner resourceKey="bookings_per_month" limitInfo={bookingsLimit} />
      <div className="page-header">
        <div>
          <h1 className="page-title">Bookings</h1>
          <p className="page-subtitle">{bookings.length} booking{bookings.length === 1 ? '' : 's'}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={16} /> New Booking
        </button>
      </div>

      <div className="card card-shadow">
        {bookings.length === 0 ? (
          <EmptyState icon={<BrandIcon name="noBookings" size={48} />} title="No bookings yet"
            description="Create your first booking to get started."
            action={<button className="btn btn-primary btn-sm" onClick={() => setModalOpen(true)}>New Booking</button>} />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Ref</th><th>Guest</th><th>Type</th><th>Dates</th><th>Pax</th><th>Resources</th><th>Total</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 600, color: 'var(--navy)' }}>{b.booking_ref}</td>
                    <td>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: 'var(--navy)' }}>{b.guest_name || '—'}</p>
                      {b.guest_email && <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--gray-400)' }}>{b.guest_email}</p>}
                    </td>
                    <td style={{ textTransform: 'capitalize' }}>{b.booking_type}</td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>
                      {b.start_date ? new Date(b.start_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' }) : '—'}
                      {b.end_date && b.end_date !== b.start_date ? ` – ${new Date(b.end_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}` : ''}
                    </td>
                    <td>{b.guest_count}</td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                      {[
                        b.guide_id && guides.find(g => g.id === b.guide_id)?.full_name,
                        b.driver_id && drivers.find(d => d.id === b.driver_id)?.full_name,
                        b.vehicle_id && vehicles.find(v => v.id === b.vehicle_id)?.name,
                        b.vessel_id && vessels.find(v => v.id === b.vessel_id)?.name,
                        b.room_id && rooms.find(r => r.id === b.room_id)?.name,
                      ].filter(Boolean).join(' · ') || '—'}
                    </td>
                    <td>{company.currency} {Number(b.amount_total || 0).toLocaleString()}</td>
                    <td><StatusBadge status={b.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Booking" size="lg"
        footer={<>
          <button className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
          <button className="btn btn-primary" disabled={saving} onClick={handleSave}>{saving ? 'Saving…' : 'Create Booking'}</button>
        </>}>
        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
            <Input label="Guest Name" required value={form.guest_name} onChange={e => setForm({ ...form, guest_name: e.target.value })} />
            <Input label="Guest Email" type="email" value={form.guest_email} onChange={e => setForm({ ...form, guest_email: e.target.value })} />
            <Input label="Guest Phone" value={form.guest_phone} onChange={e => setForm({ ...form, guest_phone: e.target.value })} />
            <Input label="Guests" type="number" min="1" value={form.guest_count} onChange={e => setForm({ ...form, guest_count: e.target.value })} />
            <Input label="Start Date" type="date" required value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} />
            <Input label="End Date" type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} />
            <Select label="Status" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              {BOOKING_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </Select>
            <Select label="Type" value={form.booking_type} onChange={e => setForm({ ...form, booking_type: e.target.value })}>
              <option value="tour">Tour</option>
              <option value="transfer">Transfer</option>
              <option value="charter">Charter</option>
              <option value="accommodation">Accommodation</option>
            </Select>
            <Input label="Total Amount" type="number" step="0.01" value={form.amount_total} onChange={e => setForm({ ...form, amount_total: e.target.value })} />
            <Input label="Amount Paid" type="number" step="0.01" value={form.amount_paid} onChange={e => setForm({ ...form, amount_paid: e.target.value })} />
          </div>

          <div style={{ marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--gray-100)' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>
              Assign Resources (optional)
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
              <Select label="Guide" value={form.guide_id} onChange={e => setForm({ ...form, guide_id: e.target.value })}>
                <option value="">— None —</option>
                {guides.map(g => <option key={g.id} value={g.id}>{g.full_name}</option>)}
              </Select>
              <Select label="Driver" value={form.driver_id} onChange={e => setForm({ ...form, driver_id: e.target.value })}>
                <option value="">— None —</option>
                {drivers.map(d => <option key={d.id} value={d.id}>{d.full_name}</option>)}
              </Select>
              <Select label="Vehicle" value={form.vehicle_id} onChange={e => setForm({ ...form, vehicle_id: e.target.value })}>
                <option value="">— None —</option>
                {vehicles.map(v => <option key={v.id} value={v.id}>{v.name} {v.status !== 'available' ? `(${v.status})` : ''}</option>)}
              </Select>
              <Select label="Vessel" value={form.vessel_id} onChange={e => setForm({ ...form, vessel_id: e.target.value })}>
                <option value="">— None —</option>
                {vessels.map(v => <option key={v.id} value={v.id}>{v.name} {v.status !== 'available' ? `(${v.status})` : ''}</option>)}
              </Select>
              <Select label="Room" value={form.room_id} onChange={e => setForm({ ...form, room_id: e.target.value })}>
                <option value="">— None —</option>
                {rooms.map(r => <option key={r.id} value={r.id}>{r.name} {r.status !== 'available' ? `(${r.status})` : ''}</option>)}
              </Select>
            </div>
          </div>

          <Textarea label="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
        </form>
      </Modal>
    </div>
  )
}

export const dynamic = 'force-dynamic'
