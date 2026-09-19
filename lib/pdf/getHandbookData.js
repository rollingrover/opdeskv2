import { createClient } from '@/lib/supabase/server'

export async function getHandbookData() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: profile } = await supabase.from('profiles').select('company_id').eq('id', user.id).maybeSingle()
  if (!profile?.company_id) throw new Error('No company on this account')

  const { data: company } = await supabase.from('companies').select('*').eq('id', profile.company_id).maybeSingle()
  const { data: sections } = await supabase.from('company_policies').select('*').eq('company_id', profile.company_id).order('sort_order').order('created_at')

  const { data: addons } = await supabase.from('company_addons').select('addon_key').eq('company_id', profile.company_id).eq('active', true)
  const noWatermark = (addons || []).some(a => a.addon_key === 'hr_bundle' || a.addon_key === 'logistics_bundle')

  return { company, sections: sections || [], noWatermark }
}
