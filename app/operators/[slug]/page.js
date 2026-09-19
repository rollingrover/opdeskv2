import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/service'
import { LegalPageHeader, LegalPageFooter } from '@/components/marketing/LegalPageChrome'
import { OPERATOR_TYPES } from '@/lib/constants'
import { Calendar } from 'lucide-react'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }) {
  const { slug } = await params
  const supabase = createServiceClient()
  const { data: profile } = await supabase.from('public_operator_profiles').select('name, public_description').eq('public_slug', slug).maybeSingle()
  if (!profile) return {}
  return { title: `${profile.name} — OpDesk`, description: profile.public_description || undefined }
}

function formatBusyRanges(ranges) {
  // Merge into a short, readable list rather than a full calendar widget —
  // simpler to build and just as useful for a marketing-only page: "here's
  // roughly when we're busy," not a full interactive booking calendar.
  return ranges
    .slice(0, 8)
    .map(r => {
      const start = new Date(r.start_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })
      const end = new Date(r.end_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })
      return `${start} – ${end}`
    })
}

export default async function OperatorProfilePage({ params }) {
  const { slug } = await params
  const supabase = createServiceClient()

  const { data: profile } = await supabase.from('public_operator_profiles').select('*').eq('public_slug', slug).maybeSingle()
  if (!profile) notFound()

  const [{ data: photos }, { data: busyDates }] = await Promise.all([
    supabase.from('company_photos').select('*').eq('company_id', profile.id).order('sort_order'),
    profile.public_calendar_enabled
      ? supabase.rpc('get_public_busy_dates', { p_company_id: profile.id })
      : Promise.resolve({ data: [] }),
  ])

  const photoUrls = (photos || []).map(p => supabase.storage.from('company-photos').getPublicUrl(p.storage_path).data.publicUrl)
  const busyRanges = formatBusyRanges(busyDates || [])
  const operatorLabel = OPERATOR_TYPES.find(t => t.value === profile.operator_type)?.label || profile.operator_type

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      <LegalPageHeader />

      <section style={{ background: 'linear-gradient(135deg, var(--navy) 0%, #1a3a5c 55%, #1B8A8F 100%)', padding: '3rem 2rem', textAlign: 'center', color: 'white' }}>
        <p style={{ fontSize: '0.8125rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.5rem' }}>{operatorLabel}</p>
        <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 900, color: 'white', margin: '0 auto' }}>{profile.name}</h1>
        {profile.country && <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '0.5rem' }}>{profile.country}</p>}
      </section>

      <section style={{ padding: '2.5rem 2rem', maxWidth: '900px', margin: '0 auto' }}>
        {photoUrls.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: photoUrls.length === 1 ? '1fr' : 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', marginBottom: '2rem' }}>
            {photoUrls.map((url, i) => (
              <div key={i} style={{ borderRadius: '0.75rem', overflow: 'hidden', aspectRatio: '4/3' }}>
                <img src={url} alt={`${profile.name} photo ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
        )}

        {profile.public_description && (
          <p style={{ fontSize: '1rem', color: 'var(--gray-600, #4b5563)', lineHeight: 1.75, marginBottom: '2rem', whiteSpace: 'pre-wrap' }}>
            {profile.public_description}
          </p>
        )}

        {profile.public_calendar_enabled && (
          <div className="card card-shadow">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Calendar size={18} color="var(--gold)" />
              <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--navy)' }}>Availability</h3>
            </div>
            {busyRanges.length === 0 ? (
              <p style={{ color: 'var(--teal)', fontWeight: 600, fontSize: '0.9375rem' }}>No upcoming busy dates on record — get in touch to check availability.</p>
            ) : (
              <>
                <p style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', marginBottom: '0.75rem' }}>Currently booked (dates only — contact them directly for details):</p>
                <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                  {busyRanges.map((r, i) => <li key={i} style={{ fontSize: '0.875rem', color: 'var(--navy)', marginBottom: '0.25rem' }}>{r}</li>)}
                </ul>
              </>
            )}
          </div>
        )}
      </section>

      <LegalPageFooter />
    </div>
  )
}
