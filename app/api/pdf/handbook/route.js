import { NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { HandbookDocument } from '@/lib/pdf/HandbookDocument'
import { getHandbookData } from '@/lib/pdf/getHandbookData'

export async function GET() {
  try {
    const data = await getHandbookData()
    if (data.sections.length === 0) {
      return NextResponse.json({ error: 'Add at least one section before downloading the handbook' }, { status: 400 })
    }
    const buffer = await renderToBuffer(<HandbookDocument {...data} />)

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${(data.company.name || 'company').replace(/[^a-z0-9]+/gi, '-')}-handbook.pdf"`,
      },
    })
  } catch (error) {
    console.error('[api/pdf/handbook] error:', error)
    return NextResponse.json({ error: error.message || 'Failed to generate handbook' }, { status: 500 })
  }
}
