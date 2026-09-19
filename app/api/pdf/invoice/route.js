import { NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { InvoiceDocument } from '@/lib/pdf/InvoiceDocument'
import { getInvoiceData } from '@/lib/pdf/getInvoiceData'

export async function GET(request) {
  try {
    const url = new URL(request.url)
    const invoiceId = url.searchParams.get('invoiceId')
    if (!invoiceId) return NextResponse.json({ error: 'invoiceId is required' }, { status: 400 })

    const data = await getInvoiceData(invoiceId)
    const buffer = await renderToBuffer(<InvoiceDocument {...data} />)

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${data.invoice.invoice_number}.pdf"`,
      },
    })
  } catch (error) {
    console.error('[api/pdf/invoice] error:', error)
    return NextResponse.json({ error: error.message || 'Failed to generate invoice' }, { status: 500 })
  }
}
