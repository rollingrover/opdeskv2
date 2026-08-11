'use client'
import { BrandIcon } from '@/components/ui/BrandIcon'
import Link from 'next/link'
import { OpDeskLogo } from '@/components/layout/OpDeskLogo'

export function MarketingNav() {
  return (
    <nav style={{ background:'var(--navy)', padding:'0 2rem', height:'4rem', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:100 }}>
      <Link href="/" style={{ textDecoration:'none' }}><OpDeskLogo size={36} white /></Link>
      <div style={{ display:'flex', gap:'1.5rem', alignItems:'center' }}>
        {[['/features','Features'],['/pricing','Pricing'],['/about','About']].map(([href,label]) => (
          <Link key={href} href={href} style={{ color:'rgba(255,255,255,0.7)', textDecoration:'none', fontSize:'0.875rem', fontWeight:500, transition:'color 0.15s' }}
            onMouseOver={e => e.currentTarget.style.color='white'}
            onMouseOut={e => e.currentTarget.style.color='rgba(255,255,255,0.7)'}>
            {label}
          </Link>
        ))}
        <Link href="/auth/login" style={{ color:'rgba(255,255,255,0.7)', textDecoration:'none', fontSize:'0.875rem', fontWeight:500 }}>Sign In</Link>
        <Link href="/auth/signup" className="btn btn-primary btn-sm">Start Free <BrandIcon name="arrowRight" size={14} style={{ display:'inline-block' }} /></Link>
      </div>
    </nav>
  )
}
