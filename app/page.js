'use client'
import Link from 'next/link'
import { BrandIcon } from '@/components/ui/BrandIcon'
import { MarketingNav } from '@/components/marketing/MarketingNav'
import { MarketingFooter } from '@/components/marketing/MarketingFooter'

const OPERATOR_TYPES = [
  { icon:'safari', label:'Safari / Game Lodges' },
  { icon:'shuttle', label:'Shuttles & Transfers' },
  { icon:'fishing', label:'Fishing Charters' },
  { icon:'yacht', label:'Yacht Charters' },
  { icon:'trailGuide', label:'Trail Guides' },
  { icon:'gameLodge', label:'Hotels & Guesthouses' },
  { icon:'eastAfrica', label:'East Africa Tours' },
  { icon:'islandTransfer', label:'Island Transfers' },
]

const FEATURES = [
  { icon:'bookingCalendar', title:'Bookings & Calendar',    desc:'Full booking management with drag-and-drop calendar scheduling for all operator types.' },
  { icon:'teamRoles', title:'Staff & HR',             desc:'Certifications, cost-to-company tracking, shifts, leave management, and performance notes.' },
  { icon:'gameLodge', title:'Lodging & Rooms',        desc:'Room inventory, availability calendar, guest check-in/out, and housekeeping task board.' },
  { icon:'fleet', title:'Fleet Management',       desc:'Track vehicles and vessels with licence expiry, roadworthy, and insurance reminders.' },
  { icon:'proformaInvoice', title:'Pro Forma Invoices',     desc:'Professional invoices in 15+ currencies with VAT calculations and PDF export.' },
  { icon:'dashboardReports', title:'Reports & Analytics',    desc:'Occupancy rates, revenue, staff costs, and booking trends at a glance.' },
  { icon:'firearmRegister', title:'Firearm Register',       desc:'Compliant firearm tracking for safari and fishing operators with licence expiry alerts.' },
  { icon:'trailsModule', title:'Trails Module',          desc:'Manage trail routes, difficulty, capacity, and guide assignments.' },
]

export default function HomePage() {
  return (
    <div style={{ fontFamily:'Inter, sans-serif' }}>
      <MarketingNav />

      {/* HERO */}
      <section style={{ background:'linear-gradient(135deg, var(--navy) 0%, #1a3a5c 55%, #1B8A8F 100%)', padding:'5rem 2rem 6rem', textAlign:'center', color:'white' }}>
        <p style={{ fontSize:'0.875rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--gold)', marginBottom:'1rem' }}>
          Operate. Explore. Grow.
        </p>
        <h1 style={{ fontFamily:'Montserrat, sans-serif', fontSize:'clamp(2rem, 5vw, 3.5rem)', fontWeight:900, color:'white', margin:'0 auto 1.25rem', maxWidth:'800px', lineHeight:1.1 }}>
          The command centre for <span style={{ color:'var(--gold)' }}>Africa's operators</span>
        </h1>
        <p style={{ fontSize:'clamp(1rem, 2vw, 1.25rem)', color:'rgba(255,255,255,0.75)', maxWidth:'600px', margin:'0 auto 2.5rem', lineHeight:1.6 }}>
          Safari lodges, guesthouses, charters, shuttles and trail operators — all in one platform. Bookings, staff, lodging, fleet, certs, and invoices.
        </p>
        <div style={{ display:'flex', gap:'1rem', justifyContent:'center', flexWrap:'wrap' }}>
          <Link href="/auth/signup" className="btn btn-primary btn-xl">Start for Free <BrandIcon name="arrowRight" size={14} style={{ display:'inline-block' }} /></Link>
          <Link href="/features" className="btn btn-outline btn-xl" style={{ color:'white', borderColor:'rgba(255,255,255,0.4)' }}>See Features</Link>
        </div>
        <p style={{ marginTop:'1.5rem', fontSize:'0.8125rem', color:'rgba(255,255,255,0.4)' }}>No credit card required · Cancel anytime · Runs in your browser</p>
      </section>

      {/* OPERATOR TYPES */}
      <section style={{ background:'var(--cream)', padding:'4rem 2rem', textAlign:'center' }}>
        <h2 style={{ fontFamily:'Montserrat, sans-serif', fontSize:'1.75rem', marginBottom:'0.5rem' }}>Built for every African operator</h2>
        <p style={{ color:'var(--gray-500)', marginBottom:'2.5rem', fontSize:'1rem' }}>One platform, every business type</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))', gap:'1rem', maxWidth:'900px', margin:'0 auto' }}>
          {OPERATOR_TYPES.map(t => (
            <div key={t.label} style={{ background:'white', borderRadius:'1rem', padding:'1.5rem 1rem', border:'1px solid var(--gray-200)', transition:'box-shadow 0.2s, border-color 0.2s', cursor:'default' }}
              onMouseOver={e => { e.currentTarget.style.boxShadow='0 4px 20px rgba(0,0,0,0.09)'; e.currentTarget.style.borderColor='var(--gold)' }}
              onMouseOut={e => { e.currentTarget.style.boxShadow='none'; e.currentTarget.style.borderColor='var(--gray-200)' }}>
              <div style={{ marginBottom:'0.625rem', display:'flex', justifyContent:'center' }}><BrandIcon name={t.icon} size={40} /></div>
              <p style={{ margin:0, fontSize:'0.875rem', fontWeight:600, color:'var(--navy)', lineHeight:1.3 }}>{t.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding:'4rem 2rem', maxWidth:'1100px', margin:'0 auto' }}>
        <div style={{ textAlign:'center', marginBottom:'3rem' }}>
          <h2 style={{ fontFamily:'Montserrat, sans-serif', fontSize:'1.75rem', marginBottom:'0.5rem' }}>Everything you need to run your business</h2>
          <p style={{ color:'var(--gray-500)', fontSize:'1rem' }}>No spreadsheets. No WhatsApp bookings. One dashboard.</p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))', gap:'1.25rem' }}>
          {FEATURES.map(f => (
            <div key={f.title} className="card card-lg card-shadow"
              style={{ transition:'transform 0.2s, box-shadow 0.2s' }}
              onMouseOver={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 8px 30px rgba(0,0,0,0.1)' }}
              onMouseOut={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='0 1px 6px rgba(0,0,0,0.07)' }}>
              <div style={{ marginBottom:'0.75rem' }}><BrandIcon name={f.icon} size={36} /></div>
              <h3 style={{ margin:'0 0 0.5rem', fontSize:'1rem', color:'var(--navy)' }}>{f.title}</h3>
              <p style={{ margin:0, fontSize:'0.875rem', color:'var(--gray-500)', lineHeight:1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background:'var(--navy)', padding:'4rem 2rem', textAlign:'center', color:'white' }}>
        <h2 style={{ fontFamily:'Montserrat, sans-serif', fontSize:'2rem', color:'white', marginBottom:'0.75rem' }}>Ready to take control of your operations?</h2>
        <p style={{ color:'rgba(255,255,255,0.6)', marginBottom:'2rem', fontSize:'1rem' }}>Join operators across Africa who run their business with OpDesk.</p>
        <Link href="/auth/signup" className="btn btn-primary btn-xl">Start for Free <BrandIcon name="arrowRight" size={14} style={{ display:'inline-block' }} /></Link>
      </section>

      <MarketingFooter />
    </div>
  )
}
