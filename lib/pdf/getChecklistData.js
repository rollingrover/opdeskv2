import { createClient } from '@/lib/supabase/server'

export async function getChecklistData(templateId) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: profile } = await supabase.from('profiles').select('company_id').eq('id', user.id).maybeSingle()
  if (!profile?.company_id) throw new Error('No company on this account')

  const { data: company } = await supabase.from('companies').select('*').eq('id', profile.company_id).maybeSingle()
  const { data: template, error: tErr } = await supabase.from('checklist_templates').select('*').eq('id', templateId).eq('company_id', profile.company_id).maybeSingle()
  if (tErr || !template) throw new Error('List not found')

  const { data: items } = await supabase.from('checklist_items').select('*').eq('template_id', templateId).order('sort_order')

  return { company, template, items: items || [] }
}
