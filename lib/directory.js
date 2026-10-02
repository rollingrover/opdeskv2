// Server-only helpers for the ZAtours / Route22 directory (dir_* tables).
// The directory front ends live in the rollingrover/route22 repo; OpDesk is
// where the directory is administered and billed.

import crypto from 'node:crypto'

export const ZATOURS_URL = (process.env.NEXT_PUBLIC_ZATOURS_URL || 'https://www.zatours.co.za').replace(/\/+$/, '')
export const ROUTE22_URL = (process.env.NEXT_PUBLIC_ROUTE22_URL || 'https://www.route22zululand.co.za').replace(/\/+$/, '')

// Must match lib/pricing.ts in the route22 repo (shown on /list-your-business).
export const DIRECTORY_PLANS = {
  premium: { amount: 249, label: 'Premium listing' },
  featured: { amount: 399, label: 'Featured listing' },
}

export const LISTING_TIERS = ['community', 'basic', 'premium', 'featured']
export const LISTING_CATEGORIES = ['stay', 'tours', 'wildlife', 'ocean', 'culture', 'eat', 'transport', 'volunteer']
export const BILLING_STATUSES = ['free', 'paid', 'comped', 'trial', 'lapsed']
export const LEAD_STATUSES = ['new', 'contacted', 'won', 'lost']

// ZAtours is the canonical home for a listing; Route22-only listings live there.
export function siteUrlFor(listing) {
  return listing?.sites?.includes('zatours') ? ZATOURS_URL : ROUTE22_URL
}
export function listingUrl(listing) {
  return `${siteUrlFor(listing)}/listings/${listing.slug}`
}

export function generateToken() {
  return crypto.randomBytes(24).toString('base64url')
}

export function slugify(s) {
  return String(s || '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 80) || 'listing'
}

// Ask both directory sites to refresh (best-effort; never throws). Without
// DIRECTORY_REVALIDATE_SECRET the sites still pick changes up within 5 min.
export async function revalidateDirectory(slugs = []) {
  const secret = process.env.DIRECTORY_REVALIDATE_SECRET
  if (!secret) return { skipped: true }
  const body = JSON.stringify({ slugs: slugs.filter(Boolean) })
  const results = await Promise.allSettled(
    [ZATOURS_URL, ROUTE22_URL].map(base =>
      fetch(`${base}/api/revalidate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-revalidate-secret': secret },
        body,
        signal: AbortSignal.timeout(5000),
      })
    )
  )
  results.forEach((r, i) => {
    if (r.status === 'rejected' || !r.value.ok) console.warn('[directory] revalidate failed for site', i)
  })
  return { ok: true }
}

const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))

// Owner email: edit link (+ upgrade prompt for free tiers). Used by "send
// edit link" and claim approval.
export function ownerEmailHtml({ listing, editUrl, intro }) {
  const site = siteUrlFor(listing)
  const brand = site === ZATOURS_URL ? 'ZAtours' : 'Route22'
  const free = listing.tier === 'community' || listing.tier === 'basic'
  return {
    subject: intro === 'claim' ? `Your ${brand} listing claim was approved` : `Manage your ${brand} listing`,
    html: `
      <p>Hi,</p>
      ${intro === 'claim' ? `<p>Your claim on <strong>${esc(listing.name)}</strong> has been approved.</p>` : ''}
      <p>Here's your link to edit your ${brand} listing at any time — no account or password needed:</p>
      <p><a href="${esc(editUrl)}">${esc(editUrl)}</a></p>
      <p style="color:#666">Keep this link private; anyone with it can edit the listing.</p>
      ${free ? `
      <hr style="border:none;border-top:1px solid #eee;margin:20px 0" />
      <p>Want more enquiries? Upgrade to <strong>Premium (R${DIRECTORY_PLANS.premium.amount}/month)</strong> for a full page with photos, your website and booking links, and an enquiry form to your inbox — or <strong>Featured (R${DIRECTORY_PLANS.featured.amount}/month)</strong> for home-page placement:</p>
      <p><a href="${site}/list-your-business?listing=${encodeURIComponent(listing.slug)}">${site}/list-your-business</a></p>
      <p style="color:#666">Flat monthly price — no commission, no per-booking or per-enquiry fees.</p>` : ''}
    `,
  }
}

export function paymentLinkEmailHtml({ listing, plan, paymentUrl, contactName }) {
  const site = siteUrlFor(listing)
  const brand = site === ZATOURS_URL ? 'ZAtours' : 'Route22'
  const p = DIRECTORY_PLANS[plan]
  return {
    subject: `Your ${brand} ${p.label} — payment link`,
    html: `
      <p>Hi ${esc(contactName || '')},</p>
      <p>Thanks for upgrading <strong>${esc(listing.name)}</strong> to a <strong>${p.label}</strong> on ${brand}: R${p.amount} per month.</p>
      <p>Pay securely through PayFast here — your listing upgrades automatically as soon as the payment goes through:</p>
      <p><a href="${esc(paymentUrl)}">Pay R${p.amount}/month with PayFast</a></p>
      <p style="color:#666">Flat monthly price — no commission, no per-booking or per-enquiry fees. Reply to this email with any questions.</p>
    `,
  }
}
