import { createClient } from '@/lib/supabase/server'

export async function getStatementData(clientId) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: profile } = await supabase.from('profiles').select('company_id').eq('id', user.id).maybeSingle()
  if (!profile?.company_id) throw new Error('No company on this account')

  const { data: company } = await supabase.from('companies').select('*').eq('id', profile.company_id).maybeSingle()
  const { data: client, error: clientErr } = await supabase.from('delivery_clients').select('*').eq('id', clientId).eq('company_id', profile.company_id).maybeSingle()
  if (clientErr || !client) throw new Error('Client not found')

  const [{ data: rawOrders }, { data: payments }] = await Promise.all([
    supabase.from('delivery_orders').select('*, delivery_order_items(quantity, unit_sell_price)').eq('client_id', clientId).order('order_date', { ascending: false }),
    supabase.from('delivery_client_payments').select('*').eq('client_id', clientId).order('payment_date', { ascending: false }),
  ])

  const orders = (rawOrders || []).map(o => ({
    ...o,
    amount: (o.delivery_order_items || []).reduce((s, li) => s + li.quantity * li.unit_sell_price, 0),
  }))

  const totalInvoiced = orders.reduce((s, o) => s + o.amount, 0)
  const totalPaid = (payments || []).reduce((s, p) => s + Number(p.amount), 0)
  const balance = totalInvoiced - totalPaid

  return { company, client, orders, payments: payments || [], totalInvoiced, totalPaid, balance }
}
