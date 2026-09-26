import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { sendGuestJourneyEmail } from '@/lib/email'
import { renderGuestJourneyTemplate } from '@/lib/guestJourneyTemplate'

export async function POST(request) {
  try {
    const { bookingId } = await request.json()
    if (!bookingId) return NextResponse.json({ error: 'bookingId is required' }, { status: 400 })

    // Confirm the caller actually belongs to this booking's company (or is
    // a superadmin) before doing anything privileged with the service
    // client — this is the same authorize-then-elevate pattern used
    // elsewhere for actions the tenant RLS doesn't directly allow.
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    const { data: booking } = await supabase.from('bookings').select('*').eq('id', bookingId).maybeSingle()
    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

    const svc = createServiceClient()
    const { data: settings } = await svc.from('guest_journey_settings').select('*').eq('company_id', booking.company_id).maybeSingle()
    if (!settings || !settings.confirmation_enabled || !booking.guest_email) {
      return NextResponse.json({ success: true, sent: false })
    }

    // The unique constraint on (booking_id, trigger_type) is what actually
    // prevents a duplicate send if this fires twice (e.g. two quick saves)
    // — insert first, and only send if the insert actually succeeded.
    const { error: logErr } = await svc.from('guest_journey_sent_log').insert([{ booking_id: bookingId, trigger_type: 'confirmation' }])
    if (logErr) return NextResponse.json({ success: true, sent: false }) // already sent

    const { data: company } = await svc.from('companies').select('name').eq('id', booking.company_id).maybeSingle()
    const { data: bookingType } = await svc.from('booking_types').select('name').eq('company_id', booking.company_id).eq('slug', booking.booking_type).maybeSingle()

    const vars = {
      guest_name: booking.guest_name, company_name: company?.name || 'us',
      booking_type: bookingType?.name || booking.booking_type,
      start_date: new Date(booking.start_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' }),
    }
    await sendGuestJourneyEmail({
      to: booking.guest_email,
      subject: renderGuestJourneyTemplate(settings.confirmation_subject, vars),
      bodyText: renderGuestJourneyTemplate(settings.confirmation_body, vars),
      companyName: company?.name,
    })

    return NextResponse.json({ success: true, sent: true })
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Failed to send confirmation email' }, { status: 500 })
  }
}
