import { NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { StatementDocument } from '@/lib/pdf/StatementDocument'
import { getStatementData } from '@/lib/pdf/getStatementData'

export async function GET(request) {
  try {
    const url = new URL(request.url)
    const clientId = url.searchParams.get('clientId')
    if (!clientId) return NextResponse.json({ error: 'clientId is required' }, { status: 400 })

    const data = await getStatementData(clientId)
    const periodLabel = `As at ${new Date().toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}`

    const buffer = await renderToBuffer(<StatementDocument {...data} periodLabel={periodLabel} />)

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="Statement-${data.client.name.replace(/[^a-z0-9]/gi, '-')}.pdf"`,
      },
    })
  } catch (error) {
    console.error('[api/pdf/statement] error:', error)
    return NextResponse.json({ error: error.message || 'Failed to generate statement' }, { status: 500 })
  }
}
