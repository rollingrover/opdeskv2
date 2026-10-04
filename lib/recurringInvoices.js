// Recurring invoices (monthly / annual): each day, create the invoices that
// are due, email them with the PDF attached, and move the schedule on.
// Server-only. Idempotent per schedule+date via next_issue_date advancing in
// the same update that records last_invoice_id.
import { renderToBuffer } from '@react-pdf/renderer'
import { createElement } from 'react'
import { InvoiceDocument } from './pdf/InvoiceDocument'
import { getInvoiceData } from './pdf/getInvoiceData'
import { invoiceEmailHtml } from './invoiceEmail'
import { sendEmail } from './email'

export function addCadence(isoDate, cadence) {
  const d = new Date(isoDate + 'T00:00:00Z')
  const day = d.getUTCDate()
  if (cadence === 'annual') d.setUTCFullYear(d.getUTCFullYear() + 1)
  else d.setUTCMonth(d.getUTCMonth() + 1)
  // Keep month-end billing sane (31 Jan → 28/29 Feb, not 3 Mar).
  if (d.getUTCDate() < day) d.setUTCDate(0)
  return d.toISOString().slice(0, 10)
}

function totals(items, vatRate) {
  const lines = (items || []).map(li => ({ description: li.description, quantity: Number(li.quantity) || 1, unit_price: Number(li.unit_price) || 0 }))
    .map(li => ({ ...li, total: +(li.quantity * li.unit_price).toFixed(2) }))
  const subtotal = +lines.reduce((s, li) => s + li.total, 0).toFixed(2)
  const vat = +(subtotal * (Number(vatRate) || 0) / 100).toFixed(2)
  return { lines, subtotal, vat, total: +(subtotal + vat).toFixed(2) }
}

export async function runRecurringInvoices(svc, today = new Date().toISOString().slice(0, 10)) {
  const report = { created: 0, emailed: 0, errors: [] }
  const { data: due } = await svc.from('recurring_invoices').select('*').eq('active', true).lte('next_issue_date', today).limit(200)
  for (const r of due || []) {
    try {
      const issueDate = r.next_issue_date
      const { lines, subtotal, vat, total } = totals(r.line_items, r.vat_rate)
      if (!lines.length || total <= 0) throw new Error('Schedule has no billable lines')
      const dueDate = new Date(Date.parse(issueDate) + r.due_days * 86400000).toISOString().slice(0, 10)
      const period = r.cadence === 'annual' ? `${issueDate} – ${addCadence(issueDate, 'annual')}` : new Date(issueDate).toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' })
      const { data: inv, error } = await svc.from('invoices').insert([{
        company_id: r.company_id, invoice_number: 'INV-' + Date.now().toString(36).toUpperCase() + Math.floor(Math.random() * 36).toString(36).toUpperCase(),
        invoice_type: r.invoice_type, status: r.auto_send && r.client_email ? 'sent' : 'draft',
        guest_name: r.client_name, guest_email: r.client_email, guest_business_name: r.client_business_name, guest_phone: r.client_phone,
        currency: r.currency, subtotal, vat_rate: Number(r.vat_rate) || 0, vat_amount: vat, total, amount_paid: 0, due_date: dueDate,
        line_items: lines.map(li => ({ ...li, description: `${li.description} (${period})` })),
        notes: r.notes || null, recurring_id: r.id,
      }]).select('id').single()
      if (error) throw new Error(error.message)
      // Advance the schedule first, so a failed email never double-bills.
      await svc.from('recurring_invoices').update({ next_issue_date: addCadence(issueDate, r.cadence), last_invoice_id: inv.id, last_issued_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', r.id)
      report.created++
      if (r.auto_send && r.client_email) {
        const data = await getInvoiceData(inv.id, { client: svc })
        const pdf = await renderToBuffer(createElement(InvoiceDocument, data))
        const res = await sendEmail({
          to: r.client_email, bcc: data.company.bookkeeper_email || undefined,
          subject: `${data.company.name} — ${data.invoice.invoice_number}`,
          html: invoiceEmailHtml(data, { recurring: true }),
          attachments: [{ filename: `${data.invoice.invoice_number}.pdf`, content: pdf.toString('base64') }],
        })
        if (!res?.error) report.emailed++
      }
    } catch (e) {
      report.errors.push({ schedule: r.id, error: String(e.message || e) })
    }
  }
  return report
}
