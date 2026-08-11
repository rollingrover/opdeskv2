'use client'
import Link from 'next/link'
import { EmptyState } from './EmptyState'
import { BrandIcon } from './BrandIcon'

export function ComingSoon({ title, description }) {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{title}</h1>
          <p className="page-subtitle">This module is on the roadmap.</p>
        </div>
      </div>
      <div className="card card-shadow">
        <EmptyState
          icon={<BrandIcon name="comingSoon" size={48} />}
          title={`${title} is coming soon`}
          description={description || "We're still building this part of OpDesk. Check back soon."}
          action={<Link href="/dashboard" className="btn btn-outline btn-sm">Back to Dashboard</Link>}
        />
      </div>
    </div>
  )
}
