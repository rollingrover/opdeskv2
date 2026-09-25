'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { OpDeskLogo } from '@/components/layout/OpDeskLogo'
import { BrandIcon } from '@/components/ui/BrandIcon'

function LoginForm() {
  const t = useTranslations('Auth.Login')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const { signIn } = useAuth()
  const router = useRouter()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await signIn(email, password)
    if (error) { setError(error.message); setLoading(false) }
    else {
      const pendingToken = typeof window !== 'undefined' ? localStorage.getItem('opdesk_pending_invite_token') : null
      if (pendingToken) {
        localStorage.removeItem('opdesk_pending_invite_token')
        router.replace(`/auth/accept-invite?token=${pendingToken}`)
      } else {
        router.replace('/dashboard')
      }
    }
  }

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg, var(--navy) 0%, #1a3a5c 60%, #2d5a8e 100%)', display:'flex', alignItems:'center', justifyContent:'center', padding:'1.5rem' }}>
      <div style={{ background:'white', borderRadius:'1.25rem', padding:'2.5rem', width:'100%', maxWidth:'420px', boxShadow:'0 24px 80px rgba(0,0,0,0.3)' }}>
        <div style={{ textAlign:'center', marginBottom:'2rem' }}>
          <div style={{ display:'flex', justifyContent:'center', marginBottom:'1rem' }}>
            <OpDeskLogo size={48} />
          </div>
          <h1 style={{ fontSize:'1.5rem', margin:'0 0 0.25rem', color:'var(--navy)' }}>{t('welcomeBack')}</h1>
          <p style={{ color:'var(--gray-400)', fontSize:'0.875rem', margin:0 }}>{t('subtitle')}</p>
        </div>

        {error && (
          <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:'0.5rem', padding:'0.75rem 1rem', marginBottom:'1.25rem', display:'flex', gap:'0.5rem', alignItems:'flex-start' }}>
            <AlertCircle size={16} color="var(--danger)" style={{ flexShrink:0, marginTop:1 }} />
            <p style={{ margin:0, fontSize:'0.875rem', color:'var(--danger)' }}>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom:'1rem' }}>
            <label className="label">{t('email')}</label>
            <input type="email" className="input" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@yourbusiness.com" required autoComplete="email" />
          </div>

          <div style={{ marginBottom:'0.5rem' }}>
            <label className="label">{t('password')}</label>
            <div style={{ position:'relative' }}>
              <input type={showPw ? 'text' : 'password'} className="input" value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={t('password')} required autoComplete="current-password"
                style={{ paddingRight:'2.5rem' }} />
              <button type="button" onClick={() => setShowPw(v => !v)}
                style={{ position:'absolute', right:'0.75rem', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--gray-400)', padding:0 }}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div style={{ textAlign:'right', marginBottom:'1.5rem' }}>
            <Link href="/auth/forgot-password" style={{ fontSize:'0.8125rem', color:'var(--gold)', textDecoration:'none', fontWeight:500 }}>
              {t('forgotPassword')}
            </Link>
          </div>

          <button type="submit" className="btn btn-navy btn-lg" style={{ width:'100%' }} disabled={loading}>
            {loading ? t('signingIn') : t('signIn')}
          </button>
        </form>

        <div style={{ textAlign:'center', marginTop:'1.5rem', paddingTop:'1.5rem', borderTop:'1px solid var(--gray-100)' }}>
          <p style={{ fontSize:'0.875rem', color:'var(--gray-500)', margin:0 }}>
            {t('noAccount')}{' '}
            <Link href="/auth/signup" style={{ color:'var(--orange)', fontWeight:600, textDecoration:'none', display:'inline-flex', alignItems:'center', gap:'0.25rem' }}>
              {t('startFree')} <BrandIcon name="arrowRight" size={12} />
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return <AuthProvider><LoginForm /></AuthProvider>
}

export const dynamic = 'force-dynamic'
