import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { runRecurringInvoices } from '@/lib/recurringInvoices'

// Daily 05:00 (SAST ≈ 03:00 UTC): issue + email recurring invoices that are due.
export const maxDuration = 120

export async function GET(request) {
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Johannesburg' }).format(new Date())
  const report = await runRecurringInvoices(createServiceClient(), today)
  return NextResponse.json({ ok: true, ...report })
}
