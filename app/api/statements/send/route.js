import { NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { StatementDocument } from '@/lib/pdf/StatementDocument'
import { getStatementData } from '@/lib/pdf/getStatementData'
import { sendEmail } from '@/lib/email'

export async function POST(request) {
  try {
    const { clientId } = await request.json()
    if (!clientId) return NextResponse.json({ error: 'clientId is required' }, { status: 400 })

    const data = await getStatementData(clientId)
    if (!data.client.email) {
      return NextResponse.json({ error: 'This client has no email address on file' }, { status: 400 })
    }

    const periodLabel = `As at ${new Date().toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}`
    const buffer = await renderToBuffer(<StatementDocument {...data} periodLabel={periodLabel} />)
    const base64Pdf = buffer.toString('base64')
    const fileName = `Statement-${data.client.name.replace(/[^a-z0-9]/gi, '-')}.pdf`

    const html = `
      <div style="font-family: Inter, -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
        <p>Hi ${data.client.contact_person || data.client.name},</p>
        <p>Please find attached your statement from <strong>${data.company.name}</strong>, showing a current balance of
          <strong>${data.company.currency} ${data.balance.toLocaleString()}</strong>.</p>
        <p style="color:#9ca3af; font-size:13px;">This statement is generated for reference — please reach out if anything looks out of place.</p>
      </div>
    `

    // The actual "keep the bookkeeper in the loop" feature: every statement
    // sent to a client automatically bccs the company's configured
    // bookkeeper/accounts officer, if one is set — no manual forwarding
    // needed. See Settings for where this is configured.
    const result = await sendEmail({
      to: data.client.email,
      bcc: data.company.bookkeeper_email || undefined,
      subject: `Statement from ${data.company.name}`,
      html,
      attachments: [{ filename: fileName, content: base64Pdf }],
    })

    if (result?.error) {
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, bccSent: !!data.company.bookkeeper_email })
  } catch (error) {
    console.error('[api/statements/send] error:', error)
    return NextResponse.json({ error: error.message || 'Failed to send statement' }, { status: 500 })
  }
}
