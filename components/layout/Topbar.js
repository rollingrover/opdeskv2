'use client'
import { useState } from 'react'
import { Menu, Bell, Search, ChevronDown, User, Shield, LogOut } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'

export function Topbar({ onMenuClick }) {
  const t = useTranslations('Topbar')
  const { profile, company, signOut } = useAuth()
  const router = useRouter()
  const [dropOpen, setDropOpen] = useState(false)

  async function handleSignOut() {
    setDropOpen(false)
    await signOut()
    // Explicit navigation rather than leaving the user on a now-stale
    // protected page — going straight to the landing page rather than
    // /auth/login, since there's nothing left to sign back into from here
    // that the middleware would otherwise redirect them to.
    router.push('/')
  }

  return (
    <header className="topbar">
      <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
        <button className="btn btn-ghost btn-sm" onClick={onMenuClick}
          style={{ display:'none', padding:'0.375rem' }}
          id="mobile-menu-btn">
          <Menu size={20} />
        </button>
        <div style={{ position:'relative', display:'flex', alignItems:'center' }}>
          <Search size={15} style={{ position:'absolute', left:'0.625rem', color:'var(--gray-400)', pointerEvents:'none' }} />
          <input placeholder={t('searchPlaceholder')} className="input"
            style={{ paddingLeft:'2rem', width:'260px', height:'2rem', fontSize:'0.8125rem', border:'1px solid var(--gray-200)' }} />
        </div>
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
        {profile?.is_superadmin && (
          <Link href="/admin" style={{
            display:'flex', alignItems:'center', gap:'0.375rem', background:'#dc2626', color:'white',
            fontSize:'0.75rem', fontWeight:700, padding:'0.375rem 0.75rem', borderRadius:'0.5rem',
            textDecoration:'none', letterSpacing:'0.02em',
          }}>
            <Shield size={13} /> Superadmin
          </Link>
        )}
        <button className="btn btn-ghost btn-sm" style={{ padding:'0.375rem', position:'relative' }}>
          <Bell size={18} />
        </button>

        <div style={{ position:'relative' }}>
          <button className="btn btn-ghost btn-sm"
            onClick={() => setDropOpen(v => !v)}
            style={{ display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.25rem 0.5rem' }}>
            <div style={{ width:30, height:30, borderRadius:'50%', background:'var(--navy)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              {profile?.avatar_url
                ? <img src={profile.avatar_url} alt="" style={{ width:30, height:30, borderRadius:'50%', objectFit:'cover' }} />
                : <User size={15} color="white" />}
            </div>
            <div style={{ textAlign:'left', display:'flex', flexDirection:'column' }}>
              <span style={{ fontSize:'0.8125rem', fontWeight:600, color:'var(--navy)', lineHeight:1.2 }}>
                {profile?.full_name?.split(' ')[0] || t('userFallback')}
              </span>
              <span style={{ fontSize:'0.7rem', color:'var(--gray-400)', lineHeight:1.2, textTransform:'capitalize' }}>
                {profile?.role}
              </span>
            </div>
            <ChevronDown size={14} color="var(--gray-400)" />
          </button>

          {dropOpen && (
            <>
              <div onClick={() => setDropOpen(false)}
                style={{ position:'fixed', inset:0, zIndex:10 }} />
              <div style={{
                position:'absolute', right:0, top:'calc(100% + 0.5rem)', background:'white',
                border:'1px solid var(--gray-200)', borderRadius:'0.625rem', minWidth:'180px',
                boxShadow:'0 4px 20px rgba(0,0,0,0.1)', zIndex:20, overflow:'hidden'
              }}>
                <div style={{ padding:'0.75rem 1rem', borderBottom:'1px solid var(--gray-100)' }}>
                  <p style={{ fontSize:'0.8125rem', fontWeight:600, margin:0, color:'var(--navy)' }}>{profile?.full_name}</p>
                  <p style={{ fontSize:'0.75rem', color:'var(--gray-400)', margin:0 }}>{profile?.email}</p>
                </div>
                {[
                  { href:'/settings', label:t('settings') },
                  { href:'/settings/billing', label:t('billing') },
                  { href:'/support', label:t('support') },
                  ...(profile?.is_superadmin ? [{ href:'/admin', label:'Superadmin Panel' }] : []),
                ].map(item => (
                  <Link key={item.href} href={item.href} onClick={() => setDropOpen(false)}
                    style={{ display:'block', padding:'0.625rem 1rem', fontSize:'0.875rem', color:'var(--gray-700)', textDecoration:'none' }}
                    onMouseOver={e => e.currentTarget.style.background='var(--gray-50)'}
                    onMouseOut={e => e.currentTarget.style.background='transparent'}>
                    {item.label}
                  </Link>
                ))}
                <button onClick={handleSignOut}
                  style={{
                    display:'flex', alignItems:'center', gap:'0.5rem', width:'100%', padding:'0.625rem 1rem',
                    fontSize:'0.875rem', color:'var(--danger, #dc2626)', background:'none', border:'none',
                    borderTop:'1px solid var(--gray-100)', cursor:'pointer', textAlign:'left',
                  }}
                  onMouseOver={e => e.currentTarget.style.background='var(--gray-50)'}
                  onMouseOut={e => e.currentTarget.style.background='transparent'}>
                  <LogOut size={14} /> {t('signOut')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) { #mobile-menu-btn { display: flex !important; } }
      `}</style>
    </header>
  )
}
