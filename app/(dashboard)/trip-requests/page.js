'use client'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { PageLoader } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { useToast, ToastContainer } from '@/components/ui/Toast'
import { BrandIcon } from '@/components/ui/BrandIcon'
import { Compass, Mail, Phone, CalendarPlus, Lock, Users, MapPin, ExternalLink } from 'lucide-react'

// Trip requests: travellers on ZAtours / Route22 describe their trip once;
// up to 3 paying members claim it. Contact details are released only on
// claim (enforced by the dir_* database functions, not just this page).
const STATUS_COLORS = { claimed: '#3b82f6', replied: '#f59e0b', booked: '#22c55e', lost: '#9ca3af' }

export default function TripRequestsPage() {
  const t = useTranslations('TripRequests')
  const tCommon = useTranslations('Common')
  const { company, needsCompany } = useAuth()
  const supabase = createClient()
  const toast = useToast()
  const router = useRouter()
  const [tab, setTab] = useState('open')
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState([])
  const [mine, setMine] = useState([])
  const [busy, setBusy] = useState(null)

  async function fetchAll() {
    return Promise.all([supabase.rpc('dir_open_trip_requests'), supabase.rpc('dir_my_trip_requests')])
  }
  function apply([o, m]) {
    if (o.error) toast.error(o.error.message)
    setOpen(o.data || [])
    setMine(m.data || [])
    setLoading(false)
  }
  async function load() { apply(await fetchAll()) }
  useEffect(() => {
    if (!company) return
    let alive = true
    fetchAll().then(r => { if (alive) apply(r) })
    return () => { alive = false }
  }, [company]) // eslint-disable-line react-hooks/exhaustive-deps

  const canClaim = open[0]?.can_claim ?? false
  const fmt = d => (d ? new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '')
  const when = r => (r.date_from ? `${fmt(r.date_from)}${r.date_to ? ` – ${fmt(r.date_to)}` : ''}` : '') + (r.flexible ? ` (${t('flexible')})` : '') || t('noDates')
  const who = r => t('who', { adults: r.adults, children: r.children })

  async function claim(r) {
    setBusy(r.id)
    const { error } = await supabase.rpc('dir_claim_trip_request', { p_request: r.id })
    setBusy(null)
    if (error) { toast.error(error.message); return }
    toast.success(t('claimed'))
    await load()
    setTab('mine')
  }

  async function setStatus(r, status) {
    setBusy(r.id)
    const { error } = await supabase.from('dir_trip_request_claims').update({ status }).eq('request_id', r.id).eq('company_id', company.id)
    setBusy(null)
    if (error) { toast.error(error.message); return }
    load()
  }

  async function convert(r) {
    setBusy(r.id)
    const { data: types } = await supabase.from('booking_types').select('slug').eq('company_id', company.id).eq('active', true).order('sort_order').limit(1)
    const { data: booking, error } = await supabase.from('bookings').insert([{
      company_id: company.id, booking_ref: 'BK-' + Date.now().toString(36).toUpperCase(),
      booking_type: types?.[0]?.slug || 'tour', status: 'pending', source: 'directory',
      start_date: r.date_from || new Date().toISOString().slice(0, 10), end_date: r.date_to || r.date_from || null,
      guest_count: (r.adults || 1) + (r.children || 0), guest_name: r.name, guest_email: r.email, guest_phone: r.phone || null,
      currency: company.currency || 'ZAR', unit_price: 0, amount_total: 0, amount_paid: 0,
      notes: [t('fromTripRequest'), r.area && `${t('where')}: ${r.area}`, r.message].filter(Boolean).join('\n\n'),
    }]).select('id').maybeSingle()
    if (error || !booking) { setBusy(null); toast.error(error?.message || t('convertFailed')); return }
    await supabase.from('dir_trip_request_claims').update({ status: 'booked', booking_id: booking.id }).eq('request_id', r.id).eq('company_id', company.id)
    setBusy(null)
    router.push(`/bookings?edit=${booking.id}`)
  }

  if (needsCompany) return <EmptyState icon={<BrandIcon name="companySetup" size={48} />} title={tCommon('needsCompanyTitle')} />
  if (loading) return <PageLoader />

  const Details = ({ r }) => (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.875rem', color: 'var(--navy)' }}>
      <span>📅 {when(r)}</span>
      <span><Users size={14} style={{ verticalAlign: '-2px' }} /> {who(r)}</span>
      {r.area && <span><MapPin size={14} style={{ verticalAlign: '-2px' }} /> {r.area}</span>}
      {r.budget && <span>💰 {t(`budget_${r.budget}`)}</span>}
    </div>
  )

  return (
    <div>
      <ToastContainer toasts={toast.toasts} remove={toast.remove} />
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('title')}</h1>
          <p className="page-subtitle">{t('subtitle')}</p>
        </div>
      </div>

      {!canClaim && open.length > 0 && (
        <div className="card card-shadow" style={{ marginBottom: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', borderLeft: '4px solid var(--gold)' }}>
          <Lock size={18} color="var(--gold)" />
          <span style={{ flex: 1, fontSize: '0.9rem' }}>{t('upgradeBanner', { count: open.length })}</span>
          <Link href="/settings/billing" className="btn btn-primary btn-sm">{t('upgradeCta')}</Link>
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <button className={`btn btn-sm ${tab === 'open' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab('open')}>{t('tabOpen', { count: open.filter(r => !r.already_claimed && r.slots_left > 0).length })}</button>
        <button className={`btn btn-sm ${tab === 'mine' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab('mine')}>{t('tabMine', { count: mine.length })}</button>
      </div>

      {tab === 'open' && (
        open.length === 0 ? (
          <div className="card card-shadow"><EmptyState icon={<Compass size={40} color="var(--gray-400)" />} title={t('emptyOpen')} description={t('emptyOpenDesc')} /></div>
        ) : (
          <div style={{ display: 'grid', gap: '0.875rem' }}>
            {open.map(r => (
              <div key={r.id} className="card card-shadow" style={{ opacity: busy === r.id ? 0.6 : 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                  <p style={{ margin: 0, fontWeight: 700, color: 'var(--navy)' }}>{t('fromTraveller', { name: r.first_name })} <span style={{ fontWeight: 400, color: 'var(--gray-500)', fontSize: '0.8125rem' }}>· {fmt(r.created_at)} · {r.site === 'route22' ? 'Route22' : 'ZAtours'}</span></p>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: r.slots_left > 0 ? 'var(--navy)' : 'var(--gray-400)' }}>{t('slotsLeft', { count: r.slots_left })}</span>
                </div>
                <Details r={r} />
                {r.categories?.length > 0 && <p style={{ margin: '0.5rem 0 0', fontSize: '0.8125rem', color: 'var(--gray-500)' }}>{t('interests')}: {r.categories.join(', ')}</p>}
                {r.message && <p style={{ margin: '0.625rem 0 0', fontSize: '0.875rem', whiteSpace: 'pre-wrap' }}>{r.message}</p>}
                <div style={{ marginTop: '0.875rem' }}>
                  {r.already_claimed ? (
                    <button className="btn btn-outline btn-sm" onClick={() => setTab('mine')}>{t('alreadyClaimed')}</button>
                  ) : r.slots_left <= 0 ? (
                    <span style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>{t('full')}</span>
                  ) : canClaim ? (
                    <button className="btn btn-primary btn-sm" disabled={busy === r.id} onClick={() => claim(r)}>{t('claim')}</button>
                  ) : (
                    <Link href="/settings/billing" className="btn btn-outline btn-sm"><Lock size={14} /> {t('upgradeToClaim')}</Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {tab === 'mine' && (
        mine.length === 0 ? (
          <div className="card card-shadow"><EmptyState icon={<Compass size={40} color="var(--gray-400)" />} title={t('emptyMine')} /></div>
        ) : (
          <div style={{ display: 'grid', gap: '0.875rem' }}>
            {mine.map(r => (
              <div key={r.id} className="card card-shadow" style={{ opacity: busy === r.id ? 0.6 : 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                  <p style={{ margin: 0, fontWeight: 700, color: 'var(--navy)' }}>{r.name} <span style={{ fontSize: '0.75rem', fontWeight: 700, color: STATUS_COLORS[r.claim_status], textTransform: 'uppercase', marginLeft: 6 }}>{t(`status_${r.claim_status}`)}</span></p>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>{t('claimedOn', { date: fmt(r.claimed_at) })}</span>
                </div>
                <p style={{ margin: '0 0 0.5rem', fontSize: '0.875rem' }}>
                  <a href={`mailto:${r.email}`}>{r.email}</a>{r.phone && <> · <a href={`tel:${r.phone}`}>{r.phone}</a> · <a href={`https://wa.me/${r.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer">WhatsApp</a></>}
                  {r.locale && r.locale !== 'en' && <span style={{ color: 'var(--gray-500)' }}> · {t('language')}: {r.locale.toUpperCase()}</span>}
                </p>
                <Details r={r} />
                {r.message && <p style={{ margin: '0.625rem 0 0', fontSize: '0.875rem', whiteSpace: 'pre-wrap' }}>{r.message}</p>}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.875rem' }}>
                  <a className="btn btn-outline btn-sm" href={`mailto:${r.email}?subject=${encodeURIComponent(t('replySubject', { company: company.name }))}`}
                    onClick={() => r.claim_status === 'claimed' && setStatus(r, 'replied')}><Mail size={14} /> {t('reply')}</a>
                  {r.phone && <a className="btn btn-outline btn-sm" href={`tel:${r.phone}`}><Phone size={14} /> {t('call')}</a>}
                  {r.booking_id ? (
                    <button className="btn btn-outline btn-sm" onClick={() => router.push(`/bookings?edit=${r.booking_id}`)}><ExternalLink size={14} /> {t('openBooking')}</button>
                  ) : (
                    <button className="btn btn-primary btn-sm" disabled={busy === r.id} onClick={() => convert(r)}><CalendarPlus size={14} /> {t('convert')}</button>
                  )}
                  {r.claim_status !== 'lost' && r.claim_status !== 'booked' && (
                    <button className="btn btn-outline btn-sm" disabled={busy === r.id} onClick={() => setStatus(r, 'lost')}>{t('markLost')}</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}

export const dynamic = 'force-dynamic'
