'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { OpDeskLogo } from '@/components/layout/OpDeskLogo'

function ResetForm() {
  const t = useTranslations('Auth.ResetPassword')
  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [showPw, setShowPw]       = useState(false)
  const [loading, setLoading]     = useState(false)
  const [done, setDone]           = useState(false)
  const [error, setError]         = useState('')
  const { updatePassword } = useAuth()
  const router = useRouter()

  async function handleSubmit(e) {
    e.preventDefault()
    if (password !== confirm) { setError(t('mismatch')); return }
    if (password.length < 8) { setError(t('tooShort')); return }
    setLoading(true); setError('')
    const { error } = await updatePassword(password)
    if (error) { setError(error.message); setLoading(false) }
    else { setDone(true); setTimeout(() => router.replace('/dashboard'), 2500) }
  }

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg, var(--navy) 0%, #1a3a5c 60%, #2d5a8e 100%)', display:'flex', alignItems:'center', justifyContent:'center', padding:'1.5rem' }}>
      <div style={{ background:'white', borderRadius:'1.25rem', padding:'2.5rem', width:'100%', maxWidth:'420px', boxShadow:'0 24px 80px rgba(0,0,0,0.3)' }}>
        <div style={{ textAlign:'center', marginBottom:'2rem' }}>
          <div style={{ display:'flex', justifyContent:'center', marginBottom:'1rem' }}>
            <OpDeskLogo size={48} />
          </div>
          <h1 style={{ fontSize:'1.5rem', margin:'0 0 0.25rem', color:'var(--navy)' }}>{t('title')}</h1>
          <p style={{ color:'var(--gray-400)', fontSize:'0.875rem', margin:0 }}>{t('subtitle')}</p>
        </div>

        {done ? (
          <div style={{ textAlign:'center', padding:'1rem 0' }}>
            <CheckCircle size={48} color="var(--teal)" style={{ marginBottom:'1rem' }} />
            <h3 style={{ color:'var(--navy)' }}>{t('updated')}</h3>
            <p style={{ color:'var(--gray-400)', fontSize:'0.875rem' }}>{t('redirecting')}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:'0.5rem', padding:'0.75rem 1rem', marginBottom:'1.25rem', display:'flex', gap:'0.5rem' }}>
                <AlertCircle size={16} color="var(--danger)" style={{ flexShrink:0 }} />
                <p style={{ margin:0, fontSize:'0.875rem', color:'var(--danger)' }}>{error}</p>
              </div>
            )}
            <div style={{ marginBottom:'1rem' }}>
              <label className="label">{t('newPassword')}</label>
              <div style={{ position:'relative' }}>
                <input type={showPw ? 'text' : 'password'} className="input" value={password}
                  onChange={e => setPassword(e.target.value)} placeholder={t('passwordHint')} required
                  style={{ paddingRight:'2.5rem' }} />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  style={{ position:'absolute', right:'0.75rem', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--gray-400)', padding:0 }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div style={{ marginBottom:'1.5rem' }}>
              <label className="label">{t('confirmPassword')}</label>
              <input type="password" className="input" value={confirm}
                onChange={e => setConfirm(e.target.value)} placeholder={t('confirmHint')} required />
            </div>
            <button type="submit" className="btn btn-navy btn-lg" style={{ width:'100%' }} disabled={loading}>
              {loading ? t('updating') : t('updateButton')}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return <AuthProvider><ResetForm /></AuthProvider>
}

export const dynamic = 'force-dynamic'
