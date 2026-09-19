import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { parseIcs } from '@/lib/ical'

// Vercel Cron calls this on the schedule configured in vercel.json, sending
// an Authorization header matching CRON_SECRET — this is Vercel's
// documented pattern for protecting cron endpoints from being triggered by
// anyone who discovers the URL. See https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs
export async function GET(request) {
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const supabase = createServiceClient()
  const { data: feeds } = await supabase.from('room_ical_feeds').select('*')

  const results = { synced: 0, failed: 0, errors: [] }

  for (const feed of feeds || []) {
    try {
      const res = await fetch(feed.feed_url, { headers: { 'User-Agent': 'OpDesk-Calendar-Sync/1.0' } })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const icsText = await res.text()
      const events = parseIcs(icsText)

      // Replace this feed's previously-synced blocked dates with the fresh
      // set — simplest correct approach for a periodic sync (handles
      // cancellations disappearing from the source feed automatically).
      await supabase.from('room_blocked_dates').delete().eq('feed_id', feed.id)
      if (events.length > 0) {
        await supabase.from('room_blocked_dates').insert(
          events.map(ev => ({
            room_id: feed.room_id, company_id: feed.company_id, feed_id: feed.id,
            source_name: feed.source_name, external_uid: ev.uid,
            start_date: ev.start, end_date: ev.end,
          }))
        )
      }

      await supabase.from('room_ical_feeds').update({
        last_synced_at: new Date().toISOString(), last_sync_status: 'ok', last_sync_error: null,
      }).eq('id', feed.id)
      results.synced++
    } catch (error) {
      await supabase.from('room_ical_feeds').update({
        last_synced_at: new Date().toISOString(), last_sync_status: 'error', last_sync_error: String(error.message || error),
      }).eq('id', feed.id)
      results.failed++
      results.errors.push({ feedId: feed.id, error: String(error.message || error) })
    }
  }

  return NextResponse.json(results)
}
