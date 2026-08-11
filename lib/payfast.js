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
