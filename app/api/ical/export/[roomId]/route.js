import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { buildIcs } from '@/lib/ical'

// Public, unauthenticated (this is how Airbnb/Booking.com's calendar
// importers work — they just periodically GET a plain URL, no auth
// headers). Protected only by the token being unguessable, not by login —
// the data exposed is busy/free date ranges only, no guest details.
export async function GET(request, { params }) {
  const { roomId } = await params
  const url = new URL(request.url)
  const token = url.searchParams.get('token')

  const supabase = createServiceClient()

  const { data: room } = await supabase.from('rooms').select('id, name, company_id, ical_export_token').eq('id', roomId).maybeSingle()
  if (!room || !token || room.ical_export_token !== token) {
    return new NextResponse('Not found', { status: 404 })
  }

  const { data: company } = await supabase.from('companies').select('name').eq('id', room.company_id).maybeSingle()

  const [{ data: roomBookings }, { data: blocked }] = await Promise.all([
    supabase.from('room_bookings').select('id, check_in, check_out').eq('room_id', roomId),
    supabase.from('room_blocked_dates').select('id, start_date, end_date, source_name').eq('room_id', roomId),
  ])

  const events = [
    ...(roomBookings || []).map(b => ({ uid: `opdesk-booking-${b.id}`, start: b.check_in, end: b.check_out, summary: 'Not available' })),
    ...(blocked || []).map(b => ({ uid: `opdesk-blocked-${b.id}`, start: b.start_date, end: b.end_date, summary: `Not available (${b.source_name})` })),
  ]

  const ics = buildIcs(events, { calendarName: `${company?.name || 'OpDesk'} — ${room.name}` })

  return new NextResponse(ics, {
    status: 200,
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `inline; filename="${room.name.replace(/[^a-z0-9]/gi, '-')}.ics"`,
      'Cache-Control': 'public, max-age=1800', // 30 min — this gets polled often by external calendars
    },
  })
}
