import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { sendEmail, EMAIL_TEMPLATES } from '@/lib/email'

export async function POST(request) {
  try {
    const { email, role } = await request.json()
    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    const grantedRole = role === 'admin' ? 'admin' : 'staff' // owner is never assigned this way

    // Authenticate the caller with the normal session-bound client — the
    // create_company_invite RPC itself checks is_company_admin() and the
    // plan's seat limit (including already-pending invites in that count),
    // so this route doesn't duplicate either check — it just calls the RPC
    // and lets it be the single source of truth for both.
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('full_name, company_id').eq('id', user.id).maybeSingle()
    if (!profile?.company_id) return NextResponse.json({ error: 'No company on this account' }, { status: 400 })

    // Creates the trackable, revocable invite row — this is the piece that
    // was missing entirely before (nothing previously recorded a pending
    // invite, so there was no way to see or cancel one before it was used).
    const { data: invite, error: rpcErr } = await supabase.rpc('create_company_invite', { p_email: email, p_role: grantedRole })
    if (rpcErr) return NextResponse.json({ error: rpcErr.message }, { status: 400 })

    const { data: company } = await supabase.from('companies').select('name').eq('id', profile.company_id).maybeSingle()
    const origin = request.headers.get('origin') || new URL(request.url).origin
    const acceptUrl = `${origin}/auth/accept-invite?token=${invite.token}`

    // Two cases: a brand-new email Supabase has never seen needs an actual
    // auth account created before it can log in at all — inviteUserByEmail
    // does that securely (password-set flow) and we point its redirect at
    // our accept-invite page rather than Supabase's default. An email
    // that's already registered (e.g. an existing OpDesk user being invited
    // to a second company) doesn't need a new account — just a link to the
    // invite, which our own email sends explicitly.
    const svc = createServiceClient()
    const { error: inviteUserErr } = await svc.auth.admin.inviteUserByEmail(invite.email, { redirectTo: acceptUrl })
    if (inviteUserErr) {
      if (!/already registered|already exists/i.test(inviteUserErr.message)) {
        console.warn('[team invite] inviteUserByEmail failed unexpectedly, falling back to direct email:', inviteUserErr.message)
      }
      const { to, subject, html } = EMAIL_TEMPLATES.team_invite({
        toEmail: invite.email, companyName: company?.name || 'OpDesk', inviterName: profile.full_name || 'A teammate',
        role: grantedRole, token: invite.token,
      })
      sendEmail({ to, subject, html }).catch(err => console.warn('[team invite email] failed:', err))
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Something went wrong' }, { status: 500 })
  }
}
