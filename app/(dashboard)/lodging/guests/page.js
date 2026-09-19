'use client'
import { useTranslations } from 'next-intl'
import { ComingSoon } from '@/components/ui/ComingSoon'

export default function Page() {
  const tSidebar = useTranslations('Sidebar')
  const t = useTranslations('LodgingStubs')
  return <ComingSoon title={tSidebar('items.guests')} description={t('guestsDesc')} />
}

export const dynamic = 'force-dynamic'
