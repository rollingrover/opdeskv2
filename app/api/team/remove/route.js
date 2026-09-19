import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST(request) {
  try {
    const { profileId } = await request.json()
    if (!profileId) return NextResponse.json({ error: 'profileId is required' }, { status: 400 })

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('company_id, role').eq('id', user.id).maybeSingle()
    if (!profile?.company_id) return NextResponse.json({ error: 'No company on this account' }, { status: 400 })
    if (!['owner', 'admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Only owners and admins can remove teammates' }, { status: 403 })
    }
    if (profileId === user.id) return NextResponse.json({ error: "You can't remove yourself" }, { status: 400 })

    const svc = createServiceClient()
    const { data: target } = await svc.from('profiles').select('company_id, role').eq('id', profileId).maybeSingle()
    if (!target || target.company_id !== profile.company_id) {
      return NextResponse.json({ error: 'That person is not on your team' }, { status: 404 })
    }
    if (target.role === 'owner') return NextResponse.json({ error: "The owner's access can't be removed this way" }, { status: 400 })

    // Unlinks the account from this company rather than deleting it — the
    // person's own auth account (and history tied to their profile id in
    // bookings.created_by etc.) is left intact; they simply lose access.
    const { error } = await svc.from('profiles').update({ company_id: null }).eq('id', profileId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Something went wrong' }, { status: 500 })
  }
}
