// Server-only, and more sensitive than the regular server client — this
// bypasses RLS entirely using the service_role key, so it must never be
// imported into anything that runs in the browser, and should only be used
// where there's genuinely no user session to check against (e.g. a webhook
// called directly by an external server like PayFast's ITN callback).
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY
  if (!url || !key) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_KEY not configured')
  }
  return createSupabaseClient(url, key, { auth: { persistSession: false } })
}
