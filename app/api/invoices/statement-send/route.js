import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email'

// Email an account statement to one invoice client (by email): every invoice
// (not quotations), payments received and the balance owing. RLS limits the
// data to the sender's own company.
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
const money = (cur, n) => `${cur} ${Number(n || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const d = s => (s ? new Date(s).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' }) : '—')

export async function POST(request) {
  try {
    const { clientEmail } = await request.json()
    if (!clientEmail) return NextResponse.json({ error: 'clientEmail is required' }, { status: 400 })
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    const { data: profile } = await supabase.from('profiles').select('company_id').eq('id', user.id).maybeSingle()
    const { data: company } = await supabase.from('companies').select('name, email, phone, bookkeeper_email, vat_number').eq('id', profile?.company_id).maybeSingle()
    if (!company) return NextResponse.json({ error: 'No company' }, { status: 400 })

    const { data: invoices } = await supabase.from('invoices')
      .select('id, invoice_number, invoice_type, status, guest_name, currency, total, amount_paid, due_date, created_at, invoice_payments(amount, payment_date, method, reference)')
      .eq('company_id', profile.company_id).ilike('guest_email', clientEmail).neq('invoice_type', 'quotation').neq('status', 'cancelled')
      .order('created_at')
    if (!invoices?.length) return NextResponse.json({ error: 'No invoices for this client' }, { status: 404 })
    const cur = invoices[0].currency || 'ZAR'
    const billed = invoices.reduce((s, i) => s + Number(i.total || 0), 0)
    const paid = invoices.reduce((s, i) => s + Number(i.amount_paid || 0), 0)
    const balance = billed - paid
    const payments = invoices.flatMap(i => (i.invoice_payments || []).map(p => ({ ...p, invoice_number: i.invoice_number }))).sort((a, b) => String(a.payment_date).localeCompare(String(b.payment_date)))
    const name = invoices[invoices.length - 1].guest_name || clientEmail
    const today = new Date().toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })
    const th = 'style="text-align:left;padding:6px 8px;border-bottom:2px solid #0F2540;font-size:12px"'
    const td = 'style="padding:6px 8px;border-bottom:1px solid #eee;font-size:13px"'
    const html = `
      <div style="font-family: Inter, -apple-system, sans-serif; max-width: 640px; margin: 0 auto; padding: 24px; color:#0F2540">
        <h2 style="margin:0">Statement of account</h2>
        <p style="margin:4px 0 16px;color:#666">${esc(company.name)} · ${today}</p>
        <p>Hi ${esc(name)},</p>
        <p>Here is your account statement with <strong>${esc(company.name)}</strong>.</p>
        <table style="width:100%;border-collapse:collapse;margin:12px 0">
          <tr><th ${th}>Invoice</th><th ${th}>Date</th><th ${th}>Due</th><th ${th} align="right">Amount</th><th ${th} align="right">Paid</th><th ${th} align="right">Balance</th></tr>
          ${invoices.map(i => `<tr><td ${td}>${esc(i.invoice_number)}${i.invoice_type === 'proforma' ? ' <span style="color:#999">(pro forma)</span>' : ''}</td><td ${td}>${d(i.created_at)}</td><td ${td}>${d(i.due_date)}</td>
            <td ${td} align="right">${money(cur, i.total)}</td><td ${td} align="right">${money(cur, i.amount_paid)}</td><td ${td} align="right">${money(cur, Number(i.total) - Number(i.amount_paid || 0))}</td></tr>`).join('')}
          <tr><td colspan="3" style="padding:8px;font-weight:700">Total</td><td style="padding:8px;text-align:right;font-weight:700">${money(cur, billed)}</td><td style="padding:8px;text-align:right;font-weight:700">${money(cur, paid)}</td><td style="padding:8px;text-align:right;font-weight:800">${money(cur, balance)}</td></tr>
        </table>
        ${payments.length ? `<h3 style="font-size:14px;margin:16px 0 6px">Payments received</h3><ul style="padding-left:18px;font-size:13px">${payments.map(p => `<li>${d(p.payment_date)} — ${money(cur, p.amount)}${p.method ? ` · ${esc(p.method)}` : ''}${p.reference ? ` · ref ${esc(p.reference)}` : ''} (${esc(p.invoice_number)})</li>`).join('')}</ul>` : ''}
        <p style="font-size:15px;margin-top:16px">${balance > 0.004 ? `<strong>Balance due: ${money(cur, balance)}</strong>` : '<strong style="color:#1B8A8F">Your account is fully paid — thank you.</strong>'}</p>
        <p style="color:#9ca3af;font-size:13px">Questions? Reply to this email${company.phone ? ` or call ${esc(company.phone)}` : ''}.</p>
      </div>`
    const result = await sendEmail({ to: clientEmail, bcc: company.bookkeeper_email || undefined, subject: `Statement of account — ${company.name}`, html })
    if (result?.error) throw new Error(result.error.message || 'Email failed')
    return NextResponse.json({ ok: true, balance })
  } catch (error) {
    console.error('[api/invoices/statement-send]', error)
    return NextResponse.json({ error: error.message || 'Failed to send statement' }, { status: 500 })
  }
}
