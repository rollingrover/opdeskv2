import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { checkLimit } from '@/lib/limits'

export async function POST(request) {
  try {
    const { email, role } = await request.json()
    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    const grantedRole = role === 'admin' ? 'admin' : 'staff' // owner is never assigned this way

    // Authenticate the caller with the normal session-bound client — only
    // an owner/admin of an actual company can invite. This deliberately
    // does NOT trust anything the client sent about who's inviting; it's
    // derived from the request's own cookies.
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('company_id, role').eq('id', user.id).maybeSingle()
    if (!profile?.company_id) return NextResponse.json({ error: 'No company on this account' }, { status: 400 })
    if (!['owner', 'admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Only owners and admins can invite teammates' }, { status: 403 })
    }

    const { data: company } = await supabase.from('companies').select('*').eq('id', profile.company_id).maybeSingle()

    const svc = createServiceClient()
    const { count: seatCount } = await svc.from('profiles').select('id', { count: 'exact', head: true }).eq('company_id', profile.company_id)
    const { data: seatAddons } = await svc.from('company_addons').select('quantity').eq('company_id', profile.company_id).eq('addon_key', 'seats').eq('active', true)
    const seatsLimit = checkLimit('seats', seatCount || 0, {
      company,
      companyAddons: (seatAddons || []).map(a => ({ addon_key: 'seats', active: true, quantity: a.quantity })),
    })
    if (seatsLimit?.level === 'at_limit') {
      return NextResponse.json({ error: `You're at your plan's limit of ${seatsLimit.limit} team seats. Upgrade your plan or buy an extra seat to invite more people.` }, { status: 400 })
    }

    const origin = request.headers.get('origin') || new URL(request.url).origin
    const { data: invited, error: inviteErr } = await svc.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${origin}/auth/reset-password`,
    })
    if (inviteErr) {
      const msg = /already registered|already exists/i.test(inviteErr.message)
        ? 'This email is already registered with OpDesk.'
        : inviteErr.message
      return NextResponse.json({ error: msg }, { status: 400 })
    }

    // The on_auth_user_created trigger already created a bare profiles row
    // for this new user (company_id null). Link it to this company now —
    // this MUST go through the service client since profiles_update RLS
    // only ever allows a user to update their own row, never someone
    // else's, so a normal session-bound update from the inviter would be
    // silently rejected.
    const { error: linkErr } = await svc.from('profiles')
      .update({ company_id: profile.company_id, role: grantedRole })
      .eq('id', invited.user.id)
    if (linkErr) return NextResponse.json({ error: linkErr.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Something went wrong' }, { status: 500 })
  }
}
