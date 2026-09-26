import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

async function requireSuperadmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated', status: 401 }
  const { data: profile } = await supabase.from('profiles').select('is_superadmin').eq('id', user.id).maybeSingle()
  if (!profile?.is_superadmin) return { error: 'Not authorised — superadmin role required', status: 403 }
  return { ok: true }
}

async function getInternalCompanyId(svc) {
  const { data } = await svc.from('companies').select('id').eq('is_internal', true).maybeSingle()
  return data?.id || null
}

export async function POST(request) {
  const auth = await requireSuperadmin()
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    const body = await request.json()
    const svc = createServiceClient()
    const companyId = await getInternalCompanyId(svc)
    if (!companyId) return NextResponse.json({ error: 'OpDesk internal billing entity not found' }, { status: 500 })

    const subtotal = body.line_items?.length > 0
      ? body.line_items.reduce((sum, li) => sum + (Number(li.quantity) || 1) * (Number(li.unit_price) || 0), 0)
      : Number(body.subtotal) || 0
    const vatRate = Number(body.vat_rate) || 0
    const vatAmount = +(subtotal * vatRate / 100).toFixed(2)
    const total = +(subtotal + vatAmount).toFixed(2)

    const { data, error } = await svc.from('invoices').insert([{
      company_id: companyId,
      guest_name: body.guest_name, guest_email: body.guest_email || null, guest_address: body.guest_address || null,
      guest_vat_number: body.guest_vat_number || null, guest_phone: body.guest_phone || null,
      guest_business_name: body.guest_business_name || null,
      invoice_type: body.invoice_type || 'tax', status: body.status || 'draft',
      invoice_number: 'OPD-' + Date.now().toString(36).toUpperCase(),
      currency: body.currency || 'ZAR', subtotal, vat_rate: vatRate, vat_amount: vatAmount, total,
      amount_paid: Number(body.amount_paid) || 0, due_date: body.due_date || null, notes: body.notes || null,
      line_items: (body.line_items || []).map(li => ({
        description: li.description, quantity: Number(li.quantity) || 1, unit_price: Number(li.unit_price) || 0,
        total: (Number(li.quantity) || 1) * (Number(li.unit_price) || 0),
      })),
    }]).select().maybeSingle()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, invoice: data })
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Failed to create invoice' }, { status: 500 })
  }
}

export async function PATCH(request) {
  const auth = await requireSuperadmin()
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    const { id, status, amount_paid, invoice_type } = await request.json()
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })
    const svc = createServiceClient()
    const payload = {}
    if (status !== undefined) payload.status = status
    if (amount_paid !== undefined) { payload.amount_paid = Number(amount_paid) || 0; if (status === 'paid') payload.paid_at = new Date().toISOString() }
    if (invoice_type !== undefined) {
      payload.invoice_type = invoice_type
      // Converting a proforma into a real invoice re-derives VAT from
      // scratch — a proforma might have been drafted at 0% (undecided at
      // the time), and "Invoice" (non-VAT-registered) must always be 0%
      // regardless of what was on it before.
      const { data: current } = await svc.from('invoices').select('subtotal, vat_rate').eq('id', id).maybeSingle()
      if (current) {
        const vatRate = invoice_type === 'invoice' ? 0 : Number(current.vat_rate) || 0
        const vatAmount = +(Number(current.subtotal) * vatRate / 100).toFixed(2)
        payload.vat_rate = vatRate
        payload.vat_amount = vatAmount
        payload.total = +(Number(current.subtotal) + vatAmount).toFixed(2)
      }
    }
    const { error } = await svc.from('invoices').update(payload).eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Failed to update invoice' }, { status: 500 })
  }
}
