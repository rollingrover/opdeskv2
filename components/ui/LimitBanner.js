'use client'
import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'

const RESOURCE_LABELS = {
  vehicles: 'vehicle & room capacity', rooms: 'vehicle & room capacity', guides: 'staff', bookings_per_month: 'bookings this month', seats: 'team seats',
}

export function LimitBanner({ resourceKey, limitInfo }) {
  if (!limitInfo) return null
  const label = RESOURCE_LABELS[resourceKey] || resourceKey
  const atLimit = limitInfo.level === 'at_limit'
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
      background: atLimit ? '#FEF2F2' : '#FFFBEB',
      border: `1px solid ${atLimit ? '#FCA5A5' : '#FDE68A'}`,
      borderRadius: '0.75rem', padding: '0.75rem 1.125rem', marginBottom: '1.25rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
        <AlertTriangle size={16} color={atLimit ? '#DC2626' : '#D97706'} />
        <span style={{ fontSize: '0.8125rem', color: atLimit ? '#991B1B' : '#92400E', fontWeight: 500 }}>
          {atLimit
            ? `You've reached your plan's limit of ${limitInfo.limit} ${label} (${limitInfo.current}/${limitInfo.limit} used).`
            : `You're using ${limitInfo.current} of ${limitInfo.limit} ${label} on your current plan.`}
        </span>
      </div>
      <Link href="/settings/billing" className="btn btn-primary btn-sm" style={{ whiteSpace: 'nowrap' }}>
        {atLimit ? 'Upgrade Now' : 'View Plans'}
      </Link>
    </div>
  )
}
