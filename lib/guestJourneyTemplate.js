// Guest journey templates are stored per-company and editable by the
// operator, unlike the hardcoded EMAIL_TEMPLATES functions elsewhere in
// lib/email.js — so rendering is a plain {{variable}} substitution rather
// than a JS template literal.
export function renderGuestJourneyTemplate(str, vars) {
  if (!str) return ''
  return str.replace(/\{\{(\w+)\}\}/g, (match, key) => (vars[key] !== undefined && vars[key] !== null ? String(vars[key]) : ''))
}
