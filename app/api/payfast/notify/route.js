import { NextResponse } from 'next/server'
import { verifyItnSignature, confirmWithPayfast } from '@/lib/payfast'
import { createServiceClient } from '@/lib/supabase/service'

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

  try {
    if (!verifyItnSignature(postData)) {
      console.error('[payfast/notify] signature mismatch', postData.m_payment_id)
      return new NextResponse('invalid signature', { status: 400 })
    }

    const confirmed = await confirmWithPayfast(rawBody)
    if (!confirmed) {
      console.error('[payfast/notify] PayFast did not confirm this notification', postData.m_payment_id)
      return new NextResponse('not confirmed', { status: 400 })
    }

    const supabase = createServiceClient()
    const mPaymentId = postData.m_payment_id || ''

    // --- RollingRover Web Services payment (one-off or recurring) ---
    if (mPaymentId.startsWith('RR-')) {
      if (postData.payment_status !== 'COMPLETE') return new NextResponse('OK', { status: 200 })
      const { error } = await supabase.from('rollingrover_requests')
        .update({ status: 'paid', paid_at: new Date().toISOString(), payfast_pf_payment_id: postData.pf_payment_id })
        .eq('payfast_m_payment_id', mPaymentId)
      if (error) { console.error('[payfast/notify] RR update failed:', error); return new NextResponse('db error', { status: 500 }) }
      return new NextResponse('OK', { status: 200 })
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
      return new NextResponse('OK', { status: 200 }) // acknowledge anyway — nothing more we can do with it
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
      return new NextResponse('OK', { status: 200 })
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

    return new NextResponse('OK', { status: 200 })
  } catch (error) {
    console.error('[payfast/notify] error:', error)
    return new NextResponse('error', { status: 500 })
  }
}
