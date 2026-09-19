'use client'
import { useTranslations } from 'next-intl'
import { ComingSoon } from '@/components/ui/ComingSoon'

export default function Page() {
  const tSidebar = useTranslations('Sidebar')
  const t = useTranslations('Stubs')
  return <ComingSoon title={tSidebar('items.firearmRegister')} description={t('firearmRegisterDesc')} />
}

export const dynamic = 'force-dynamic'
