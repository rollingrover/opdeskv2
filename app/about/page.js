'use client'
import Link from 'next/link'
import { BrandIcon } from '@/components/ui/BrandIcon'
import { MarketingNav } from '@/components/marketing/MarketingNav'
import { MarketingFooter } from '@/components/marketing/MarketingFooter'

const OPERATOR_TYPES = [
  { icon: 'safari', label: 'Safari & Game Lodges' },
  { icon: 'shuttle', label: 'Shuttle Companies' },
  { icon: 'fishing', label: 'Fishing Charters' },
  { icon: 'yacht', label: 'Yacht Charters' },
  { icon: 'trailGuide', label: 'Trail Guides' },
  { icon: 'gameLodge', label: 'Hotels & Guesthouses' },
  { icon: 'eastAfrica', label: 'East Africa Tours' },
  { icon: 'islandTransfer', label: 'Island Transfers' },
]

export default function AboutPage() {
  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      <MarketingNav />

      <section style={{ background: 'linear-gradient(135deg, var(--navy) 0%, #1a3a5c 55%, #1B8A8F 100%)', padding: '4rem 2rem', textAlign: 'center', color: 'white' }}>
        <p style={{ fontSize: '0.875rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '1rem' }}>
          Our story
        </p>
        <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 'clamp(2rem, 4.5vw, 3rem)', fontWeight: 900, color: 'white', margin: '0 auto 1.25rem', maxWidth: '700px', lineHeight: 1.15 }}>
          Built by people who understand Africa's operators
        </h1>
        <p style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,0.75)', maxWidth: '620px', margin: '0 auto', lineHeight: 1.6 }}>
          OpDesk exists because running a safari lodge, a shuttle fleet, or a fishing charter shouldn't mean juggling five different spreadsheets and a WhatsApp group.
        </p>
      </section>

      <section style={{ padding: '4rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.5rem', color: 'var(--navy)', marginBottom: '1rem' }}>Why we built this</h2>
        <p style={{ color: 'var(--gray-500)', lineHeight: 1.8, marginBottom: '1rem' }}>
          Most operations software is built for hotels in Europe or tour companies in the US — it doesn't understand firearm registers, multi-currency invoicing across a dozen African currencies, or the difference between a game vehicle and a shuttle van.
        </p>
        <p style={{ color: 'var(--gray-500)', lineHeight: 1.8, marginBottom: '1rem' }}>
          OpDesk is built specifically for the operators who keep Africa's tourism industry running: safari lodges, guesthouses, shuttle and transfer companies, fishing and yacht charters, and trail guiding operations. One dashboard for bookings, staff, fleet, lodging, certifications, and invoicing — in the currency and language you actually work in.
        </p>
        <p style={{ color: 'var(--gray-500)', lineHeight: 1.8 }}>
          No credit card required to start. No lock-in. Just a tool that gets out of your way so you can run your business.
        </p>
      </section>

      <section style={{ background: 'var(--cream)', padding: '3.5rem 2rem', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.5rem', color: 'var(--navy)', marginBottom: '0.5rem' }}>Who we build for</h2>
        <p style={{ color: 'var(--gray-500)', marginBottom: '2.5rem' }}>If this sounds like your business, OpDesk was built for you</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', maxWidth: '900px', margin: '0 auto' }}>
          {OPERATOR_TYPES.map(t => (
            <div key={t.label} className="card card-shadow" style={{ background: 'white' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.625rem' }}><BrandIcon name={t.icon} size={40} /></div>
              <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--navy)', lineHeight: 1.3 }}>{t.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ background: 'var(--navy)', padding: '4rem 2rem', textAlign: 'center', color: 'white' }}>
        <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '2rem', color: 'white', marginBottom: '0.75rem' }}>Ready to get started?</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '2rem', fontSize: '1rem' }}>Join operators across Africa who run their business with OpDesk.</p>
        <Link href="/auth/signup" className="btn btn-primary btn-xl">Start for Free <BrandIcon name="arrowRight" size={14} style={{ display:'inline-block' }} /></Link>
      </section>

      <MarketingFooter />
    </div>
  )
}
