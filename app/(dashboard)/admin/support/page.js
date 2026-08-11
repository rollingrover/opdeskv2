'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { notify } from '@/lib/notify'
import { Icon } from '@/lib/saIcons'

function useToast() {
  const [toast, setToast] = useState(null)
  function showToast(message, type = 'info') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }
  return { toast, showToast }
}

function Toast({ toast }) {
  if (!toast) return null
  return (
    <div style={{
      position: 'fixed', top: 20, right: 20, zIndex: 9999, padding: '12px 20px', borderRadius: 8,
      backgroundColor: toast.type === 'success' ? '#22c55e' : toast.type === 'error' ? '#ef4444' : '#3b82f6',
      color: 'white', fontWeight: 600, fontSize: 14, boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
      <Icon name={toast.type === 'success' ? 'check' : 'alert'} size={16} />
      {toast.message}
    </div>
  )
}

// Note: adapted to the app's real `support_tickets` table (status values are
// lowercase — 'open' / 'in_progress' / 'resolved' / 'closed' — to match the
// rest of the schema) rather than the original RPC-based version, since the
// old `get_all_support_tickets` / `update_support_ticket` RPCs don't exist
// here. Superadmin read/update access already comes from the RLS policies in
// fixes.sql, so this talks to the table directly.
const STATUS_COLORS = { open: '#dc2626', in_progress: '#d97706', resolved: '#16a34a', closed: '#6b7280' }
const STATUS_LABELS = { open: 'Open', in_progress: 'In Progress', resolved: 'Resolved', closed: 'Closed' }
const CAT_ICON = { bug: 'shield', billing: 'billing', feature_request: 'star', other: 'settings' }

function SASupportQueue() {
  const supabase = createClient()
  const { toast, showToast } = useToast()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState('open')
  const [saving, setSaving] = useState(false)

  async function loadTickets() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*, companies(name), profiles(full_name, email)')
        .order('created_at', { ascending: false })
      if (error) throw error
      setTickets(data || [])
    } catch (error) {
      console.error('Error loading tickets:', error)
      showToast('Failed to load support tickets', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadTickets() }, [])

  function openTicket(t) {
    setSelected(t)
    setNotes(t.admin_notes || '')
    setStatus(t.status || 'open')
  }

  async function saveTicket() {
    if (!selected) return
    setSaving(true)
    try {
      const { error } = await supabase.from('support_tickets')
        .update({ status, admin_notes: notes, resolved_at: status === 'resolved' ? new Date().toISOString() : selected.resolved_at })
        .eq('id', selected.id)
      if (error) throw error
      if (status !== selected.status) {
        notify('support_ticket_updated', { toEmail: selected.profiles?.email, subject: selected.subject, status })
      }
      showToast('Ticket updated successfully', 'success')
      await loadTickets()
      setSelected(null)
    } catch (error) {
      console.error('Error updating ticket:', error)
      showToast('Failed to update ticket: ' + error.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const counts = { open: 0, in_progress: 0, resolved: 0, closed: 0 }
  tickets.forEach(t => { if (counts[t.status] !== undefined) counts[t.status]++ })

  if (loading) {
    return <div style={{ color: '#9ca3af', padding: 40, textAlign: 'center' }}>Loading tickets…</div>
  }

  return (
    <div style={{ background: '#0a0a0a', margin: '-1.75rem', padding: '1.75rem', borderRadius: '0.75rem' }}>
      <Toast toast={toast} />

      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'white', marginBottom: 4 }}>Support Queue</h2>
        <p style={{ color: '#6b7280', fontSize: 14 }}>{tickets.length} total tickets</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
        {Object.entries(counts).map(([st, n]) => (
          <div key={st} style={{ background: '#1a1a1a', borderRadius: 10, padding: '14px 16px', border: '1px solid #2a2a2a' }}>
            <div style={{ fontSize: 26, fontWeight: 900, color: STATUS_COLORS[st] || 'white' }}>{n}</div>
            <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{STATUS_LABELS[st]}</div>
          </div>
        ))}
      </div>

      {tickets.length === 0 && (
        <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>
          <Icon name="shield" size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
          <p>No support tickets yet</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {tickets.map(t => (
          <div key={t.id} onClick={() => openTicket(t)}
            style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 10, padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, transition: 'border-color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#dc2626'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#2a2a2a'}>
            <div style={{ background: '#111', borderRadius: 8, padding: 8 }}>
              <Icon name={CAT_ICON[t.category] || 'settings'} size={18} style={{ color: '#9ca3af' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'white', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {t.subject}
              </div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>
                {t.companies?.name || 'Unknown'} · {t.profiles?.email || '—'} · {new Date(t.created_at).toLocaleDateString()}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ background: '#111', border: `1px solid ${STATUS_COLORS[t.status] || '#6b7280'}`, color: STATUS_COLORS[t.status] || '#6b7280', borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>
                {STATUS_LABELS[t.status] || t.status}
              </span>
              {t.category && (
                <span style={{ background: '#222', borderRadius: 6, padding: '2px 8px', fontSize: 11, color: '#9ca3af', textTransform: 'capitalize' }}>
                  {t.category.replace(/_/g, ' ')}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 20 }}
          onClick={() => setSelected(null)}>
          <div style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 14, padding: 28, width: '100%', maxWidth: 560, maxHeight: '85vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 17, color: 'white', marginBottom: 4 }}>{selected.subject}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>{selected.companies?.name || 'Unknown'} · {selected.profiles?.email || '—'}</div>
                <div style={{ fontSize: 11, color: '#4b5563', marginTop: 2 }}>{new Date(selected.created_at).toLocaleString()}</div>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: 4, fontSize: 20 }}>×</button>
            </div>

            <div style={{ background: '#111', borderRadius: 8, padding: 14, marginBottom: 20, fontSize: 13, color: '#d1d5db', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {selected.description}
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, color: '#9ca3af', display: 'block', marginBottom: 6 }}>Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)}
                style={{ background: '#111', border: '1px solid #333', color: 'white', borderRadius: 8, padding: '8px 12px', width: '100%' }}>
                {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, color: '#9ca3af', display: 'block', marginBottom: 6 }}>Admin Notes</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Internal notes (not visible to user)"
                style={{ background: '#111', border: '1px solid #333', color: 'white', borderRadius: 8, padding: '8px 12px', width: '100%', resize: 'vertical', fontSize: 13, boxSizing: 'border-box' }} />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setSelected(null)} style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: '1px solid #333', background: 'none', color: '#9ca3af', cursor: 'pointer', fontWeight: 600 }}>
                Cancel
              </button>
              <button onClick={saveTicket} disabled={saving}
                style={{ flex: 1, padding: '10px 0', borderRadius: 8, background: '#dc2626', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 700, fontSize: 14, opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Page() {
  return <SASupportQueue />
}
