'use client'
import Link from 'next/link'
import { Lock } from 'lucide-react'
import { EmptyState } from './EmptyState'
import { MODULE_LABELS } from '@/lib/constants'

export function ModuleLocked({ moduleKey }) {
  const label = MODULE_LABELS[moduleKey] || 'This module'
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{label}</h1>
          <p className="page-subtitle">Not included in your current plan</p>
        </div>
      </div>
      <div className="card card-shadow">
        <EmptyState
          icon={<Lock size={40} color="var(--gray-400)" />}
          title={`${label} isn't part of your current plan`}
          description="This feature is fully built and ready to use — it just needs to be added to your account. Upgrade your plan or add it individually to unlock it."
          action={<Link href="/settings/addons" className="btn btn-primary btn-sm">Buy This Module</Link>}
        />
      </div>
    </div>
  )
}
