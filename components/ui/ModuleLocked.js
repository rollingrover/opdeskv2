'use client'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Lock } from 'lucide-react'
import { EmptyState } from './EmptyState'
import { MODULE_LABELS } from '@/lib/constants'

export function ModuleLocked({ moduleKey }) {
  const t = useTranslations('Common')
  const label = MODULE_LABELS[moduleKey] || t('thisModule')
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{label}</h1>
          <p className="page-subtitle">{t('notInPlan')}</p>
        </div>
      </div>
      <div className="card card-shadow">
        <EmptyState
          icon={<Lock size={40} color="var(--gray-400)" />}
          title={t('moduleLockedTitle', { label })}
          description={t('moduleLockedDesc')}
          action={<Link href="/settings/addons" className="btn btn-primary btn-sm">{t('buyThisModule')}</Link>}
        />
      </div>
    </div>
  )
}
