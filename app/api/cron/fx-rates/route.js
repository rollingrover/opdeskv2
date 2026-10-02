import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

// Daily: refresh fx_rates (base ZAR) from ExchangeRate-API's free open
// endpoint (no key; attribution "Rates by Exchange Rate API" is shown where
// converted prices appear). Display only — billing is always in ZAR.
const CODES = ['USD', 'EUR', 'GBP', 'AUD', 'KES', 'TZS', 'UGX', 'RWF', 'BWP', 'NAD', 'ZMW', 'MZN', 'MWK']

export async function GET(request) {
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/ZAR', { signal: AbortSignal.timeout(10000), cache: 'no-store' })
    const data = await res.json()
    if (data.result !== 'success' || !data.rates) throw new Error('Rate source unavailable')
    const now = new Date().toISOString()
    const rows = CODES.filter(c => Number(data.rates[c]) > 0).map(c => ({ code: c, rate: Number(data.rates[c]), updated_at: now }))
    rows.push({ code: 'ZAR', rate: 1, updated_at: now })
    const { error } = await createServiceClient().from('fx_rates').upsert(rows, { onConflict: 'code' })
    if (error) throw new Error(error.message)
    return NextResponse.json({ ok: true, updated: rows.length })
  } catch (e) {
    // Keep yesterday's rates; displays stay approximate rather than breaking.
    console.error('[cron/fx-rates]', e)
    return NextResponse.json({ ok: false, error: e.message }, { status: 502 })
  }
}
