import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { revalidateDirectory } from '@/lib/directory'

// Daily: paid directory plans whose paid_until has passed (no successful
// PayFast renewal) go back to a free listing. Comped listings are never
// touched. Same CRON_SECRET check as the other cron routes.
export async function GET(request) {
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const svc = createServiceClient()
  const today = new Date().toISOString().slice(0, 10)

  const { data: expired, error } = await svc.from('dir_billing')
    .select('id, entity_id').eq('entity_type', 'listing').eq('billing_status', 'paid').lt('paid_until', today)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const slugs = []
  for (const row of expired || []) {
    await svc.from('dir_billing').update({ billing_status: 'lapsed', updated_at: new Date().toISOString() }).eq('id', row.id)
    const { data: l } = await svc.from('dir_listings').select('id, slug, tier, claimed').eq('id', row.entity_id).maybeSingle()
    if (l && (l.tier === 'premium' || l.tier === 'featured')) {
      await svc.from('dir_listings').update({ tier: l.claimed ? 'basic' : 'community' }).eq('id', l.id)
      slugs.push(l.slug)
    }
  }
  if (slugs.length) await revalidateDirectory(slugs)
  return NextResponse.json({ ok: true, lapsed: (expired || []).length })
}
