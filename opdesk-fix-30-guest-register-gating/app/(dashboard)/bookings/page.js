'use client'
import { BrandIcon } from '@/components/ui/BrandIcon'
import { useEffect, useState, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
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
import { hasModuleAccess } from '@/lib/moduleAccess'
import { BOOKING_STATUSES } from '@/lib/constants'
import { Plus, Lock } from 'lucide-react'
import Link from 'next/link'

const emptyForm = {
  guest_name: '', guest_email: '', guest_phone: '', guest_count: 1,
  start_date: '', end_date: '', booking_type: 'tour', status: 'pending',
  unit_price: 0, amount_paid: 0, notes: '',
  guide_id: '', driver_id: '', vehicle_id: '', vessel_id: '', room_id: '',
  travelers: [], // optional additional travelers beyond the lead guest — [{full_name, email, phone}]
}

function BookingsContent() {
  const t = useTranslations('Bookings')
  const tStatus = useTranslations('StatusBadge')
  const tCommon = useTranslations('Common')
  const searchParams = useSearchParams()
  const { company, profile, needsCompany } = useAuth()
  const supabase = createClient()
  const toast = useToast()
  const [bookings, setBookings] = useState([])
  const [invoicedBookingIds, setInvoicedBookingIds] = useState(new Set())
  const [bookingTypes, setBookingTypes] = useState([])
  const [staff, setStaff] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [vessels, setVessels] = useState([])
  const [rooms, setRooms] = useState([])
  const [addons, setAddons] = useState([])
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
    const [b, s, v, ve, r, inv, bt, a] = await Promise.all([
      supabase.from('bookings').select('*').eq('company_id', company.id).order('start_date', { ascending: false }).limit(200),
      supabase.from('staff').select('id, full_name, staff_type').eq('company_id', company.id).eq('status', 'active'),
      supabase.from('vehicles').select('id, name, status').eq('company_id', company.id),
      supabase.from('vessels').select('id, name, status').eq('company_id', company.id),
      supabase.from('rooms').select('id, name, status').eq('company_id', company.id),
      supabase.from('invoices').select('booking_id').eq('company_id', company.id).not('booking_id', 'is', null),
      supabase.from('booking_types').select('*').eq('company_id', company.id).eq('active', true).order('sort_order').order('name'),
      supabase.from('company_addons').select('addon_key, active').eq('company_id', company.id).eq('active', true),
    ])
    if (b.error) toast.error(b.error.message)
    setBookings(b.data || [])
    setStaff(s.data || [])
    setVehicles(v.data || [])
    setVessels(ve.data || [])
    setRooms(r.data || [])
    setInvoicedBookingIds(new Set((inv.data || []).map(i => i.booking_id)))
    setBookingTypes(bt.data || [])
    setAddons(a.data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [company])

  const guides = staff.filter(s => s.staff_type === 'guide')
  const drivers = staff.filter(s => s.staff_type === 'driver')

  // Legacy fallback for the 4 hardcoded values older bookings may still
  // have stored before booking types became per-company and dynamic.
  const LEGACY_TYPE_LABELS = { tour: t('typeTour'), transfer: t('typeTransfer'), charter: t('typeCharter'), accommodation: t('typeAccommodation') }
  function typeLabel(slug) {
    return bookingTypes.find(bt => bt.slug === slug)?.name || LEGACY_TYPE_LABELS[slug] || slug
  }
  function selectedType() {
    return bookingTypes.find(bt => bt.slug === form.booking_type)
  }

  function isEditable(booking) {
    return !invoicedBookingIds.has(booking.id)
  }

  function openForCreate() {
    setEditingId(null)
    setForm({ ...emptyForm, booking_type: bookingTypes[0]?.slug || '' })
    setModalOpen(true)
  }

  async function openForEdit(booking) {
    if (!isEditable(booking)) return
    setEditingId(booking.id)
    const { data: travs } = await supabase.from('booking_travelers').select('full_name, email, phone').eq('booking_id', booking.id).eq('is_lead', false)
    setForm({
      guest_name: booking.guest_name || '', guest_email: booking.guest_email || '', guest_phone: booking.guest_phone || '',
      guest_count: booking.guest_count || 1, start_date: booking.start_date || '', end_date: booking.end_date || '',
      booking_type: booking.booking_type || bookingTypes[0]?.slug || '', status: booking.status || 'pending',
      unit_price: booking.unit_price ?? (booking.amount_total ? booking.amount_total / (booking.guest_count || 1) : 0),
      amount_paid: booking.amount_paid || 0, notes: booking.notes || '',
      guide_id: booking.guide_id || '', driver_id: booking.driver_id || '', vehicle_id: booking.vehicle_id || '',
      vessel_id: booking.vessel_id || '', room_id: booking.room_id || '',
      travelers: travs || [],
    })
    setModalOpen(true)
  }

  // Supports deep-linking straight into a booking's edit view, e.g.
  // /bookings?edit=<id> from the dashboard's recent bookings list — a plain
  // link to /bookings would otherwise land on the list with no way to tell
  // which booking the person actually wanted to open.
  const autoOpenedRef = useRef(false)
  useEffect(() => {
    const editId = searchParams.get('edit')
    if (!editId || autoOpenedRef.current || bookings.length === 0) return
    const target = bookings.find(b => b.id === editId)
    if (target) { autoOpenedRef.current = true; openForEdit(target) }
  }, [searchParams, bookings]) // eslint-disable-line react-hooks/exhaustive-deps

  // Picking a duration on a duration-priced type (Safari, Boat Cruise, etc.)
  // fills the per-guest unit price from that type's rate card — still just
  // a starting point, unit_price stays a normal editable field afterward.
  // The rate card is treated as a per-guest rate; total is guests × unit price.
  function applyDuration(durationKey) {
    const rate = selectedType()?.durations?.[durationKey]
    if (rate !== undefined) setForm(f => ({ ...f, unit_price: rate }))
  }

  // Matches an existing guest by email first (case-insensitive), falling
  // back to exact name match if no email is given, so the same person
  // booking again links to their existing record instead of creating a
  // duplicate. Creates a new guest only when nothing matches.
  async function findOrCreateGuest(name, email, phone) {
    if (!name) return null
    let existing = null
    if (email) {
      const { data } = await supabase.from('guests').select('id, phone').eq('company_id', company.id).ilike('email', email).maybeSingle()
      existing = data
    } else {
      const { data } = await supabase.from('guests').select('id, phone').eq('company_id', company.id).is('email', null).eq('full_name', name).maybeSingle()
      existing = data
    }
    if (existing) {
      if (phone && !existing.phone) await supabase.from('guests').update({ phone }).eq('id', existing.id)
      return existing.id
    }
    const { data: created } = await supabase.from('guests').insert([{ company_id: company.id, full_name: name, email: email || null, phone: phone || null }]).select('id').maybeSingle()
    return created?.id || null
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!company) return
    setSaving(true)
    const guestCount = Number(form.guest_count) || 1
    const unitPrice = Number(form.unit_price) || 0
    const guestId = await findOrCreateGuest(form.guest_name, form.guest_email, form.guest_phone)
    const { travelers, ...formRest } = form
    const payload = {
      ...formRest,
      guest_id: guestId,
      guest_count: guestCount,
      unit_price: unitPrice,
      amount_total: guestCount * unitPrice,
      amount_paid: Number(form.amount_paid) || 0,
      end_date: form.end_date || form.start_date,
      guide_id: form.guide_id || null,
      driver_id: form.driver_id || null,
      vehicle_id: form.vehicle_id || null,
      vessel_id: form.vessel_id || null,
      room_id: form.room_id || null,
    }
    let bookingId = editingId
    let error
    if (editingId) {
      ;({ error } = await supabase.from('bookings').update(payload).eq('id', editingId))
    } else {
      const ref = 'BK-' + Date.now().toString(36).toUpperCase()
      const { data: inserted, error: insertErr } = await supabase.from('bookings').insert([{ ...payload, company_id: company.id, booking_ref: ref }]).select('id').maybeSingle()
      error = insertErr
      bookingId = inserted?.id
    }
    if (error) { setSaving(false); toast.error(error.message); return }

    // Travelers are entirely optional — most bookings have none listed
    // beyond the lead guest, and that's fine. When editing, the existing
    // list is replaced wholesale with whatever's currently in the form,
    // which is simplest and matches how the rest of this form already
    // works (no partial-diff tracking anywhere else on this page either).
    if (bookingId) {
      await supabase.from('booking_travelers').delete().eq('booking_id', bookingId)
      const rows = [{ full_name: form.guest_name, email: form.guest_email || null, phone: form.guest_phone || null, is_lead: true, guest_id: guestId }]
      for (const trav of travelers) {
        if (!trav.full_name) continue
        const travGuestId = await findOrCreateGuest(trav.full_name, trav.email, trav.phone)
        rows.push({ full_name: trav.full_name, email: trav.email || null, phone: trav.phone || null, is_lead: false, guest_id: travGuestId })
      }
      if (rows.length > 0) {
        await supabase.from('booking_travelers').insert(rows.map(r => ({ ...r, booking_id: bookingId, company_id: company.id })))
      }
    }

    setSaving(false)
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
                    <td style={{ textTransform: 'capitalize' }}>{typeLabel(b.booking_type)}</td>
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
              {bookingTypes.length === 0
                ? <option value="">{t('noTypesYet')}</option>
                : bookingTypes.map(bt => <option key={bt.slug} value={bt.slug}>{bt.name}</option>)}
            </Select>
            {selectedType()?.durations && (
              <Select label={t('duration')} defaultValue="" onChange={e => applyDuration(e.target.value)}>
                <option value="" disabled>{t('selectDuration')}</option>
                {Object.entries(selectedType().durations).map(([key, price]) => (
                  <option key={key} value={key}>
                    {{ '3hr': t('duration3hr'), '6hr': t('duration6hr'), full_day: t('durationFullDay') }[key] || key} — {company.currency}{price}
                  </option>
                ))}
              </Select>
            )}
            <Input label={t('unitSellPrice')} type="number" step="0.01" value={form.unit_price} onChange={e => setForm({ ...form, unit_price: e.target.value })} />
            <Input label={t('amountPaid')} type="number" step="0.01" value={form.amount_paid} onChange={e => setForm({ ...form, amount_paid: e.target.value })} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--cream)', borderRadius: '0.5rem', padding: '0.625rem 0.875rem', margin: '0.25rem 0 0.75rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--gray-500)' }}>
              {t('totalCalc', { guests: Number(form.guest_count) || 1, unitPrice: `${company.currency}${(Number(form.unit_price) || 0).toLocaleString()}` })}
            </span>
            <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--navy)' }}>
              {company.currency} {((Number(form.guest_count) || 1) * (Number(form.unit_price) || 0)).toLocaleString()}
            </span>
          </div>

          {bookingTypes.length === 0 && (
            <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '-0.5rem', marginBottom: '0.75rem' }}>
              {t('noTypesHint')} <Link href="/settings/booking-types" style={{ color: 'var(--gold)' }}>{t('manageTypes')}</Link>
            </p>
          )}

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

          {hasModuleAccess('guest_register', { profile, company, companyAddons: addons }) && (
          <div style={{ marginBottom: '0.875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--gray-700)' }}>{t('travelers')}</label>
              <button type="button" className="btn btn-outline btn-sm"
                onClick={() => setForm({ ...form, travelers: [...form.travelers, { full_name: '', email: '', phone: '' }] })}>
                + {t('addTraveler')}
              </button>
            </div>
            {form.travelers.length === 0 ? (
              <p style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{t('travelersHint')}</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {form.travelers.map((trav, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1fr auto', gap: '0.5rem', alignItems: 'center' }}>
                    <input placeholder={t('travelerName')} value={trav.full_name}
                      onChange={e => setForm({ ...form, travelers: form.travelers.map((tv, ti) => ti === i ? { ...tv, full_name: e.target.value } : tv) })}
                      style={{ padding: '0.4rem 0.6rem', border: '1px solid var(--gray-200)', borderRadius: '0.375rem', fontSize: '0.8125rem' }} />
                    <input placeholder={t('travelerEmail')} type="email" value={trav.email}
                      onChange={e => setForm({ ...form, travelers: form.travelers.map((tv, ti) => ti === i ? { ...tv, email: e.target.value } : tv) })}
                      style={{ padding: '0.4rem 0.6rem', border: '1px solid var(--gray-200)', borderRadius: '0.375rem', fontSize: '0.8125rem' }} />
                    <input placeholder={t('travelerPhone')} value={trav.phone}
                      onChange={e => setForm({ ...form, travelers: form.travelers.map((tv, ti) => ti === i ? { ...tv, phone: e.target.value } : tv) })}
                      style={{ padding: '0.4rem 0.6rem', border: '1px solid var(--gray-200)', borderRadius: '0.375rem', fontSize: '0.8125rem' }} />
                    <button type="button" onClick={() => setForm({ ...form, travelers: form.travelers.filter((_, ti) => ti !== i) })}
                      style={{ background: 'none', border: 'none', color: 'var(--gray-400)', cursor: 'pointer', fontSize: '1rem' }}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
          )}

          <Textarea label={t('notes')} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
        </form>
      </Modal>
    </div>
  )
}

export default function BookingsPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <BookingsContent />
    </Suspense>
  )
}

export const dynamic = 'force-dynamic'
