'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MarketingNav } from '@/components/marketing/MarketingNav'
import { MarketingFooter } from '@/components/marketing/MarketingFooter'
import { Input, Select, Textarea } from '@/components/ui/FormField'
import { Check } from 'lucide-react'

const FEATURE_OPTIONS = [
  'Online booking system', 'Blog', 'Multi-language support', 'Membership / login area',
  'Custom animations', 'SEO package', 'Payment integration', 'Photo gallery',
]

const emptyForm = {
  name: '', email: '', phone: '', business_name: '',
  project_type: 'new_website', page_count: '1-5', ecommerce: false,
  features: [], timeline: 'flexible', budget_range: '', details: '',
}

export default function WebDesignRequestPage() {
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  function toggleFeature(f) {
    setForm(prev => ({
      ...prev,
      features: prev.features.includes(f) ? prev.features.filter(x => x !== f) : [...prev.features, f],
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    const supabase = createClient()
    const { error: err } = await supabase.from('rollingrover_requests').insert([form])
    setSubmitting(false)
    if (err) { setError('Something went wrong — please try again or email us directly.'); return }
    setSubmitted(true)
  }

  const inputWrap = { marginBottom: '1rem' }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      <MarketingNav />

      <section style={{ background: 'linear-gradient(135deg, var(--navy) 0%, #1a3a5c 55%, #1B8A8F 100%)', padding: '4rem 2rem 3rem', textAlign: 'center', color: 'white' }}>
        <p style={{ fontSize: '0.875rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '1rem' }}>
          RollingRover Web Services
        </p>
        <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 'clamp(2rem, 4.5vw, 2.75rem)', fontWeight: 900, color: 'white', margin: '0 auto 1rem', maxWidth: '680px' }}>
          Get a custom quote for your website
        </h1>
        <p style={{ fontSize: '1.0625rem', color: 'rgba(255,255,255,0.8)', maxWidth: '560px', margin: '0 auto' }}>
          Tell us about your project — we'll come back with a proposal and a secure payment link tailored to what you need.
        </p>
      </section>

      <section style={{ padding: '3rem 2rem', maxWidth: '640px', margin: '0 auto' }}>
        {submitted ? (
          <div className="card card-lg card-shadow" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <div style={{ background: 'var(--cream)', borderRadius: '50%', padding: '0.875rem' }}>
                <Check size={32} color="var(--teal)" />
              </div>
            </div>
            <h2 style={{ color: 'var(--navy)', marginBottom: '0.5rem' }}>Thanks — we've got it</h2>
            <p style={{ color: 'var(--gray-500)' }}>We'll review your project and send a custom quote to {form.email} shortly.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card card-lg card-shadow">
            <div style={inputWrap}><Input label="Your Name" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
              <Input label="Email" type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              <Input label="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>
            <Input label="Business Name" value={form.business_name} onChange={e => setForm({ ...form, business_name: e.target.value })} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
              <Select label="Project Type" value={form.project_type} onChange={e => setForm({ ...form, project_type: e.target.value })}>
                <option value="new_website">New Website</option>
                <option value="redesign">Redesign of Existing Site</option>
                <option value="ecommerce">E-commerce Store</option>
                <option value="landing_page">Landing Page</option>
                <option value="web_app">Web Application</option>
              </Select>
              <Select label="Approx. Number of Pages" value={form.page_count} onChange={e => setForm({ ...form, page_count: e.target.value })}>
                <option value="1">Just 1 page</option>
                <option value="1-5">1–5 pages</option>
                <option value="6-10">6–10 pages</option>
                <option value="10+">10+ pages</option>
              </Select>
              <Select label="Timeline" value={form.timeline} onChange={e => setForm({ ...form, timeline: e.target.value })}>
                <option value="asap">As soon as possible</option>
                <option value="1_month">Within a month</option>
                <option value="2_3_months">2–3 months</option>
                <option value="flexible">Flexible</option>
              </Select>
              <Select label="Budget Range (optional)" value={form.budget_range} onChange={e => setForm({ ...form, budget_range: e.target.value })}>
                <option value="">Prefer not to say</option>
                <option value="under_10k">Under R10,000</option>
                <option value="10k_25k">R10,000 – R25,000</option>
                <option value="25k_50k">R25,000 – R50,000</option>
                <option value="50k_plus">R50,000+</option>
              </Select>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.5rem 0 1rem', fontSize: '0.875rem', color: 'var(--navy)', cursor: 'pointer' }}>
              <input type="checkbox" checked={form.ecommerce} onChange={e => setForm({ ...form, ecommerce: e.target.checked })} />
              This project needs online payments / e-commerce
            </label>

            <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Features you're interested in</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.25rem' }}>
              {FEATURE_OPTIONS.map(f => (
                <label key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--gray-600, #4b5563)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.features.includes(f)} onChange={() => toggleFeature(f)} />
                  {f}
                </label>
              ))}
            </div>

            <Textarea label="Tell us more about your project" rows={5} value={form.details} onChange={e => setForm({ ...form, details: e.target.value })} />

            {error && <p style={{ color: '#ef4444', fontSize: '0.875rem', marginBottom: '1rem' }}>{error}</p>}
            <button type="submit" className="btn btn-primary btn-lg" disabled={submitting} style={{ width: '100%', justifyContent: 'center' }}>
              {submitting ? 'Sending…' : 'Request My Quote'}
            </button>
          </form>
        )}
      </section>

      <MarketingFooter />
    </div>
  )
}
