'use client'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { loadComplianceItems, todayIn } from '@/lib/compliance'
import { ShieldAlert } from 'lucide-react'

// Dashboard banner: documents expired or expiring within 30 days.
export default function ComplianceAlert({ company }) {
  const t = useTranslations('Compliance')
  const [n, setN] = useState({ expired: 0, soon: 0 })
  useEffect(() => {
    if (!company) return
    let alive = true
    loadComplianceItems(createClient(), company.id, todayIn(company.timezone || 'Africa/Johannesburg')).then(items => {
      if (alive) setN({ expired: items.filter(i => i.bucket === 'expired').length, soon: items.filter(i => i.bucket === 'd7' || i.bucket === 'd30').length })
    }).catch(() => {})
    return () => { alive = false }
  }, [company])
  if (!n.expired && !n.soon) return null
  return (
    <Link href="/compliance" className="card card-shadow" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1.25rem', textDecoration: 'none', borderLeft: `4px solid ${n.expired ? '#b91c1c' : '#d97706'}` }}>
      <ShieldAlert size={20} color={n.expired ? '#b91c1c' : '#d97706'} />
      <span style={{ flex: 1, color: 'var(--navy)', fontSize: '0.9rem' }}>{t('dashboardAlert', { expired: n.expired, soon: n.soon })}</span>
      <span style={{ fontWeight: 700, color: 'var(--navy)' }}>→</span>
    </Link>
  )
}
