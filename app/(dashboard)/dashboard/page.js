'use client'
import { useEffect, useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { PageLoader } from '@/components/ui/Spinner'
import { StatusBadge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { BrandIcon } from '@/components/ui/BrandIcon'
import {
  BookOpen, Users, DollarSign, TrendingUp, Calendar,
  AlertTriangle, CheckCircle, Clock, ArrowRight, Hotel, MapPin, Plus
} from 'lucide-react'
import Link from 'next/link'

function StatCard({ icon: Icon, label, value, sub, color = '#1B8A8F' }) {
  return (
    <div className="stat-card card-shadow">
      <div className="stat-icon" style={{ background: color + '15' }}>
        <Icon size={22} color={color} />
      </div>
      <div>
        <p style={{ margin:0, fontSize:'0.75rem', fontWeight:600, color:'var(--gray-400)', textTransform:'uppercase', letterSpacing:'0.04em' }}>{label}</p>
        <p style={{ margin:'0.125rem 0 0', fontSize:'1.5rem', fontWeight:800, color:'var(--navy)', lineHeight:1 }}>{value}</p>
        {sub && <p style={{ margin:'0.125rem 0 0', fontSize:'0.75rem', color:'var(--gray-400)' }}>{sub}</p>}
      </div>
    </div>
  )
}

function CertAlert({ cert, t }) {
  const daysLeft = Math.ceil((new Date(cert.expiry_date) - new Date()) / 86400000)
  const isExpired = daysLeft < 0
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.625rem 0', borderBottom:'1px solid var(--gray-100)' }}>
      <div style={{ width:32, height:32, borderRadius:'50%', background: isExpired ? '#fee2e2' : '#fef9c3', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <AlertTriangle size={14} color={ isExpired ? 'var(--danger)' : 'var(--warning)' } />
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ margin:0, fontSize:'0.8125rem', fontWeight:600, color:'var(--navy)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {cert.staff?.full_name} — {cert.cert_type?.replace(/_/g,' ')}
        </p>
        <p style={{ margin:0, fontSize:'0.75rem', color:'var(--gray-400)' }}>
          {isExpired ? t('expired', { days: Math.abs(daysLeft) }) : t('expiresIn', { days: daysLeft })}
        </p>
      </div>
      <StatusBadge status={isExpired ? 'expired' : 'expiring_soon'} />
    </div>
  )
}

const LOCALE_MAP = { en: 'en-ZA', af: 'af-ZA', fr: 'fr-FR', pt: 'pt-PT', de: 'de-DE' }

export default function DashboardPage() {
  const t = useTranslations('DashboardHome')
  const locale = useLocale()
  const router = useRouter()
  const { company, profileError, needsCompany, reload } = useAuth()
  const supabase = createClient()
  const [stats, setStats]     = useState({ totalBookings:0, confirmedToday:0, totalStaff:0, occupiedRooms:0, totalRooms:0 })
  const [bookings, setBookings] = useState([])
  const [certAlerts, setCertAlerts] = useState([])
  const [locations, setLocations] = useState([])
  const [switching, setSwitching] = useState(false)
  const [loading, setLoading] = useState(true)

  // Sibling locations under the same Enterprise org, same idea as the
  // sidebar switcher — surfaced here too since this is where an owner
  // juggling several sites is most likely to want to jump between them.
  useEffect(() => {
    if (!company?.organization_id) { setLocations([]); return }
    let cancelled = false
    supabase.from('companies').select('id, name, operator_type').eq('organization_id', company.organization_id).order('name')
      .then(({ data }) => { if (!cancelled) setLocations(data || []) })
    return () => { cancelled = true }
  }, [company?.organization_id])

  async function switchLocation(id) {
    if (id === company.id || switching) return
    setSwitching(true)
    const { error } = await supabase.rpc('switch_active_company', { p_company_id: id })
    setSwitching(false)
    if (error) { alert(error.message); return }
    await reload()
    router.refresh()
  }

  useEffect(() => {
    if (!company) { setLoading(false); return }
    setLoading(true)
    async function load() {
      const today = new Date().toISOString().split('T')[0]
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]

      const [
        { count: totalBookings },
        { count: confirmedToday },
        { count: totalStaff },
        { data: recentBookings },
        { data: expiring },
        { data: rooms },
      ] = await Promise.all([
        supabase.from('bookings').select('*', { count:'exact', head:true }).eq('company_id', company.id).gte('created_at', monthStart),
        supabase.from('bookings').select('*', { count:'exact', head:true }).eq('company_id', company.id).eq('start_date', today),
        supabase.from('staff').select('*', { count:'exact', head:true }).eq('company_id', company.id).eq('status','active'),
        supabase.from('bookings').select('*, staff!guide_id(full_name)').eq('company_id', company.id).order('created_at', { ascending:false }).limit(6),
        supabase.from('staff_certifications').select('*, staff(full_name)').eq('company_id', company.id).lt('expiry_date', new Date(Date.now() + 60*24*60*60*1000).toISOString().split('T')[0]).gte('expiry_date', new Date(Date.now() - 30*24*60*60*1000).toISOString().split('T')[0]).order('expiry_date'),
        supabase.from('rooms').select('*').eq('company_id', company.id),
      ])

      const occupiedRooms = rooms?.filter(r => r.status === 'occupied').length || 0
      const totalRooms = rooms?.length || 0

      setStats({ totalBookings, confirmedToday, totalStaff, occupiedRooms, totalRooms })
      setBookings(recentBookings || [])
      setCertAlerts(expiring || [])
      setLoading(false)
    }
    load()
  }, [company, supabase])

  if (loading) return <PageLoader />

  if (profileError) {
    return (
      <EmptyState icon={<BrandIcon name="errorIcon" size={48} />} title={t('profileErrorTitle')}
        description={t('profileErrorDesc')}
        action={<Link href="/auth/login" className="btn btn-primary btn-sm">{t('backToLogin')}</Link>} />
    )
  }

  if (needsCompany || !company) {
    return (
      <EmptyState icon={<BrandIcon name="companySetup" size={48} />} title={t('needsCompanyTitle')}
        description={t('needsCompanyDesc')}
        action={<Link href="/settings" className="btn btn-primary btn-sm">{t('goToSettings')}</Link>} />
    )
  }

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return t('greetingMorning')
    if (h < 17) return t('greetingAfternoon')
    return t('greetingEvening')
  }

  const dateLocale = LOCALE_MAP[locale] || 'en-ZA'

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom:'1.75rem' }}>
        <h1 style={{ margin:0, fontSize:'1.5rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
          {greeting()}, {company.name} <BrandIcon name="greeting" size={28} />
        </h1>
        <p style={{ margin:'0.25rem 0 0', color:'var(--gray-400)', fontSize:'0.875rem' }}>
          {t('subtitle', { date: new Date().toLocaleDateString(dateLocale, { weekday:'long', day:'numeric', month:'long' }) })}
        </p>
        {locations.length > 1 && (
          <div style={{ display:'flex', gap:'0.5rem', marginTop:'0.75rem', flexWrap:'wrap' }}>
            {locations.map(loc => (
              <button key={loc.id} onClick={() => switchLocation(loc.id)} disabled={switching}
                style={{
                  display:'flex', alignItems:'center', gap:'0.375rem', padding:'0.375rem 0.75rem', borderRadius:'999px',
                  border: loc.id === company.id ? '1px solid var(--gold)' : '1px solid var(--gray-200)',
                  background: loc.id === company.id ? 'var(--gold)15' : 'white',
                  color: loc.id === company.id ? 'var(--navy)' : 'var(--gray-500)',
                  fontSize:'0.8125rem', fontWeight:600, cursor: switching ? 'default' : 'pointer',
                }}>
                <MapPin size={13} /> {loc.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:'1rem', marginBottom:'1.75rem' }}>
        <StatCard icon={BookOpen}    label={t('statsBookings')} value={stats.totalBookings || 0}  sub={t('allTime')} color="var(--teal)" />
        <StatCard icon={Calendar}    label={t('statsCheckins')}     value={stats.confirmedToday || 0} sub={t('confirmed')} color="var(--orange)" />
        <StatCard icon={Users}       label={t('statsStaff')}        value={stats.totalStaff || 0}     sub={t('employees')} color="var(--navy)" />
        {stats.totalRooms > 0 && (
          <StatCard icon={Hotel} label={t('statsRooms')} value={`${stats.occupiedRooms}/${stats.totalRooms}`} sub={t('tonight')} color="var(--gold)" />
        )}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 380px', gap:'1.25rem', alignItems:'start' }}>
        {/* Recent Bookings */}
        <div className="card card-shadow">
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem' }}>
            <h2 style={{ margin:0, fontSize:'1rem' }}>{t('recentBookings')}</h2>
            <Link href="/bookings" className="btn btn-ghost btn-sm" style={{ fontSize:'0.8125rem', color:'var(--gold)' }}>
              {t('viewAll')} <ArrowRight size={14} />
            </Link>
          </div>
          {bookings.length === 0 ? (
            <EmptyState icon={<BrandIcon name="noBookings" size={48} />} title={t('noBookingsTitle')} description={t('noBookingsDesc')}
              action={<Link href="/bookings" className="btn btn-primary btn-sm">{t('newBooking')}</Link>} />
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>{t('colRef')}</th><th>{t('colGuest')}</th><th>{t('colDate')}</th><th>{t('colStatus')}</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b.id} onClick={() => router.push(`/bookings?edit=${b.id}`)} style={{ cursor: 'pointer' }} title={t('clickToOpen')}>
                      <td><span style={{ fontFamily:'monospace', fontSize:'0.8rem', color:'var(--navy)', fontWeight:600 }}>{b.booking_ref}</span></td>
                      <td>
                        <p style={{ margin:0, fontWeight:600, fontSize:'0.875rem', color:'var(--navy)' }}>{b.guest_name || '—'}</p>
                        {b.staff?.full_name && <p style={{ margin:0, fontSize:'0.75rem', color:'var(--gray-400)' }}>{t('guide', { name: b.staff.full_name })}</p>}
                      </td>
                      <td style={{ fontSize:'0.8125rem', color:'var(--gray-500)' }}>
                        {b.start_date ? new Date(b.start_date).toLocaleDateString(dateLocale, { day:'numeric', month:'short' }) : '—'}
                      </td>
                      <td><StatusBadge status={b.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Cert Alerts */}
        <div className="card card-shadow">
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem' }}>
            <h2 style={{ margin:0, fontSize:'1rem' }}>{t('certAlertsHeading')}</h2>
            <Link href="/staff/certifications" className="btn btn-ghost btn-sm" style={{ fontSize:'0.8125rem', color:'var(--gold)' }}>
              {t('manage')} <ArrowRight size={14} />
            </Link>
          </div>
          {certAlerts.length === 0 ? (
            <div style={{ padding:'1.5rem 0', textAlign:'center' }}>
              <CheckCircle size={32} color="var(--teal)" style={{ marginBottom:'0.5rem' }} />
              <p style={{ margin:0, fontSize:'0.875rem', color:'var(--gray-400)' }}>{t('allCertsUpToDate')}</p>
            </div>
          ) : (
            <div>
              {certAlerts.map(c => <CertAlert key={c.id} cert={c} t={t} />)}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ marginTop:'1.25rem', display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))', gap:'0.75rem' }}>
        {[
          { href:'/bookings', key:'newBooking', icon:'noBookings', color:'var(--teal)' },
          { href:'/staff',    key:'addStaff',   icon:'addStaff', color:'var(--navy)' },
          { href:'/invoices', key:'newInvoice', icon:'newInvoice', color:'var(--gold)' },
          { href:'/settings', key:'settings',    icon:'settingsIcon', color:'var(--gray-500)' },
          ...(company.package?.slug === 'enterprise' || company.organization_id
            ? [{ href:'/settings/locations?add=1', key:'newSite', icon:null, color:'var(--gold)' }]
            : []),
        ].map(a => (
          <Link key={a.href} href={a.href} style={{
            background:'white', border:'1px solid var(--gray-200)', borderRadius:'0.75rem',
            padding:'1rem', display:'flex', flexDirection:'column', alignItems:'flex-start', gap:'0.375rem',
            textDecoration:'none', transition:'border-color 0.15s, box-shadow 0.15s',
          }}
          onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)' }}
          onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--gray-200)'; e.currentTarget.style.boxShadow = 'none' }}>
            {a.icon ? <BrandIcon name={a.icon} size={28} /> : <MapPin size={28} color="var(--gold)" />}
            <span style={{ fontSize:'0.875rem', fontWeight:600, color:'var(--navy)' }}>{t(`quickActions.${a.key}`)}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

export const dynamic = 'force-dynamic'
