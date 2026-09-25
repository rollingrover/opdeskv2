'use client'
import { BrandIcon } from '@/components/ui/BrandIcon'
import { useEffect, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { PageLoader } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { ChevronLeft, ChevronRight, BedDouble } from 'lucide-react'
import Link from 'next/link'

const DAYS_SHOWN = 14

function toISODate(d) { return d.toISOString().slice(0, 10) }
function addDays(date, n) { const d = new Date(date); d.setDate(d.getDate() + n); return d }

export default function LodgingCalendarPage() {
  const t = useTranslations('LodgingCalendar')
  const tCommon = useTranslations('Common')
  const tStatus = useTranslations('StatusBadge')
  const { company, needsCompany } = useAuth()
  const supabase = createClient()
  const [rooms, setRooms] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [rangeStart, setRangeStart] = useState(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d })

  const days = useMemo(() => Array.from({ length: DAYS_SHOWN }, (_, i) => addDays(rangeStart, i)), [rangeStart])
  const rangeEndISO = toISODate(addDays(rangeStart, DAYS_SHOWN))
  const rangeStartISO = toISODate(rangeStart)

  async function load() {
    if (!company) { setLoading(false); return }
    setLoading(true)
    const [r, b] = await Promise.all([
      supabase.from('rooms').select('id, name, room_type').eq('company_id', company.id).eq('active', true).order('name'),
      // Overlap check: a booking touches this window if it starts before
      // the window ends AND ends on/after the window starts.
      supabase.from('bookings').select('id, room_id, guest_name, start_date, end_date, status')
        .eq('company_id', company.id).not('room_id', 'is', null).neq('status', 'cancelled')
        .lte('start_date', rangeEndISO).gte('end_date', rangeStartISO),
    ])
    setRooms(r.data || [])
    setBookings(b.data || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [company, rangeStartISO])

  if (needsCompany) return <EmptyState icon={<BrandIcon name="companySetup" size={48} />} title={tCommon('needsCompanyTitle')} />
  if (loading) return <PageLoader />

  function bookingFor(roomId, dateISO) {
    return bookings.find(b => b.room_id === roomId && b.start_date <= dateISO && b.end_date >= dateISO)
  }

  const STATUS_COLOR = { confirmed: 'var(--teal, #0d9488)', pending: 'var(--gold)', completed: 'var(--gray-400)' }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('title')}</h1>
          <p className="page-subtitle">{t('subtitle')}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button className="btn btn-outline btn-sm" onClick={() => setRangeStart(d => addDays(d, -7))}><ChevronLeft size={15} /></button>
          <button className="btn btn-outline btn-sm" onClick={() => { const d = new Date(); d.setHours(0, 0, 0, 0); setRangeStart(d) }}>{t('today')}</button>
          <button className="btn btn-outline btn-sm" onClick={() => setRangeStart(d => addDays(d, 7))}><ChevronRight size={15} /></button>
        </div>
      </div>

      {rooms.length === 0 ? (
        <EmptyState icon={<BedDouble size={48} color="var(--gray-300)" />} title={t('noRoomsTitle')} description={t('noRoomsDesc')}
          action={<Link href="/lodging/rooms" className="btn btn-primary btn-sm">{t('addRooms')}</Link>} />
      ) : (
        <div className="card card-shadow" style={{ padding: 0, overflow: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 900 }}>
            <thead>
              <tr>
                <th style={{ position: 'sticky', left: 0, background: 'var(--cream)', zIndex: 2, padding: '0.625rem 0.875rem', textAlign: 'left', fontSize: '0.75rem', color: 'var(--gray-500)', borderBottom: '1px solid var(--gray-100)', minWidth: 160 }}>
                  {t('room')}
                </th>
                {days.map(d => {
                  const isToday = toISODate(d) === toISODate(new Date())
                  return (
                    <th key={d.toISOString()} style={{
                      padding: '0.5rem 0.375rem', textAlign: 'center', fontSize: '0.6875rem', fontWeight: 600, minWidth: 62,
                      color: isToday ? 'var(--navy)' : 'var(--gray-500)', background: isToday ? 'var(--cream)' : 'transparent',
                      borderBottom: '1px solid var(--gray-100)',
                    }}>
                      <div>{d.toLocaleDateString('en-ZA', { weekday: 'short' })}</div>
                      <div style={{ fontSize: '0.8125rem' }}>{d.getDate()}</div>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {rooms.map(room => (
                <tr key={room.id}>
                  <td style={{ position: 'sticky', left: 0, background: 'white', zIndex: 1, padding: '0.625rem 0.875rem', fontWeight: 600, color: 'var(--navy)', fontSize: '0.8125rem', borderBottom: '1px solid var(--gray-50)', whiteSpace: 'nowrap' }}>
                    {room.name}
                  </td>
                  {days.map(d => {
                    const dateISO = toISODate(d)
                    const b = bookingFor(room.id, dateISO)
                    const color = b ? (STATUS_COLOR[b.status] || 'var(--gray-400)') : null
                    const cell = (
                      <div style={{
                        height: 32, margin: '0.25rem', borderRadius: '0.25rem',
                        background: b ? color : 'var(--gray-50)', opacity: b ? 0.85 : 1,
                      }} />
                    )
                    return (
                      <td key={dateISO} style={{ padding: 0, borderBottom: '1px solid var(--gray-50)', textAlign: 'center' }}
                        title={b ? `${b.guest_name} — ${tStatus(b.status)}` : t('available')}>
                        {b ? <Link href={`/bookings?edit=${b.id}`}>{cell}</Link> : cell}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ display: 'flex', gap: '1.25rem', marginTop: '1rem', fontSize: '0.75rem', color: 'var(--gray-500)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><span style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--teal, #0d9488)', display: 'inline-block' }} /> {tStatus('confirmed')}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><span style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--gold)', display: 'inline-block' }} /> {tStatus('pending')}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><span style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--gray-50)', border: '1px solid var(--gray-100)', display: 'inline-block' }} /> {t('available')}</span>
      </div>
    </div>
  )
}

export const dynamic = 'force-dynamic'
