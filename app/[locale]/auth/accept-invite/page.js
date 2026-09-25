'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { OpDeskLogo } from '@/components/layout/OpDeskLogo'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

function AcceptInviteContent() {
  const t = useTranslations('Auth.AcceptInvite')
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  const supabase = createClient()
  const { user, profile, loading: authLoading } = useAuth()

  const [preview, setPreview] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [loadingPreview, setLoadingPreview] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) { setNotFound(true); setLoadingPreview(false); return }
    supabase.rpc('get_invite_preview', { p_token: token }).then(({ data, error }) => {
      if (error || !data || data.length === 0) { setNotFound(true) } else { setPreview(data[0]) }
      setLoadingPreview(false)
    })
  }, [token])

  // Not logged in — remember the token, send them to sign in, and the
  // login page checks for exactly this on success to bring them straight
  // back here instead of the dashboard.
  useEffect(() => {
    if (!authLoading && !user && token && typeof window !== 'undefined') {
      localStorage.setItem('opdesk_pending_invite_token', token)
    }
  }, [authLoading, user, token])

  async function handleAccept() {
    setAccepting(true)
    setError('')
    const { error } = await supabase.rpc('accept_company_invite', { p_token: token })
    setAccepting(false)
    if (error) { setError(error.message); return }
    router.replace('/dashboard')
  }

  const wrapStyle = { minHeight: '100vh', background: 'linear-gradient(135deg, var(--navy) 0%, #1a3a5c 60%, #2d5a8e 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }
  const cardStyle = { background: 'white', borderRadius: '1.25rem', padding: '2.5rem', width: '100%', maxWidth: '440px', boxShadow: '0 24px 80px rgba(0,0,0,0.3)', textAlign: 'center' }

  if (loadingPreview || authLoading) {
    return <div style={wrapStyle}><div style={cardStyle}><p style={{ color: 'var(--gray-400)' }}>{t('loadingInvite')}</p></div></div>
  }

  if (notFound || !preview) {
    return (
      <div style={wrapStyle}>
        <div style={cardStyle}>
          <OpDeskLogo size={40} />
          <h1 style={{ fontSize: '1.25rem', margin: '1.25rem 0 0.5rem', color: 'var(--navy)' }}>{t('notFoundTitle')}</h1>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>{t('notFoundDesc')}</p>
        </div>
      </div>
    )
  }

  if (preview.status === 'accepted') {
    return (
      <div style={wrapStyle}>
        <div style={cardStyle}>
          <CheckCircle2 size={40} color="var(--teal, #0d9488)" />
          <h1 style={{ fontSize: '1.25rem', margin: '1.25rem 0 0.5rem', color: 'var(--navy)' }}>{t('alreadyAcceptedTitle')}</h1>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>{t('alreadyAcceptedDesc')}</p>
          <Link href="/auth/login" className="btn btn-navy" style={{ width: '100%' }}>{t('signIn')}</Link>
        </div>
      </div>
    )
  }

  if (preview.status === 'revoked') {
    return (
      <div style={wrapStyle}>
        <div style={cardStyle}>
          <AlertCircle size={40} color="var(--danger)" />
          <h1 style={{ fontSize: '1.25rem', margin: '1.25rem 0 0.5rem', color: 'var(--navy)' }}>{t('revokedTitle')}</h1>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>{t('revokedDesc', { company: preview.company_name })}</p>
        </div>
      </div>
    )
  }

  // Logged in, but already belongs to a different company — matches
  // accept_company_invite's own rejection, shown before they even try.
  if (user && profile?.company_id) {
    return (
      <div style={wrapStyle}>
        <div style={cardStyle}>
          <AlertCircle size={40} color="var(--danger)" />
          <h1 style={{ fontSize: '1.25rem', margin: '1.25rem 0 0.5rem', color: 'var(--navy)' }}>{t('alreadyLinkedTitle')}</h1>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>{t('alreadyLinkedDesc', { company: preview.company_name })}</p>
        </div>
      </div>
    )
  }

  return (
    <div style={wrapStyle}>
      <div style={cardStyle}>
        <OpDeskLogo size={40} />
        <h1 style={{ fontSize: '1.375rem', margin: '1.25rem 0 0.5rem', color: 'var(--navy)' }}>
          {t('joinHeading', { company: preview.company_name })}
        </h1>
        <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginBottom: '1.75rem' }}>
          {t('invitedAs', { role: preview.role === 'admin' ? t('roleAdmin') : t('roleStaff'), email: preview.email })}
        </p>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.5rem', padding: '0.75rem 1rem', marginBottom: '1.25rem', textAlign: 'left' }}>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--danger)' }}>{error}</p>
          </div>
        )}

        {user ? (
          <button className="btn btn-navy btn-lg" style={{ width: '100%' }} disabled={accepting} onClick={handleAccept}>
            {accepting ? t('joining') : t('acceptButton', { company: preview.company_name })}
          </button>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link href="/auth/login" className="btn btn-navy btn-lg" style={{ width: '100%' }}>{t('signInToAccept')}</Link>
            <p style={{ fontSize: '0.8125rem', color: 'var(--gray-400)', margin: 0 }}>
              {t('newAccountHint')}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AcceptInvitePage() {
  return (
    <AuthProvider>
      <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--navy)' }} />}>
        <AcceptInviteContent />
      </Suspense>
    </AuthProvider>
  )
}

export const dynamic = 'force-dynamic'
