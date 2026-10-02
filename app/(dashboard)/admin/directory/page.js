'use client'
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { useToast, ToastContainer } from '@/components/ui/Toast'
import { PageLoader } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { Shield } from 'lucide-react'
import { C, Btn, Card, Pill, fmtDate } from '@/components/admin/directory/ui'
import ListingsTab from '@/components/admin/directory/ListingsTab'
import ListingDrawer from '@/components/admin/directory/ListingDrawer'
import ClaimsTab from '@/components/admin/directory/ClaimsTab'
import LeadsTab from '@/components/admin/directory/LeadsTab'
import RoutesTab from '@/components/admin/directory/RoutesTab'
import PackagesTab from '@/components/admin/directory/PackagesTab'

// Superadmin: ZAtours + Route22 directory (shared dir_* tables). Reads use
// the signed-in superadmin's session (RLS); writes go through
// /api/admin/directory, which also refreshes both directory sites.
function DirectoryAdmin() {
  const supabase = createClient()
  const toast = useToast()
  // Tab lives in the URL (?tab=leads) so sidebar links can deep-link to it.
  const router = useRouter()
  const searchParams = useSearchParams()
  const TABS = ['listings', 'leads', 'claims', 'routes', 'packages', 'enquiries']
  const tab = TABS.includes(searchParams.get('tab')) ? searchParams.get('tab') : 'listings'
  const setTab = k => router.replace(k === 'listings' ? '/admin/directory' : `/admin/directory?tab=${k}`, { scroll: false })
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({ listings: [], billing: [], claims: [], leads: [], companies: [], enquiries: [], verified: [], routes: [], routeMembers: [], packages: [] })
  const [drawer, setDrawer] = useState(null) // { listing, prefill, lead }

  // Fetch only (no state writes) so the mount effect can apply results in a
  // promise callback rather than synchronously inside the effect.
  const fetchAll = useCallback(async () => {
    const [listings, billing, claims, leads, companies, enquiries, verified, routes, routeMembers, packages] = await Promise.all([
      supabase.from('dir_listings').select('*').order('name'),
      supabase.from('dir_billing').select('*').in('entity_type', ['listing', 'route']),
      supabase.from('dir_claims').select('*').order('created_at', { ascending: false }),
      supabase.from('dir_business_enquiries').select('*').order('created_at', { ascending: false }),
      supabase.from('companies').select('id, name').order('name'),
      supabase.from('dir_enquiries').select('id, listing_id, site, name, email, status, date_from, date_to, guests, created_at').order('created_at', { ascending: false }).limit(200),
      supabase.from('dir_public_listings').select('id, verified'),
      supabase.from('dir_routes').select('*').order('name'),
      supabase.from('dir_route_members').select('route_id, listing_id'),
      supabase.from('dir_packages').select('*').order('sort_order'),
    ])
    const firstErr = [listings, billing, claims, leads, companies, enquiries, verified, routes, routeMembers, packages].find(r => r.error)
    return {
      error: firstErr?.error?.message,
      data: {
        listings: listings.data || [], billing: billing.data || [], claims: claims.data || [], leads: leads.data || [],
        companies: companies.data || [], enquiries: enquiries.data || [], verified: verified.data || [],
        routes: routes.data || [], routeMembers: routeMembers.data || [], packages: packages.data || [],
      },
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const apply = useCallback(({ error, data }) => {
    if (error) toast.error(error)
    setData(data)
    setLoading(false)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const load = useCallback(async () => apply(await fetchAll()), [fetchAll, apply])

  useEffect(() => {
    let alive = true
    fetchAll().then(r => { if (alive) apply(r) })
    return () => { alive = false }
  }, [fetchAll, apply])

  const listingsById = useMemo(() => Object.fromEntries(data.listings.map(l => [l.id, l])), [data.listings])
  const billingById = useMemo(() => Object.fromEntries(data.billing.filter(b => b.entity_type === 'listing').map(b => [b.entity_id, b])), [data.billing])
  const billingByRoute = useMemo(() => Object.fromEntries(data.billing.filter(b => b.entity_type === 'route').map(b => [b.entity_id, b])), [data.billing])
  const verifiedById = useMemo(() => Object.fromEntries(data.verified.map(v => [v.id, v.verified])), [data.verified])
  const enquiryCounts = useMemo(() => {
    const m = {}; for (const e of data.enquiries) m[e.listing_id] = (m[e.listing_id] || 0) + 1; return m
  }, [data.enquiries])

  // Keep an open drawer pointed at fresh data after a save.
  const drawerListing = drawer?.listing ? listingsById[drawer.listing.id] || drawer.listing : null

  const openClaims = data.claims.filter(c => ['pending', 'verified'].includes(c.status)).length
  const openLeads = data.leads.filter(l => ['new', 'contacted'].includes(l.status)).length
  const newEnq = data.enquiries.filter(e => e.status === 'new').length

  const tabs = [
    ['listings', `Listings (${data.listings.length})`],
    ['leads', `Business leads${openLeads ? ` · ${openLeads} open` : ''}`],
    ['claims', `Claims${openClaims ? ` · ${openClaims} open` : ''}`],
    ['routes', `Routes (${data.routes.length})`],
    ['packages', 'Packages & prices'],
    ['enquiries', `Guest enquiries${newEnq ? ` · ${newEnq} new` : ''}`],
  ]

  return (
    <div style={{ background: C.bg, margin: '-1.75rem', padding: '1.75rem', borderRadius: '0.75rem', minHeight: '80vh' }}>
      <ToastContainer toasts={toast.toasts} remove={toast.remove} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'white', marginBottom: 4 }}>Directory</h2>
          <p style={{ color: '#6b7280', fontSize: 14, margin: 0 }}>
            ZAtours + Route22 — one listings database. Changes publish to both sites immediately.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <a href={process.env.NEXT_PUBLIC_ZATOURS_URL || 'https://www.zatours.co.za'} target="_blank" rel="noopener noreferrer" style={{ color: C.gold, fontSize: 13 }}>ZAtours ↗</a>
          <a href={process.env.NEXT_PUBLIC_ROUTE22_URL || 'https://www.route22zululand.co.za'} target="_blank" rel="noopener noreferrer" style={{ color: C.gold, fontSize: 13 }}>Route22 ↗</a>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap', borderBottom: `1px solid ${C.line}`, paddingBottom: 10 }}>
        {tabs.map(([k, l]) => <Btn key={k} kind={tab === k ? 'gold' : 'default'} onClick={() => setTab(k)}>{l}</Btn>)}
      </div>

      {loading ? <p style={{ color: C.muted }}>Loading…</p> : (
        <>
          {tab === 'listings' && (
            <ListingsTab listings={data.listings} billingById={billingById} verifiedById={verifiedById}
              enquiryCounts={enquiryCounts} companies={data.companies} reload={load} toast={toast}
              onOpen={l => setDrawer({ listing: l })} onCreate={() => setDrawer({ listing: null, prefill: {} })} />
          )}
          {tab === 'leads' && (
            <LeadsTab leads={data.leads} listingsById={listingsById} reload={load} toast={toast}
              onOpenListing={(l, lead) => setDrawer({ listing: l, lead })}
              onCreateFromLead={lead => setDrawer({
                listing: null, lead,
                prefill: { name: lead.business, town: lead.location || '', email: lead.email, phone: lead.phone || '', sites: [lead.site] },
              })} />
          )}
          {tab === 'claims' && <ClaimsTab claims={data.claims} listingsById={listingsById} reload={load} toast={toast} />}
          {tab === 'routes' && (
            <RoutesTab routes={data.routes} members={data.routeMembers} listings={data.listings} billingByRoute={billingByRoute}
              packages={data.packages} reload={load} toast={toast} />
          )}
          {tab === 'packages' && <PackagesTab packages={data.packages} reload={load} toast={toast} />}
          {tab === 'enquiries' && (
            <Card style={{ overflowX: 'auto' }}>
              <p style={{ color: C.muted, fontSize: 12, padding: '12px 12px 0', margin: 0 }}>
                Read-only overview. Linked OpDesk operators handle these in their own Directory enquiries inbox; the rest are emailed to the listing&apos;s address.
              </p>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginTop: 8 }}>
                <thead><tr style={{ color: C.muted, fontSize: 11, textTransform: 'uppercase', textAlign: 'left' }}>
                  {['Date', 'Listing', 'Guest', 'Dates', 'Site', 'Status'].map(h => <th key={h} style={{ padding: '8px 12px', borderBottom: `1px solid ${C.line}` }}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {data.enquiries.map(e => (
                    <tr key={e.id} style={{ borderBottom: `1px solid ${C.line}` }}>
                      <td style={{ padding: '8px 12px', color: C.muted }}>{fmtDate(e.created_at)}</td>
                      <td style={{ padding: '8px 12px', color: 'white' }}>{listingsById[e.listing_id]?.name || '—'}</td>
                      <td style={{ padding: '8px 12px', color: C.text }}>{e.name} · {e.email}</td>
                      <td style={{ padding: '8px 12px', color: C.muted }}>{e.date_from ? `${fmtDate(e.date_from)}${e.date_to ? ` – ${fmtDate(e.date_to)}` : ''}` : '—'}{e.guests ? ` · ${e.guests} guests` : ''}</td>
                      <td style={{ padding: '8px 12px', color: C.muted }}>{e.site}</td>
                      <td style={{ padding: '8px 12px' }}><Pill color={e.status === 'new' ? C.blue : e.status === 'converted' ? C.green : '#6b7280'}>{e.status}</Pill></td>
                    </tr>
                  ))}
                  {!data.enquiries.length && <tr><td colSpan={6} style={{ padding: 24, color: C.muted, textAlign: 'center' }}>No guest enquiries yet.</td></tr>}
                </tbody>
              </table>
            </Card>
          )}
        </>
      )}

      {drawer && (
        <ListingDrawer key={`${drawer.listing?.id || 'new'}-${drawer.lead?.id || ''}`} listing={drawerListing} prefill={drawer.prefill} lead={drawer.lead}
          billing={drawerListing ? billingById[drawerListing.id] : null} companies={data.companies} packages={data.packages}
          onClose={() => setDrawer(null)} onSaved={load} toast={toast} />
      )}
    </div>
  )
}

export default function Page() {
  const { profile } = useAuth()
  if (!profile?.is_superadmin) {
    return (
      <div style={{ background: '#0a0a0a', margin: '-1.75rem', padding: '1.75rem', borderRadius: '0.75rem', minHeight: '60vh' }}>
        <EmptyState icon={<Shield size={48} color="#ef4444" />} title="Superadmin access required"
          description="The directory admin is only available to OpDesk superadmins." />
      </div>
    )
  }
  return (
    <Suspense fallback={<PageLoader />}>
      <DirectoryAdmin />
    </Suspense>
  )
}

export const dynamic = 'force-dynamic'
