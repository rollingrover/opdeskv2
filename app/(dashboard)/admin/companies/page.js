'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const TIER_COLOR = { free: '#6b7280', explorer: '#6b7280', basic: '#3b82f6', standard: '#9333ea', professional: '#D4A853', enterprise: '#dc2626' }
const STATUS_COLOR = { active: '#22c55e', suspended: '#ef4444', trial: '#f59e0b', churned: '#6b7280', vip: '#D4A853', payment_failed: '#dc2626' }

function SACompaniesList() {
  const supabase = createClient()
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterTier, setFilterTier] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  async function load() {
    setLoading(true)
    try {
      const { data, error } = await supabase.rpc('sa_get_all_companies')
      if (error) throw error
      setCompanies(data || [])
    } catch (error) {
      console.error('sa_get_all_companies error', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtered = companies.filter(c => {
    const q = search.toLowerCase()
    const matchSearch = !q || (c.name || '').toLowerCase().includes(q) || (c.email || '').toLowerCase().includes(q)
    const matchTier = filterTier === 'all' || c.subscription_tier === filterTier
    const matchStatus = filterStatus === 'all' || (c.account_status || 'active') === filterStatus
    return matchSearch && matchTier && matchStatus
  })

  // package_monthly_price comes straight from sa_get_all_companies, joined
  // live against marketing_packages — not a cached/stale lookup, so this
  // total always matches whatever price is actually set in Marketing
  // Packages right now.
  const mrr = companies.reduce((s, c) => s + (Number(c.package_monthly_price) || 0), 0)
  const paying = companies.filter(c => c.subscription_tier && c.subscription_tier !== 'free' && c.subscription_tier !== 'explorer').length

  const inputStyle = { background: '#1a1a1a', border: '1px solid #333', color: 'white', borderRadius: 8, padding: '9px 14px', fontSize: 13 }

  return (
    <div style={{ background: '#0a0a0a', margin: '-1.75rem', padding: '1.75rem', borderRadius: '0.75rem' }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'white', marginBottom: 4 }}>Companies</h2>
        <p style={{ color: '#6b7280', fontSize: 14 }}>Manage every account on the platform</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
        {[
          ['Total Companies', companies.length, '#6b7280'],
          ['Paying', paying, '#22c55e'],
          ['MRR', `R${mrr.toLocaleString()}`, '#D4A853'],
          ['ARR', `R${(mrr * 12).toLocaleString()}`, '#9333ea'],
        ].map(([l, v, c]) => (
          <div key={l} style={{ background: '#1a1a1a', borderRadius: 12, padding: '16px 20px', border: '1px solid #222' }}>
            <div style={{ color: '#6b7280', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{l}</div>
            <div style={{ color: c, fontSize: 24, fontWeight: 900 }}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search company or email…"
          style={{ ...inputStyle, flex: 1, minWidth: 200 }} />
        <select value={filterTier} onChange={e => setFilterTier(e.target.value)} style={{ ...inputStyle, color: '#9ca3af' }}>
          <option value="all">All Tiers</option>
          {['free', 'basic', 'standard', 'professional', 'enterprise'].map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ ...inputStyle, color: '#9ca3af' }}>
          <option value="all">All Statuses</option>
          {['active', 'trial', 'suspended', 'churned', 'vip'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <span style={{ color: '#6b7280', fontSize: 13 }}>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      <div style={{ background: '#111', borderRadius: 12, border: '1px solid #222', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#0d0d0d' }}>
              {['Company', 'Tier', 'Trial', 'Status', 'Bookings', 'Users', 'Add-ons', 'Joined', ''].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: '#6b7280', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #222' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} style={{ padding: 24, textAlign: 'center', color: '#6b7280' }}>Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={9} style={{ padding: 24, textAlign: 'center', color: '#6b7280' }}>No companies found</td></tr>
            ) : filtered.map(c => {
              const status = c.account_status || 'active'
              return (
                <tr key={c.id} style={{ borderBottom: '1px solid #1a1a1a' }}>
                  <td style={{ padding: '11px 14px' }}>
                    <div style={{ color: 'white', fontWeight: 600 }}>{c.name}</div>
                    <div style={{ color: '#6b7280', fontSize: 12 }}>{c.email || '—'} · {c.country || '—'}</div>
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    <span style={{ background: (TIER_COLOR[c.subscription_tier || 'free']) + '22', color: TIER_COLOR[c.subscription_tier || 'free'], borderRadius: 999, padding: '2px 10px', fontSize: 12, fontWeight: 700, textTransform: 'capitalize' }}>
                      {c.subscription_tier || 'free'}
                    </span>
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    {c.trial_ends_at && (() => {
                      const daysLeft = Math.ceil((new Date(c.trial_ends_at) - new Date()) / 86400000)
                      const expired = daysLeft < 0
                      return (
                        <span style={{ color: expired ? '#ef4444' : '#f59e0b', fontSize: 12, fontWeight: expired ? 700 : 400 }}>
                          {expired ? `Ended ${Math.abs(daysLeft)}d ago` : `${daysLeft}d left`}
                        </span>
                      )
                    })()}
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    <span style={{ background: STATUS_COLOR[status] + '22', color: STATUS_COLOR[status], borderRadius: 999, padding: '2px 10px', fontSize: 12, fontWeight: 700, textTransform: 'capitalize' }}>
                      {status}
                    </span>
                  </td>
                  <td style={{ padding: '11px 14px', color: '#9ca3af', fontWeight: 600 }}>{c.booking_count || 0}</td>
                  <td style={{ padding: '11px 14px', color: '#9ca3af' }}>{c.user_count || 0}</td>
                  <td style={{ padding: '11px 14px', color: '#9ca3af' }}>{c.addon_count || 0}</td>
                  <td style={{ padding: '11px 14px', color: '#6b7280', fontSize: 13 }}>
                    {c.created_at ? new Date(c.created_at).toLocaleDateString('en-ZA') : '—'}
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    <Link href={`/admin/companies/${c.id}`} style={{ color: '#3b82f6', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                      Manage →
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function Page() {
  return <SACompaniesList />
}

export const dynamic = 'force-dynamic'
