'use client'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { PageLoader } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { useToast, ToastContainer } from '@/components/ui/Toast'
import { BrandIcon } from '@/components/ui/BrandIcon'
import { ExternalLink, Globe, Inbox } from 'lucide-react'

// Directory listing (ZAtours / Route22). Replaces OpDesk's old standalone
// public profile: the directory listing is now the one public page for an
// operator. Listings themselves are created and edited by the OpDesk team
// (or by the owner via their emailed edit link); this page shows the
// operator's listing(s) and the live-availability switch.
const ZATOURS = (process.env.NEXT_PUBLIC_ZATOURS_URL || 'https://www.zatours.co.za').replace(/\/+$/, '')
const ROUTE22 = (process.env.NEXT_PUBLIC_ROUTE22_URL || 'https://www.route22zululand.co.za').replace(/\/+$/, '')
const siteOf = l => (l.sites?.includes('zatours') ? ZATOURS : ROUTE22)

export default function DirectoryListingSettingsPage() {
  const t = useTranslations('SettingsPublicProfile')
  const tCommon = useTranslations('Common')
  const { company, needsCompany, reload } = useAuth()
  const supabase = createClient()
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [listings, setListings] = useState([])
  // Local override only while/after toggling; otherwise reflect the company row.
  const [calendarOverride, setCalendarOverride] = useState(null)
  const calendar = calendarOverride ?? !!company?.public_calendar_enabled
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!company) return
    let alive = true
    supabase.from('dir_listings').select('id, slug, name, tier, sites, published, claimed').eq('company_id', company.id)
      .then(({ data }) => { if (alive) { setListings(data || []); setLoading(false) } })
    return () => { alive = false }
  }, [company]) // eslint-disable-line react-hooks/exhaustive-deps

  async function toggleCalendar(next) {
    setSaving(true)
    setCalendarOverride(next)
    const { error } = await supabase.from('companies').update({ public_calendar_enabled: next }).eq('id', company.id)
    setSaving(false)
    if (error) { setCalendarOverride(!next); toast.error(error.message); return }
    toast.success(t('saved'))
    reload?.()
  }

  if (needsCompany) return <EmptyState icon={<BrandIcon name="companySetup" size={48} />} title={tCommon('needsCompanyTitle')} />
  if (loading) return <PageLoader />

  const tierLabel = tier => t(`tier_${tier}`)

  return (
    <div>
      <ToastContainer toasts={toast.toasts} remove={toast.remove} />
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('title')}</h1>
          <p className="page-subtitle">{t('subtitle')}</p>
        </div>
      </div>

      <div style={{ background: 'var(--cream)', border: '1px solid var(--gray-100)', borderRadius: '0.75rem', padding: '0.875rem 1.125rem', marginBottom: '1.25rem', fontSize: '0.8125rem', color: 'var(--gray-500)' }}>
        {t('infoBanner')}
      </div>

      {listings.length === 0 ? (
        <div className="card card-shadow" style={{ marginBottom: '1.25rem' }}>
          <EmptyState icon={<Globe size={40} color="var(--gray-400)" />} title={t('noListingTitle')} description={t('noListingDesc')} />
          <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
            <a href={`${ZATOURS}/list-your-business?plan=opdesk`} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              <ExternalLink size={14} /> {t('getListed')}
            </a>
          </div>
        </div>
      ) : (
        listings.map(l => (
          <div key={l.id} className="card card-shadow" style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--navy)' }}>{l.name}</h3>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: 'var(--gray-500)' }}>
                  {tierLabel(l.tier)} · {l.published ? t('statusLive') : t('statusDraft')} · {l.sites?.map(s => (s === 'zatours' ? 'ZAtours' : 'Route22')).join(' + ')}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {l.published && l.tier !== 'community' && (
                  <a href={`${siteOf(l)}/listings/${l.slug}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
                    <ExternalLink size={14} /> {t('viewListing')}
                  </a>
                )}
                {(l.tier === 'community' || l.tier === 'basic') && (
                  <a href={`${siteOf(l)}/list-your-business?listing=${l.slug}&plan=opdesk`} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
                    {t('upgrade')}
                  </a>
                )}
              </div>
            </div>
            <p style={{ margin: '0.75rem 0 0', fontSize: '0.8125rem', color: 'var(--gray-500)' }}>{t('editHint')}</p>
          </div>
        ))
      )}

      <div className="card card-shadow" style={{ marginBottom: '1.25rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', cursor: 'pointer' }}>
          <input type="checkbox" checked={calendar} disabled={saving} onChange={e => toggleCalendar(e.target.checked)} />
          <div>
            <p style={{ margin: 0, fontWeight: 700, color: 'var(--navy)' }}>{t('showCalendar')}</p>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--gray-500)' }}>{t('showCalendarDesc')}</p>
          </div>
        </label>
      </div>

      <Link href="/enquiries" className="btn btn-outline btn-sm"><Inbox size={14} /> {t('goToEnquiries')}</Link>
    </div>
  )
}

export const dynamic = 'force-dynamic'
