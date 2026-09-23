'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

// This route deliberately sits outside the [locale] segment (see proxy.js
// NON_LOCALIZED_PATHS) so embed URLs stay simple — opdesk.app/book/{slug},
// not opdesk.app/{locale}/book/{slug} — since operators paste this straight
// into their own site's HTML. That means it never gets next-intl's
// NextIntlClientProvider, so it can't use useTranslations(). Given the
// small, fixed set of strings here, a local dictionary is simpler than
// restructuring routing just for this one page. Displayed language is
// driven by the OPERATOR's own configured language (company.language),
// not the visitor's browser — the operator set that language up to match
// their actual market, which is a better signal than guessing.
const STRINGS = {
  en: {
    loading: 'Loading…', notAvailable: "This booking form isn't available right now.",
    requestSent: 'Request Sent', requestSentBody: (name, ref) => `Thanks — ${name} will be in touch shortly to confirm your booking (ref: ${ref}).`,
    bookWith: name => `Book with ${name}`, noTypes: 'No booking types are currently available.',
    bookingType: 'Booking Type', duration: 'Duration', selectDuration: 'Select a duration…',
    date: 'Date', guests: 'Guests', yourName: 'Your Name', email: 'Email', phone: 'Phone',
    notes: 'Notes (optional)', sending: 'Sending…', requestBooking: 'Request Booking',
    poweredBy: 'Powered by', genericError: 'Something went wrong',
    duration3hr: '3 Hours', duration6hr: '6 Hours', durationFullDay: 'Full Day',
  },
  af: {
    loading: 'Laai tans…', notAvailable: 'Hierdie besprekingvorm is nie op die oomblik beskikbaar nie.',
    requestSent: 'Versoek Gestuur', requestSentBody: (name, ref) => `Dankie — ${name} sal binnekort met jou in verbinding tree om jou bespreking te bevestig (verw: ${ref}).`,
    bookWith: name => `Bespreek by ${name}`, noTypes: 'Geen besprekingtipes is tans beskikbaar nie.',
    bookingType: 'Bespreking Tipe', duration: 'Duur', selectDuration: 'Kies \'n duur…',
    date: 'Datum', guests: 'Gaste', yourName: 'Jou Naam', email: 'E-pos', phone: 'Foon',
    notes: 'Notas (opsioneel)', sending: 'Stuur tans…', requestBooking: 'Versoek Bespreking',
    poweredBy: 'Aangedryf deur', genericError: 'Iets het verkeerd geloop',
    duration3hr: '3 Uur', duration6hr: '6 Uur', durationFullDay: 'Volle Dag',
  },
  de: {
    loading: 'Wird geladen…', notAvailable: 'Dieses Buchungsformular ist derzeit nicht verfügbar.',
    requestSent: 'Anfrage Gesendet', requestSentBody: (name, ref) => `Danke — ${name} wird sich in Kürze melden, um Ihre Buchung zu bestätigen (Ref: ${ref}).`,
    bookWith: name => `Buchen bei ${name}`, noTypes: 'Derzeit sind keine Buchungsarten verfügbar.',
    bookingType: 'Buchungsart', duration: 'Dauer', selectDuration: 'Dauer auswählen…',
    date: 'Datum', guests: 'Gäste', yourName: 'Ihr Name', email: 'E-Mail', phone: 'Telefon',
    notes: 'Notizen (optional)', sending: 'Wird gesendet…', requestBooking: 'Buchung Anfragen',
    poweredBy: 'Bereitgestellt von', genericError: 'Etwas ist schiefgelaufen',
    duration3hr: '3 Stunden', duration6hr: '6 Stunden', durationFullDay: 'Ganztägig',
  },
  fr: {
    loading: 'Chargement…', notAvailable: "Ce formulaire de réservation n'est pas disponible pour le moment.",
    requestSent: 'Demande Envoyée', requestSentBody: (name, ref) => `Merci — ${name} vous contactera sous peu pour confirmer votre réservation (réf : ${ref}).`,
    bookWith: name => `Réserver avec ${name}`, noTypes: 'Aucun type de réservation n\'est disponible actuellement.',
    bookingType: 'Type de Réservation', duration: 'Durée', selectDuration: 'Sélectionner une durée…',
    date: 'Date', guests: 'Voyageurs', yourName: 'Votre Nom', email: 'E-mail', phone: 'Téléphone',
    notes: 'Notes (facultatif)', sending: 'Envoi…', requestBooking: 'Demander une Réservation',
    poweredBy: 'Propulsé par', genericError: "Une erreur s'est produite",
    duration3hr: '3 Heures', duration6hr: '6 Heures', durationFullDay: 'Journée Complète',
  },
  pt: {
    loading: 'A carregar…', notAvailable: 'Este formulário de reserva não está disponível de momento.',
    requestSent: 'Pedido Enviado', requestSentBody: (name, ref) => `Obrigado — ${name} entrará em contacto em breve para confirmar a sua reserva (ref: ${ref}).`,
    bookWith: name => `Reservar com ${name}`, noTypes: 'Não há tipos de reserva disponíveis de momento.',
    bookingType: 'Tipo de Reserva', duration: 'Duração', selectDuration: 'Selecione uma duração…',
    date: 'Data', guests: 'Hóspedes', yourName: 'O Seu Nome', email: 'Email', phone: 'Telefone',
    notes: 'Notas (opcional)', sending: 'A enviar…', requestBooking: 'Pedir Reserva',
    poweredBy: 'Desenvolvido por', genericError: 'Algo correu mal',
    duration3hr: '3 Horas', duration6hr: '6 Horas', durationFullDay: 'Dia Inteiro',
  },
}

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

  const t = STRINGS[data?.company?.language] || STRINGS.en
  const DURATION_LABEL = { '3hr': t.duration3hr, '6hr': t.duration6hr, full_day: t.durationFullDay }
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
      if (!res.ok) throw new Error(result.error || t.genericError)
      setSubmitted(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const wrapStyle = { fontFamily: 'Inter, system-ui, sans-serif', maxWidth: 480, margin: '0 auto', padding: '1.5rem' }

  if (loading) return <div style={wrapStyle}><p style={{ color: '#6b7280', textAlign: 'center' }}>{t.loading}</p></div>

  if (notFound) {
    return (
      <div style={wrapStyle}>
        <p style={{ color: '#6b7280', textAlign: 'center' }}>{t.notAvailable}</p>
      </div>
    )
  }

  if (submitted) {
    return (
      <div style={wrapStyle}>
        <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 12, padding: '1.5rem', textAlign: 'center' }}>
          <h2 style={{ margin: '0 0 0.5rem', color: '#166534', fontSize: '1.125rem' }}>{t.requestSent}</h2>
          <p style={{ margin: 0, color: '#166534', fontSize: '0.9375rem' }}>
            {t.requestSentBody(data.company.name, submitted.bookingRef)}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={wrapStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
        {data.company.logo_url && <img src={data.company.logo_url} alt="" style={{ height: 40, objectFit: 'contain' }} />}
        <h1 style={{ margin: 0, fontSize: '1.25rem', color: '#0F2540', fontWeight: 800 }}>{t.bookWith(data.company.name)}</h1>
      </div>

      {data.bookingTypes.length === 0 ? (
        <p style={{ color: '#6b7280' }}>{t.noTypes}</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <Field label={t.bookingType}>
            <select value={form.booking_type} onChange={e => setForm({ ...form, booking_type: e.target.value, duration: '' })} style={inputStyle}>
              {data.bookingTypes.map(bt => <option key={bt.slug} value={bt.slug}>{bt.name}</option>)}
            </select>
          </Field>

          {selectedType?.durations && (
            <Field label={t.duration}>
              <select value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} required style={inputStyle}>
                <option value="" disabled>{t.selectDuration}</option>
                {Object.entries(selectedType.durations).map(([key, price]) => (
                  <option key={key} value={key}>{DURATION_LABEL[key] || key} — {data.company.currency}{price}</option>
                ))}
              </select>
            </Field>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 0.75rem' }}>
            <Field label={t.date}>
              <input type="date" required value={form.start_date} min={new Date().toISOString().slice(0, 10)}
                onChange={e => setForm({ ...form, start_date: e.target.value })} style={inputStyle} />
            </Field>
            <Field label={t.guests}>
              <input type="number" min="1" required value={form.guest_count}
                onChange={e => setForm({ ...form, guest_count: e.target.value })} style={inputStyle} />
            </Field>
          </div>

          <Field label={t.yourName}>
            <input type="text" required value={form.guest_name} onChange={e => setForm({ ...form, guest_name: e.target.value })} style={inputStyle} />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 0.75rem' }}>
            <Field label={t.email}>
              <input type="email" value={form.guest_email} onChange={e => setForm({ ...form, guest_email: e.target.value })} style={inputStyle} />
            </Field>
            <Field label={t.phone}>
              <input type="tel" value={form.guest_phone} onChange={e => setForm({ ...form, guest_phone: e.target.value })} style={inputStyle} />
            </Field>
          </div>
          <Field label={t.notes}>
            <textarea rows={3} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} style={{ ...inputStyle, resize: 'vertical' }} />
          </Field>

          {error && <p style={{ color: '#dc2626', fontSize: '0.875rem', marginBottom: '0.75rem' }}>{error}</p>}

          <button type="submit" disabled={submitting}
            style={{ width: '100%', background: '#D4A853', color: '#0F2540', border: 'none', borderRadius: 8, padding: '0.75rem', fontWeight: 700, fontSize: '0.9375rem', cursor: submitting ? 'default' : 'pointer', opacity: submitting ? 0.7 : 1 }}>
            {submitting ? t.sending : t.requestBooking}
          </button>
        </form>
      )}

      <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.6875rem', color: '#9ca3af' }}>
        {t.poweredBy} <a href="https://opdesk.app" target="_blank" rel="noopener noreferrer" style={{ color: '#9ca3af' }}>OpDesk</a>
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
