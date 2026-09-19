import { NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { ChecklistDocument } from '@/lib/pdf/ChecklistDocument'
import { getChecklistData } from '@/lib/pdf/getChecklistData'

export async function GET(request) {
  try {
    const url = new URL(request.url)
    const templateId = url.searchParams.get('templateId')
    if (!templateId) return NextResponse.json({ error: 'templateId is required' }, { status: 400 })

    const data = await getChecklistData(templateId)
    const buffer = await renderToBuffer(<ChecklistDocument {...data} />)

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${data.template.name.replace(/[^a-z0-9]/gi, '-')}.pdf"`,
      },
    })
  } catch (error) {
    console.error('[api/pdf/checklist] error:', error)
    return NextResponse.json({ error: error.message || 'Failed to generate checklist' }, { status: 500 })
  }
}
