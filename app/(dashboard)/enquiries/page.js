'use client'
import { useEffect, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { PageLoader } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { useToast, ToastContainer } from '@/components/ui/Toast'
import { BrandIcon } from '@/components/ui/BrandIcon'
import { Inbox, Mail, CalendarPlus, Check, X, ExternalLink } from 'lucide-react'

// Directory enquiries: guest enquiries sent from the operator's ZAtours /
// Route22 listing (dir_enquiries, company-scoped by RLS). This is what makes
// "verified & bookable" true — enquiries land here, and one click turns an
// enquiry into a pending booking.
const ZATOURS = (process.env.NEXT_PUBLIC_ZATOURS_URL || 'https://www.zatours.co.za').replace(/\/+$/, '')
const STATUS_COLORS = { new: '#3b82f6', replied: '#f59e0b', converted: '#22c55e', closed: '#9ca3af', spam: '#ef4444' }

export default function DirectoryEnquiriesPage() {
  const t = useTranslations('DirectoryEnquiries')
  const tCommon = useTranslations('Common')
  const { company, needsCompany } = useAuth()
  const supabase = createClient()
  const toast = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState([])
  const [listings, setListings] = useState({})
  const [filter, setFilter] = useState('open')
  const [busy, setBusy] = useState(null)

  async function fetchAll() {
    return Promise.all([
      supabase.from('dir_enquiries').select('*').eq('company_id', company.id).order('created_at', { ascending: false }),
      supabase.from('dir_listings').select('id, name, slug, sites').eq('company_id', company.id),
    ])
  }
  function apply([{ data: enq, error }, { data: ls }]) {
    if (error) toast.error(error.message)
    setRows(enq || [])
    setListings(Object.fromEntries((ls || []).map(l => [l.id, l])))
    setLoading(false)
  }
  async function load() { apply(await fetchAll()) }
  useEffect(() => {
    if (!company) return
    let alive = true
    fetchAll().then(r => { if (alive) apply(r) })
    return () => { alive = false }
  }, [company]) // eslint-disable-line react-hooks/exhaustive-deps

  const shown = useMemo(() => rows.filter(r =>
    filter === 'all' ? true : filter === 'open' ? ['new', 'replied'].includes(r.status) : r.status === filter
  ), [rows, filter])

  async function setStatus(r, status) {
    setBusy(r.id)
    const { error } = await supabase.from('dir_enquiries').update({ status }).eq('id', r.id)
    setBusy(null)
    if (error) { toast.error(error.message); return }
    toast.success(t('updated'))
    load()
  }

  async function convert(r) {
    setBusy(r.id)
    const { data: types } = await supabase.from('booking_types').select('slug').eq('company_id', company.id)
      .eq('active', true).order('sort_order').limit(1)
    const guests = r.guests || 1
    const { data: booking, error } = await supabase.from('bookings').insert([{
      company_id: company.id, booking_ref: 'BK-' + Date.now().toString(36).toUpperCase(),
      booking_type: types?.[0]?.slug || 'tour', status: 'pending', source: 'directory',
      start_date: r.date_from || new Date().toISOString().slice(0, 10), end_date: r.date_to || r.date_from || null,
      guest_count: guests, guest_name: r.name, guest_email: r.email, guest_phone: r.phone || null,
      currency: company.currency || 'ZAR', unit_price: 0, amount_total: 0, amount_paid: 0,
      notes: [t('fromDirectory'), r.message].filter(Boolean).join('\n\n'),
    }]).select('id').maybeSingle()
    if (error || !booking) { setBusy(null); toast.error(error?.message || t('convertFailed')); return }
    await supabase.from('dir_enquiries').update({ status: 'converted', booking_id: booking.id }).eq('id', r.id)
    setBusy(null)
    router.push(`/bookings?edit=${booking.id}`)
  }

  if (needsCompany) return <EmptyState icon={<BrandIcon name="companySetup" size={48} />} title={tCommon('needsCompanyTitle')} />
  if (loading) return <PageLoader />

  const fmt = d => d ? new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : ''

  return (
    <div>
      <ToastContainer toasts={toast.toasts} remove={toast.remove} />
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('title')}</h1>
          <p className="page-subtitle">{t('subtitle')}</p>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="card card-shadow">
          <EmptyState icon={<Inbox size={40} color="var(--gray-400)" />} title={t('emptyTitle')}
            description={Object.keys(listings).length ? t('emptyDescListed') : t('emptyDescUnlisted')} />
          {!Object.keys(listings).length && (
            <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
              <a href={`${ZATOURS}/list-your-business?plan=opdesk`} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                <ExternalLink size={14} /> {t('getListed')}
              </a>
            </div>
          )}
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            {['open', 'converted', 'closed', 'spam', 'all'].map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline'}`}>
                {t(`filter_${f}`)}
              </button>
            ))}
          </div>
          {shown.length === 0 && <p style={{ color: 'var(--gray-500)' }}>{t('noneInFilter')}</p>}
          <div style={{ display: 'grid', gap: '0.875rem' }}>
            {shown.map(r => (
              <div key={r.id} className="card card-shadow" style={{ opacity: busy === r.id ? 0.6 : 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, color: 'var(--navy)' }}>
                      {r.name}{' '}
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: STATUS_COLORS[r.status], textTransform: 'uppercase', marginLeft: 6 }}>{t(`status_${r.status}`)}</span>
                    </p>
                    <p style={{ margin: '0.125rem 0 0', fontSize: '0.8125rem', color: 'var(--gray-500)' }}>
                      {r.email}{r.phone ? ` · ${r.phone}` : ''} · {listings[r.listing_id]?.name || ''} · {r.site === 'route22' ? 'Route22' : 'ZAtours'} · {fmt(r.created_at)}
                    </p>
                    {(r.date_from || r.guests) && (
                      <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: 'var(--navy)' }}>
                        {r.date_from && <>{fmt(r.date_from)}{r.date_to ? ` – ${fmt(r.date_to)}` : ''}</>}
                        {r.guests ? ` · ${t('guests', { count: r.guests })}` : ''}
                      </p>
                    )}
                  </div>
                </div>
                {r.message && <p style={{ margin: '0.75rem 0 0', fontSize: '0.875rem', whiteSpace: 'pre-wrap' }}>{r.message}</p>}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.875rem' }}>
                  <a className="btn btn-outline btn-sm" href={`mailto:${r.email}?subject=${encodeURIComponent(t('replySubject', { company: company.name }))}`}
                    onClick={() => r.status === 'new' && setStatus(r, 'replied')}>
                    <Mail size={14} /> {t('reply')}
                  </a>
                  {r.booking_id ? (
                    <button className="btn btn-outline btn-sm" onClick={() => router.push(`/bookings?edit=${r.booking_id}`)}>
                      <ExternalLink size={14} /> {t('openBooking')}
                    </button>
                  ) : (
                    <button className="btn btn-primary btn-sm" disabled={busy === r.id} onClick={() => convert(r)}>
                      <CalendarPlus size={14} /> {t('convert')}
                    </button>
                  )}
                  {['new', 'replied'].includes(r.status) && (
                    <>
                      <button className="btn btn-outline btn-sm" disabled={busy === r.id} onClick={() => setStatus(r, 'closed')}><Check size={14} /> {t('close')}</button>
                      <button className="btn btn-outline btn-sm" disabled={busy === r.id} onClick={() => setStatus(r, 'spam')}><X size={14} /> {t('spam')}</button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export const dynamic = 'force-dynamic'
