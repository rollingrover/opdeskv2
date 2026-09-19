'use client'
import { useEffect, useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { PageLoader } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { BrandIcon } from '@/components/ui/BrandIcon'

const LOCALE_MAP = { en: 'en-ZA', af: 'af-ZA', fr: 'fr-FR', pt: 'pt-PT', de: 'de-DE' }

export default function ReportsPage() {
  const t = useTranslations('MainReports')
  const tCommon = useTranslations('Common')
  const tStatus = useTranslations('StatusBadge')
  const locale = useLocale()
  const { company, needsCompany } = useAuth()
  const supabase = createClient()
  const [invoices, setInvoices] = useState([])
  const [bookings, setBookings] = useState([])
  const [rooms, setRooms] = useState([])
  const [roomBookings, setRoomBookings] = useState([])
  const [loading, setLoading] = useState(true)

  const dateLocale = LOCALE_MAP[locale] || 'en-ZA'

  async function load() {
    if (!company) { setLoading(false); return }
    setLoading(true)
    const isLodging = company.operator_type === 'lodge'
    const [inv, bk, rm, rb] = await Promise.all([
      supabase.from('invoices').select('total, amount_paid, status, created_at').eq('company_id', company.id),
      supabase.from('bookings').select('start_date, status, amount_total').eq('company_id', company.id),
      isLodging ? supabase.from('rooms').select('id').eq('company_id', company.id).eq('active', true).neq('status', 'maintenance') : Promise.resolve({ data: [] }),
      isLodging ? supabase.from('room_bookings').select('check_in, check_out, bookings!inner(status)').eq('company_id', company.id) : Promise.resolve({ data: [] }),
    ])
    setInvoices(inv.data || [])
    setBookings(bk.data || [])
    setRooms(rm.data || [])
    setRoomBookings(rb.data || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [company])

  if (needsCompany) return <EmptyState icon={<BrandIcon name="companySetup" size={48} />} title={tCommon('needsCompanyTitle')} />
  if (loading) return <PageLoader />

  const revenueByMonth = {}
  invoices.forEach(inv => {
    if (!inv.amount_paid || Number(inv.amount_paid) === 0) return
    const key = new Date(inv.created_at).toLocaleDateString(dateLocale, { month: 'short', year: 'numeric' })
    revenueByMonth[key] = (revenueByMonth[key] || 0) + Number(inv.amount_paid)
  })
  const revenueRows = Object.entries(revenueByMonth)

  const bookingsByMonth = {}
  bookings.forEach(b => {
    const key = new Date(b.start_date).toLocaleDateString(dateLocale, { month: 'short', year: 'numeric' })
    bookingsByMonth[key] = (bookingsByMonth[key] || 0) + 1
  })
  const bookingRows = Object.entries(bookingsByMonth)

  const totalInvoiced = invoices.reduce((s, i) => s + Number(i.total), 0)
  const totalPaid = invoices.reduce((s, i) => s + Number(i.amount_paid || 0), 0)
  const outstanding = totalInvoiced - totalPaid

  const statusCounts = {}
  bookings.forEach(b => { statusCounts[b.status] = (statusCounts[b.status] || 0) + 1 })

  // Occupancy trend, Lodging only — nights booked vs. available room-nights,
  // for each of the last 6 months. Two real fixes from the original
  // snapshot version: rooms currently under maintenance are excluded from
  // available inventory (they were never bookable capacity), and bookings
  // that were cancelled or a no-show are excluded from booked nights (the
  // room was actually free those nights, whatever the calendar hold said).
  // Still an estimate — nights are counted by date-range overlap, not a
  // precise per-night inventory ledger — but a materially more honest one,
  // and a trend is far more useful for a real decision than one snapshot.
  let occupancyTrend = null
  let occupancyPct = null
  if (company.operator_type === 'lodge' && rooms.length > 0) {
    const activeRoomBookings = roomBookings.filter(rb => !['cancelled', 'no_show'].includes(rb.bookings?.status))
    const months = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthStart = monthDate
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)
      const daysInMonth = monthEnd.getDate()
      const availableRoomNights = rooms.length * daysInMonth
      let bookedNights = 0
      activeRoomBookings.forEach(rb => {
        const checkIn = new Date(rb.check_in)
        const checkOut = new Date(rb.check_out)
        const overlapStart = checkIn > monthStart ? checkIn : monthStart
        const overlapEnd = checkOut < monthEnd ? checkOut : monthEnd
        const nights = Math.max(0, Math.round((overlapEnd - overlapStart) / 86400000))
        bookedNights += nights
      })
      const pct = availableRoomNights > 0 ? Math.round((bookedNights / availableRoomNights) * 100) : 0
      months.push({ label: monthDate.toLocaleDateString(dateLocale, { month: 'short', year: 'numeric' }), pct })
    }
    occupancyTrend = months
    occupancyPct = months[months.length - 1].pct
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('title')}</h1>
          <p className="page-subtitle">{t('subtitle')}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${occupancyPct !== null ? 4 : 3}, 1fr)`, gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card card-shadow">
          <div style={{ color: 'var(--gray-500)', fontSize: '0.75rem', textTransform: 'uppercase' }}>{t('totalRevenueReceived')}</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--navy)' }}>{company.currency} {totalPaid.toLocaleString()}</div>
        </div>
        <div className="card card-shadow">
          <div style={{ color: 'var(--gray-500)', fontSize: '0.75rem', textTransform: 'uppercase' }}>{t('outstandingBalance')}</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: outstanding > 0 ? '#ef4444' : 'var(--teal)' }}>{company.currency} {outstanding.toLocaleString()}</div>
        </div>
        <div className="card card-shadow">
          <div style={{ color: 'var(--gray-500)', fontSize: '0.75rem', textTransform: 'uppercase' }}>{t('totalBookings')}</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--navy)' }}>{bookings.length}</div>
        </div>
        {occupancyPct !== null && (
          <div className="card card-shadow">
            <div style={{ color: 'var(--gray-500)', fontSize: '0.75rem', textTransform: 'uppercase' }}>{t('occupancyLatestMonth')}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--navy)' }}>{occupancyPct}%</div>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        <div className="card card-shadow" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--gray-100)' }}><h3 style={{ margin: 0, fontSize: '0.9375rem', color: 'var(--navy)' }}>{t('revenueByMonth')}</h3></div>
          {revenueRows.length === 0 ? (
            <div style={{ padding: '1.5rem', color: 'var(--gray-400)', textAlign: 'center' }}>{t('noPaymentsYet')}</div>
          ) : (
            <table className="table">
              <thead><tr><th>{t('colMonth')}</th><th style={{ textAlign: 'right' }}>{t('colReceived')}</th></tr></thead>
              <tbody>
                {revenueRows.map(([month, amount]) => (
                  <tr key={month}>
                    <td style={{ fontWeight: 600, color: 'var(--navy)' }}>{month}</td>
                    <td style={{ textAlign: 'right', color: 'var(--teal)', fontWeight: 600 }}>{company.currency} {amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card card-shadow" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--gray-100)' }}><h3 style={{ margin: 0, fontSize: '0.9375rem', color: 'var(--navy)' }}>{t('bookingsByMonth')}</h3></div>
          {bookingRows.length === 0 ? (
            <div style={{ padding: '1.5rem', color: 'var(--gray-400)', textAlign: 'center' }}>{t('noBookingsYet')}</div>
          ) : (
            <table className="table">
              <thead><tr><th>{t('colMonth')}</th><th style={{ textAlign: 'right' }}>{t('colBookings')}</th></tr></thead>
              <tbody>
                {bookingRows.map(([month, count]) => (
                  <tr key={month}>
                    <td style={{ fontWeight: 600, color: 'var(--navy)' }}>{month}</td>
                    <td style={{ textAlign: 'right', color: 'var(--navy)', fontWeight: 600 }}>{count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {occupancyTrend && (
        <div className="card card-shadow" style={{ marginTop: '1.25rem' }}>
          <h3 style={{ margin: '0 0 0.25rem', fontSize: '0.9375rem', color: 'var(--navy)' }}>{t('occupancyTrend')}</h3>
          <p style={{ margin: '0 0 1rem', fontSize: '0.75rem', color: 'var(--gray-400)' }}>
            {t('occupancyFootnote')}
          </p>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', height: 140 }}>
            {occupancyTrend.map(m => (
              <div key={m.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy)' }}>{m.pct}%</div>
                <div style={{ width: '100%', height: 100, display: 'flex', alignItems: 'flex-end' }}>
                  <div style={{ width: '100%', height: `${Math.max(m.pct, 2)}%`, background: 'var(--gold)', borderRadius: '0.25rem 0.25rem 0 0' }} />
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--gray-500)' }}>{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card card-shadow" style={{ marginTop: '1.25rem' }}>
        <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.9375rem', color: 'var(--navy)' }}>{t('statusBreakdown')}</h3>
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          {Object.entries(statusCounts).map(([status, count]) => (
            <div key={status}>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy)' }}>{count}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{tStatus(status)}</div>
            </div>
          ))}
          {Object.keys(statusCounts).length === 0 && <p style={{ color: 'var(--gray-400)', margin: 0 }}>{t('noBookingsYet')}</p>}
        </div>
      </div>
    </div>
  )
}

export const dynamic = 'force-dynamic'
