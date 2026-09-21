'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Icon } from '@/lib/saIcons'

export default function Page() {
  const supabase = createClient()
  const [companies, setCompanies] = useState([])
  const [photoCounts, setPhotoCounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // 'all' | 'listed' | 'unlisted'

  async function load() {
    setLoading(true)
    const { data: cos, error } = await supabase
      .from('companies')
      .select('id, name, operator_type, public_profile_enabled, public_calendar_enabled, public_slug, public_description, updated_at')
      .order('name')
    if (error) { console.error(error); setLoading(false); return }
    setCompanies(cos || [])

    // Photo counts fetched separately and reduced client-side — the
    // company_photos table has no per-company aggregate view, and this
    // stays cheap since the operator list itself is small.
    const listedIds = (cos || []).filter(c => c.public_profile_enabled).map(c => c.id)
    if (listedIds.length > 0) {
      const { data: photos } = await supabase.from('company_photos').select('company_id').in('company_id', listedIds)
      const counts = {}
      for (const p of photos || []) counts[p.company_id] = (counts[p.company_id] || 0) + 1
      setPhotoCounts(counts)
    } else {
      setPhotoCounts({})
    }
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const visible = companies.filter(c =>
    filter === 'all' ? true : filter === 'listed' ? c.public_profile_enabled : !c.public_profile_enabled
  )
  const listedCount = companies.filter(c => c.public_profile_enabled).length

  if (loading) {
    return <div style={{ color: '#6b7280', padding: 40, textAlign: 'center' }}>Loading operator profiles...</div>
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ color: 'white', fontWeight: 700, fontSize: 20, margin: 0 }}>Operator Profiles</h2>
          <p style={{ color: '#6b7280', fontSize: 13, margin: '2px 0 0' }}>
            {listedCount} of {companies.length} companies are listed on the public <a href="/operators" target="_blank" rel="noopener noreferrer" style={{ color: '#D4A853' }}>operators directory</a>.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[['all', 'All'], ['listed', 'Listed'], ['unlisted', 'Not Listed']].map(([val, label]) => (
            <button key={val} onClick={() => setFilter(val)}
              style={{
                background: filter === val ? '#D4A853' : '#1a1a1a', color: filter === val ? '#0F2540' : '#9ca3af',
                border: '1px solid #333', borderRadius: 8, padding: '6px 14px', fontWeight: 700, fontSize: 13, cursor: 'pointer',
              }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ background: '#1a1a00', border: '1px solid #ca8a04', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#fde047', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Icon name="alert" size={16} />
        <span>
          Moderation actions (force-unpublish a listing) aren't wired up yet — this view is read-only for now. Companies manage their own listing from Settings → Public Profile.
        </span>
      </div>

      <div style={{ background: '#1a1a1a', borderRadius: 12, border: '1px solid #222', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#0d0d0d' }}>
              {['Company', 'Type', 'Status', 'Public URL', 'Photos', 'Calendar', ''].map(h => (
                <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: '#6b7280', fontSize: 11, textTransform: 'uppercase', borderBottom: '1px solid #222' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>No companies match this filter.</td></tr>
            ) : visible.map(c => (
              <tr key={c.id} style={{ borderBottom: '1px solid #1a1a1a' }}>
                <td style={{ padding: '10px 12px', color: 'white', fontWeight: 600 }}>{c.name}</td>
                <td style={{ padding: '10px 12px', color: '#9ca3af', fontSize: 13, textTransform: 'capitalize' }}>{c.operator_type?.replace(/_/g, ' ')}</td>
                <td style={{ padding: '10px 12px' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, padding: '2px 8px', borderRadius: 999,
                    background: c.public_profile_enabled ? '#22c55e22' : '#33333322', color: c.public_profile_enabled ? '#22c55e' : '#6b7280',
                  }}>
                    {c.public_profile_enabled ? 'Listed' : 'Not Listed'}
                  </span>
                </td>
                <td style={{ padding: '10px 12px', fontSize: 13 }}>
                  {c.public_profile_enabled && c.public_slug ? (
                    <a href={`/operators/${c.public_slug}`} target="_blank" rel="noopener noreferrer" style={{ color: '#D4A853' }}>
                      /operators/{c.public_slug}
                    </a>
                  ) : (
                    <span style={{ color: '#4b5563' }}>—</span>
                  )}
                </td>
                <td style={{ padding: '10px 12px', color: '#9ca3af', fontSize: 13 }}>{photoCounts[c.id] || 0}/6</td>
                <td style={{ padding: '10px 12px', color: '#9ca3af', fontSize: 13 }}>{c.public_calendar_enabled ? 'On' : 'Off'}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                  <a href={`/admin/companies/${c.id}`} style={{ color: '#6b7280', fontSize: 12 }}>View company →</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export const dynamic = 'force-dynamic'
