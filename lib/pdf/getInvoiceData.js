import { createClient } from '@/lib/supabase/server'

export async function getInvoiceData(invoiceId) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: profile } = await supabase.from('profiles').select('company_id').eq('id', user.id).maybeSingle()
  if (!profile?.company_id) throw new Error('No company on this account')

  const { data: company } = await supabase.from('companies').select('*').eq('id', profile.company_id).maybeSingle()
  const { data: invoice, error: invErr } = await supabase.from('invoices').select('*').eq('id', invoiceId).eq('company_id', profile.company_id).maybeSingle()
  if (invErr || !invoice) throw new Error('Invoice not found')

  const { data: payments } = await supabase.from('invoice_payments').select('*').eq('invoice_id', invoiceId).order('payment_date')

  return { company, invoice, payments: payments || [] }
}
