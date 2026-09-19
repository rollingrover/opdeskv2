'use client'
import { useState } from 'react'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { Mail, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { OpDeskLogo } from '@/components/layout/OpDeskLogo'

function ForgotForm() {
  const t = useTranslations('Auth.ForgotPassword')
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState('')
  const { resetPassword } = useAuth()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await resetPassword(email)
    if (error) { setError(error.message); setLoading(false) }
    else { setSent(true); setLoading(false) }
  }

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg, var(--navy) 0%, #1a3a5c 60%, #2d5a8e 100%)', display:'flex', alignItems:'center', justifyContent:'center', padding:'1.5rem' }}>
      <div style={{ background:'white', borderRadius:'1.25rem', padding:'2.5rem', width:'100%', maxWidth:'420px', boxShadow:'0 24px 80px rgba(0,0,0,0.3)' }}>
        <div style={{ textAlign:'center', marginBottom:'2rem' }}>
          <div style={{ display:'flex', justifyContent:'center', marginBottom:'1rem' }}>
            <OpDeskLogo size={48} />
          </div>
          <h1 style={{ fontSize:'1.5rem', margin:'0 0 0.25rem', color:'var(--navy)' }}>{t('title')}</h1>
          <p style={{ color:'var(--gray-400)', fontSize:'0.875rem', margin:0 }}>
            {t('subtitle')}
          </p>
        </div>

        {sent ? (
          <div style={{ textAlign:'center', padding:'1rem 0' }}>
            <CheckCircle size={48} color="var(--teal)" style={{ marginBottom:'1rem' }} />
            <h3 style={{ color:'var(--navy)', marginBottom:'0.5rem' }}>{t('checkInbox')}</h3>
            <p style={{ color:'var(--gray-500)', fontSize:'0.875rem', marginBottom:'1.5rem' }}>
              {t('sentTo', { email })}
            </p>
            <Link href="/auth/login" className="btn btn-outline" style={{ width:'100%', justifyContent:'center' }}>
              <ArrowLeft size={16} /> {t('backToLogin')}
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:'0.5rem', padding:'0.75rem 1rem', marginBottom:'1.25rem', display:'flex', gap:'0.5rem' }}>
                <AlertCircle size={16} color="var(--danger)" style={{ flexShrink:0 }} />
                <p style={{ margin:0, fontSize:'0.875rem', color:'var(--danger)' }}>{error}</p>
              </div>
            )}
            <div style={{ marginBottom:'1.5rem' }}>
              <label className="label">{t('email')}</label>
              <div style={{ position:'relative' }}>
                <Mail size={15} style={{ position:'absolute', left:'0.75rem', top:'50%', transform:'translateY(-50%)', color:'var(--gray-400)', pointerEvents:'none' }} />
                <input type="email" className="input" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@yourbusiness.com" required style={{ paddingLeft:'2.25rem' }} />
              </div>
            </div>
            <button type="submit" className="btn btn-navy btn-lg" style={{ width:'100%' }} disabled={loading}>
              {loading ? t('sending') : t('sendLink')}
            </button>
            <div style={{ textAlign:'center', marginTop:'1.25rem' }}>
              <Link href="/auth/login" style={{ fontSize:'0.875rem', color:'var(--gray-500)', textDecoration:'none', display:'inline-flex', alignItems:'center', gap:'0.25rem' }}>
                <ArrowLeft size={14} /> {t('backToLogin')}
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default function ForgotPasswordPage() {
  return <AuthProvider><ForgotForm /></AuthProvider>
}

export const dynamic = 'force-dynamic'
