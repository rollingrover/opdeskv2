'use client'
import { Link } from '@/i18n/navigation'
import PlainLink from 'next/link'
import { useTranslations } from 'next-intl'
import { OpDeskLogo } from '@/components/layout/OpDeskLogo'

export function MarketingFooter() {
  const t = useTranslations('Footer')
  const nav = useTranslations('Nav')
  return (
    <footer style={{ background:'#0a1929', color:'rgba(255,255,255,0.4)', padding:'2rem', textAlign:'center', fontSize:'0.8125rem' }}>
      <div style={{ marginBottom:'1rem' }}>
        <OpDeskLogo size={28} white />
      </div>
      <div style={{ display:'flex', gap:'0.75rem', justifyContent:'center', marginBottom:'1.25rem' }}>
        <a href="https://www.facebook.com/opdeskapp" target="_blank" rel="noopener noreferrer" aria-label="OpDesk on Facebook"
          style={{ color:'rgba(255,255,255,0.4)', display:'inline-flex', padding:'0.375rem' }}
          onMouseOver={e => e.currentTarget.style.color='rgba(255,255,255,0.7)'}
          onMouseOut={e => e.currentTarget.style.color='rgba(255,255,255,0.4)'}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M22 12.06C22 6.505 17.523 2 12 2S2 6.505 2 12.06c0 5.02 3.657 9.184 8.438 9.94v-7.03H7.898v-2.91h2.54V9.845c0-2.507 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562v1.875h2.773l-.443 2.91h-2.33V22c4.78-.756 8.437-4.92 8.437-9.94Z" />
          </svg>
        </a>
        <a href="https://www.instagram.com/opdeskapp" target="_blank" rel="noopener noreferrer" aria-label="OpDesk on Instagram"
          style={{ color:'rgba(255,255,255,0.4)', display:'inline-flex', padding:'0.375rem' }}
          onMouseOver={e => e.currentTarget.style.color='rgba(255,255,255,0.7)'}
          onMouseOut={e => e.currentTarget.style.color='rgba(255,255,255,0.4)'}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
          </svg>
        </a>
      </div>
      <div style={{ display:'flex', gap:'1.5rem', justifyContent:'center', marginBottom:'1.25rem', flexWrap:'wrap' }}>
        {[['/features', nav('features')], ['/pricing', nav('pricing')], ['/about', nav('about')], ['/auth/login', nav('signIn')], ['/auth/signup', nav('startFree')]].map(([href, label]) => (
          <Link key={href} href={href} style={{ color:'rgba(255,255,255,0.4)', textDecoration:'none' }}
            onMouseOver={e => e.currentTarget.style.color='rgba(255,255,255,0.7)'}
            onMouseOut={e => e.currentTarget.style.color='rgba(255,255,255,0.4)'}>
            {label}
          </Link>
        ))}
        <PlainLink href="/operators" style={{ color:'rgba(255,255,255,0.4)', textDecoration:'none' }}
          onMouseOver={e => e.currentTarget.style.color='rgba(255,255,255,0.7)'}
          onMouseOut={e => e.currentTarget.style.color='rgba(255,255,255,0.4)'}>
          Find Operators
        </PlainLink>
      </div>
      <div style={{ borderTop:'1px solid rgba(255,255,255,0.08)', paddingTop:'1rem', marginBottom:'0.75rem' }}>
        <Link href="/web-design" style={{ color:'var(--gold)', textDecoration:'none', fontSize:'0.8125rem', fontWeight:600 }}>
          {t('needWebsite')} →
        </Link>
      </div>
      <p style={{ margin:'0 0 0.375rem' }}>{t('copyright', { year: new Date().getFullYear() })}</p>
      <p style={{ margin:'0 0 0.75rem', fontSize:'0.6875rem', color:'rgba(255,255,255,0.3)' }}>
        {t('regInfo')}
      </p>
      <div style={{ display:'flex', gap:'1rem', justifyContent:'center', marginBottom:'0.75rem', fontSize:'0.6875rem' }}>
        <PlainLink href="/privacy" style={{ color:'rgba(255,255,255,0.35)', textDecoration:'underline' }}>Privacy Policy</PlainLink>
        <PlainLink href="/paia-manual" style={{ color:'rgba(255,255,255,0.35)', textDecoration:'underline' }}>PAIA Manual</PlainLink>
      </div>
      <p style={{ margin:0, fontSize:'0.75rem' }}>
        {t('webDesignBy')}{' '}
        <a href="https://rollingrover.co.za" target="_blank" rel="noopener noreferrer"
          style={{ color:'rgba(255,255,255,0.5)', textDecoration:'underline' }}>
          RollingRover Productions
        </a>
      </p>
    </footer>
  )
}
