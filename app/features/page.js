'use client'
import Link from 'next/link'
import { BrandIcon } from '@/components/ui/BrandIcon'
import { MarketingNav } from '@/components/marketing/MarketingNav'
import { MarketingFooter } from '@/components/marketing/MarketingFooter'

const FEATURE_GROUPS = [
  {
    heading: 'Operations',
    items: [
      { slug: 'bookings-calendar', icon: 'bookingCalendar', title: 'Bookings & Calendar', desc: 'Create and manage bookings across tours, transfers, charters and stays, with guest details, pricing, and status tracking in one place.' },
      { slug: 'fleet-management', icon: 'fleet', title: 'Fleet Management', desc: 'Track every vehicle and vessel — registration, capacity, and status — so you always know what\u2019s available and what\u2019s in for maintenance.' },
      { slug: 'trails-module', icon: 'trailsModule', title: 'Trails Module', desc: 'Manage trail routes, difficulty ratings, distance, duration, and guide assignments for adventure and hiking operators.' },
      { slug: 'shifts-scheduling', icon: 'schedules', title: 'Shifts & Scheduling', desc: 'Roster your guides, drivers and support staff against bookings so nothing gets double-booked.' },
    ],
  },
  {
    heading: 'Staff & HR',
    items: [
      { slug: 'staff-roles', icon: 'teamRoles', title: 'Staff & Roles', desc: 'Keep a full staff directory with employment type, contact details, and role-based access across your team.' },
      { slug: 'certifications', icon: 'guides', title: 'Certifications', desc: 'Track guide and staff certifications with issuing bodies and expiry dates, so nobody is out in the field unqualified.' },
      { slug: 'firearm-register', icon: 'firearmRegister', title: 'Firearm Register', desc: 'Compliant firearm tracking for safari and fishing operators — serials, licences, and safe storage locations.' },
      { slug: 'cost-to-company', icon: 'driversShuttles', title: 'Cost to Company', desc: 'Full payroll breakdowns — salary, allowances, deductions, and true cost to company — per staff member.' },
    ],
  },
  {
    heading: 'Guest & Property',
    items: [
      { slug: 'lodging-rooms', icon: 'gameLodge', title: 'Lodging & Rooms', desc: 'Room inventory, nightly rates, and live occupancy status for lodges, guesthouses and hotels.' },
      { slug: 'housekeeping', icon: 'shuttle', title: 'Housekeeping', desc: 'Assign and track room turnover tasks so every room is guest-ready on schedule.' },
      { slug: 'guest-directory', icon: 'islandTransfer', title: 'Guest Directory', desc: 'A single view of every guest across all your stays and bookings.' },
    ],
  },
  {
    heading: 'Finance & Reporting',
    items: [
      { slug: 'invoicing', icon: 'proformaInvoice', title: 'Pro Forma & Tax Invoices', desc: 'Generate professional invoices with automatic VAT calculation in your local currency.' },
      { slug: 'reports-analytics', icon: 'dashboardReports', title: 'Reports & Analytics', desc: 'Occupancy, revenue, staff cost and booking trend reports whenever you need them.' },
      { slug: 'csv-export', icon: 'csvExport', title: 'CSV Data Export', desc: 'Export any of your operational data for accounting, audits, or your own spreadsheets.' },
      { slug: 'automatic-backups', icon: 'autoBackup', title: 'Automatic Backups', desc: 'Your data is automatically backed up, so a lost laptop or a fat-fingered delete never costs you anything.' },
    ],
  },
  {
    heading: 'Platform',
    items: [
      { slug: 'multi-currency', icon: 'multiCurrency', title: 'Multi-Currency & Language', desc: 'Run your business in ZAR, KES, USD, EUR and more, with support for multiple languages across the region.' },
      { slug: 'white-label-branding', icon: 'whiteLabel', title: 'White-Label Branding', desc: 'Put your own logo and colours on guest-facing invoices and documents (available on higher tiers).' },
      { slug: 'built-for-africa', icon: 'marketing', title: 'Built for Africa\u2019s Operators', desc: 'Designed around how safari lodges, shuttle companies, charters and trail operators actually work day to day.' },
    ],
  },
]

export default function FeaturesPage() {
  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      <MarketingNav />

      <section style={{ background: 'linear-gradient(135deg, var(--navy) 0%, #1a3a5c 55%, #1B8A8F 100%)', padding: '4rem 2rem', textAlign: 'center', color: 'white' }}>
        <p style={{ fontSize: '0.875rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '1rem' }}>
          Everything, in one place
        </p>
        <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 'clamp(2rem, 4.5vw, 3rem)', fontWeight: 900, color: 'white', margin: '0 auto 1.25rem', maxWidth: '760px', lineHeight: 1.15 }}>
          Every feature your operation actually needs
        </h1>
        <p style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,0.75)', maxWidth: '620px', margin: '0 auto', lineHeight: 1.6 }}>
          No spreadsheets. No WhatsApp bookings. No missed certifications. One dashboard for bookings, staff, fleet, lodging and finance.
        </p>
      </section>

      {FEATURE_GROUPS.map((group, i) => (
        <section key={group.heading} style={{ padding: '3.5rem 2rem', maxWidth: '1100px', margin: '0 auto', background: i % 2 === 1 ? 'var(--cream)' : 'transparent' }}>
          <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.5rem', color: 'var(--navy)', marginBottom: '2rem' }}>{group.heading}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            {group.items.map(f => (
              <Link key={f.title} href={`/features/${f.slug}`} className="card card-lg card-shadow" style={{ textDecoration: 'none', display: 'block', transition: 'transform 0.15s' }}>
                <div style={{ marginBottom: '0.75rem' }}><BrandIcon name={f.icon} size={36} /></div>
                <h3 style={{ margin: '0 0 0.5rem', fontSize: '1rem', color: 'var(--navy)' }}>{f.title}</h3>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--gray-500)', lineHeight: 1.6 }}>{f.desc}</p>
              </Link>
            ))}
          </div>
        </section>
      ))}

      <section style={{ background: 'var(--navy)', padding: '4rem 2rem', textAlign: 'center', color: 'white' }}>
        <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '2rem', color: 'white', marginBottom: '0.75rem' }}>See it running your business</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '2rem', fontSize: '1rem' }}>Start free — no credit card required.</p>
        <Link href="/auth/signup" className="btn btn-primary btn-xl">Start for Free <BrandIcon name="arrowRight" size={14} style={{ display:'inline-block' }} /></Link>
      </section>

      <MarketingFooter />
    </div>
  )
}
