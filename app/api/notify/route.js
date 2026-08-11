import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail, EMAIL_TEMPLATES } from '@/lib/email'

// This route is a side-effect trigger, called by the client right after a
// support ticket or add-on request is inserted/updated. The actual data
// mutation it's reporting on already happened via a normal Supabase call
// from the client, which is itself protected by RLS (e.g. only a
// superadmin's session can update support_tickets/company_addons/
// addon_requests) — this route doesn't re-check *which* action is allowed,
// it just requires *some* real logged-in session before it will spend the
// Resend API key, so this endpoint can't be used to mass-email people by
// hitting it directly from outside the app.
export async function POST(request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { template, data } = await request.json()
    const builder = EMAIL_TEMPLATES[template]
    if (!builder) {
      return NextResponse.json({ error: `Unknown email template: ${template}` }, { status: 400 })
    }

    const { to, subject, html } = builder(data || {})
    const result = await sendEmail({ to, subject, html })
    return NextResponse.json({ ok: true, result })
  } catch (error) {
    console.error('[api/notify] error:', error)
    // Notification failures should never break the user-facing action that
    // triggered them (submitting a ticket, requesting an add-on) — callers
    // treat this as fire-and-forget and don't surface errors from it.
    return NextResponse.json({ error: error.message || 'Failed to send notification' }, { status: 500 })
  }
}
