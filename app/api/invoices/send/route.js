import { NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { InvoiceDocument } from '@/lib/pdf/InvoiceDocument'
import { getInvoiceData } from '@/lib/pdf/getInvoiceData'
import { sendEmail } from '@/lib/email'

export async function POST(request) {
  try {
    const { invoiceId } = await request.json()
    if (!invoiceId) return NextResponse.json({ error: 'invoiceId is required' }, { status: 400 })

    const data = await getInvoiceData(invoiceId)
    if (!data.invoice.guest_email) {
      return NextResponse.json({ error: 'This invoice has no guest email on file' }, { status: 400 })
    }

    const buffer = await renderToBuffer(<InvoiceDocument {...data} />)
    const base64Pdf = buffer.toString('base64')
    const fileName = `${data.invoice.invoice_number}.pdf`
    const balance = Number(data.invoice.total) - Number(data.invoice.amount_paid || 0)
    const docLabel = data.invoice.invoice_type === 'quotation' ? 'quotation' : data.invoice.invoice_type === 'tax' ? 'tax invoice' : 'pro forma invoice'

    const isQuotation = data.invoice.invoice_type === 'quotation'
    const html = `
      <div style="font-family: Inter, -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
        <p>Hi ${data.invoice.guest_name || 'there'},</p>
        <p>Please find attached your ${docLabel} from <strong>${data.company.name}</strong>
          (${data.invoice.invoice_number}) for <strong>${data.invoice.currency} ${Number(data.invoice.total).toLocaleString()}</strong>.</p>
        ${isQuotation
          ? (data.invoice.valid_until
              ? `<p>This quote is valid until <strong>${new Date(data.invoice.valid_until).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>. No payment is due unless you accept it.</p>`
              : `<p style="color:#9ca3af; font-size:13px;">No payment is due unless you accept this quote.</p>`)
          : (balance > 0
              ? `<p>Outstanding balance: <strong>${data.invoice.currency} ${balance.toLocaleString()}</strong></p>`
              : `<p style="color:#1B8A8F;">This has been paid in full — thank you.</p>`)}
        <p style="color:#9ca3af; font-size:13px;">Please get in touch if you have any questions.</p>
      </div>
    `

    // Same "keep the bookkeeper in the loop automatically" pattern already
    // built and tested for delivery statements.
    const result = await sendEmail({
      to: data.invoice.guest_email,
      bcc: data.company.bookkeeper_email || undefined,
      subject: `${data.company.name} — ${data.invoice.invoice_number}`,
      html,
      attachments: [{ filename: fileName, content: base64Pdf }],
    })

    if (result?.error) {
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, bccSent: !!data.company.bookkeeper_email })
  } catch (error) {
    console.error('[api/invoices/send] error:', error)
    return NextResponse.json({ error: error.message || 'Failed to send invoice' }, { status: 500 })
  }
}
