import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { runOsmImport } from '@/lib/osmImport'
import { revalidateDirectory } from '@/lib/directory'

// Daily: refresh the 2 stalest map regions' services from OpenStreetMap
// (ATMs, fuel, clinics, hospitals, pharmacies, police, airports).
export const maxDuration = 300

export async function GET(request) {
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const report = await runOsmImport(createServiceClient(), { max: 2 })
  await revalidateDirectory([])
  return NextResponse.json({ ok: true, report })
}
