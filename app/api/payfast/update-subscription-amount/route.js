import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { updateSubscriptionAmount } from '@/lib/payfast'

export async function POST(request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('is_superadmin').eq('id', user.id).maybeSingle()
    if (!profile?.is_superadmin) return NextResponse.json({ error: 'Superadmin only' }, { status: 403 })

    const { companyId } = await request.json()
    if (!companyId) return NextResponse.json({ error: 'companyId is required' }, { status: 400 })

    const { data: company, error: companyErr } = await supabase
      .from('companies').select('id, package_id, payfast_token').eq('id', companyId).maybeSingle()
    if (companyErr || !company) return NextResponse.json({ error: 'Company not found' }, { status: 404 })

    // No PayFast token means this company never went through PayFast
    // checkout (still on a free tier, or set up manually by a superadmin
    // outside PayFast entirely) — there's no live recurring subscription
    // to sync, so this is a normal no-op, not an error.
    if (!company.payfast_token) {
      return NextResponse.json({ synced: false, reason: 'No active PayFast subscription on this company' })
    }

    const [{ data: pkg }, { data: addons }] = await Promise.all([
      company.package_id
        ? supabase.from('marketing_packages').select('monthly_price').eq('id', company.package_id).maybeSingle()
        : Promise.resolve({ data: null }),
      supabase.from('company_addons').select('price_per_unit, quantity').eq('company_id', companyId).eq('active', true),
    ])

    const packagePrice = Number(pkg?.monthly_price) || 0
    const addonsTotal = (addons || []).reduce((sum, a) => sum + (Number(a.price_per_unit) || 0) * (a.quantity || 1), 0)
    const newTotal = packagePrice + addonsTotal

    const result = await updateSubscriptionAmount(company.payfast_token, newTotal)
    if (!result.success) {
      // Don't fail the caller's overall action over this — the add-on
      // grant/revoke in our own database already succeeded and that's
      // what matters for access control. Surface the mismatch so the
      // superadmin can follow up (e.g. retry, or adjust manually in
      // PayFast) rather than silently losing revenue to a stale amount.
      return NextResponse.json({ synced: false, newTotal, error: result.error }, { status: 200 })
    }

    return NextResponse.json({ synced: true, newTotal })
  } catch (error) {
    console.error('[api/payfast/update-subscription-amount] error:', error)
    return NextResponse.json({ error: error.message || 'Failed to sync subscription amount' }, { status: 500 })
  }
}
