import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { buildPaymentUrl } from '@/lib/payfast'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://opdesk.app'

export async function POST(request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('is_superadmin').eq('id', user.id).maybeSingle()
    if (!profile?.is_superadmin) {
      return NextResponse.json({ error: 'Superadmin access required' }, { status: 403 })
    }

    const { requestId } = await request.json()
    const { data: req, error: reqErr } = await supabase
      .from('rollingrover_requests').select('*').eq('id', requestId).maybeSingle()
    if (reqErr || !req) return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    if (!req.quote_amount) return NextResponse.json({ error: 'Set a quote amount first' }, { status: 400 })

    const mPaymentId = `RR-${req.id}`
    const [nameFirst, ...rest] = (req.name || '').split(' ')

    const paymentUrl = buildPaymentUrl({
      amount: req.quote_amount,
      itemName: `RollingRover Web Services — ${req.business_name || req.name}`,
      itemDescription: req.quote_notes || req.details || 'Web design services',
      mPaymentId,
      nameFirst: nameFirst || req.name,
      nameLast: rest.join(' ') || '',
      emailAddress: req.email,
      returnUrl: `${SITE_URL}/web-design/thank-you`,
      cancelUrl: `${SITE_URL}/web-design`,
      notifyUrl: `${SITE_URL}/api/payfast/notify`,
      recurring: req.billing_type === 'recurring',
      cycleFrequency: req.recurring_cadence,
    })

    await supabase.from('rollingrover_requests')
      .update({ payment_link: paymentUrl, payfast_m_payment_id: mPaymentId, status: req.status === 'new' ? 'quoted' : req.status })
      .eq('id', requestId)

    return NextResponse.json({ paymentUrl })
  } catch (error) {
    console.error('[api/payfast/create-link] error:', error)
    return NextResponse.json({ error: error.message || 'Failed to create payment link' }, { status: 500 })
  }
}
