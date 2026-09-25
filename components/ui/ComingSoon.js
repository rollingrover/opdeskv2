'use client'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { EmptyState } from './EmptyState'
import { BrandIcon } from './BrandIcon'

export function ComingSoon({ title, description }) {
  const t = useTranslations('Common')
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{title}</h1>
          <p className="page-subtitle">{t('onRoadmap')}</p>
        </div>
      </div>
      <div className="card card-shadow">
        <EmptyState
          icon={<BrandIcon name="comingSoon" size={48} />}
          title={t('comingSoonTitle', { title })}
          description={description || t('comingSoonDefaultDesc')}
          action={<Link href="/dashboard" className="btn btn-outline btn-sm">{t('backToDashboard')}</Link>}
        />
      </div>
    </div>
  )
}
