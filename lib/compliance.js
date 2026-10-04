// Compliance centre: one list of everything that expires — staff
// certificates, vehicle licence discs / roadworthy / insurance, firearm
// licences and business documents. Pure helpers + a loader that works with
// any Supabase client (browser session or service role).

export const BUSINESS_DOC_TYPES = ['operating_licence', 'public_liability', 'tgcsa_grading', 'tax_clearance', 'bbbee',
  'business_registration', 'liquor_licence', 'health_certificate', 'fire_certificate', 'other']

export const THRESHOLDS = [60, 30, 7, 0] // reminder points (days before expiry; 0 = on/after expiry)

export function todayIn(tz = 'Africa/Johannesburg', now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now)
}

export function daysLeft(expiry, today) {
  if (!expiry) return null
  return Math.round((Date.parse(expiry) - Date.parse(today)) / 86400000)
}

export function bucketOf(days) {
  if (days === null) return 'none'
  if (days < 0) return 'expired'
  if (days <= 7) return 'd7'
  if (days <= 30) return 'd30'
  if (days <= 60) return 'd60'
  return 'ok'
}

// Load every expiring item for one company.
export async function loadComplianceItems(supabase, companyId, today) {
  const [certs, staff, vehicles, firearms, docs] = await Promise.all([
    supabase.from('staff_certifications').select('id, staff_id, cert_type, cert_number, expiry_date, document_url').eq('company_id', companyId),
    supabase.from('staff').select('id, full_name, email, status').eq('company_id', companyId),
    supabase.from('vehicles').select('id, name, registration, licence_expiry, roadworthy_expiry, insurance_expiry, licence_doc_path, roadworthy_doc_path, insurance_doc_path, status').eq('company_id', companyId),
    supabase.from('firearm_register').select('id, firearm_make, firearm_model, serial_number, licence_number, licence_expiry, licence_doc_path, status').eq('company_id', companyId),
    supabase.from('business_documents').select('*').eq('company_id', companyId),
  ])
  const staffName = Object.fromEntries((staff.data || []).map(s => [s.id, s.full_name]))
  const items = []
  const push = (o) => { const d = daysLeft(o.expiry, today); items.push({ ...o, days: d, bucket: bucketOf(d) }) }

  for (const c of certs.data || []) {
    push({ key: `cert:${c.id}`, source: 'staff', kind: c.cert_type || 'certificate', subject: staffName[c.staff_id] || '—',
      reference: c.cert_number, expiry: c.expiry_date, docPath: c.document_url, table: 'staff_certifications', rowId: c.id, docColumn: 'document_url' })
  }
  for (const v of vehicles.data || []) {
    if (v.status === 'retired' || v.status === 'sold') continue
    const subject = [v.name, v.registration].filter(Boolean).join(' · ')
    for (const [kind, col, doc] of [['licence_disc', 'licence_expiry', 'licence_doc_path'], ['roadworthy', 'roadworthy_expiry', 'roadworthy_doc_path'], ['insurance', 'insurance_expiry', 'insurance_doc_path']]) {
      if (!v[col] && !v[doc]) continue
      push({ key: `vehicle:${v.id}:${kind}`, source: 'vehicle', kind, subject, expiry: v[col], docPath: v[doc], table: 'vehicles', rowId: v.id, docColumn: doc })
    }
  }
  for (const f of firearms.data || []) {
    if (f.status === 'disposed') continue
    push({ key: `firearm:${f.id}`, source: 'firearm', kind: 'firearm_licence', subject: [f.firearm_make, f.firearm_model, f.serial_number].filter(Boolean).join(' '),
      reference: f.licence_number, expiry: f.licence_expiry, docPath: f.licence_doc_path, table: 'firearm_register', rowId: f.id, docColumn: 'licence_doc_path' })
  }
  for (const b of docs.data || []) {
    push({ key: `business:${b.id}`, source: 'business', kind: b.doc_type, subject: b.title || '', reference: b.reference_number,
      expiry: b.expiry_date, docPath: b.document_path, table: 'business_documents', rowId: b.id, docColumn: 'document_path', raw: b })
  }
  const order = { expired: 0, d7: 1, d30: 2, d60: 3, ok: 4, none: 5 }
  items.sort((a, b) => order[a.bucket] - order[b.bucket] || (a.days ?? 1e9) - (b.days ?? 1e9))
  return items
}
