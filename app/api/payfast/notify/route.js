import { NextResponse } from 'next/server'
import { verifyItnSignature, confirmWithPayfast } from '@/lib/payfast'
import { createServiceClient } from '@/lib/supabase/service'
import { revalidateDirectory } from '@/lib/directory'

const TRIAL_DAYS = 30

// PayFast calls this directly — there is no logged-in user, no session,
// nothing to check via normal auth. Trust comes entirely from (1) the
// signature matching and (2) PayFast's own servers confirming the
// notification when we post it back to them. Skipping either check would
// let anyone who discovers this URL fake a "payment succeeded" callback.
export async function POST(request) {
  const rawBody = await request.text()
  const params = new URLSearchParams(rawBody)
  const postData = Object.fromEntries(params.entries())
  const supabase = createServiceClient()

  // Every call to this endpoint gets exactly one row here, whatever the
  // outcome — this table existed in the schema from early on but nothing
  // ever wrote to it, so there was no audit trail for a webhook that
  // moves real money. logAndReturn wraps every existing return path
  // below rather than restructuring them, so nothing about the actual
  // payment logic changes.
  async function logAndReturn(response, { intent, outcome, error, companyId } = {}) {
    try {
      await supabase.from('payfast_itn_log').insert([{
        payment_status: postData.payment_status || null, pf_payment_id: postData.pf_payment_id || null,
        m_payment_id: postData.m_payment_id || null, amount_gross: postData.amount_gross ? Number(postData.amount_gross) : null,
        company_id: companyId || null, intent: intent ? { type: intent } : null, raw_params: postData,
        outcome: outcome || null, error: error || null,
      }])
    } catch (logErr) {
      console.error('[payfast/notify] failed to write itn log:', logErr)
    }
    return response
  }

  try {
    if (!verifyItnSignature(postData)) {
      console.error('[payfast/notify] signature mismatch', postData.m_payment_id)
      return logAndReturn(new NextResponse('invalid signature', { status: 400 }), { outcome: 'rejected', error: 'signature mismatch' })
    }

    const confirmed = await confirmWithPayfast(rawBody)
    if (!confirmed) {
      console.error('[payfast/notify] PayFast did not confirm this notification', postData.m_payment_id)
      return logAndReturn(new NextResponse('not confirmed', { status: 400 }), { outcome: 'rejected', error: 'not confirmed by PayFast' })
    }

    const mPaymentId = postData.m_payment_id || ''

    // --- RollingRover Productions payment (one-off or recurring) ---
    if (mPaymentId.startsWith('RR-')) {
      if (postData.payment_status !== 'COMPLETE') return logAndReturn(new NextResponse('OK', { status: 200 }), { intent: 'rollingrover_payment', outcome: 'ignored_not_complete' })
      const { error } = await supabase.from('rollingrover_requests')
        .update({ status: 'paid', paid_at: new Date().toISOString(), payfast_pf_payment_id: postData.pf_payment_id })
        .eq('payfast_m_payment_id', mPaymentId)
      if (error) {
        console.error('[payfast/notify] RR update failed:', error)
        return logAndReturn(new NextResponse('db error', { status: 500 }), { intent: 'rollingrover_payment', outcome: 'error', error: error.message })
      }
      return logAndReturn(new NextResponse('OK', { status: 200 }), { intent: 'rollingrover_payment', outcome: 'success' })
    }

    // --- Directory listing plan (ZAtours / Route22 Premium or Featured) ---
    // First payment: m_payment_id DIR-{listingId}-{plan}-{ts}. Recurring
    // re-bills are matched by PayFast token, like SaaS subscriptions.
    {
      let dirRow = null
      if (mPaymentId.startsWith('DIR-')) {
        const { data } = await supabase.from('dir_billing').select('*').eq('payfast_m_payment_id', mPaymentId).maybeSingle()
        dirRow = data
      }
      if (!dirRow && postData.token) {
        const { data } = await supabase.from('dir_billing').select('*').eq('payfast_token', postData.token).maybeSingle()
        dirRow = data
      }
      if (dirRow || mPaymentId.startsWith('DIR-')) {
        const result = await handleDirectoryPayment(supabase, dirRow, postData, mPaymentId)
        return logAndReturn(new NextResponse(result.status === 500 ? 'db error' : 'OK', { status: result.status }), {
          intent: 'directory_plan', outcome: result.outcome, error: result.error,
        })
      }
    }

    // --- OpDesk SaaS subscription payment ---
    // PayFast identifies *recurring* re-bills of an existing subscription by
    // `token`, not by m_payment_id (which we only guarantee unique for the
    // very first checkout transaction) — so a token match takes priority.
    let companyId = null
    let packageId = null
    let isInitialSetup = false

    if (postData.token) {
      const { data: existing } = await supabase.from('companies').select('id').eq('payfast_token', postData.token).maybeSingle()
      if (existing) companyId = existing.id
    }
    if (!companyId && mPaymentId.startsWith('SUB-')) {
      const parts = mPaymentId.split('-')
      // SUB-{companyId(uuid, 5 parts)}-{packageId(uuid, 5 parts)}-{timestamp}
      if (parts.length >= 11) {
        companyId = parts.slice(1, 6).join('-')
        packageId = parts.slice(6, 11).join('-')
        isInitialSetup = true
      }
    }

    if (!companyId) {
      console.error('[payfast/notify] could not match SUB payment to a company', mPaymentId, postData.token)
      return logAndReturn(new NextResponse('OK', { status: 200 }), { intent: 'subscription_payment', outcome: 'unmatched', error: 'could not match to a company' }) // acknowledge anyway — nothing more we can do with it
    }

    if (postData.payment_status !== 'COMPLETE') {
      // A failed recurring charge — flag for follow-up, don't touch access
      // yet (avoid yanking a paying customer's account over one hiccup).
      await supabase.from('companies').update({ account_status: 'payment_failed' }).eq('id', companyId)
      await supabase.from('subscription_payments').insert([{
        company_id: companyId, package_id: packageId, amount: postData.amount_gross || 0,
        payfast_m_payment_id: mPaymentId, payfast_pf_payment_id: postData.pf_payment_id,
        payfast_token: postData.token, payment_status: postData.payment_status,
      }])
      return logAndReturn(new NextResponse('OK', { status: 200 }), { intent: 'subscription_payment', outcome: 'payment_failed', companyId })
    }

    await supabase.from('subscription_payments').insert([{
      company_id: companyId, package_id: packageId, amount: postData.amount_gross || 0,
      payfast_m_payment_id: mPaymentId, payfast_pf_payment_id: postData.pf_payment_id,
      payfast_token: postData.token, payment_status: postData.payment_status,
      is_initial_setup: isInitialSetup,
    }])

    if (isInitialSetup) {
      // First confirmation for this subscription — activate the trial now.
      // Billing itself was already delayed to TRIAL_DAYS out via
      // billing_date on the PayFast link; account_status reflects that.
      const trialEndsAt = new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000).toISOString()
      await supabase.from('companies').update({
        package_id: packageId,
        account_status: 'trial',
        trial_ends_at: trialEndsAt,
        payfast_token: postData.token,
      }).eq('id', companyId)
    } else {
      // A real recurring charge succeeded — extend access and clear the
      // trial/payment-failed status.
      const nextExpiry = new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString() // small buffer past the monthly cycle
      await supabase.from('companies').update({
        account_status: 'active',
        subscription_expires_at: nextExpiry,
      }).eq('id', companyId)
    }

    return logAndReturn(new NextResponse('OK', { status: 200 }), { intent: isInitialSetup ? 'subscription_initial_setup' : 'subscription_renewal', outcome: 'success', companyId })
  } catch (error) {
    console.error('[payfast/notify] error:', error)
    return logAndReturn(new NextResponse('error', { status: 500 }), { intent: 'unhandled', outcome: 'error', error: error.message })
  }
}

// Directory plan payments. Kept separate from the SaaS subscription flow:
// they touch dir_billing / dir_listings only, never companies.
async function handleDirectoryPayment(supabase, row, postData, mPaymentId) {
  if (!row) {
    console.error('[payfast/notify] DIR payment with no matching dir_billing row', mPaymentId)
    return { status: 200, outcome: 'unmatched', error: 'no dir_billing row' } // acknowledge; nothing to update
  }
  const status = postData.payment_status
  const now = new Date()
  const { data: listing } = await supabase.from('dir_listings').select('id, slug, tier, claimed').eq('id', row.entity_id).maybeSingle()

  if (status === 'COMPLETE') {
    const paidUntil = new Date(now.getTime() + 35 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10) // monthly cycle + buffer
    const plan = row.plan || (mPaymentId.split('-')[6] === 'featured' ? 'featured' : 'premium')
    const { error } = await supabase.from('dir_billing').update({
      billing_status: 'paid', plan, payfast_token: postData.token || row.payfast_token,
      last_paid_at: now.toISOString(), paid_until: paidUntil, payment_failed_at: null,
      updated_at: now.toISOString(),
    }).eq('id', row.id)
    if (error) return { status: 500, outcome: 'error', error: error.message }
    if (listing) {
      // Paying listings are always published at their plan's tier.
      await supabase.from('dir_listings').update({ tier: plan, published: true }).eq('id', listing.id)
      await supabase.from('dir_business_enquiries').update({ status: 'won' })
        .eq('listing_id', listing.id).in('status', ['new', 'contacted'])
      await revalidateDirectory([listing.slug])
    }
    return { status: 200, outcome: 'success' }
  }

  if (status === 'CANCELLED') {
    // Subscription cancelled: back to a free listing (keeps its page if claimed).
    await supabase.from('dir_billing').update({ billing_status: 'lapsed', updated_at: now.toISOString() }).eq('id', row.id)
    if (listing && (listing.tier === 'premium' || listing.tier === 'featured')) {
      await supabase.from('dir_listings').update({ tier: listing.claimed ? 'basic' : 'community' }).eq('id', listing.id)
      await revalidateDirectory([listing.slug])
    }
    return { status: 200, outcome: 'cancelled' }
  }

  // Failed charge: flag it, don't downgrade yet (same grace as SaaS accounts).
  // The daily directory-billing cron lapses it once paid_until has passed.
  await supabase.from('dir_billing').update({ payment_failed_at: now.toISOString(), updated_at: now.toISOString() }).eq('id', row.id)
  return { status: 200, outcome: 'payment_failed' }
}
