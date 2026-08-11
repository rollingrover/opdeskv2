'use client'

export function notify(template, data) {
  fetch('/api/notify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ template, data }),
  }).catch(err => console.warn('[notify] failed to send', template, err))
}
