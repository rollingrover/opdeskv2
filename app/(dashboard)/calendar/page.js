'use client'
import { BrandIcon } from '@/components/ui/BrandIcon'
import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { PageLoader } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { Modal } from '@/components/ui/Modal'
import { Input, Select, Textarea } from '@/components/ui/FormField'
import { StatusBadge } from '@/components/ui/Badge'
import { useToast, ToastContainer } from '@/components/ui/Toast'
import { BOOKING_STATUSES } from '@/lib/constants'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function toISODate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const emptyForm = {
  guest_name: '', guest_email: '', guest_phone: '', guest_count: 1,
  start_date: '', end_date: '', booking_type: 'tour', status: 'pending',
  amount_total: 0, amount_paid: 0, notes: '',
  guide_id: '', driver_id: '', vehicle_id: '', vessel_id: '', room_id: '',
}

export default function CalendarPage() {
  const { company, needsCompany } = useAuth()
  const supabase = createClient()
  const toast = useToast()

  const [cursor, setCursor] = useState(() => { const d = new Date(); d.setDate(1); return d })
  const [bookings, setBookings] = useState([])
  const [staff, setStaff] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [vessels, setVessels] = useState([])
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)

  const [selectedDate, setSelectedDate] = useState(null)
  const [dayModalOpen, setDayModalOpen] = useState(false)
  const [editing, setEditing] = useState(null) // null = list view, {} = new, {...booking} = edit
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const monthStart = useMemo(() => new Date(cursor.getFullYear(), cursor.getMonth(), 1), [cursor])
  const monthEnd = useMemo(() => new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0), [cursor])

  async function load() {
    if (!company) { setLoading(false); return }
    setLoading(true)
    // Fetch a comfortably wide window around the visible month so bookings
    // that started before the month but run into it (or vice versa) still
    // show up on the days they actually cover.
    const from = new Date(monthStart); from.setDate(from.getDate() - 42)
    const to = new Date(monthEnd); to.setDate(to.getDate() + 42)
    const [b, s, v, ve, r] = await Promise.all([
      supabase.from('bookings').select('*').eq('company_id', company.id)
        .lte('start_date', toISODate(to)).gte('end_date', toISODate(from)),
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

  useEffect(() => { load() }, [company, cursor])

  const guides = staff.filter(s => s.staff_type === 'guide')
  const drivers = staff.filter(s => s.staff_type === 'driver')

  function bookingsOnDay(iso) {
    return bookings.filter(b => {
      const start = b.start_date
      const end = b.end_date || b.start_date
      return iso >= start && iso <= end
    })
  }

  // Build the 6-week grid, including the tail/head of adjacent months.
  const gridStart = useMemo(() => {
    const d = new Date(monthStart)
    d.setDate(d.getDate() - d.getDay())
    return d
  }, [monthStart])

  const days = useMemo(() => {
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(gridStart)
      d.setDate(d.getDate() + i)
      return d
    })
  }, [gridStart])

  function openDay(d) {
    setSelectedDate(d)
    setEditing(null)
    setDayModalOpen(true)
  }

  function startAdd() {
    const iso = toISODate(selectedDate)
    setForm({ ...emptyForm, start_date: iso, end_date: iso })
    setEditing({})
  }

  function startEdit(b) {
    setForm({
      guest_name: b.guest_name || '', guest_email: b.guest_email || '', guest_phone: b.guest_phone || '',
      guest_count: b.guest_count || 1, start_date: b.start_date || '', end_date: b.end_date || b.start_date || '',
      booking_type: b.booking_type || 'tour', status: b.status || 'pending',
      amount_total: b.amount_total || 0, amount_paid: b.amount_paid || 0, notes: b.notes || '',
      guide_id: b.guide_id || '', driver_id: b.driver_id || '', vehicle_id: b.vehicle_id || '',
      vessel_id: b.vessel_id || '', room_id: b.room_id || '',
    })
    setEditing(b)
  }

  async function saveBooking(e) {
    e.preventDefault()
    if (!company) return
    setSaving(true)
    const payload = {
      ...form, company_id: company.id,
      guest_count: Number(form.guest_count) || 1,
      amount_total: Number(form.amount_total) || 0,
      amount_paid: Number(form.amount_paid) || 0,
      end_date: form.end_date || form.start_date,
      guide_id: form.guide_id || null, driver_id: form.driver_id || null,
      vehicle_id: form.vehicle_id || null, vessel_id: form.vessel_id || null, room_id: form.room_id || null,
    }
    let error
    if (editing?.id) {
      ;({ error } = await supabase.from('bookings').update(payload).eq('id', editing.id))
    } else {
      payload.booking_ref = 'BK-' + Date.now().toString(36).toUpperCase()
      ;({ error } = await supabase.from('bookings').insert([payload]))
    }
    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success(editing?.id ? 'Booking updated' : 'Booking created')
    setEditing(null)
    load()
  }

  if (needsCompany) return <EmptyState icon={<BrandIcon name="companySetup" size={48} />} title="Set up your company first" />
  if (loading) return <PageLoader />

  const todayISO = toISODate(new Date())
  const selISO = selectedDate ? toISODate(selectedDate) : null

  return (
    <div>
      <ToastContainer toasts={toast.toasts} remove={toast.remove} />
      <div className="page-header">
        <div>
          <h1 className="page-title">Calendar</h1>
          <p className="page-subtitle">{cursor.toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' })}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button className="btn btn-outline btn-sm" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}><ChevronLeft size={16} /></button>
          <button className="btn btn-outline btn-sm" onClick={() => { const d = new Date(); d.setDate(1); setCursor(d) }}>Today</button>
          <button className="btn btn-outline btn-sm" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}><ChevronRight size={16} /></button>
        </div>
      </div>

      <div className="card card-shadow" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid var(--gray-100)' }}>
          {WEEKDAYS.map(w => (
            <div key={w} style={{ padding: '0.625rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase' }}>{w}</div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {days.map((d, i) => {
            const iso = toISODate(d)
            const inMonth = d.getMonth() === monthStart.getMonth()
            const dayBookings = bookingsOnDay(iso)
            const isToday = iso === todayISO
            return (
              <div key={i} onClick={() => openDay(d)}
                style={{
                  minHeight: 92, padding: '0.5rem', borderRight: (i + 1) % 7 !== 0 ? '1px solid var(--gray-100)' : 'none',
                  borderBottom: '1px solid var(--gray-100)', cursor: 'pointer', background: inMonth ? 'white' : 'var(--gray-50)',
                  opacity: inMonth ? 1 : 0.5, transition: 'background 0.1s',
                }}
                onMouseOver={e => e.currentTarget.style.background = 'var(--cream)'}
                onMouseOut={e => e.currentTarget.style.background = inMonth ? 'white' : 'var(--gray-50)'}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: '1.5rem', height: '1.5rem', borderRadius: '50%',
                  background: isToday ? 'var(--gold)' : 'transparent',
                  color: isToday ? 'var(--navy)' : 'var(--navy)', fontWeight: isToday ? 800 : 600, fontSize: '0.8125rem',
                }}>
                  {d.getDate()}
                </div>
                <div style={{ marginTop: '0.25rem', display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                  {dayBookings.slice(0, 3).map(b => (
                    <div key={b.id} style={{
                      fontSize: '0.6875rem', padding: '0.0625rem 0.375rem', borderRadius: '0.25rem',
                      background: 'var(--teal-light, #E6F5F5)', color: 'var(--teal)', fontWeight: 600,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {b.guest_name || 'Booking'}
                    </div>
                  ))}
                  {dayBookings.length > 3 && (
                    <div style={{ fontSize: '0.6875rem', color: 'var(--gray-400)', fontWeight: 600 }}>+{dayBookings.length - 3} more</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <Modal open={dayModalOpen} onClose={() => { setDayModalOpen(false); setEditing(null) }}
        title={selectedDate ? selectedDate.toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : ''}
        size="lg"
        footer={editing ? (
          <>
            <button className="btn btn-outline" onClick={() => setEditing(null)}>Back</button>
            <button className="btn btn-primary" disabled={saving} onClick={saveBooking}>{saving ? 'Saving…' : editing?.id ? 'Save Changes' : 'Create Booking'}</button>
          </>
        ) : (
          <button className="btn btn-primary" onClick={startAdd}><Plus size={16} /> Add Booking</button>
        )}>
        {!editing ? (
          selISO && bookingsOnDay(selISO).length === 0 ? (
            <EmptyState icon={<BrandIcon name="noBookings" size={48} />} title="No bookings on this day" description="Add one to get started." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {selISO && bookingsOnDay(selISO).map(b => (
                <div key={b.id} onClick={() => startEdit(b)} style={{
                  border: '1px solid var(--gray-100)', borderRadius: '0.5rem', padding: '0.75rem 1rem',
                  cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, color: 'var(--navy)', fontSize: '0.875rem' }}>{b.guest_name || 'Guest'}</p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                      {b.booking_ref} · {b.booking_type} · {company.currency} {Number(b.amount_total || 0).toLocaleString()}
                    </p>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
              ))}
            </div>
          )
        ) : (
          <form onSubmit={saveBooking}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
              <Input label="Guest Name" required value={form.guest_name} onChange={e => setForm({ ...form, guest_name: e.target.value })} />
              <Input label="Guest Email" type="email" value={form.guest_email} onChange={e => setForm({ ...form, guest_email: e.target.value })} />
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
                Assign Resources
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
                  {vehicles.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                </Select>
                <Select label="Room" value={form.room_id} onChange={e => setForm({ ...form, room_id: e.target.value })}>
                  <option value="">— None —</option>
                  {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </Select>
              </div>
            </div>
            <Textarea label="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          </form>
        )}
      </Modal>
    </div>
  )
}

export const dynamic = 'force-dynamic'
