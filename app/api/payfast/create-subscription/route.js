import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { buildPaymentUrl } from '@/lib/payfast'
import { createServiceClient } from '@/lib/supabase/service'
import {
  FOUNDING, FOUNDING_INTRO_MONTHS, addMonths, addYears, foundingRateFor, isFoundingOpen, packagePriceFor,
} from '@/lib/opdeskPricing'

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

    const { data: company } = await supabase.from('companies')
      .select('name, email, payfast_token, comped, founding_member, founding_intro_until, founding_lock_until, founding_rate')
      .eq('id', profile.company_id).maybeSingle()

    // Billing starts only once the trial ends — PayFast supports this
    // natively via billing_date, so the card/subscription is set up today
    // but the first real charge only happens 30 days from now.
    const billingDate = new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000)
    const billingDateStr = billingDate.toISOString().slice(0, 10)

    // Founding members: new subscribers before the deadline start on the
    // plan's intro price for 3 billed months, then 20% off locked 3 years.
    // Existing founding members changing plan keep their stage and dates;
    // only the locked rate is re-based on the new plan.
    let founding = null
    if (company && !company.comped && pkg.intro_price) {
      if (company.founding_member) {
        founding = { founding_rate: foundingRateFor(pkg) }
      } else if (!company.payfast_token && isFoundingOpen()) {
        founding = {
          founding_member: true,
          founding_intro_until: addMonths(billingDate, FOUNDING_INTRO_MONTHS),
          founding_lock_until: addYears(billingDate, FOUNDING.lockYears),
          founding_rate: foundingRateFor(pkg),
          founding_stage: 'intro',
          founding_notice_stage: null,
        }
      }
    }
    const effective = founding ? { ...company, ...founding } : company
    const amount = founding ? packagePriceFor(effective, pkg, billingDate) : pkg.monthly_price
    if (founding) {
      // Service client: billing fields aren't writable by company users.
      const { error: fErr } = await createServiceClient().from('companies').update(founding).eq('id', profile.company_id)
      if (fErr) console.error('[create-subscription] could not record founding terms', fErr)
    }

    const mPaymentId = `SUB-${profile.company_id}-${packageId}-${Date.now()}`
    const [nameFirst, ...rest] = (profile.full_name || '').split(' ')

    const paymentUrl = buildPaymentUrl({
      amount,
      itemName: `OpDesk — ${pkg.name} Plan`,
      itemDescription: (effective?.founding_member && founding?.founding_stage === 'intro'
        ? `Founding member: R${amount}/mo for ${FOUNDING_INTRO_MONTHS} months, then R${effective.founding_rate}/mo locked ${FOUNDING.lockYears} years. First charge after your ${TRIAL_DAYS}-day free trial`
        : `Monthly subscription, first charge after your ${TRIAL_DAYS}-day free trial`).slice(0, 255),
      mPaymentId,
      nameFirst: nameFirst || profile.full_name || company?.name,
      nameLast: rest.join(' ') || '',
      emailAddress: profile.email || company?.email,
      returnUrl: `${SITE_URL}/settings/billing?subscribed=1`,
      cancelUrl: `${SITE_URL}/settings/billing?cancelled=1`,
      notifyUrl: `${SITE_URL}/api/payfast/notify`,
      recurring: true,
      cycleFrequency: 'monthly',
      cycleAmount: amount,
      billingDate: billingDateStr,
    })

    return NextResponse.json({ paymentUrl })
  } catch (error) {
    console.error('[api/payfast/create-subscription] error:', error)
    return NextResponse.json({ error: error.message || 'Failed to start checkout' }, { status: 500 })
  }
}
