// Server-only. Never import this from a 'use client' component — it reads
// RESEND_API_KEY, which must never reach the browser.
//
// Uses Resend's REST API directly via fetch rather than the `resend` npm
// package, so no new dependency/install is needed to ship this.

const FROM = process.env.RESEND_FROM_EMAIL || 'OpDesk <central@opdesk.app>'

export async function sendEmail({ to, subject, html }) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[email] RESEND_API_KEY not set — skipping send:', subject)
    return { skipped: true }
  }
  if (!to) {
    console.warn('[email] no recipient — skipping send:', subject)
    return { skipped: true }
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    console.error('[email] Resend send failed:', res.status, body)
    return { error: true, status: res.status }
  }
  return await res.json()
}

// Shared wrapper so every email looks like it came from the same product,
// without duplicating layout HTML in every template below.
function wrap(bodyHtml, { heading }) {
  return `
    <div style="font-family: Inter, -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px;">
      <div style="font-family: Montserrat, sans-serif; font-weight: 800; font-size: 20px; margin-bottom: 24px;">
        <span style="color: #F2994A;">op</span><span style="color: #0F2540;">desk</span>
      </div>
      ${heading ? `<h2 style="color: #0F2540; font-size: 18px; margin: 0 0 16px;">${heading}</h2>` : ''}
      ${bodyHtml}
      <p style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #eee; color: #9ca3af; font-size: 12px;">
        OpDesk — Operate. Explore. Grow.
      </p>
    </div>
  `
}

const ADMIN_EMAIL = process.env.SUPPORT_NOTIFY_EMAIL || 'central@opdesk.app'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://opdesk.app'

export const EMAIL_TEMPLATES = {
  support_ticket_created: ({ companyName, submitterEmail, category, priority, subject, description }) => ({
    to: ADMIN_EMAIL,
    subject: `New Support Ticket: ${subject}`,
    html: wrap(`
      <p><strong>${companyName || 'Unknown company'}</strong> (${submitterEmail}) submitted a new ticket.</p>
      <p><strong>Category:</strong> ${category} &nbsp;·&nbsp; <strong>Priority:</strong> ${priority}</p>
      <p style="background:#f9fafb; border-radius:8px; padding:12px 16px; white-space:pre-wrap;">${description}</p>
      <p><a href="${SITE_URL}/admin/support" style="color:#D4A853;">View in Support Queue →</a></p>
    `, { heading: 'New support ticket' }),
  }),

  support_ticket_updated: ({ toEmail, subject, status }) => ({
    to: toEmail,
    subject: `Update on your ticket: ${subject}`,
    html: wrap(`
      <p>Your support ticket <strong>"${subject}"</strong> has been updated to: <strong>${status.replace(/_/g, ' ')}</strong>.</p>
      <p><a href="${SITE_URL}/support" style="color:#D4A853;">View your tickets →</a></p>
    `, { heading: 'Your support ticket was updated' }),
  }),

  addon_request_created: ({ companyName, requesterEmail, addonKey, quantity }) => ({
    to: ADMIN_EMAIL,
    subject: `New Add-on Request: ${addonKey} — ${companyName}`,
    html: wrap(`
      <p><strong>${companyName}</strong> (${requesterEmail}) requested <strong>${addonKey.replace(/_/g, ' ')}</strong> ${quantity > 1 ? `×${quantity}` : ''}.</p>
      <p><a href="${SITE_URL}/admin/companies" style="color:#D4A853;">Review in Companies →</a></p>
    `, { heading: 'New add-on request' }),
  }),

  addon_request_resolved: ({ toEmail, addonKey, status }) => ({
    to: toEmail,
    subject: `Your add-on request has been ${status}`,
    html: wrap(`
      <p>Your request for <strong>${addonKey.replace(/_/g, ' ')}</strong> has been <strong>${status}</strong>.</p>
      ${status === 'approved' ? `<p>It's live on your account now.</p>` : ''}
      <p><a href="${SITE_URL}/settings/addons" style="color:#D4A853;">View your Add-ons →</a></p>
    `, { heading: `Add-on request ${status}` }),
  }),
}
