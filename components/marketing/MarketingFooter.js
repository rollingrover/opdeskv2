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
