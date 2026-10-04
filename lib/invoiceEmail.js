// Shared invoice email body (manual "Send" and automatic recurring invoices).
export function invoiceEmailHtml(data, { recurring = false } = {}) {
  const inv = data.invoice
  const balance = Number(inv.total) - Number(inv.amount_paid || 0)
  const docLabel = inv.invoice_type === 'quotation' ? 'quotation' : inv.invoice_type === 'tax' ? 'tax invoice' : 'pro forma invoice'
  const due = inv.due_date ? new Date(inv.due_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' }) : null
  return `
    <div style="font-family: Inter, -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
      <p>Hi ${inv.guest_name || 'there'},</p>
      <p>Please find attached your ${recurring ? 'regular ' : ''}${docLabel} from <strong>${data.company.name}</strong>
        (${inv.invoice_number}) for <strong>${inv.currency} ${Number(inv.total).toLocaleString()}</strong>.</p>
      ${balance > 0
        ? `<p>Amount due: <strong>${inv.currency} ${balance.toLocaleString()}</strong>${due ? ` by <strong>${due}</strong>` : ''}.</p>`
        : `<p style="color:#1B8A8F;">This has been paid in full — thank you.</p>`}
      <p style="color:#9ca3af; font-size:13px;">Please get in touch if you have any questions.</p>
    </div>`
}
