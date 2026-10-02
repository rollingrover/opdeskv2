import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email'
import { buildPaymentUrl } from '@/lib/payfast'
import {
  BILLING_STATUSES, DIRECTORY_PLAN_LABELS, LEAD_STATUSES, LISTING_CATEGORIES, LISTING_TIERS, MAX_EXTRA_CATEGORIES, PLAN_LABELS,
  ZATOURS_URL, generateToken, isFoundingOpen, listingUrl, ownerEmailHtml, paymentLinkEmailHtml, planAmount, priceOf,
  revalidateDirectory, siteUrlFor, slugify,
} from '@/lib/directory'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://opdesk.app'

// Every directory write from the superadmin goes through here: one place for
// the superadmin check, field whitelists, emails, PayFast links and the
// on-demand refresh of both directory sites. Uses the signed-in user's
// session (RLS: dir_* tables allow is_superadmin()), not the service key.

const LISTING_FIELDS = [
  'name', 'category', 'summary', 'description', 'town', 'province', 'lat', 'lng', 'phone', 'whatsapp',
  'email', 'website_url', 'photo_url', 'price_from', 'tier', 'sites', 'published', 'claimed',
  'company_id', 'partner_source', 'categories',
]

function pickListing(input) {
  const out = {}
  for (const k of LISTING_FIELDS) {
    if (!(k in input)) continue
    let v = input[k]
    if (typeof v === 'string') v = v.trim()
    if (v === '' && !['name', 'category', 'summary', 'description', 'province'].includes(k)) v = null
    out[k] = v
  }
  if ('tier' in out && !LISTING_TIERS.includes(out.tier)) throw new Error('Invalid tier')
  if ('category' in out && !LISTING_CATEGORIES.includes(out.category)) throw new Error('Invalid category')
  if ('categories' in out) {
    // Primary category stays first; the DB trigger enforces that too.
    const list = Array.from(new Set((out.categories || []).filter(c => LISTING_CATEGORIES.includes(c))))
    out.categories = list
  }
  if ('sites' in out) {
    const sites = (out.sites || []).filter(s => s === 'zatours' || s === 'route22')
    if (!sites.length) throw new Error('A listing must be on at least one site')
    out.sites = sites
  }
  for (const k of ['lat', 'lng', 'price_from']) if (k in out && out[k] !== null) {
    const n = Number(out[k]); if (Number.isNaN(n)) throw new Error(`Invalid ${k}`); out[k] = n
  }
  for (const k of ['published', 'claimed']) if (k in out) out[k] = !!out[k]
  return out
}

async function loadPackages(supabase) {
  const { data } = await supabase.from('dir_packages').select('*')
  return data || []
}

const ROUTE_FIELDS = ['name', 'kind', 'summary', 'description', 'region', 'country', 'website_url', 'contact_email',
  'logo_url', 'path', 'package_key', 'company_id', 'sites', 'published']
function pickRoute(input) {
  const out = {}
  for (const k of ROUTE_FIELDS) {
    if (!(k in input)) continue
    let v = input[k]
    if (typeof v === 'string') v = v.trim()
    if (v === '' && k !== 'name') v = null
    out[k] = v
  }
  if ('kind' in out && !['route', 'association'].includes(out.kind)) throw new Error('Invalid kind')
  if ('package_key' in out && out.package_key && !['route_hub', 'route_hub_plus'].includes(out.package_key)) throw new Error('Invalid package')
  if ('sites' in out) {
    out.sites = (out.sites || []).filter(x => x === 'zatours' || x === 'route22')
    if (!out.sites.length) throw new Error('A route must be on at least one site')
  }
  if ('path' in out) {
    const pts = Array.isArray(out.path) ? out.path : []
    out.path = pts.filter(p => Array.isArray(p) && p.length === 2 && p.every(n => Number.isFinite(Number(n))))
      .map(([a, b]) => [Number(a), Number(b)]).slice(0, 500)
  }
  if ('published' in out) out.published = !!out.published
  return out
}

async function requireSuperadmin(supabase) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from('profiles').select('is_superadmin').eq('id', user.id).maybeSingle()
  return profile?.is_superadmin ? user : null
}

async function getListing(supabase, id) {
  const { data, error } = await supabase.from('dir_listings').select('*').eq('id', id).maybeSingle()
  if (error || !data) throw new Error('Listing not found')
  return data
}

async function upsertBilling(supabase, listingId, patch) {
  const { error } = await supabase.from('dir_billing').upsert(
    { entity_type: 'listing', entity_id: listingId, ...patch, updated_at: new Date().toISOString() },
    { onConflict: 'entity_type,entity_id' }
  )
  if (error) throw new Error(error.message)
}

async function uniqueSlug(supabase, name) {
  const base = slugify(name)
  for (let i = 0; i < 50; i++) {
    const slug = i === 0 ? base : `${base}-${i + 1}`
    const { data } = await supabase.from('dir_listings').select('id').eq('slug', slug).maybeSingle()
    if (!data) return slug
  }
  throw new Error('Could not find a free slug')
}

export async function POST(request) {
  const supabase = await createClient()
  if (!(await requireSuperadmin(supabase))) {
    return NextResponse.json({ error: 'Superadmin access required' }, { status: 403 })
  }

  let body
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }) }
  const { action } = body

  try {
    switch (action) {
      case 'update_listing': {
        const before = await getListing(supabase, body.id)
        const patch = pickListing(body.patch || {})
        const { error } = await supabase.from('dir_listings').update(patch).eq('id', body.id)
        if (error) throw new Error(error.message)
        await revalidateDirectory([before.slug])
        return NextResponse.json({ ok: true })
      }

      case 'create_listing': {
        const fields = pickListing(body.fields || {})
        if (!fields.name || !fields.category) throw new Error('Name and category are required')
        const slug = await uniqueSlug(supabase, fields.name)
        const { data, error } = await supabase.from('dir_listings')
          .insert([{ sites: ['zatours'], tier: 'community', published: false, ...fields, slug }])
          .select('id, slug').single()
        if (error) throw new Error(error.message)
        if (body.leadId) {
          await supabase.from('dir_business_enquiries').update({ listing_id: data.id }).eq('id', body.leadId)
        }
        await revalidateDirectory([data.slug])
        return NextResponse.json({ ok: true, id: data.id, slug: data.slug })
      }

      case 'set_billing': {
        const listing = await getListing(supabase, body.listingId)
        if (!BILLING_STATUSES.includes(body.billing_status)) throw new Error('Invalid billing status')
        const patch = { billing_status: body.billing_status }
        if ('paid_until' in body) patch.paid_until = body.paid_until || null
        if ('source' in body && ['direct', 'opdesk_bundle', 'partner'].includes(body.source)) patch.source = body.source
        if ('extra_categories' in body) {
          const n = Number(body.extra_categories)
          if (!Number.isInteger(n) || n < 0 || n > MAX_EXTRA_CATEGORIES) throw new Error('Extra categories must be 0–6')
          patch.extra_categories = n
        }
        if ('founding' in body) patch.founding = !!body.founding
        if ('locked_amount' in body) patch.locked_amount = body.locked_amount === '' || body.locked_amount == null ? null : Number(body.locked_amount)
        if ('lock_until' in body) patch.lock_until = body.lock_until || null
        await upsertBilling(supabase, listing.id, patch)
        return NextResponse.json({ ok: true })
      }

      case 'send_edit_link': {
        const listing = await getListing(supabase, body.listingId)
        if (!listing.published) throw new Error('Publish the listing first — edit links only work on published listings')
        const ownerEmail = String(body.ownerEmail || '').trim()
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ownerEmail)) throw new Error('Enter a valid owner email')
        const token = generateToken()
        await upsertBilling(supabase, listing.id, { owner_email: ownerEmail, edit_token: token })
        const editUrl = `${siteUrlFor(listing)}/listings/edit/${listing.slug}?token=${token}`
        const { subject, html } = ownerEmailHtml({ listing, editUrl })
        const sent = await sendEmail({ to: ownerEmail, subject, html })
        return NextResponse.json({ ok: true, editUrl, emailed: !sent?.error && !sent?.skipped })
      }

      case 'approve_claim': {
        const { data: claim } = await supabase.from('dir_claims').select('*').eq('id', body.claimId).maybeSingle()
        if (!claim) throw new Error('Claim not found')
        const listing = await getListing(supabase, claim.listing_id)
        const nextTier = listing.tier === 'community' ? 'basic' : listing.tier
        await supabase.from('dir_claims').update({ status: 'approved' }).eq('id', claim.id)
        const { error } = await supabase.from('dir_listings')
          .update({ claimed: true, tier: nextTier, published: true }).eq('id', listing.id)
        if (error) throw new Error(error.message)
        const token = generateToken()
        await upsertBilling(supabase, listing.id, { owner_email: claim.business_email, edit_token: token })
        const updated = { ...listing, tier: nextTier, published: true }
        const editUrl = `${siteUrlFor(updated)}/listings/edit/${listing.slug}?token=${token}`
        const { subject, html } = ownerEmailHtml({ listing: updated, editUrl, intro: 'claim' })
        await sendEmail({ to: claim.business_email, subject, html })
        await revalidateDirectory([listing.slug])
        return NextResponse.json({ ok: true })
      }

      case 'reject_claim': {
        const { error } = await supabase.from('dir_claims').update({ status: 'rejected' }).eq('id', body.claimId)
        if (error) throw new Error(error.message)
        return NextResponse.json({ ok: true })
      }

      case 'update_lead': {
        const patch = {}
        if ('status' in body) {
          if (!LEAD_STATUSES.includes(body.status)) throw new Error('Invalid status')
          patch.status = body.status
        }
        if ('notes' in body) patch.notes = String(body.notes || '').slice(0, 5000) || null
        if ('listing_id' in body) patch.listing_id = body.listing_id || null
        const { error } = await supabase.from('dir_business_enquiries').update(patch).eq('id', body.id)
        if (error) throw new Error(error.message)
        return NextResponse.json({ ok: true })
      }

      case 'payment_link': {
        // Monthly recurring PayFast subscription for a Premium/Featured plan.
        // DIR-{listingId}-{plan}-{timestamp}; the ITN handler upgrades the
        // listing when PayFast confirms the first payment.
        const plan = body.plan
        if (!PLAN_LABELS[plan]) throw new Error('Pick Premium or Featured')
        const listing = await getListing(supabase, body.listingId)
        const table = await loadPackages(supabase)
        // Premium for members of a Route Hub Plus route bills at the member rate.
        let priceKey = plan
        if (plan === 'premium') {
          const { data: memberOf } = await supabase.from('dir_route_members')
            .select('dir_routes!inner(package_key, published)').eq('listing_id', listing.id)
          if ((memberOf || []).some(m => m.dir_routes?.package_key === 'route_hub_plus' && m.dir_routes?.published)) {
            priceKey = 'route_member_premium'
          }
        }
        const { amount, founding, extras } = planAmount(plan, body.extraCategories, new Date(), table, priceKey)
        const email = String(body.email || '').trim()
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('A valid billing email is required')
        const name = String(body.name || '').trim()
        const [nameFirst, ...rest] = name.split(' ')
        const mPaymentId = `DIR-${listing.id}-${plan}-${Date.now()}`
        const label = DIRECTORY_PLAN_LABELS[priceKey] || PLAN_LABELS[plan]
        const site = siteUrlFor(listing)

        const paymentUrl = buildPaymentUrl({
          amount,
          itemName: `${site.includes('zatours') ? 'ZAtours' : 'Route22'} ${label} — ${listing.name}`.slice(0, 100),
          itemDescription: `Monthly ${label.toLowerCase()} for ${listing.name}${extras ? ` incl. ${extras} extra categor${extras === 1 ? 'y' : 'ies'}` : ''}${founding ? ' — founding price, locked 3 years' : ''}. No commission.`.slice(0, 255),
          mPaymentId,
          nameFirst: nameFirst || listing.name,
          nameLast: rest.join(' ') || '',
          emailAddress: email,
          returnUrl: `${listingUrl(listing)}?upgraded=1`,
          cancelUrl: `${site}/list-your-business?listing=${listing.slug}`,
          notifyUrl: `${SITE_URL}/api/payfast/notify`,
          recurring: true,
          cycleFrequency: 'monthly',
        })

        // Quote recorded now; the founding lock itself starts on first payment (ITN).
        await upsertBilling(supabase, listing.id, {
          payfast_m_payment_id: mPaymentId, plan: priceKey, owner_email: email,
          extra_categories: extras, locked_amount: amount, founding,
        })
        if (body.leadId) {
          await supabase.from('dir_business_enquiries')
            .update({ payment_link: paymentUrl, listing_id: listing.id, status: 'contacted' })
            .eq('id', body.leadId)
        }
        let emailed = false
        if (body.sendEmail) {
          const { subject, html } = paymentLinkEmailHtml({ listing, plan, amount, extras, founding, paymentUrl, contactName: name })
          const sent = await sendEmail({ to: email, subject, html })
          emailed = !sent?.error && !sent?.skipped
        }
        return NextResponse.json({ ok: true, paymentUrl, emailed, amount, founding, memberRate: priceKey !== plan })
      }

      case 'delete_listings': {
        // Permanently removes listings that never went live (e.g. imported
        // businesses that didn't reply to the consent request). Guard rails:
        // only unpublished drafts with no payments, no OpDesk link and no
        // guest enquiries — anything else should be unpublished instead.
        const ids = Array.from(new Set((body.ids || []).filter(x => typeof x === 'string'))).slice(0, 200)
        if (!ids.length) throw new Error('Nothing selected')
        const [{ data: rows }, { data: bills }, { data: enq }] = await Promise.all([
          supabase.from('dir_listings').select('id, slug, name, published, company_id').in('id', ids),
          supabase.from('dir_billing').select('entity_id, billing_status').eq('entity_type', 'listing').in('entity_id', ids),
          supabase.from('dir_enquiries').select('listing_id').in('listing_id', ids),
        ])
        const paid = new Set((bills || []).filter(b => ['paid', 'comped'].includes(b.billing_status)).map(b => b.entity_id))
        const hasEnq = new Set((enq || []).map(e => e.listing_id))
        const skipped = []
        const deletable = []
        for (const l of rows || []) {
          const reason = l.published ? 'published' : l.company_id ? 'linked to OpDesk' : paid.has(l.id) ? 'paid or comped' : hasEnq.has(l.id) ? 'has guest enquiries' : null
          if (reason) skipped.push(`${l.name} (${reason})`)
          else deletable.push(l)
        }
        if (deletable.length) {
          const delIds = deletable.map(l => l.id)
          await supabase.from('dir_billing').delete().eq('entity_type', 'listing').in('entity_id', delIds)
          const { error } = await supabase.from('dir_listings').delete().in('id', delIds)
          if (error) throw new Error(error.message)
          console.info('[directory] deleted listings', deletable.map(l => l.slug).join(', '))
        }
        return NextResponse.json({ ok: true, deleted: deletable.length, skipped })
      }

      case 'update_package': {
        const patch = {}
        for (const k of ['founding_price', 'standard_price', 'included_categories', 'min_quantity']) {
          if (k in body) {
            const v = body[k] === '' || body[k] == null ? null : Number(body[k])
            if (v !== null && (!Number.isFinite(v) || v < 0)) throw new Error(`Invalid ${k}`)
            if (v === null && (k === 'founding_price' || k === 'standard_price')) throw new Error('Prices are required')
            patch[k] = v
          }
        }
        if ('name' in body) patch.name = String(body.name || '').trim() || undefined
        if ('description' in body) patch.description = String(body.description || '').trim() || null
        if ('active' in body) patch.active = !!body.active
        if ('features' in body) {
          patch.features = (Array.isArray(body.features) ? body.features : String(body.features || '').split('\n'))
            .map(f => String(f).trim()).filter(Boolean).slice(0, 12)
        }
        const { error } = await supabase.from('dir_packages').update(patch).eq('key', body.key)
        if (error) throw new Error(error.message)
        await revalidateDirectory([])
        return NextResponse.json({ ok: true })
      }

      case 'create_route': {
        const fields = pickRoute(body.fields || {})
        if (!fields.name) throw new Error('Route name is required')
        let slug = slugify(fields.name)
        for (let i = 2; i < 50; i++) {
          const { data } = await supabase.from('dir_routes').select('id').eq('slug', slug).maybeSingle()
          if (!data) break
          slug = `${slugify(fields.name)}-${i}`
        }
        const { data, error } = await supabase.from('dir_routes')
          .insert([{ sites: ['zatours'], published: false, ...fields, slug }]).select('id, slug').single()
        if (error) throw new Error(error.message)
        if (body.leadId) await supabase.from('dir_business_enquiries').update({ status: 'contacted' }).eq('id', body.leadId)
        await revalidateDirectory([])
        return NextResponse.json({ ok: true, id: data.id, slug: data.slug })
      }

      case 'update_route': {
        const patch = pickRoute(body.patch || {})
        const { error } = await supabase.from('dir_routes').update(patch).eq('id', body.id)
        if (error) throw new Error(error.message)
        await revalidateDirectory([])
        return NextResponse.json({ ok: true })
      }

      case 'set_route_members': {
        const ids = Array.from(new Set((body.listingIds || []).filter(x => typeof x === 'string')))
        const { error: delErr } = await supabase.from('dir_route_members').delete().eq('route_id', body.routeId)
        if (delErr) throw new Error(delErr.message)
        if (ids.length) {
          const { error } = await supabase.from('dir_route_members').insert(ids.map(listing_id => ({ route_id: body.routeId, listing_id })))
          if (error) throw new Error(error.message)
        }
        await revalidateDirectory([])
        return NextResponse.json({ ok: true, members: ids.length })
      }

      case 'route_payment_link': {
        // Route Hub / Hub Plus monthly subscription, or an association paying
        // Premium for N members (association_bulk_premium x quantity).
        const plan = body.plan
        if (!['route_hub', 'route_hub_plus', 'association_bulk_premium'].includes(plan)) throw new Error('Pick a route package')
        const { data: route } = await supabase.from('dir_routes').select('*').eq('id', body.routeId).maybeSingle()
        if (!route) throw new Error('Route not found')
        const email = String(body.email || '').trim()
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('A valid billing email is required')
        const table = await loadPackages(supabase)
        const pkgRow = table.find(t => t.key === plan)
        const minQty = plan === 'association_bulk_premium' ? (pkgRow?.min_quantity || 10) : 1
        const quantity = plan === 'association_bulk_premium' ? Math.max(minQty, Number(body.quantity) || 0) : 1
        const unit = priceOf(plan, table)
        const amount = unit * quantity
        const founding = isFoundingOpen()
        const name = String(body.name || '').trim()
        const [nameFirst, ...rest] = name.split(' ')
        const mPaymentId = `DIR-${route.id}-${plan}-${Date.now()}`
        const label = DIRECTORY_PLAN_LABELS[plan]
        const paymentUrl = buildPaymentUrl({
          amount,
          itemName: `ZAtours ${label} — ${route.name}`.slice(0, 100),
          itemDescription: `Monthly ${label}${quantity > 1 ? ` for ${quantity} members` : ''}${founding ? ' — founding price, locked 3 years' : ''}. No commission.`.slice(0, 255),
          mPaymentId,
          nameFirst: nameFirst || route.name,
          nameLast: rest.join(' ') || '',
          emailAddress: email,
          returnUrl: `${ZATOURS_URL}/routes/${route.slug}?upgraded=1`,
          cancelUrl: `${ZATOURS_URL}/list-your-business#routes`,
          notifyUrl: `${SITE_URL}/api/payfast/notify`,
          recurring: true,
          cycleFrequency: 'monthly',
        })
        await supabase.from('dir_billing').upsert({
          entity_type: 'route', entity_id: route.id, payfast_m_payment_id: mPaymentId, plan, owner_email: email,
          quantity, locked_amount: amount, founding, updated_at: new Date().toISOString(),
        }, { onConflict: 'entity_type,entity_id' })
        let emailed = false
        if (body.sendEmail) {
          const sent = await sendEmail({
            to: email,
            subject: `Your ZAtours ${label} — payment link`,
            html: `<p>Hi ${name || ''},</p>
              <p>Thanks for choosing <strong>${label}</strong> for <strong>${route.name}</strong>: R${amount} per month${quantity > 1 ? ` (${quantity} members × R${unit})` : ''}.</p>
              ${founding ? '<p><strong>Founding price:</strong> locked for 3 years from your first payment.</p>' : ''}
              <p><a href="${paymentUrl}">Pay R${amount}/month securely with PayFast</a> — your route goes live as soon as the payment is confirmed.</p>
              <p style="color:#666">No commission, no per-booking fees.</p>`,
          })
          emailed = !sent?.error && !sent?.skipped
        }
        return NextResponse.json({ ok: true, paymentUrl, amount, founding, quantity, emailed })
      }

      case 'revalidate': {
        await revalidateDirectory(Array.isArray(body.slugs) ? body.slugs : [])
        return NextResponse.json({ ok: true })
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }
  } catch (error) {
    console.error('[api/admin/directory]', action, error)
    return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 400 })
  }
}
