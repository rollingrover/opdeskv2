// Server-only PayFast helper. Built against PayFast's documented signature
// spec (https://developers.payfast.co.za/docs#step_2_signature). This has
// NOT been tested against PayFast's real sandbox from this environment —
// payfast.co.za isn't reachable from the sandbox this was built in. Test
// with real sandbox credentials before relying on this for a real payment.

import crypto from 'crypto'

const PAYFAST_HOST = process.env.PAYFAST_SANDBOX === 'false'
  ? 'https://www.payfast.co.za'
  : 'https://sandbox.payfast.co.za'

// PayFast's signature spec requires PHP-style urlencode (spaces as '+',
// not '%20'), NOT JavaScript's encodeURIComponent default behaviour —
// this mismatch is the single most common bug in JS PayFast integrations.
function phpUrlEncode(value) {
  return encodeURIComponent(value).replace(/%20/g, '+')
}

// Fields must be added in the exact order PayFast expects them signed in —
// this function preserves insertion order via a plain object + Object.entries,
// so callers must build `fields` in the right order (see buildPaymentUrl).
function generateSignature(fields, passphrase) {
  let pairs = Object.entries(fields)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${k}=${phpUrlEncode(String(v).trim())}`)
  let str = pairs.join('&')
  if (passphrase) {
    str += `&passphrase=${phpUrlEncode(passphrase)}`
  }
  return crypto.createHash('md5').update(str).digest('hex')
}

/**
 * Builds a signed PayFast redirect URL for a once-off (or recurring, via
 * subscription_type) custom-amount payment.
 */
export function buildPaymentUrl({
  amount, itemName, itemDescription, mPaymentId,
  nameFirst, nameLast, emailAddress,
  returnUrl, cancelUrl, notifyUrl,
  recurring = false, cycleFrequency, cycleAmount, billingDate,
}) {
  const merchantId = process.env.PAYFAST_MERCHANT_ID
  const merchantKey = process.env.PAYFAST_MERCHANT_KEY
  const passphrase = process.env.PAYFAST_PASSPHRASE || ''

  if (!merchantId || !merchantKey) {
    throw new Error('PAYFAST_MERCHANT_ID / PAYFAST_MERCHANT_KEY not configured')
  }

  // Order matters for the signature — build in the order PayFast documents.
  const fields = {
    merchant_id: merchantId,
    merchant_key: merchantKey,
    return_url: returnUrl,
    cancel_url: cancelUrl,
    notify_url: notifyUrl,
    name_first: nameFirst,
    name_last: nameLast,
    email_address: emailAddress,
    m_payment_id: mPaymentId,
    amount: Number(amount).toFixed(2),
    item_name: itemName,
    item_description: itemDescription,
  }

  if (recurring) {
    fields.subscription_type = '1'
    fields.recurring_amount = Number(cycleAmount ?? amount).toFixed(2)
    fields.frequency = cycleFrequency === 'annual' ? '6' : '3' // PayFast: 3=monthly, 6=annual
    fields.cycles = '0' // 0 = until cancelled
    if (billingDate) fields.billing_date = billingDate // Y-m-d — delays the first real charge (used for the 30-day trial)
  }

  const signature = generateSignature(fields, passphrase)
  const query = Object.entries(fields)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${k}=${phpUrlEncode(String(v).trim())}`)
    .concat(`signature=${signature}`)
    .join('&')

  return `${PAYFAST_HOST}/eng/process?${query}`
}

/**
 * Verifies an incoming ITN (webhook) payload. Per PayFast's own integration
 * guide, signature verification alone is not sufficient — you should also
 * make a server-to-server confirmation call back to PayFast before trusting
 * the notification (handled separately in the notify route, see
 * confirmWithPayfast below), since a signature match only proves the
 * payload wasn't tampered with in transit, not that it genuinely came from
 * PayFast's servers.
 */
export function verifyItnSignature(postData) {
  const passphrase = process.env.PAYFAST_PASSPHRASE || ''
  const { signature, ...rest } = postData
  const expected = generateSignature(rest, passphrase)
  return expected === signature
}

/**
 * Server-to-server confirmation: POST the raw ITN body back to PayFast and
 * check it echoes "VALID". This is PayFast's documented anti-spoofing step —
 * skipping it means anyone who can guess your notify_url and construct a
 * correctly-signed payload (a real risk if the passphrase ever leaks) could
 * fake a payment confirmation.
 */
export async function confirmWithPayfast(rawBody) {
  const host = process.env.PAYFAST_SANDBOX === 'false' ? 'www.payfast.co.za' : 'sandbox.payfast.co.za'
  try {
    const res = await fetch(`https://${host}/eng/query/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: rawBody,
    })
    const text = await res.text()
    return text.trim() === 'VALID'
  } catch (err) {
    console.error('[payfast] confirmation call failed:', err)
    return false
  }
}

// ----------------------------------------------------------------------------
// Subscriptions Management API — used to change the amount of an *existing*
// recurring subscription (e.g. when an add-on is granted or revoked, so the
// customer's actual PayFast charge reflects package + add-ons, not just the
// original package price). This is a genuinely different part of PayFast's
// API from the checkout-redirect + ITN flow above:
//   - Same host for sandbox and live (api.payfast.co.za) — sandbox mode is
//     a `?testing=true` query param, not a different subdomain.
//   - Auth is via headers (merchant-id, version, timestamp, signature),
//     not form fields.
//   - The signature is an MD5 hash of the ALPHABETICALLY SORTED combined
//     header+body fields plus the passphrase — NOT insertion-order like
//     the checkout/ITN signature above. Reusing generateSignature() here
//     would silently produce a wrong signature.
// Verified against PayFast's documented spec and cross-checked against
// several independent working implementations, but — like the rest of
// this file — has not been exercised against PayFast's real servers from
// this environment. Confirm against the real sandbox once real
// credentials are available, before relying on it for a real account.
// ----------------------------------------------------------------------------

function apiTimestamp() {
  // PayFast wants YYYY-MM-DDTHH:MM:SS — no milliseconds, no trailing Z.
  return new Date().toISOString().split('.')[0]
}

function apiSignature(fields, passphrase) {
  const pairs = Object.keys(fields)
    .sort()
    .filter(k => fields[k] !== undefined && fields[k] !== null && fields[k] !== '')
    .map(k => `${k}=${phpUrlEncode(String(fields[k]).trim())}`)
  let str = pairs.join('&')
  if (passphrase) str += `&passphrase=${phpUrlEncode(passphrase)}`
  return crypto.createHash('md5').update(str).digest('hex')
}

function apiBaseUrl(path) {
  const testing = process.env.PAYFAST_SANDBOX !== 'false'
  return `https://api.payfast.co.za${path}${testing ? '?testing=true' : ''}`
}

/**
 * Updates the recurring amount on an existing subscription, identified by
 * its PayFast `token` (stored on companies.payfast_token once the first
 * ITN confirmation comes in — see the notify route). Leaves cycles,
 * frequency, and run_date untouched; only `amount` is sent.
 *
 * Returns { success: true } on a confirmed update, or { success: false,
 * error } otherwise — this never throws, since a PayFast sync failure
 * should never block the add-on itself from being granted or revoked in
 * our own database; callers surface the failure to the superadmin instead
 * of rolling back the grant.
 */
export async function updateSubscriptionAmount(token, newAmount) {
  const merchantId = process.env.PAYFAST_MERCHANT_ID
  const passphrase = process.env.PAYFAST_PASSPHRASE || ''
  if (!merchantId) return { success: false, error: 'PAYFAST_MERCHANT_ID not configured' }
  if (!token) return { success: false, error: 'No PayFast subscription token on this company' }

  const timestamp = apiTimestamp()
  const amountStr = Number(newAmount).toFixed(2)
  const headerFields = { 'merchant-id': merchantId, version: 'v1', timestamp }
  const bodyFields = { amount: amountStr }
  const signature = apiSignature({ ...headerFields, ...bodyFields }, passphrase)

  try {
    const res = await fetch(apiBaseUrl(`/subscriptions/${token}/update`), {
      method: 'PUT',
      headers: {
        'merchant-id': merchantId,
        version: 'v1',
        timestamp,
        signature,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(bodyFields).toString(),
    })
    const json = await res.json().catch(() => null)
    const ok = res.ok && json?.code === 200 && json?.status === 'success' &&
      (json?.data?.response === true || json?.data?.response === 'true')
    if (!ok) {
      console.error('[payfast] subscription amount update failed:', token, json)
      return { success: false, error: json?.data?.message || json?.data?.response || `HTTP ${res.status}` }
    }
    return { success: true }
  } catch (err) {
    console.error('[payfast] subscription amount update request failed:', err)
    return { success: false, error: err.message }
  }
}
