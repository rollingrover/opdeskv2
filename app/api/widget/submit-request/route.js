import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { sendEmail, EMAIL_TEMPLATES } from '@/lib/email'

export async function POST(request) {
  try {
    const { slug, booking_type, duration, start_date, guest_count, guest_name, guest_email, guest_phone, notes } = await request.json()
    if (!slug || !booking_type || !start_date || !guest_name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createServiceClient()
    const { data: company } = await supabase
      .from('companies').select('id, name, currency, billing_email, email')
      .eq('slug', slug).eq('widget_enabled', true).maybeSingle()
    if (!company) return NextResponse.json({ error: 'Booking widget not found or not enabled for this business' }, { status: 404 })

    const { data: bt } = await supabase
      .from('booking_types').select('name, durations')
      .eq('company_id', company.id).eq('slug', booking_type).eq('active', true).eq('public_bookable', true).maybeSingle()
    if (!bt) return NextResponse.json({ error: 'That booking type is not available' }, { status: 400 })

    // A duration rate (if the type has one and the visitor picked one) is
    // used only as a starting unit price — same as when an operator picks
    // a duration manually — the operator can still adjust it when they
    // confirm the request.
    const unitPrice = duration && bt.durations?.[duration] !== undefined ? bt.durations[duration] : 0
    const guestCount = Number(guest_count) || 1

    const { data: booking, error } = await supabase.from('bookings').insert([{
      company_id: company.id, booking_ref: 'BK-' + Date.now().toString(36).toUpperCase(),
      booking_type, status: 'pending', source: 'widget',
      start_date, end_date: start_date, guest_count: guestCount,
      guest_name, guest_email: guest_email || null, guest_phone: guest_phone || null,
      unit_price: unitPrice, amount_total: unitPrice * guestCount, amount_paid: 0,
      notes: notes || null,
    }]).select().maybeSingle()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const toEmail = company.billing_email || company.email
    if (toEmail) {
      const { to, subject, html } = EMAIL_TEMPLATES.widget_booking_request({
        toEmail, companyName: company.name, guestName: guest_name,
        bookingTypeName: bt.name, startDate: start_date, guestCount,
      })
      sendEmail({ to, subject, html }).catch(err => console.warn('[widget booking email] failed:', err))
    }

    return NextResponse.json({ success: true, bookingRef: booking.booking_ref })
  } catch (error) {
    console.error('[api/widget/submit-request] error:', error)
    return NextResponse.json({ error: error.message || 'Failed to submit booking request' }, { status: 500 })
  }
}
