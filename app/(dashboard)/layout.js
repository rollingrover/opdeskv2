'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { PageLoader } from '@/components/ui/Spinner'

export const dynamic = 'force-dynamic'

function DashboardShell({ children }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (!loading && !user) router.replace('/auth/login')
  }, [user, loading, router])

  if (loading) return <PageLoader />
  if (!user) return null

  return (
    <div>
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="app-shell">
        <Topbar onMenuClick={() => setMobileOpen(v => !v)} />
        <main className="page-content">{children}</main>
      </div>
    </div>
  )
}

export default function DashboardLayout({ children }) {
  return (
    <AuthProvider>
      <DashboardShell>{children}</DashboardShell>
    </AuthProvider>
  )
}
