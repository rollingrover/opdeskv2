'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { PageLoader } from '@/components/ui/Spinner'
import { StatusBadge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { BrandIcon } from '@/components/ui/BrandIcon'
import {
  BookOpen, Users, DollarSign, TrendingUp, Calendar,
  AlertTriangle, CheckCircle, Clock, ArrowRight, Hotel
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

function CertAlert({ cert }) {
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
          {isExpired ? `Expired ${Math.abs(daysLeft)} days ago` : `Expires in ${daysLeft} days`}
        </p>
      </div>
      <StatusBadge status={isExpired ? 'expired' : 'expiring_soon'} />
    </div>
  )
}

export default function DashboardPage() {
  const { company, profileError, needsCompany } = useAuth()
  const supabase = createClient()
  const [stats, setStats]     = useState({ totalBookings:0, confirmedToday:0, totalStaff:0, occupiedRooms:0, totalRooms:0 })
  const [bookings, setBookings] = useState([])
  const [certAlerts, setCertAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!company) { setLoading(false); return }
    // Company can arrive a render or two after mount (AuthContext loads it
    // asynchronously) — without this, `loading` stays stuck at the `false`
    // it was set to on the very first render (when company was still null),
    // so the component below renders its main body before `stats` has ever
    // been populated for this company.
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
      <EmptyState icon={<BrandIcon name="errorIcon" size={48} />} title="We couldn't load your profile"
        description="Your account exists, but no profile record was found for it. Please contact support or try signing out and back in."
        action={<Link href="/auth/login" className="btn btn-primary btn-sm">Back to login</Link>} />
    )
  }

  if (needsCompany || !company) {
    return (
      <EmptyState icon={<BrandIcon name="companySetup" size={48} />} title="Finish setting up your company"
        description="Your account isn't linked to a company yet, so there's no data to show."
        action={<Link href="/settings" className="btn btn-primary btn-sm">Go to Settings</Link>} />
    )
  }

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom:'1.75rem' }}>
        <h1 style={{ margin:0, fontSize:'1.5rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
          {greeting()}, {company.name} <BrandIcon name="greeting" size={28} />
        </h1>
        <p style={{ margin:'0.25rem 0 0', color:'var(--gray-400)', fontSize:'0.875rem' }}>
          Here's what's happening today — {new Date().toLocaleDateString('en-ZA', { weekday:'long', day:'numeric', month:'long' })}
        </p>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:'1rem', marginBottom:'1.75rem' }}>
        <StatCard icon={BookOpen}    label="Bookings This Month" value={stats.totalBookings || 0}  sub="all time" color="var(--teal)" />
        <StatCard icon={Calendar}    label="Check-ins Today"     value={stats.confirmedToday || 0} sub="confirmed" color="var(--orange)" />
        <StatCard icon={Users}       label="Active Staff"        value={stats.totalStaff || 0}     sub="employees" color="var(--navy)" />
        {stats.totalRooms > 0 && (
          <StatCard icon={Hotel} label="Rooms Occupied" value={`${stats.occupiedRooms}/${stats.totalRooms}`} sub="tonight" color="var(--gold)" />
        )}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 380px', gap:'1.25rem', alignItems:'start' }}>
        {/* Recent Bookings */}
        <div className="card card-shadow">
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem' }}>
            <h2 style={{ margin:0, fontSize:'1rem' }}>Recent Bookings</h2>
            <Link href="/bookings" className="btn btn-ghost btn-sm" style={{ fontSize:'0.8125rem', color:'var(--gold)' }}>
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {bookings.length === 0 ? (
            <EmptyState icon={<BrandIcon name="noBookings" size={48} />} title="No bookings yet" description="Your bookings will appear here once created."
              action={<Link href="/bookings" className="btn btn-primary btn-sm">New Booking</Link>} />
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Ref</th><th>Guest</th><th>Date</th><th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b.id}>
                      <td><span style={{ fontFamily:'monospace', fontSize:'0.8rem', color:'var(--navy)', fontWeight:600 }}>{b.booking_ref}</span></td>
                      <td>
                        <p style={{ margin:0, fontWeight:600, fontSize:'0.875rem', color:'var(--navy)' }}>{b.guest_name || '—'}</p>
                        {b.staff?.full_name && <p style={{ margin:0, fontSize:'0.75rem', color:'var(--gray-400)' }}>Guide: {b.staff.full_name}</p>}
                      </td>
                      <td style={{ fontSize:'0.8125rem', color:'var(--gray-500)' }}>
                        {b.start_date ? new Date(b.start_date).toLocaleDateString('en-ZA', { day:'numeric', month:'short' }) : '—'}
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
            <h2 style={{ margin:0, fontSize:'1rem' }}>Certification Alerts</h2>
            <Link href="/staff/certifications" className="btn btn-ghost btn-sm" style={{ fontSize:'0.8125rem', color:'var(--gold)' }}>
              Manage <ArrowRight size={14} />
            </Link>
          </div>
          {certAlerts.length === 0 ? (
            <div style={{ padding:'1.5rem 0', textAlign:'center' }}>
              <CheckCircle size={32} color="var(--teal)" style={{ marginBottom:'0.5rem' }} />
              <p style={{ margin:0, fontSize:'0.875rem', color:'var(--gray-400)' }}>All certifications are up to date</p>
            </div>
          ) : (
            <div>
              {certAlerts.map(c => <CertAlert key={c.id} cert={c} />)}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ marginTop:'1.25rem', display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))', gap:'0.75rem' }}>
        {[
          { href:'/bookings', label:'New Booking', icon:'noBookings', color:'var(--teal)' },
          { href:'/staff',    label:'Add Staff',   icon:'addStaff', color:'var(--navy)' },
          { href:'/invoices', label:'New Invoice', icon:'newInvoice', color:'var(--gold)' },
          { href:'/settings', label:'Settings',    icon:'settingsIcon', color:'var(--gray-500)' },
        ].map(a => (
          <Link key={a.href} href={a.href} style={{
            background:'white', border:'1px solid var(--gray-200)', borderRadius:'0.75rem',
            padding:'1rem', display:'flex', flexDirection:'column', alignItems:'flex-start', gap:'0.375rem',
            textDecoration:'none', transition:'border-color 0.15s, box-shadow 0.15s',
          }}
          onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)' }}
          onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--gray-200)'; e.currentTarget.style.boxShadow = 'none' }}>
            <BrandIcon name={a.icon} size={28} />
            <span style={{ fontSize:'0.875rem', fontWeight:600, color:'var(--navy)' }}>{a.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

export const dynamic = 'force-dynamic'
