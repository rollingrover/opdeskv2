'use client'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { EmptyState } from '@/components/ui/EmptyState'
import { TrendingUp, Shield, Star, DollarSign, FileText, HelpCircle, Settings } from 'lucide-react'

const SECTIONS = [
  { href: '/admin/revenue',    icon: TrendingUp,  label: 'Revenue',            desc: 'MRR, ARR, tier breakdown, monthly cohorts' },
  { href: '/admin/companies',  icon: Shield,      label: 'Companies',          desc: 'Manage every account — tiers, add-ons, users' },
  { href: '/admin/operators',  icon: Star,        label: 'Operator Profiles',  desc: 'Public-facing operator listings (coming soon)' },
  { href: '/admin/pricing',    icon: DollarSign,  label: 'Pricing Editor',     desc: 'Edit tier & add-on pricing platform-wide' },
  { href: '/admin/packages',   icon: FileText,    label: 'Marketing Packages', desc: 'Bundle add-ons into packages (coming soon)' },
  { href: '/admin/affiliates', icon: Star,        label: 'Affiliates',         desc: 'Affiliate signups & commissions (coming soon)' },
  { href: '/admin/discounts',  icon: FileText,    label: 'Discount Codes',     desc: 'Promo codes (coming soon)' },
  { href: '/admin/support',    icon: HelpCircle,  label: 'Support Queue',      desc: 'All support tickets across every company' },
  { href: '/admin/system',     icon: Settings,    label: 'System',            desc: 'Maintenance mode, feature flags, defaults' },
]

function AdminIndex() {
  const { profile } = useAuth()

  if (!profile?.is_superadmin) {
    return (
      <div style={{ background: '#0a0a0a', margin: '-1.75rem', padding: '1.75rem', borderRadius: '0.75rem', minHeight: '60vh' }}>
        <EmptyState
          icon={<Shield size={48} color="#ef4444" />}
          title="Superadmin access required"
          description="Your account isn't flagged as a superadmin. If you believe this is wrong, check the is_superadmin column on your profile row and make sure you're signed in with the correct account."
        />
      </div>
    )
  }

  return (
    <div style={{ background: '#0a0a0a', margin: '-1.75rem', padding: '1.75rem', borderRadius: '0.75rem' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'white', marginBottom: 4 }}>Superadmin</h2>
        <p style={{ color: '#6b7280', fontSize: 14 }}>Platform-wide administration — signed in as {profile.email}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
        {SECTIONS.map(s => {
          const Icon = s.icon
          return (
            <Link key={s.href} href={s.href} style={{
              background: '#1a1a1a', border: '1px solid #222', borderRadius: 12, padding: 18,
              textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 8,
              transition: 'border-color 0.15s',
            }}
            onMouseOver={e => e.currentTarget.style.borderColor = '#D4A853'}
            onMouseOut={e => e.currentTarget.style.borderColor = '#222'}>
              <Icon size={22} color="#D4A853" />
              <span style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>{s.label}</span>
              <span style={{ color: '#6b7280', fontSize: 12, lineHeight: 1.4 }}>{s.desc}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default function Page() {
  return <AdminIndex />
}
