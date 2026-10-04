import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { runNotifications } from '@/lib/notifications'

// Every 15 minutes: booking reminders, daily digests (at each company's own
// local hour) and compliance alerts. Paid plans only; idempotent.
export const maxDuration = 120

export async function GET(request) {
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const report = await runNotifications(createServiceClient())
  return NextResponse.json({ ok: true, ...report })
}
