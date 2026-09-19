'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { NextIntlClientProvider } from 'next-intl'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { PageLoader } from '@/components/ui/Spinner'
import dashboardEn from '@/messages/dashboard/en.json'
import dashboardAf from '@/messages/dashboard/af.json'
import dashboardFr from '@/messages/dashboard/fr.json'
import dashboardPt from '@/messages/dashboard/pt.json'
import dashboardDe from '@/messages/dashboard/de.json'

// Deliberately NOT the same URL-locale system the marketing site uses
// (/fr/pricing etc.) — the dashboard is authenticated and never indexed by
// search engines, so there's no SEO reason to prefix its URLs, and doing so
// would mean restructuring every dashboard route for no real benefit.
// Language is read straight from company.language (already stored, was
// previously unused) and applied here with no URL change at all.
const DASHBOARD_MESSAGES = { en: dashboardEn, af: dashboardAf, fr: dashboardFr, pt: dashboardPt, de: dashboardDe }

function DashboardShell({ children }) {
  const { user, loading, company } = useAuth()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (!loading && !user) router.replace('/auth/login')
  }, [user, loading, router])

  if (loading) return <PageLoader />
  if (!user) return null

  const locale = DASHBOARD_MESSAGES[company?.language] ? company.language : 'en'

  return (
    <NextIntlClientProvider locale={locale} messages={DASHBOARD_MESSAGES[locale]}>
      <div>
        <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
        <div className="app-shell">
          <Topbar onMenuClick={() => setMobileOpen(v => !v)} />
          <main className="page-content">{children}</main>
        </div>
      </div>
    </NextIntlClientProvider>
  )
}

export default function DashboardLayoutClient({ children }) {
  return (
    <AuthProvider>
      <DashboardShell>{children}</DashboardShell>
    </AuthProvider>
  )
}
