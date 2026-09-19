'use client'
import { BrandIcon } from '@/components/ui/BrandIcon'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
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
import { Plus, Lock } from 'lucide-react'

const emptyForm = {
  guest_name: '', guest_email: '', guest_phone: '', guest_count: 1,
  start_date: '', end_date: '', booking_type: 'tour', status: 'pending',
  amount_total: 0, amount_paid: 0, notes: '',
  guide_id: '', driver_id: '', vehicle_id: '', vessel_id: '', room_id: '',
}

export default function BookingsPage() {
  const t = useTranslations('Bookings')
  const tStatus = useTranslations('StatusBadge')
  const tCommon = useTranslations('Common')
  const { company, profile, needsCompany } = useAuth()
  const supabase = createClient()
  const toast = useToast()
  const [bookings, setBookings] = useState([])
  const [invoicedBookingIds, setInvoicedBookingIds] = useState(new Set())
  const [staff, setStaff] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [vessels, setVessels] = useState([])
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  async function load() {
    if (!company) { setLoading(false); return }
    setLoading(true)
    // invoices.booking_id tells us which bookings have already been
    // invoiced out — those become read-only (see isEditable below), since
    // editing a booking after its invoice exists would leave the invoice
    // describing something that no longer matches.
    const [b, s, v, ve, r, inv] = await Promise.all([
      supabase.from('bookings').select('*').eq('company_id', company.id).order('start_date', { ascending: false }).limit(200),
      supabase.from('staff').select('id, full_name, staff_type').eq('company_id', company.id).eq('status', 'active'),
      supabase.from('vehicles').select('id, name, status').eq('company_id', company.id),
      supabase.from('vessels').select('id, name, status').eq('company_id', company.id),
      supabase.from('rooms').select('id, name, status').eq('company_id', company.id),
      supabase.from('invoices').select('booking_id').eq('company_id', company.id).not('booking_id', 'is', null),
    ])
    if (b.error) toast.error(b.error.message)
    setBookings(b.data || [])
    setStaff(s.data || [])
    setVehicles(v.data || [])
    setVessels(ve.data || [])
    setRooms(r.data || [])
    setInvoicedBookingIds(new Set((inv.data || []).map(i => i.booking_id)))
    setLoading(false)
  }

  useEffect(() => { load() }, [company])

  const guides = staff.filter(s => s.staff_type === 'guide')
  const drivers = staff.filter(s => s.staff_type === 'driver')

  function isEditable(booking) {
    return !invoicedBookingIds.has(booking.id)
  }

  function openForCreate() {
    setEditingId(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  function openForEdit(booking) {
    if (!isEditable(booking)) return
    setEditingId(booking.id)
    setForm({
      guest_name: booking.guest_name || '', guest_email: booking.guest_email || '', guest_phone: booking.guest_phone || '',
      guest_count: booking.guest_count || 1, start_date: booking.start_date || '', end_date: booking.end_date || '',
      booking_type: booking.booking_type || 'tour', status: booking.status || 'pending',
      amount_total: booking.amount_total || 0, amount_paid: booking.amount_paid || 0, notes: booking.notes || '',
      guide_id: booking.guide_id || '', driver_id: booking.driver_id || '', vehicle_id: booking.vehicle_id || '',
      vessel_id: booking.vessel_id || '', room_id: booking.room_id || '',
    })
    setModalOpen(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!company) return
    setSaving(true)
    const payload = {
      ...form,
      guest_count: Number(form.guest_count) || 1,
      amount_total: Number(form.amount_total) || 0,
      amount_paid: Number(form.amount_paid) || 0,
      end_date: form.end_date || form.start_date,
      guide_id: form.guide_id || null,
      driver_id: form.driver_id || null,
      vehicle_id: form.vehicle_id || null,
      vessel_id: form.vessel_id || null,
      room_id: form.room_id || null,
    }
    const { error } = editingId
      ? await supabase.from('bookings').update(payload).eq('id', editingId)
      : await supabase.from('bookings').insert([{ ...payload, company_id: company.id, booking_ref: 'BK-' + Date.now().toString(36).toUpperCase() }])
    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success(editingId ? t('bookingUpdated') : t('bookingCreated'))
    setModalOpen(false)
    setEditingId(null)
    setForm(emptyForm)
    load()
  }

  if (needsCompany) {
    return <EmptyState icon={<BrandIcon name="companySetup" size={48} />} title={tCommon('needsCompanyTitle')} description={t('needsCompanyDesc')} />
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
          <h1 className="page-title">{t('title')}</h1>
          <p className="page-subtitle">{bookings.length} {bookings.length === 1 ? t('bookingSingular') : t('bookingPlural')}</p>
        </div>
        <button className="btn btn-primary" onClick={openForCreate}>
          <Plus size={16} /> {t('newBooking')}
        </button>
      </div>

      <div className="card card-shadow">
        {bookings.length === 0 ? (
          <EmptyState icon={<BrandIcon name="noBookings" size={48} />} title={t('noBookingsTitle')}
            description={t('noBookingsDesc')}
            action={<button className="btn btn-primary btn-sm" onClick={openForCreate}>{t('newBooking')}</button>} />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>{t('colRef')}</th><th>{t('colGuest')}</th><th>{t('colType')}</th><th>{t('colDates')}</th><th>{t('colPax')}</th><th>{t('colResources')}</th><th>{t('colTotal')}</th><th>{t('colStatus')}</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => {
                  const editable = isEditable(b)
                  return (
                  <tr key={b.id} onClick={() => openForEdit(b)}
                    title={editable ? t('clickToEdit') : t('lockedInvoiced')}
                    style={{ cursor: editable ? 'pointer' : 'not-allowed' }}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 600, color: 'var(--navy)' }}>{b.booking_ref}</td>
                    <td>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: 'var(--navy)' }}>{b.guest_name || '—'}</p>
                      {b.guest_email && <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--gray-400)' }}>{b.guest_email}</p>}
                    </td>
                    <td style={{ textTransform: 'capitalize' }}>{{tour:t('typeTour'),transfer:t('typeTransfer'),charter:t('typeCharter'),accommodation:t('typeAccommodation')}[b.booking_type] || b.booking_type}</td>
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
                    <td style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', justifyContent: 'flex-end' }}>
                      <StatusBadge status={b.status} />
                      {!editable && <Lock size={12} color="var(--gray-400)" />}
                    </td>
                  </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditingId(null) }} title={editingId ? t('editBooking') : t('newBooking')} size="lg"
        footer={<>
          <button className="btn btn-outline" onClick={() => { setModalOpen(false); setEditingId(null) }}>{t('cancel')}</button>
          <button className="btn btn-primary" disabled={saving} onClick={handleSave}>{saving ? t('saving') : editingId ? t('saveChanges') : t('createBooking')}</button>
        </>}>
        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
            <Input label={t('guestName')} required value={form.guest_name} onChange={e => setForm({ ...form, guest_name: e.target.value })} />
            <Input label={t('guestEmail')} type="email" value={form.guest_email} onChange={e => setForm({ ...form, guest_email: e.target.value })} />
            <Input label={t('guestPhone')} value={form.guest_phone} onChange={e => setForm({ ...form, guest_phone: e.target.value })} />
            <Input label={t('guests')} type="number" min="1" value={form.guest_count} onChange={e => setForm({ ...form, guest_count: e.target.value })} />
            <Input label={t('startDate')} type="date" required value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} />
            <Input label={t('endDate')} type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} />
            <Select label={t('status')} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              {BOOKING_STATUSES.map(s => <option key={s.value} value={s.value}>{tStatus(s.value)}</option>)}
            </Select>
            <Select label={t('type')} value={form.booking_type} onChange={e => setForm({ ...form, booking_type: e.target.value })}>
              <option value="tour">{t('typeTour')}</option>
              <option value="transfer">{t('typeTransfer')}</option>
              <option value="charter">{t('typeCharter')}</option>
              <option value="accommodation">{t('typeAccommodation')}</option>
            </Select>
            <Input label={t('totalAmount')} type="number" step="0.01" value={form.amount_total} onChange={e => setForm({ ...form, amount_total: e.target.value })} />
            <Input label={t('amountPaid')} type="number" step="0.01" value={form.amount_paid} onChange={e => setForm({ ...form, amount_paid: e.target.value })} />
          </div>

          <div style={{ marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--gray-100)' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>
              {t('assignResources')}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
              <Select label={t('guide')} value={form.guide_id} onChange={e => setForm({ ...form, guide_id: e.target.value })}>
                <option value="">{t('none')}</option>
                {guides.map(g => <option key={g.id} value={g.id}>{g.full_name}</option>)}
              </Select>
              <Select label={t('driver')} value={form.driver_id} onChange={e => setForm({ ...form, driver_id: e.target.value })}>
                <option value="">{t('none')}</option>
                {drivers.map(d => <option key={d.id} value={d.id}>{d.full_name}</option>)}
              </Select>
              <Select label={t('vehicle')} value={form.vehicle_id} onChange={e => setForm({ ...form, vehicle_id: e.target.value })}>
                <option value="">{t('none')}</option>
                {vehicles.map(v => <option key={v.id} value={v.id}>{v.name} {v.status !== 'available' ? `(${tStatus(v.status)})` : ''}</option>)}
              </Select>
              <Select label={t('vessel')} value={form.vessel_id} onChange={e => setForm({ ...form, vessel_id: e.target.value })}>
                <option value="">{t('none')}</option>
                {vessels.map(v => <option key={v.id} value={v.id}>{v.name} {v.status !== 'available' ? `(${tStatus(v.status)})` : ''}</option>)}
              </Select>
              <Select label={t('room')} value={form.room_id} onChange={e => setForm({ ...form, room_id: e.target.value })}>
                <option value="">{t('none')}</option>
                {rooms.map(r => <option key={r.id} value={r.id}>{r.name} {r.status !== 'available' ? `(${tStatus(r.status)})` : ''}</option>)}
              </Select>
            </div>
          </div>

          <Textarea label={t('notes')} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
        </form>
      </Modal>
    </div>
  )
}

export const dynamic = 'force-dynamic'
