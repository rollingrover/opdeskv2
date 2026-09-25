'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { OpDeskLogo } from './OpDeskLogo'
import { OPERATOR_MODULES } from '@/lib/constants'
import { hasModuleAccess } from '@/lib/moduleAccess'
import {
  LayoutDashboard, CalendarDays, BookOpen, Users, Hotel,
  Truck, Ship, FileText, BarChart3, Settings, HelpCircle,
  Shield, MapPin, Crosshair, LogOut, ChevronRight, Bed,
  ClipboardList, UserCheck, DollarSign, Clock, Plane,
  TrendingUp, Star, Package, Briefcase, RefreshCw, Globe, ClipboardCheck, Tag
} from 'lucide-react'

const ALL_NAV = [
  {
    sectionKey: 'operations',
    items: [
      { href:'/dashboard',   icon: LayoutDashboard, key:'dashboard',        module:'always' },
      { href:'/bookings',    icon: BookOpen,         key:'bookings',         module:'bookings' },
      { href:'/calendar',    icon: CalendarDays,     key:'calendar',         module:'bookings' },
      { href:'/settings/booking-types', icon: Tag,   key:'bookingTypes',     module:'always' },
      { href:'/guests',      icon: Users,           key:'guestsDirectory',  module:'guests_directory', gate:'guest_register' },
    ]
  },
  {
    sectionKey: 'staffHr',
    items: [
      { href:'/staff',              icon: Users,       key:'staffMembers',    module:'staff' },
      { href:'/staff/certifications', icon: UserCheck, key:'certifications',  module:'certs', gate:'certifications' },
      { href:'/staff/costs',        icon: DollarSign,  key:'costToCompany',  module:'costs', gate:'costs' },
      { href:'/staff/shifts',       icon: Clock,       key:'shifts',           module:'shifts', gate:'shifts' },
      { href:'/staff/leave',        icon: Plane,       key:'leave',            module:'leave', gate:'leave' },
      { href:'/staff/handbook',     icon: BookOpen,    key:'handbook',         module:'always' },
    ]
  },
  {
    sectionKey: 'lodging',
    items: [
      { href:'/lodging',             icon: Hotel,       key:'roomOverview',    module:'rooms' },
      { href:'/lodging/rooms',       icon: Bed,         key:'rooms',            module:'rooms' },
      { href:'/lodging/calendar',    icon: CalendarDays,key:'availability',     module:'rooms' },
      { href:'/lodging/housekeeping',icon: ClipboardList,key:'housekeeping',    module:'housekeeping' },
      { href:'/lodging/channel-sync',icon: RefreshCw,   key:'channelSync',     module:'rooms', gate:'ical_sync' },
    ]
  },
  {
    // Logistics/delivery is a purchasable add-on (or Professional+/Enterprise
    // tier perk) available to ANY operator type now, not just companies whose
    // operator_type happens to be 'delivery' — so these items are gated
    // purely by hasModuleAccess('delivery_management', ...) below, with no
    // dependency on OPERATOR_MODULES at all.
    sectionKey: 'logistics',
    items: [
      { href:'/delivery/clients',    icon: Users,       key:'clients',          module:'delivery_clients', gate:'delivery_management' },
      { href:'/delivery/price-list', icon: DollarSign,  key:'priceList',       module:'delivery_clients', gate:'delivery_management' },
      { href:'/delivery/orders',     icon: Package,     key:'orders',           module:'delivery_orders', gate:'delivery_management' },
      { href:'/delivery/statements', icon: FileText,    key:'deliveryStatements', module:'delivery_orders', gate:'delivery_management' },
    ]
  },
  {
    sectionKey: 'fleet',
    items: [
      { href:'/fleet/vehicles', icon: Truck, key:'vehicles', module:'vehicles' },
      { href:'/fleet/vessels',  icon: Ship,  key:'vessels',  module:'vessels' },
    ]
  },
  {
    sectionKey: 'more',
    items: [
      { href:'/guides',           icon: UserCheck,   key:'guides',           module:'guides' },
      { href:'/trails',           icon: MapPin,       key:'trails',           module:'trails' },
      { href:'/firearm-register', icon: Crosshair,   key:'firearmRegister', module:'firearm' },
      { href:'/invoices',         icon: FileText,    key:'invoices',         module:'invoices' },
      { href:'/invoices/statements', icon: FileText, key:'clientStatements', module:'invoices' },
      { href:'/quotations',       icon: FileText,    key:'quotations',       module:'quotations', gate:'quotations' },
      { href:'/settings/rate-sheet', icon: FileText, key:'rateSheet',       module:'rate_sheet', gate:'rate_sheet' },
      { href:'/checklists',       icon: ClipboardCheck, key:'checklists',     module:'checklists', gate:'checklists' },
      { href:'/reports',          icon: BarChart3,   key:'reports',          module:'reports' },
      { href:'/reports/commission', icon: BarChart3, key:'commissionReport', module:'commission_report', gate:'commission_reporting' },
    ]
  },
  {
    sectionKey: 'account',
    items: [
      { href:'/settings',        icon: Settings,    key:'settings',  module:'always' },
      { href:'/settings/team',   icon: Users,       key:'team',      module:'always' },
      { href:'/settings/locations', icon: MapPin,  key:'locations', module:'always', special: 'enterpriseLocations' },
      { href:'/settings/booking-widget', icon: Globe, key:'bookingWidget', module:'always', special: 'professionalPlus' },
      { href:'/settings/addons', icon: Package,     key:'addons',   module:'always' },
      { href:'/settings/public-profile', icon: Globe, key:'publicProfile', module:'always' },
      { href:'/support',         icon: HelpCircle,  key:'support',   module:'always' },
    ]
  },
]

export function Sidebar({ mobileOpen, onClose }) {
  const t = useTranslations('Sidebar')
  const pathname = usePathname()
  const router = useRouter()
  const { company, profile, signOut, reload } = useAuth()
  const operatorType = company?.operator_type || 'safari'
  const allowed = OPERATOR_MODULES[operatorType] || []

  // Sibling locations under the same Enterprise org (see link_new_location/
  // switch_active_company) — only fetched, and only rendered below, when
  // this company actually belongs to one. Every other company in the app
  // has organization_id null and this stays an empty, invisible no-op.
  const [locations, setLocations] = useState([])
  const [switching, setSwitching] = useState(false)
  useEffect(() => {
    if (!company?.organization_id) { setLocations([]); return }
    let cancelled = false
    createClient()
      .from('companies').select('id, name, operator_type').eq('organization_id', company.organization_id).order('name')
      .then(({ data }) => { if (!cancelled) setLocations(data || []) })
    return () => { cancelled = true }
  }, [company?.organization_id])

  async function switchLocation(id) {
    if (id === company.id || switching) return
    setSwitching(true)
    const { error } = await createClient().rpc('switch_active_company', { p_company_id: id })
    setSwitching(false)
    if (error) { alert(error.message); return }
    await reload()
    router.push('/dashboard')
  }

  // Needed to evaluate hasModuleAccess() below — without this the sidebar
  // has no way to know about tier upgrades or purchased add-ons at all,
  // which was the root cause of both "approved addon doesn't show" and
  // "enterprise upgrade doesn't show" bugs. Company-scoped RLS means this
  // is cheap and always reflects whatever the DB currently says, regardless
  // of when this browser session originally logged in.
  const [companyAddons, setCompanyAddons] = useState([])
  useEffect(() => {
    if (!company?.id) { setCompanyAddons([]); return }
    let cancelled = false
    createClient()
      .from('company_addons').select('addon_key, active')
      .eq('company_id', company.id).eq('active', true)
      .then(({ data }) => { if (!cancelled) setCompanyAddons(data || []) })
    return () => { cancelled = true }
  }, [company?.id])

  // An item shows if it's always visible, if it's a genuinely tier/add-on
  // gated feature the company is actually entitled to (checked via the same
  // hasModuleAccess() every page already uses for its own access check —
  // this is the piece the sidebar was previously skipping entirely), or
  // otherwise if the company's operator type includes that base module.
  function isVisible(item) {
    if (item.module === 'always' && item.special === 'enterpriseLocations') {
      return ['professional', 'enterprise', 'hr_bureau'].includes(company?.package?.slug) || !!company?.organization_id
    }
    if (item.module === 'always' && item.special === 'professionalPlus') {
      return ['professional', 'enterprise'].includes(company?.package?.slug)
    }
    if (item.module === 'always') return true
    // A package's modules JSON can explicitly hide a base module (e.g. the
    // HR Package hiding Bookings/Fleet entirely) by setting it to false —
    // only takes effect when explicitly false; undefined/missing means
    // "not overridden" so every existing package keeps behaving exactly
    // as before until it's deliberately set.
    if (company?.package?.modules?.[item.module] === false) return false
    if (item.gate) return hasModuleAccess(item.gate, { profile, company, companyAddons })
    return allowed.includes(item.module)
  }

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
          {locations.length > 1 && (
            <div style={{ display:'flex', gap:'0.375rem', marginTop:'0.625rem', flexWrap:'wrap' }}>
              {locations.map(loc => (
                <button key={loc.id} onClick={() => switchLocation(loc.id)} disabled={switching}
                  title={loc.name}
                  style={{
                    width: 28, height: 28, borderRadius: '50%', border: 'none', cursor: switching ? 'default' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6875rem', fontWeight: 700,
                    background: loc.id === company.id ? 'var(--gold, #D4A853)' : 'rgba(255,255,255,0.12)',
                    color: loc.id === company.id ? '#1a1a1a' : 'rgba(255,255,255,0.75)',
                  }}>
                  {loc.name.slice(0, 2).toUpperCase()}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {ALL_NAV.map(group => {
            const visibleItems = group.items.filter(isVisible)
            if (!visibleItems.length) return null
            return (
              <div key={group.sectionKey}>
                <div className="sidebar-section-label">{t(`sections.${group.sectionKey}`)}</div>
                {visibleItems.map(item => {
                  const Icon = item.icon
                  const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
                  return (
                    <Link key={item.href} href={item.href} className={`nav-item${active ? ' active' : ''}`} onClick={onClose}>
                      <Icon size={16} />
                      <span style={{ flex:1 }}>{item.key === 'locations' && company?.package?.slug === 'hr_bureau' ? t('items.clients') : t(`items.${item.key}`)}</span>
                      {active && <ChevronRight size={14} />}
                    </Link>
                  )
                })}
              </div>
            )
          })}

          {profile?.is_superadmin && (
            <div>
              {/* Superadmin section deliberately stays in English — this is
                  OpDesk's own team using it, not customers, so translating
                  it isn't worth the effort relative to everything else. */}
              <div className="sidebar-section-label">Superadmin</div>
              {[
                { href:'/admin/revenue',   icon: TrendingUp, label:'Revenue' },
                { href:'/admin/companies', icon: Shield, label:'Companies' },
                { href:'/admin/operators', icon: Star, label:'Operator Profiles' },
                { href:'/admin/pricing',   icon: DollarSign, label:'Add-on Pricing' },
                { href:'/admin/packages',  icon: FileText, label:'Marketing Packages' },
                { href:'/admin/community-contributions', icon: Star, label:'Community Contributions' },
                { href:'/admin/affiliates', icon: Star, label:'Affiliates' },
                { href:'/admin/discounts', icon: FileText, label:'Discount Codes' },
                { href:'/admin/support',   icon: HelpCircle, label:'Support Queue' },
                { href:'/admin/system',    icon: Settings, label:'System' },
                { href:'/admin/rollingrover', icon: Briefcase, label:'RollingRover' },
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
          <button onClick={async () => { await signOut(); router.push('/') }} className="nav-item" style={{ width:'100%', border:'none', background:'none', cursor:'pointer' }}>
            <LogOut size={16} />
            <span>{t('signOut')}</span>
          </button>
        </div>
      </aside>
    </>
  )
}
