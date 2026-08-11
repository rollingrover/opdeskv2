'use client'
import Link from 'next/link'
import { OpDeskLogo } from '@/components/layout/OpDeskLogo'

export function MarketingFooter() {
  return (
    <footer style={{ background:'#0a1929', color:'rgba(255,255,255,0.4)', padding:'2rem', textAlign:'center', fontSize:'0.8125rem' }}>
      <div style={{ marginBottom:'1rem' }}>
        <OpDeskLogo size={28} white />
      </div>
      <div style={{ display:'flex', gap:'1.5rem', justifyContent:'center', marginBottom:'1.25rem', flexWrap:'wrap' }}>
        {[['/features','Features'],['/pricing','Pricing'],['/about','About'],['/auth/login','Sign In'],['/auth/signup','Sign Up']].map(([href,label]) => (
          <Link key={href} href={href} style={{ color:'rgba(255,255,255,0.4)', textDecoration:'none' }}
            onMouseOver={e => e.currentTarget.style.color='rgba(255,255,255,0.7)'}
            onMouseOut={e => e.currentTarget.style.color='rgba(255,255,255,0.4)'}>
            {label}
          </Link>
        ))}
      </div>
      <div style={{ borderTop:'1px solid rgba(255,255,255,0.08)', paddingTop:'1rem', marginBottom:'0.75rem' }}>
        <Link href="/web-design" style={{ color:'var(--gold)', textDecoration:'none', fontSize:'0.8125rem', fontWeight:600 }}>
          Need a website too? RollingRover Productions can help →
        </Link>
      </div>
      <p style={{ margin:'0 0 0.375rem' }}>© {new Date().getFullYear()} OpDesk. Built for Africa's operators.</p>
      <p style={{ margin:0, fontSize:'0.75rem' }}>
        Web design by{' '}
        <a href="https://rollingrover.co.za" target="_blank" rel="noopener noreferrer"
          style={{ color:'rgba(255,255,255,0.5)', textDecoration:'underline' }}>
          RollingRover Productions
        </a>
      </p>
    </footer>
  )
}
