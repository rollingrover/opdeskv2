'use client'
import { BrandIcon } from '@/components/ui/BrandIcon'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { PageLoader } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { Modal } from '@/components/ui/Modal'
import { Input, Select } from '@/components/ui/FormField'
import { useToast, ToastContainer } from '@/components/ui/Toast'
import { hasModuleAccess } from '@/lib/moduleAccess'
import { Plus, Pencil, Trash2, Lock, Upload, Download, AlertCircle, CheckCircle2 } from 'lucide-react'
import Papa from 'papaparse'
import Link from 'next/link'

const IMPORT_TEMPLATE_HEADERS = ['name', 'booking_type', 'residency', 'guest_category', 'trade_tier', 'unit_price', 'commission_pct']
const IMPORT_TEMPLATE_EXAMPLE = ['Full Day Safari - Adult', 'Full Day Game Drive', 'international', 'adult', 'rack', '2500', '10']
const VALID_RESIDENCY = ['local', 'sadc', 'international']
const VALID_CATEGORY = ['adult', 'child', 'infant']
const VALID_TIER = ['rack', 'sto', 'net']

const emptyForm = {
  name: '', booking_type_id: '', residency: 'international', guest_category: 'adult', trade_tier: 'rack',
  unit_price: '', commission_enabled: false, commission_pct: 10, is_park_fee: false,
}

export default function RateSheetPage() {
  const t = useTranslations('RateSheet')
  const tCommon = useTranslations('Common')
  const { company, profile, needsCompany } = useAuth()
  const supabase = createClient()
  const toast = useToast()
  const [items, setItems] = useState([])
  const [bookingTypes, setBookingTypes] = useState([])
  const [addons, setAddons] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [importRows, setImportRows] = useState([]) // parsed + validated rows
  const [importing, setImporting] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  async function load() {
    if (!company) { setLoading(false); return }
    setLoading(true)
    const [it, bt, ad] = await Promise.all([
      supabase.from('rate_sheet_items').select('*').eq('company_id', company.id).order('sort_order').order('name'),
      supabase.from('booking_types').select('id, name').eq('company_id', company.id).eq('active', true),
      supabase.from('company_addons').select('addon_key, active').eq('company_id', company.id).eq('active', true),
    ])
    setItems(it.data || [])
    setBookingTypes(bt.data || [])
    setAddons(ad.data || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [company])

  if (needsCompany) return <EmptyState icon={<BrandIcon name="companySetup" size={48} />} title={tCommon('needsCompanyTitle')} />
  if (loading) return <PageLoader />

  const canRateSheet = hasModuleAccess('rate_sheet', { profile, company, companyAddons: addons })
  const canTradeTier = hasModuleAccess('commission_reporting', { profile, company, companyAddons: addons })

  if (!canRateSheet) {
    return (
      <div>
        <div className="page-header">
          <div><h1 className="page-title">{t('title')}</h1><p className="page-subtitle">{t('subtitle')}</p></div>
        </div>
        <EmptyState icon={<Lock size={40} color="var(--gray-400)" />} title={t('lockedTitle')} description={t('lockedDesc')}
          action={<Link href="/settings/billing" className="btn btn-primary btn-sm">{t('viewPlans')}</Link>} />
      </div>
    )
  }

  function openForCreate() {
    setEditingId(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  function openForEdit(item) {
    setEditingId(item.id)
    setForm({
      name: item.name, booking_type_id: item.booking_type_id || '', residency: item.residency, guest_category: item.guest_category,
      trade_tier: item.trade_tier, unit_price: item.unit_price, commission_enabled: item.commission_enabled, commission_pct: item.commission_pct,
      is_park_fee: item.is_park_fee || false,
    })
    setModalOpen(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    const payload = {
      name: form.name, booking_type_id: form.booking_type_id || null, residency: form.residency, guest_category: form.guest_category,
      trade_tier: canTradeTier ? form.trade_tier : 'rack',
      unit_price: Number(form.unit_price) || 0,
      commission_enabled: canTradeTier ? form.commission_enabled : false,
      commission_pct: Number(form.commission_pct) || 0,
      is_park_fee: form.is_park_fee,
      updated_at: new Date().toISOString(),
    }
    const { error } = editingId
      ? await supabase.from('rate_sheet_items').update(payload).eq('id', editingId)
      : await supabase.from('rate_sheet_items').insert([{ ...payload, company_id: company.id, sort_order: items.length }])
    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success(editingId ? t('itemUpdated') : t('itemCreated'))
    setModalOpen(false)
    setEditingId(null)
    setForm(emptyForm)
    load()
  }

  async function remove(item) {
    if (!confirm(t('confirmDelete', { name: item.name }))) return
    const { error } = await supabase.from('rate_sheet_items').delete().eq('id', item.id)
    if (error) { toast.error(error.message); return }
    toast.success(t('itemDeleted'))
    load()
  }

  function downloadTemplate() {
    const csv = Papa.unparse([IMPORT_TEMPLATE_HEADERS, IMPORT_TEMPLATE_EXAMPLE])
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'rate-sheet-template.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  function validateRow(row) {
    const issues = []
    if (!row.name?.trim()) issues.push(t('importErrNoName'))
    const matchedType = row.booking_type?.trim()
      ? bookingTypes.find(bt => bt.name.toLowerCase().trim() === row.booking_type.toLowerCase().trim())
      : null
    if (row.booking_type?.trim() && !matchedType) issues.push(t('importErrNoBookingTypeMatch', { name: row.booking_type }))
    const residency = row.residency?.trim().toLowerCase()
    if (!VALID_RESIDENCY.includes(residency)) issues.push(t('importErrBadResidency', { value: row.residency || '(blank)' }))
    const guest_category = row.guest_category?.trim().toLowerCase()
    if (!VALID_CATEGORY.includes(guest_category)) issues.push(t('importErrBadCategory', { value: row.guest_category || '(blank)' }))
    const trade_tier = row.trade_tier?.trim().toLowerCase() || 'rack'
    if (!VALID_TIER.includes(trade_tier)) issues.push(t('importErrBadTier', { value: row.trade_tier }))
    const unit_price = Number(row.unit_price)
    if (row.unit_price === undefined || row.unit_price === '' || isNaN(unit_price)) issues.push(t('importErrBadPrice', { value: row.unit_price || '(blank)' }))
    return {
      raw: row, issues, valid: issues.length === 0,
      parsed: { name: row.name?.trim(), booking_type_id: matchedType?.id || null, residency, guest_category, trade_tier, unit_price, commission_pct: Number(row.commission_pct) || 0 },
    }
  }

  function handleFile(file) {
    Papa.parse(file, {
      header: true, skipEmptyLines: true,
      complete: (results) => setImportRows(results.data.map(validateRow)),
      error: (err) => toast.error(err.message),
    })
  }

  async function confirmImport() {
    const validRows = importRows.filter(r => r.valid)
    if (validRows.length === 0) return
    setImporting(true)
    const payload = validRows.map((r, i) => ({
      company_id: company.id, name: r.parsed.name, booking_type_id: r.parsed.booking_type_id,
      residency: r.parsed.residency, guest_category: r.parsed.guest_category,
      trade_tier: canTradeTier ? r.parsed.trade_tier : 'rack', unit_price: r.parsed.unit_price,
      commission_enabled: canTradeTier && r.parsed.commission_pct > 0, commission_pct: r.parsed.commission_pct,
      is_park_fee: false, sort_order: items.length + i,
    }))
    const { error } = await supabase.from('rate_sheet_items').insert(payload)
    setImporting(false)
    if (error) { toast.error(error.message); return }
    toast.success(t('importSuccess', { count: validRows.length }))
    setImportOpen(false); setImportRows([]); load()
  }

  const RESIDENCY_LABEL = { local: t('residencyLocal'), sadc: t('residencySadc'), international: t('residencyInternational') }
  const CATEGORY_LABEL = { adult: t('categoryAdult'), child: t('categoryChild'), infant: t('categoryInfant') }
  const TIER_LABEL = { rack: t('tierRack'), sto: t('tierSto'), net: t('tierNet') }

  return (
    <div>
      <ToastContainer toasts={toast.toasts} remove={toast.remove} />
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('title')}</h1>
          <p className="page-subtitle">{t('subtitle')}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-outline" onClick={() => { setImportRows([]); setImportOpen(true) }}><Upload size={16} /> {t('importCsv')}</button>
          <button className="btn btn-primary" onClick={openForCreate}><Plus size={16} /> {t('addItem')}</button>
        </div>
      </div>

      {!canTradeTier && (
        <div style={{ background: 'var(--cream)', border: '1px solid var(--gray-100)', borderRadius: '0.75rem', padding: '0.875rem 1.125rem', marginBottom: '1.25rem', fontSize: '0.8125rem', color: 'var(--gray-500)' }}>
          {t('tradeTierUpsell')}
        </div>
      )}

      {items.length === 0 ? (
        <EmptyState icon={<BrandIcon name="proformaInvoice" size={48} />} title={t('noItemsTitle')} description={t('noItemsDesc')}
          action={<button className="btn btn-primary btn-sm" onClick={openForCreate}>{t('addItem')}</button>} />
      ) : (
        <div className="card card-shadow" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table">
            <thead>
              <tr>
                <th>{t('colName')}</th><th>{t('colResidency')}</th><th>{t('colCategory')}</th>
                {canTradeTier && <th>{t('colTier')}</th>}
                <th>{t('colPrice')}</th>
                {canTradeTier && <th>{t('colCommission')}</th>}
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 600, color: 'var(--navy)' }}>{item.name}</td>
                  <td style={{ color: 'var(--gray-500)', fontSize: '0.8125rem' }}>{RESIDENCY_LABEL[item.residency]}</td>
                  <td style={{ color: 'var(--gray-500)', fontSize: '0.8125rem' }}>{CATEGORY_LABEL[item.guest_category]}</td>
                  {canTradeTier && <td style={{ color: 'var(--gray-500)', fontSize: '0.8125rem' }}>{TIER_LABEL[item.trade_tier]}</td>}
                  <td>{company.currency} {Number(item.unit_price).toLocaleString()}</td>
                  {canTradeTier && (
                    <td style={{ fontSize: '0.8125rem', color: item.commission_enabled ? 'var(--gold)' : 'var(--gray-400)' }}>
                      {item.commission_enabled ? `${item.commission_pct}%` : t('noCommission')}
                    </td>
                  )}
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button onClick={() => openForEdit(item)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)', marginRight: '0.5rem' }}><Pencil size={15} /></button>
                    <button onClick={() => remove(item)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)' }}><Trash2 size={15} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditingId(null) }} title={editingId ? t('editItem') : t('newItem')} size="lg"
        footer={<>
          <button className="btn btn-outline" onClick={() => { setModalOpen(false); setEditingId(null) }}>{t('cancel')}</button>
          <button className="btn btn-primary" disabled={saving} onClick={handleSave}>{saving ? t('saving') : t('save')}</button>
        </>}>
        <form onSubmit={handleSave}>
          <Input label={t('itemName')} required placeholder={t('itemNamePlaceholder')} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <Select label={t('linkedBookingType')} value={form.booking_type_id} onChange={e => setForm({ ...form, booking_type_id: e.target.value })}>
            <option value="">{t('none')}</option>
            {bookingTypes.map(bt => <option key={bt.id} value={bt.id}>{bt.name}</option>)}
          </Select>
          <div style={{ display: 'grid', gridTemplateColumns: canTradeTier ? '1fr 1fr 1fr' : '1fr 1fr', gap: '0 1rem' }}>
            <Select label={t('residency')} value={form.residency} onChange={e => setForm({ ...form, residency: e.target.value })}>
              <option value="local">{t('residencyLocal')}</option>
              <option value="sadc">{t('residencySadc')}</option>
              <option value="international">{t('residencyInternational')}</option>
            </Select>
            <Select label={t('guestCategory')} value={form.guest_category} onChange={e => setForm({ ...form, guest_category: e.target.value })}>
              <option value="adult">{t('categoryAdult')}</option>
              <option value="child">{t('categoryChild')}</option>
              <option value="infant">{t('categoryInfant')}</option>
            </Select>
            {canTradeTier && (
              <Select label={t('tradeTier')} value={form.trade_tier} onChange={e => setForm({ ...form, trade_tier: e.target.value })}>
                <option value="rack">{t('tierRack')}</option>
                <option value="sto">{t('tierSto')}</option>
                <option value="net">{t('tierNet')}</option>
              </Select>
            )}
          </div>
          <Input label={`${t('unitPrice')} (${company.currency})`} type="number" min="0" step="0.01" value={form.unit_price} onChange={e => setForm({ ...form, unit_price: e.target.value })} />

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', margin: '0.5rem 0 0.75rem' }}>
            <input type="checkbox" checked={form.is_park_fee} onChange={e => setForm({ ...form, is_park_fee: e.target.checked })} />
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--navy)' }}>{t('isParkFee')}</span>
          </label>
          {form.is_park_fee && <p style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginTop: '-0.5rem', marginBottom: '0.75rem' }}>{t('isParkFeeHint')}</p>}

          {canTradeTier && (
            <div style={{ marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--gray-100)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: form.commission_enabled ? '0.75rem' : 0 }}>
                <input type="checkbox" checked={form.commission_enabled} onChange={e => setForm({ ...form, commission_enabled: e.target.checked })} />
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--navy)' }}>{t('commissionEnable')}</span>
              </label>
              {form.commission_enabled && (
                <Input label={t('commissionPct')} type="number" min="0" max="100" step="0.1" value={form.commission_pct}
                  onChange={e => setForm({ ...form, commission_pct: e.target.value })} hint={t('commissionHint')} />
              )}
            </div>
          )}
        </form>
      </Modal>

      <Modal open={importOpen} onClose={() => { setImportOpen(false); setImportRows([]) }} title={t('importCsv')} size="lg"
        footer={<>
          <button className="btn btn-outline" onClick={() => { setImportOpen(false); setImportRows([]) }}>{t('cancel')}</button>
          {importRows.length > 0 && (
            <button className="btn btn-primary" disabled={importing || importRows.filter(r => r.valid).length === 0} onClick={confirmImport}>
              {importing ? t('saving') : t('importConfirm', { count: importRows.filter(r => r.valid).length })}
            </button>
          )}
        </>}>
        {importRows.length === 0 ? (
          <>
            <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginBottom: '1rem' }}>{t('importIntro')}</p>
            <button type="button" onClick={downloadTemplate}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: '1px solid var(--gray-200)', borderRadius: '0.5rem', padding: '0.5rem 0.875rem', fontSize: '0.8125rem', color: 'var(--navy)', cursor: 'pointer', marginBottom: '1.25rem' }}>
              <Download size={14} /> {t('downloadTemplate')}
            </button>
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]) }}
              onClick={() => document.getElementById('rate-sheet-csv-input').click()}
              style={{
                border: `2px dashed ${dragOver ? 'var(--gold)' : 'var(--gray-200)'}`, borderRadius: '0.75rem', padding: '2.5rem 1rem',
                textAlign: 'center', cursor: 'pointer', background: dragOver ? 'var(--cream)' : 'transparent', transition: 'all 0.15s',
              }}>
              <Upload size={28} color="var(--gray-400)" style={{ marginBottom: '0.5rem' }} />
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--gray-500)' }}>{t('dragDropHint')}</p>
              <input id="rate-sheet-csv-input" type="file" accept=".csv" style={{ display: 'none' }}
                onChange={e => e.target.files[0] && handleFile(e.target.files[0])} />
            </div>
          </>
        ) : (
          <>
            <p style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', marginBottom: '0.75rem' }}>
              {t('importPreviewSummary', { valid: importRows.filter(r => r.valid).length, total: importRows.length })}
            </p>
            <div style={{ maxHeight: '360px', overflowY: 'auto', border: '1px solid var(--gray-100)', borderRadius: '0.5rem' }}>
              <table className="table" style={{ margin: 0 }}>
                <thead>
                  <tr><th></th><th>{t('colName')}</th><th>{t('colResidency')}</th><th>{t('colCategory')}</th><th>{t('colPrice')}</th></tr>
                </thead>
                <tbody>
                  {importRows.map((r, i) => (
                    <tr key={i} style={{ background: r.valid ? 'transparent' : 'rgba(239,68,68,0.06)' }}>
                      <td>{r.valid ? <CheckCircle2 size={15} color="#22c55e" /> : <AlertCircle size={15} color="#ef4444" />}</td>
                      <td style={{ fontSize: '0.8125rem' }}>
                        {r.raw.name || <em style={{ color: 'var(--gray-400)' }}>—</em>}
                        {!r.valid && <div style={{ color: '#ef4444', fontSize: '0.6875rem', marginTop: '0.2rem' }}>{r.issues.join('; ')}</div>}
                      </td>
                      <td style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>{r.raw.residency}</td>
                      <td style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>{r.raw.guest_category}</td>
                      <td style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>{r.raw.unit_price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button type="button" onClick={() => setImportRows([])} style={{ background: 'none', border: 'none', color: 'var(--gold)', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', marginTop: '0.75rem', padding: 0 }}>
              {t('importChooseAnother')}
            </button>
          </>
        )}
      </Modal>
    </div>
  )
}

export const dynamic = 'force-dynamic'
