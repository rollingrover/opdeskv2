'use client'
// Shared bits for the superadmin Directory section (dark admin theme, same
// palette as the other /admin pages).

export const C = {
  bg: '#0a0a0a', card: '#141414', card2: '#1a1a1a', line: '#262626', text: '#e5e5e5',
  muted: '#8a8a8a', gold: '#D4A853', green: '#22c55e', red: '#ef4444', blue: '#3b82f6', amber: '#f59e0b',
}

export { FOUNDING, INCLUDED_CATEGORIES, currentPrices, planAmount, priceOf, allowedCategories, MAX_EXTRA_CATEGORIES } from '@/lib/directoryPricing'

export const CATEGORY_LABELS = {
  stay: 'Stay', tours: 'Tours & safaris', wildlife: 'Wildlife & parks', ocean: 'Diving & ocean',
  culture: 'Culture', eat: 'Eat & drink', transport: 'Transfers & shuttles', volunteer: 'Volunteer',
}

export const BILLING_COLORS = { free: '#6b7280', paid: '#22c55e', comped: '#D4A853', trial: '#3b82f6', lapsed: '#ef4444' }
export const LEAD_COLORS = { new: '#3b82f6', contacted: '#f59e0b', won: '#22c55e', lost: '#6b7280' }
export const INTEREST_LABELS = { premium: 'Premium', featured: 'Featured', opdesk: 'OpDesk bundle', free: 'Free', unsure: 'Not sure' }

export const input = {
  background: '#0f0f0f', border: `1px solid ${C.line}`, borderRadius: 8, color: C.text,
  padding: '7px 10px', fontSize: 13, width: '100%', boxSizing: 'border-box',
}
export const label = { display: 'flex', flexDirection: 'column', gap: 4, fontSize: 11, color: C.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4 }

export function Btn({ children, onClick, kind = 'default', disabled, small, type = 'button', title }) {
  const styles = {
    default: { background: C.card2, color: C.text, border: `1px solid ${C.line}` },
    gold: { background: C.gold, color: '#111', border: `1px solid ${C.gold}` },
    danger: { background: 'transparent', color: C.red, border: `1px solid ${C.red}55` },
    ghost: { background: 'transparent', color: C.muted, border: '1px solid transparent' },
  }[kind]
  return (
    <button type={type} onClick={onClick} disabled={disabled} title={title}
      style={{ ...styles, borderRadius: 8, padding: small ? '4px 9px' : '7px 13px', fontSize: small ? 12 : 13,
        fontWeight: 600, cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.5 : 1, whiteSpace: 'nowrap' }}>
      {children}
    </button>
  )
}

export function Pill({ color, children }) {
  return (
    <span style={{ background: `${color}22`, color, border: `1px solid ${color}55`, borderRadius: 999,
      padding: '2px 8px', fontSize: 11, fontWeight: 700, textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
      {children}
    </span>
  )
}

export function Card({ children, style }) {
  return <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 12, ...style }}>{children}</div>
}

// All directory writes go through one server route (superadmin-checked).
export async function dirAction(action, payload = {}) {
  const res = await fetch('/api/admin/directory', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...payload }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || data.error) throw new Error(data.error || 'Request failed')
  return data
}

export function fmtDate(d) {
  return d ? new Date(d).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
}
