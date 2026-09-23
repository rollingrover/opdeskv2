'use client'
import { BrandIcon } from '@/components/ui/BrandIcon'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { PageLoader } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { Modal } from '@/components/ui/Modal'
import { Input, Textarea } from '@/components/ui/FormField'
import { useToast, ToastContainer } from '@/components/ui/Toast'
import { StatusBadge } from '@/components/ui/Badge'
import { Search, Users, Repeat } from 'lucide-react'

export default function GuestsPage() {
  const t = useTranslations('Guests')
  const tCommon = useTranslations('Common')
  const { company, needsCompany } = useAuth()
  const supabase = createClient()
  const toast = useToast()
  const [guests, setGuests] = useState([])
  const [bookingsByGuest, setBookingsByGuest] = useState({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [detailGuest, setDetailGuest] = useState(null)
  const [notesDraft, setNotesDraft] = useState('')
  const [saving, setSaving] = useState(false)

  async function load() {
    if (!company) { setLoading(false); return }
    setLoading(true)
    const [g, b] = await Promise.all([
      supabase.from('guests').select('*').eq('company_id', company.id).order('full_name'),
      supabase.from('bookings').select('id, guest_id, booking_ref, booking_type, start_date, status, amount_total').eq('company_id', company.id).not('guest_id', 'is', null).order('start_date', { ascending: false }),
    ])
    setGuests(g.data || [])
    const byGuest = {}
    for (const bk of b.data || []) {
      if (!byGuest[bk.guest_id]) byGuest[bk.guest_id] = []
      byGuest[bk.guest_id].push(bk)
    }
    setBookingsByGuest(byGuest)
    setLoading(false)
  }
  useEffect(() => { load() }, [company])

  if (needsCompany) return <EmptyState icon={<BrandIcon name="companySetup" size={48} />} title={tCommon('needsCompanyTitle')} />
  if (loading) return <PageLoader />

  const filtered = guests.filter(g => {
    if (!search) return true
    const q = search.toLowerCase()
    return g.full_name.toLowerCase().includes(q) || (g.email || '').toLowerCase().includes(q) || (g.phone || '').includes(q)
  })

  function openDetail(guest) {
    setDetailGuest(guest)
    setNotesDraft(guest.notes || '')
  }

  async function saveNotes() {
    setSaving(true)
    const { error } = await supabase.from('guests').update({ notes: notesDraft, updated_at: new Date().toISOString() }).eq('id', detailGuest.id)
    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success(t('notesSaved'))
    setDetailGuest(null)
    load()
  }

  const detailBookings = detailGuest ? (bookingsByGuest[detailGuest.id] || []) : []

  return (
    <div>
      <ToastContainer toasts={toast.toasts} remove={toast.remove} />
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('title')}</h1>
          <p className="page-subtitle">{t('subtitle')}</p>
        </div>
      </div>

      <div style={{ position: 'relative', marginBottom: '1.25rem', maxWidth: 360 }}>
        <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('searchPlaceholder')}
          style={{ width: '100%', boxSizing: 'border-box', padding: '0.5rem 0.75rem 0.5rem 2.25rem', border: '1px solid var(--gray-200)', borderRadius: '0.5rem', fontSize: '0.875rem' }} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<Users size={40} color="var(--gray-300)" />} title={t('noGuestsTitle')} description={t('noGuestsDesc')} />
      ) : (
        <div className="card card-shadow" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table">
            <thead>
              <tr>
                <th>{t('colName')}</th><th>{t('colContact')}</th>
                <th>{t('colBookings')}</th><th>{t('colLastBooking')}</th><th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(g => {
                const gBookings = bookingsByGuest[g.id] || []
                const isRepeat = gBookings.length > 1
                return (
                  <tr key={g.id} onClick={() => openDetail(g)} style={{ cursor: 'pointer' }}>
                    <td style={{ fontWeight: 600, color: 'var(--navy)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      {g.full_name} {isRepeat && <Repeat size={13} color="var(--gold)" title={t('repeatGuest')} />}
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>
                      {g.email && <div>{g.email}</div>}
                      {g.phone && <div>{g.phone}</div>}
                      {!g.email && !g.phone && '—'}
                    </td>
                    <td>{gBookings.length}</td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>
                      {gBookings[0] ? new Date(gBookings[0].start_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td style={{ textAlign: 'right', color: 'var(--gray-400)', fontSize: '0.75rem' }}>{t('viewHistory')} →</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={!!detailGuest} onClose={() => setDetailGuest(null)} title={detailGuest?.full_name} size="lg"
        footer={<>
          <button className="btn btn-outline" onClick={() => setDetailGuest(null)}>{t('close')}</button>
          <button className="btn btn-primary" disabled={saving} onClick={saveNotes}>{saving ? t('saving') : t('saveNotes')}</button>
        </>}>
        {detailGuest && (
          <div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', marginBottom: '1rem' }}>
              {detailGuest.email && <span>{detailGuest.email}</span>}{detailGuest.email && detailGuest.phone && ' · '}{detailGuest.phone}
            </p>
            <Textarea label={t('notesLabel')} rows={3} placeholder={t('notesPlaceholder')} value={notesDraft} onChange={e => setNotesDraft(e.target.value)} />

            <h3 style={{ fontSize: '0.875rem', color: 'var(--navy)', margin: '1.25rem 0 0.75rem' }}>{t('bookingHistory')} ({detailBookings.length})</h3>
            {detailBookings.length === 0 ? (
              <p style={{ fontSize: '0.8125rem', color: 'var(--gray-400)' }}>{t('noBookingsYet')}</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {detailBookings.map(b => (
                  <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', background: 'var(--cream)', borderRadius: '0.5rem' }}>
                    <div>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--gray-500)' }}>{b.booking_ref}</span>
                      <span style={{ marginLeft: '0.5rem', fontSize: '0.8125rem' }}>{new Date(b.start_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <StatusBadge status={b.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export const dynamic = 'force-dynamic'
