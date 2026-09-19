import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/service'
import { LegalPageHeader, LegalPageFooter } from '@/components/marketing/LegalPageChrome'
import { OPERATOR_TYPES } from '@/lib/constants'

export const metadata = { title: 'Find Operators — OpDesk' }
export const dynamic = 'force-dynamic'

export default async function OperatorsDirectoryPage() {
  const supabase = createServiceClient()
  const { data: operators } = await supabase
    .from('public_operator_profiles')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      <LegalPageHeader />

      <section style={{ background: 'linear-gradient(135deg, var(--navy) 0%, #1a3a5c 55%, #1B8A8F 100%)', padding: '3.5rem 2rem', textAlign: 'center', color: 'white' }}>
        <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 900, color: 'white', margin: '0 auto 0.75rem' }}>
          Find Operators
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9375rem' }}>Businesses running on OpDesk who've opted to be listed here</p>
      </section>

      <section style={{ padding: '3rem 2rem', maxWidth: '1000px', margin: '0 auto' }}>
        {!operators || operators.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--gray-400)' }}>No public profiles yet — check back soon.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
            {operators.map(op => (
              <Link key={op.id} href={`/operators/${op.public_slug}`} className="card card-shadow"
                style={{ textDecoration: 'none', display: 'block' }}>
                <h3 style={{ margin: '0 0 0.25rem', fontSize: '1.0625rem', color: 'var(--navy)' }}>{op.name}</h3>
                <p style={{ margin: '0 0 0.5rem', fontSize: '0.8125rem', color: 'var(--gold)', fontWeight: 600 }}>
                  {OPERATOR_TYPES.find(t => t.value === op.operator_type)?.label || op.operator_type}
                </p>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--gray-500)', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                  {op.public_description || 'No description yet.'}
                </p>
                {op.country && <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', color: 'var(--gray-400)' }}>{op.country}</p>}
              </Link>
            ))}
          </div>
        )}
      </section>

      <LegalPageFooter />
    </div>
  )
}
