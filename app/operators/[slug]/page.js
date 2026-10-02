import { permanentRedirect } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/service'

// Old opdesk.app/operators/{slug} profile URLs now point at the operator's
// ZAtours listing (if one is linked and published), else the ZAtours home.
const ZATOURS_URL = (process.env.NEXT_PUBLIC_ZATOURS_URL || 'https://www.zatours.co.za').replace(/\/+$/, '')
const ROUTE22_URL = (process.env.NEXT_PUBLIC_ROUTE22_URL || 'https://www.route22zululand.co.za').replace(/\/+$/, '')

export const dynamic = 'force-dynamic'

export default async function OperatorProfilePage({ params }) {
  const { slug } = await params
  let target = ZATOURS_URL
  try {
    const supabase = createServiceClient()
    const { data: company } = await supabase.from('companies').select('id').eq('public_slug', slug).maybeSingle()
    if (company) {
      const { data: listing } = await supabase.from('dir_listings')
        .select('slug, sites, tier').eq('company_id', company.id).eq('published', true)
        .neq('tier', 'community').limit(1).maybeSingle()
      if (listing) {
        target = `${listing.sites?.includes('zatours') ? ZATOURS_URL : ROUTE22_URL}/listings/${listing.slug}`
      }
    }
  } catch (e) {
    console.error('[operators/slug] lookup failed, falling back to ZAtours home', e)
  }
  permanentRedirect(target)
}
