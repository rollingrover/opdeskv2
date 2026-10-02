import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { updateSubscriptionAmount } from '@/lib/payfast'
import { sendEmail } from '@/lib/email'
import { FOUNDING, FOUNDING_DISCOUNT_PCT, foundingStage, monthlyTotalFor } from '@/lib/opdeskPricing'

// Daily: moves founding members between price stages
// (intro -> founding 20% off -> standard) on their PayFast subscription,
// and emails 14 days' notice before each change. Never touches comped or
// internal accounts. Same CRON_SECRET check as the other cron routes.
const NOTICE_DAYS = 14
// PayFast may bill early on the change date, so the new amount is pushed a
// few days before it takes effect (it only affects the *next* charge).
const APPLY_LEAD_DAYS = 3
const STAGE_TEXT = {
  founding: `your founding-member rate (${FOUNDING_DISCOUNT_PCT}% off, locked until`,
  standard: 'the standard price',
}

export async function GET(request) {
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const svc = createServiceClient()
  const { data: companies, error } = await svc.from('companies')
    .select('id, name, email, package_id, payfast_token, location_discount_pct, comped, is_internal, founding_member, founding_intro_until, founding_lock_until, founding_rate, founding_stage, founding_notice_stage')
    .eq('founding_member', true).not('payfast_token', 'is', null)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const today = new Date()
  const ahead = new Date(today.getTime() + NOTICE_DAYS * 24 * 60 * 60 * 1000)
  const applyDay = new Date(today.getTime() + APPLY_LEAD_DAYS * 24 * 60 * 60 * 1000)
  const report = { checked: 0, noticed: 0, stepped: 0, failed: 0 }

  for (const c of companies || []) {
    if (c.comped || c.is_internal || !c.package_id) continue
    report.checked++

    // 1) Notice ahead of the next price change.
    const stageNow = foundingStage(c, today)
    const stageSoon = foundingStage(c, ahead)
    if (stageSoon !== stageNow && c.founding_notice_stage !== stageSoon && c.email) {
      const newTotal = await monthlyTotalFor(svc, c, ahead)
      const changeDate = stageSoon === 'founding' ? c.founding_intro_until : c.founding_lock_until
      const what = stageSoon === 'founding'
        ? `${STAGE_TEXT.founding} ${c.founding_lock_until})`
        : STAGE_TEXT.standard
      await sendEmail({
        to: c.email,
        subject: 'Your OpDesk subscription price is changing',
        html: `
          <p>Hi ${c.name},</p>
          <p>From <strong>${changeDate}</strong> your OpDesk subscription moves to ${what}: <strong>R${newTotal} per month</strong>.</p>
          ${stageSoon === 'founding' ? `<p>Thank you for being a founding member — this rate stays the same for ${FOUNDING.lockYears} years from your first payment.</p>` : ''}
          <p>Nothing for you to do — PayFast will bill the new amount automatically. Questions? Just reply to this email.</p>
          <p style="color:#666">No commission, no per-booking fees — ever.</p>`,
      })
      await svc.from('companies').update({ founding_notice_stage: stageSoon }).eq('id', c.id)
      report.noticed++
    }

    // 2) Push the new amount APPLY_LEAD_DAYS before it takes effect.
    const stageApply = foundingStage(c, applyDay)
    if (stageApply && stageApply !== c.founding_stage) {
      const newTotal = await monthlyTotalFor(svc, c, applyDay)
      const result = await updateSubscriptionAmount(c.payfast_token, newTotal)
      if (result.success) {
        await svc.from('companies').update({ founding_stage: stageApply }).eq('id', c.id)
        report.stepped++
      } else {
        // Leave the stage unchanged so tomorrow's run retries.
        console.error('[cron/opdesk-founding] PayFast amount update failed', c.id, result.error)
        report.failed++
      }
    }
  }
  return NextResponse.json({ ok: true, ...report })
}
