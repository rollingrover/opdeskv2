import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { buildPaymentUrl } from '@/lib/payfast'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://opdesk.app'
const TRIAL_DAYS = 30

export async function POST(request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { packageId } = await request.json()

    const { data: profile } = await supabase.from('profiles').select('company_id, full_name, email, is_superadmin').eq('id', user.id).maybeSingle()
    if (!profile?.company_id) return NextResponse.json({ error: 'No company on this account' }, { status: 400 })

    const { data: pkg, error: pkgErr } = await supabase.from('marketing_packages').select('*').eq('id', packageId).maybeSingle()
    if (pkgErr || !pkg) return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    if (pkg.monthly_price <= 0) return NextResponse.json({ error: 'This package is free — no checkout needed' }, { status: 400 })

    const { data: company } = await supabase.from('companies').select('name, email').eq('id', profile.company_id).maybeSingle()

    // Billing starts only once the trial ends — PayFast supports this
    // natively via billing_date, so the card/subscription is set up today
    // but the first real charge only happens 30 days from now.
    const billingDate = new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000)
    const billingDateStr = billingDate.toISOString().slice(0, 10)

    const mPaymentId = `SUB-${profile.company_id}-${packageId}-${Date.now()}`
    const [nameFirst, ...rest] = (profile.full_name || '').split(' ')

    const paymentUrl = buildPaymentUrl({
      amount: pkg.monthly_price,
      itemName: `OpDesk — ${pkg.name} Plan`,
      itemDescription: `Monthly subscription, first charge after your ${TRIAL_DAYS}-day free trial`,
      mPaymentId,
      nameFirst: nameFirst || profile.full_name || company?.name,
      nameLast: rest.join(' ') || '',
      emailAddress: profile.email || company?.email,
      returnUrl: `${SITE_URL}/settings/billing?subscribed=1`,
      cancelUrl: `${SITE_URL}/settings/billing?cancelled=1`,
      notifyUrl: `${SITE_URL}/api/payfast/notify`,
      recurring: true,
      cycleFrequency: 'monthly',
      cycleAmount: pkg.monthly_price,
      billingDate: billingDateStr,
    })

    return NextResponse.json({ paymentUrl })
  } catch (error) {
    console.error('[api/payfast/create-subscription] error:', error)
    return NextResponse.json({ error: error.message || 'Failed to start checkout' }, { status: 500 })
  }
}
