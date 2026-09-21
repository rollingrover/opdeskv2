'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

const DURATION_LABEL = { '3hr': '3 Hours', '6hr': '6 Hours', full_day: 'Full Day' }

export default function BookingWidgetPage() {
  const { slug } = useParams()
  const [data, setData] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(null)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    booking_type: '', duration: '', start_date: '', guest_count: 1,
    guest_name: '', guest_email: '', guest_phone: '', notes: '',
  })

  useEffect(() => {
    fetch(`/api/widget/company/${slug}`)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(d => {
        setData(d)
        if (d.bookingTypes?.[0]) setForm(f => ({ ...f, booking_type: d.bookingTypes[0].slug }))
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [slug])

  const selectedType = data?.bookingTypes?.find(bt => bt.slug === form.booking_type)

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/widget/submit-request', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, ...form }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Something went wrong')
      setSubmitted(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const wrapStyle = { fontFamily: 'Inter, system-ui, sans-serif', maxWidth: 480, margin: '0 auto', padding: '1.5rem' }

  if (loading) return <div style={wrapStyle}><p style={{ color: '#6b7280', textAlign: 'center' }}>Loading…</p></div>

  if (notFound) {
    return (
      <div style={wrapStyle}>
        <p style={{ color: '#6b7280', textAlign: 'center' }}>This booking form isn't available right now.</p>
      </div>
    )
  }

  if (submitted) {
    return (
      <div style={wrapStyle}>
        <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 12, padding: '1.5rem', textAlign: 'center' }}>
          <h2 style={{ margin: '0 0 0.5rem', color: '#166534', fontSize: '1.125rem' }}>Request Sent</h2>
          <p style={{ margin: 0, color: '#166534', fontSize: '0.9375rem' }}>
            Thanks — {data.company.name} will be in touch shortly to confirm your booking (ref: {submitted.bookingRef}).
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={wrapStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
        {data.company.logo_url && <img src={data.company.logo_url} alt="" style={{ height: 40, objectFit: 'contain' }} />}
        <h1 style={{ margin: 0, fontSize: '1.25rem', color: '#0F2540', fontWeight: 800 }}>Book with {data.company.name}</h1>
      </div>

      {data.bookingTypes.length === 0 ? (
        <p style={{ color: '#6b7280' }}>No booking types are currently available.</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <Field label="Booking Type">
            <select value={form.booking_type} onChange={e => setForm({ ...form, booking_type: e.target.value, duration: '' })} style={inputStyle}>
              {data.bookingTypes.map(bt => <option key={bt.slug} value={bt.slug}>{bt.name}</option>)}
            </select>
          </Field>

          {selectedType?.durations && (
            <Field label="Duration">
              <select value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} required style={inputStyle}>
                <option value="" disabled>Select a duration…</option>
                {Object.entries(selectedType.durations).map(([key, price]) => (
                  <option key={key} value={key}>{DURATION_LABEL[key] || key} — {data.company.currency}{price}</option>
                ))}
              </select>
            </Field>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 0.75rem' }}>
            <Field label="Date">
              <input type="date" required value={form.start_date} min={new Date().toISOString().slice(0, 10)}
                onChange={e => setForm({ ...form, start_date: e.target.value })} style={inputStyle} />
            </Field>
            <Field label="Guests">
              <input type="number" min="1" required value={form.guest_count}
                onChange={e => setForm({ ...form, guest_count: e.target.value })} style={inputStyle} />
            </Field>
          </div>

          <Field label="Your Name">
            <input type="text" required value={form.guest_name} onChange={e => setForm({ ...form, guest_name: e.target.value })} style={inputStyle} />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 0.75rem' }}>
            <Field label="Email">
              <input type="email" value={form.guest_email} onChange={e => setForm({ ...form, guest_email: e.target.value })} style={inputStyle} />
            </Field>
            <Field label="Phone">
              <input type="tel" value={form.guest_phone} onChange={e => setForm({ ...form, guest_phone: e.target.value })} style={inputStyle} />
            </Field>
          </div>
          <Field label="Notes (optional)">
            <textarea rows={3} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} style={{ ...inputStyle, resize: 'vertical' }} />
          </Field>

          {error && <p style={{ color: '#dc2626', fontSize: '0.875rem', marginBottom: '0.75rem' }}>{error}</p>}

          <button type="submit" disabled={submitting}
            style={{ width: '100%', background: '#D4A853', color: '#0F2540', border: 'none', borderRadius: 8, padding: '0.75rem', fontWeight: 700, fontSize: '0.9375rem', cursor: submitting ? 'default' : 'pointer', opacity: submitting ? 0.7 : 1 }}>
            {submitting ? 'Sending…' : 'Request Booking'}
          </button>
        </form>
      )}

      <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.6875rem', color: '#9ca3af' }}>
        Powered by <a href="https://opdesk.app" target="_blank" rel="noopener noreferrer" style={{ color: '#9ca3af' }}>OpDesk</a>
      </p>
    </div>
  )
}

const inputStyle = { width: '100%', boxSizing: 'border-box', border: '1px solid #d1d5db', borderRadius: 8, padding: '0.5rem 0.75rem', fontSize: '0.9375rem', fontFamily: 'inherit' }

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: '0.875rem' }}>
      <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: '0.25rem' }}>{label}</label>
      {children}
    </div>
  )
}
