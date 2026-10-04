// Operator notifications (paid plans), run every 15 minutes by
// /api/cron/notifications:
//  • Daily digest at the company's chosen local hour — today's bookings by
//    start time, plus documents expiring within 7 days.
//  • Booking reminder before each CONFIRMED booking that has a start time
//    (several safaris a day each get their own), to the company and the
//    assigned guide/driver.
//  • Compliance alerts when a document crosses 60 / 30 / 7 days / expired.
// notification_log.ref_key makes every send idempotent.
import { sendEmail } from './email'
import { THRESHOLDS, loadComplianceItems, todayIn } from './compliance'

const APP = (process.env.NEXT_PUBLIC_SITE_URL || 'https://opdesk.app').replace(/\/+$/, '')
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))

function localParts(tz, now) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
    .formatToParts(now).map(x => [x.type, x.value]))
  return { date: `${p.year}-${p.month}-${p.day}`, hour: Number(p.hour), minutes: Number(p.hour) * 60 + Number(p.minute) }
}
const toMin = t => { const [h, m] = String(t).split(':').map(Number); return h * 60 + (m || 0) }
const hhmm = t => String(t || '').slice(0, 5)

async function once(svc, companyId, kind, refKey, send) {
  const { error } = await svc.from('notification_log').insert({ company_id: companyId, kind, ref_key: refKey })
  if (error) return false // already sent (unique ref_key) — or log failure: never double-send
  const recipients = await send()
  await svc.from('notification_log').update({ recipients }).eq('ref_key', refKey)
  return true
}

function bookingLine(b, names) {
  const who = [b.guest_name, b.guest_count ? `${b.guest_count} pax` : null].filter(Boolean).join(' · ')
  const crew = [names[b.guide_id] && `Guide: ${names[b.guide_id]}`, names[b.driver_id] && `Driver: ${names[b.driver_id]}`, names[b.vehicle_id] && `Vehicle: ${names[b.vehicle_id]}`].filter(Boolean).join(' · ')
  return `<tr><td style="padding:6px 10px;font-weight:700;white-space:nowrap">${b.start_time ? hhmm(b.start_time) : 'All day'}</td>
    <td style="padding:6px 10px">${esc(b.booking_type)} — ${esc(who)}${b.status !== 'confirmed' ? ` <em>(${esc(b.status)})</em>` : ''}
    ${b.pickup_location ? `<br><span style="color:#666">Pickup: ${esc(b.pickup_location)}</span>` : ''}
    ${crew ? `<br><span style="color:#666">${esc(crew)}</span>` : ''}</td></tr>`
}

export async function runNotifications(svc, now = new Date()) {
  const report = { companies: 0, digests: 0, reminders: 0, compliance: 0 }
  const { data: companies } = await svc.from('companies')
    .select('id, name, email, timezone, notify_daily_digest, notify_digest_hour, notify_booking_reminder, notify_reminder_minutes, notify_assigned_staff, notify_compliance')
    .eq('active', true).eq('account_status', 'active').neq('subscription_tier', 'free')
  for (const c of companies || []) {
    const { data: paid } = await svc.rpc('company_is_paid', { p_company: c.id })
    if (!paid || !c.email) continue
    report.companies++
    const tz = c.timezone || 'Africa/Johannesburg'
    const local = localParts(tz, now)

    // Names for guides, drivers, vehicles.
    const [{ data: staff }, { data: vehicles }] = await Promise.all([
      svc.from('staff').select('id, full_name, email').eq('company_id', c.id),
      svc.from('vehicles').select('id, name, registration').eq('company_id', c.id),
    ])
    const names = Object.fromEntries([...(staff || []).map(s => [s.id, s.full_name]), ...(vehicles || []).map(v => [v.id, v.registration || v.name])])
    const staffEmail = Object.fromEntries((staff || []).map(s => [s.id, s.email]))

    const { data: todays } = await svc.from('bookings')
      .select('id, booking_ref, booking_type, status, guest_name, guest_count, start_date, start_time, pickup_location, guide_id, driver_id, vehicle_id')
      .eq('company_id', c.id).eq('start_date', local.date).in('status', ['confirmed', 'pending'])
      .order('start_time', { ascending: true, nullsFirst: true })

    // 1) Booking reminders — confirmed bookings with a start time.
    if (c.notify_booking_reminder) {
      for (const b of (todays || []).filter(x => x.status === 'confirmed' && x.start_time)) {
        const until = toMin(b.start_time) - local.minutes
        if (until <= 0 || until > c.notify_reminder_minutes) continue
        const sent = await once(svc, c.id, 'booking_reminder', `booking:${b.id}:${b.start_date}:${hhmm(b.start_time)}`, async () => {
          const to = new Set([c.email])
          if (c.notify_assigned_staff) [b.guide_id, b.driver_id].forEach(id => staffEmail[id] && to.add(staffEmail[id]))
          await Promise.allSettled([...to].map(email => sendEmail({
            to: email,
            subject: `Starting at ${hhmm(b.start_time)}: ${b.booking_type} — ${b.guest_name || b.booking_ref}`,
            html: `<p>Reminder from OpDesk — this booking starts at <strong>${hhmm(b.start_time)}</strong> today (${esc(c.name)}).</p>
              <table style="border-collapse:collapse">${bookingLine(b, names)}</table>
              <p><a href="${APP}/bookings?edit=${b.id}">Open booking ${esc(b.booking_ref)}</a></p>`,
          })))
          return to.size
        })
        if (sent) report.reminders++
      }
    }

    // Compliance items (shared by digest + alerts).
    let items = null
    const getItems = async () => (items ??= await loadComplianceItems(svc, c.id, local.date))

    // 2) Daily digest at the chosen local hour.
    if (c.notify_daily_digest && local.hour === c.notify_digest_hour) {
      const sent = await once(svc, c.id, 'digest', `digest:${c.id}:${local.date}`, async () => {
        const soon = (await getItems()).filter(i => i.bucket === 'expired' || i.bucket === 'd7')
        const rows = (todays || []).map(b => bookingLine(b, names)).join('')
        await sendEmail({
          to: c.email,
          subject: `Today at ${c.name}: ${(todays || []).length} booking${(todays || []).length === 1 ? '' : 's'}${soon.length ? ` · ${soon.length} document${soon.length === 1 ? '' : 's'} need attention` : ''}`,
          html: `<h2 style="margin:0 0 8px">Good morning — here’s today (${local.date})</h2>
            ${rows ? `<table style="border-collapse:collapse">${rows}</table>` : '<p>No bookings today.</p>'}
            ${soon.length ? `<h3>Documents needing attention</h3><ul>${soon.map(i => `<li>${esc(i.subject)} — ${esc(i.kind.replace(/_/g, ' '))}: ${i.days < 0 ? `<strong style="color:#b91c1c">expired ${-i.days} day(s) ago</strong>` : `expires in ${i.days} day(s)`}</li>`).join('')}</ul>` : ''}
            <p><a href="${APP}/bookings">Open bookings</a> · <a href="${APP}/compliance">Compliance</a></p>
            <p style="color:#888;font-size:12px">Change these emails in OpDesk → Settings → Notifications.</p>`,
        })
        return 1
      })
      if (sent) report.digests++
    }

    // 3) Compliance alerts — once a day, alongside the digest hour.
    if (c.notify_compliance && local.hour === c.notify_digest_hour) {
      const fresh = []
      for (const i of await getItems()) {
        if (i.days === null) continue
        const t = THRESHOLDS.find(th => i.days <= th && (th === 0 || i.days > THRESHOLDS[THRESHOLDS.indexOf(th) + 1]))
        if (t === undefined) continue
        const ref = `compliance:${i.key}:${i.expiry}:${t}`
        const { error } = await svc.from('notification_log').insert({ company_id: c.id, kind: 'compliance', ref_key: ref })
        if (!error) fresh.push(i)
      }
      if (fresh.length) {
        await sendEmail({
          to: c.email,
          subject: `${fresh.length} compliance item${fresh.length === 1 ? '' : 's'} need attention — ${c.name}`,
          html: `<p>These documents have expired or are coming up for renewal:</p><ul>${fresh.map(i =>
            `<li><strong>${esc(i.subject)}</strong> — ${esc(i.kind.replace(/_/g, ' '))}${i.reference ? ` (${esc(i.reference)})` : ''}: ${i.days < 0 ? `<strong style="color:#b91c1c">expired ${-i.days} day(s) ago</strong>` : i.days === 0 ? '<strong style="color:#b91c1c">expires today</strong>' : `expires in ${i.days} day(s) — ${i.expiry}`}</li>`).join('')}</ul>
            <p><a href="${APP}/compliance">Open the Compliance centre</a></p>`,
        })
        report.compliance += fresh.length
      }
    }
  }
  return report
}
