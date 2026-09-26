import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { sendGuestJourneyEmail } from '@/lib/email'
import { renderGuestJourneyTemplate } from '@/lib/guestJourneyTemplate'

function isoDaysFromNow(days) {
  const d = new Date()
  d.setUTCHours(0, 0, 0, 0)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

async function trySend(svc, booking, triggerType, subjectTemplate, bodyTemplate, extraVars = {}) {
  const { error: logErr } = await svc.from('guest_journey_sent_log').insert([{ booking_id: booking.id, trigger_type: triggerType }])
  if (logErr) return false // already sent for this booking
  if (!booking.guest_email) return false

  const { data: company } = await svc.from('companies').select('name').eq('id', booking.company_id).maybeSingle()
  const { data: bookingType } = await svc.from('booking_types').select('name').eq('company_id', booking.company_id).eq('slug', booking.booking_type).maybeSingle()
  const vars = {
    guest_name: booking.guest_name, company_name: company?.name || 'us',
    booking_type: bookingType?.name || booking.booking_type,
    start_date: new Date(booking.start_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' }),
    ...extraVars,
  }
  await sendGuestJourneyEmail({
    to: booking.guest_email,
    subject: renderGuestJourneyTemplate(subjectTemplate, vars),
    bodyText: renderGuestJourneyTemplate(bodyTemplate, vars),
    companyName: company?.name,
  })
  return true
}

export async function GET(request) {
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const svc = createServiceClient()
  const results = { prearrival: 0, postcheckout: 0, errors: [] }

  const { data: allSettings } = await svc.from('guest_journey_settings').select('*')

  for (const settings of allSettings || []) {
    try {
      if (settings.prearrival_enabled) {
        const targetDate = isoDaysFromNow(settings.prearrival_days_before)
        const { data: bookings } = await svc.from('bookings').select('*')
          .eq('company_id', settings.company_id).eq('start_date', targetDate).eq('status', 'confirmed')
        for (const booking of bookings || []) {
          const sent = await trySend(svc, booking, 'prearrival', settings.prearrival_subject, settings.prearrival_body)
          if (sent) results.prearrival++
        }
      }
      if (settings.postcheckout_enabled) {
        const targetDate = isoDaysFromNow(-settings.postcheckout_days_after)
        const { data: bookings } = await svc.from('bookings').select('*')
          .eq('company_id', settings.company_id).eq('end_date', targetDate).in('status', ['confirmed', 'completed'])
        for (const booking of bookings || []) {
          const sent = await trySend(svc, booking, 'postcheckout', settings.postcheckout_subject, settings.postcheckout_body, {
            review_link: settings.review_link || '',
          })
          if (sent) results.postcheckout++
        }
      }
    } catch (err) {
      results.errors.push({ company_id: settings.company_id, error: err.message })
    }
  }

  return NextResponse.json(results)
}
