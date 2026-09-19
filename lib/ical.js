// Deliberately dependency-free — full iCal (RFC 5545) is a large spec, but
// the subset every OTA busy-date feed actually uses (VEVENT blocks with
// DTSTART/DTEND/UID, all-day dates) is simple enough to parse directly
// without pulling in a library.

function unfoldLines(text) {
  // iCal "folds" long lines with a leading space/tab on the continuation —
  // un-fold before parsing, per RFC 5545 §3.1.
  return text.replace(/\r\n/g, '\n').replace(/\n[ \t]/g, '')
}

function parseIcsDate(value) {
  // Accepts YYYYMMDD (all-day) or YYYYMMDDTHHMMSS(Z) (timed) — for busy-date
  // sync we only care about the calendar date, not the time.
  const digits = value.replace(/[^0-9]/g, '')
  const y = digits.slice(0, 4), m = digits.slice(4, 6), d = digits.slice(6, 8)
  if (!y || !m || !d) return null
  return `${y}-${m}-${d}`
}

/**
 * Parses an .ics document into a list of { uid, start, end } busy ranges.
 * `end` is treated as exclusive per the iCal convention (a checkout day is
 * not itself blocked).
 */
export function parseIcs(icsText) {
  const text = unfoldLines(icsText)
  const events = []
  const veventBlocks = text.split('BEGIN:VEVENT').slice(1)

  for (const block of veventBlocks) {
    const body = block.split('END:VEVENT')[0]
    const lines = body.split('\n').map(l => l.trim()).filter(Boolean)
    let uid = null, start = null, end = null

    for (const line of lines) {
      const [rawKey, ...rest] = line.split(':')
      const value = rest.join(':')
      const key = rawKey.split(';')[0] // strip params like DTSTART;VALUE=DATE
      if (key === 'UID') uid = value
      else if (key === 'DTSTART') start = parseIcsDate(value)
      else if (key === 'DTEND') end = parseIcsDate(value)
    }

    if (start) {
      events.push({ uid: uid || `${start}-${end || start}`, start, end: end || start })
    }
  }
  return events
}

/**
 * Builds a valid .ics document from a list of { start, end, uid, summary }
 * busy ranges — used for OpDesk's own export feed.
 */
export function buildIcs(events, { calendarName = 'OpDesk' } = {}) {
  const esc = s => String(s || '').replace(/[,;\\]/g, m => '\\' + m)
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//OpDesk//Room Availability//EN',
    `X-WR-CALNAME:${esc(calendarName)}`,
    'CALSCALE:GREGORIAN',
  ]
  for (const ev of events) {
    const start = ev.start.replace(/-/g, '')
    const end = ev.end.replace(/-/g, '')
    lines.push(
      'BEGIN:VEVENT',
      `UID:${esc(ev.uid)}`,
      `DTSTART;VALUE=DATE:${start}`,
      `DTEND;VALUE=DATE:${end}`,
      `SUMMARY:${esc(ev.summary || 'Not available')}`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      'END:VEVENT',
    )
  }
  lines.push('END:VCALENDAR')
  return lines.join('\r\n')
}
