'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { OpDeskLogo } from './OpDeskLogo'
import { OPERATOR_MODULES } from '@/lib/constants'
import {
  LayoutDashboard, CalendarDays, BookOpen, Users, Hotel,
  Truck, Ship, FileText, BarChart3, Settings, HelpCircle,
  Shield, MapPin, Crosshair, LogOut, ChevronRight, Bed,
  ClipboardList, UserCheck, DollarSign, Clock, Plane
} from 'lucide-react'

const ALL_NAV = [
  {
    section: 'Operations',
    items: [
      { href:'/dashboard',   icon: LayoutDashboard, label:'Dashboard',        module:'always' },
      { href:'/bookings',    icon: BookOpen,         label:'Bookings',         module:'bookings' },
      { href:'/calendar',    icon: CalendarDays,     label:'Calendar',         module:'bookings' },
    ]
  },
  {
    section: 'Staff & HR',
    items: [
      { href:'/staff',              icon: Users,       label:'Staff Members',    module:'staff' },
      { href:'/staff/certifications', icon: UserCheck, label:'Certifications',  module:'certs' },
      { href:'/staff/costs',        icon: DollarSign,  label:'Cost to Company',  module:'costs' },
      { href:'/staff/shifts',       icon: Clock,       label:'Shifts',           module:'shifts' },
      { href:'/staff/leave',        icon: Plane,       label:'Leave',            module:'leave' },
    ]
  },
  {
    section: 'Lodging',
    items: [
      { href:'/lodging',             icon: Hotel,       label:'Room Overview',    module:'rooms' },
      { href:'/lodging/rooms',       icon: Bed,         label:'Rooms',            module:'rooms' },
      { href:'/lodging/calendar',    icon: CalendarDays,label:'Availability',     module:'rooms' },
      { href:'/lodging/housekeeping',icon: ClipboardList,label:'Housekeeping',    module:'housekeeping' },
      { href:'/lodging/guests',      icon: Users,       label:'Guests',           module:'rooms' },
    ]
  },
  {
    section: 'Fleet',
    items: [
      { href:'/fleet/vehicles', icon: Truck, label:'Vehicles', module:'vehicles' },
      { href:'/fleet/vessels',  icon: Ship,  label:'Vessels',  module:'vessels' },
    ]
  },
  {
    section: 'More',
    items: [
      { href:'/guides',           icon: UserCheck,   label:'Guides',           module:'guides' },
      { href:'/trails',           icon: MapPin,       label:'Trails',           module:'trails' },
      { href:'/firearm-register', icon: Crosshair,   label:'Firearm Register', module:'firearm' },
      { href:'/invoices',         icon: FileText,    label:'Invoices',         module:'invoices' },
      { href:'/reports',          icon: BarChart3,   label:'Reports',          module:'reports' },
    ]
  },
  {
    section: 'Account',
    items: [
      { href:'/settings',  icon: Settings,    label:'Settings',  module:'always' },
      { href:'/support',   icon: HelpCircle,  label:'Support',   module:'always' },
    ]
  },
]

export function Sidebar({ mobileOpen, onClose }) {
  const pathname = usePathname()
  const { company, profile, signOut } = useAuth()
  const operatorType = company?.operator_type || 'safari'
  const allowed = OPERATOR_MODULES[operatorType] || []

  return (
    <>
      {mobileOpen && (
        <div onClick={onClose}
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', zIndex:39 }} />
      )}
      <aside className={`sidebar${mobileOpen ? ' open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <Link href="/dashboard" onClick={onClose}>
            <OpDeskLogo size={36} white />
          </Link>
          {company && (
            <p style={{ color:'rgba(255,255,255,0.45)', fontSize:'0.75rem', marginTop:'0.375rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {company.name}
            </p>
          )}
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {ALL_NAV.map(group => {
            const visibleItems = group.items.filter(item =>
              item.module === 'always' || allowed.includes(item.module)
            )
            if (!visibleItems.length) return null
            return (
              <div key={group.section}>
                <div className="sidebar-section-label">{group.section}</div>
                {visibleItems.map(item => {
                  const Icon = item.icon
                  const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
                  return (
                    <Link key={item.href} href={item.href} className={`nav-item${active ? ' active' : ''}`} onClick={onClose}>
                      <Icon size={16} />
                      <span style={{ flex:1 }}>{item.label}</span>
                      {active && <ChevronRight size={14} />}
                    </Link>
                  )
                })}
              </div>
            )
          })}

          {profile?.is_superadmin && (
            <div>
              <div className="sidebar-section-label">Superadmin</div>
              {[
                { href:'/admin/companies', icon: Shield, label:'Companies' },
                { href:'/admin/support',   icon: HelpCircle, label:'Support Tickets' },
                { href:'/admin/payments',  icon: DollarSign, label:'Payments' },
              ].map(item => {
                const Icon = item.icon
                const active = pathname.startsWith(item.href)
                return (
                  <Link key={item.href} href={item.href} className={`nav-item${active ? ' active' : ''}`} onClick={onClose}>
                    <Icon size={16} /><span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          )}
        </nav>

        {/* Footer */}
        <div style={{ padding:'0.75rem', borderTop:'1px solid rgba(255,255,255,0.08)' }}>
          <button onClick={signOut} className="nav-item" style={{ width:'100%', border:'none', background:'none', cursor:'pointer' }}>
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  )
}
