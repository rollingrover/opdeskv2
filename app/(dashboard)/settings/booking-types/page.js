'use client'
import { BrandIcon } from '@/components/ui/BrandIcon'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { PageLoader } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/FormField'
import { useToast, ToastContainer } from '@/components/ui/Toast'
import { TIERS } from '@/lib/constants'
import { Plus, Pencil, Trash2, Lock, Clock } from 'lucide-react'
import Link from 'next/link'

const DURATION_KEYS = [
  { key: '3hr', label: '3 Hour' },
  { key: '6hr', label: '6 Hour' },
  { key: 'full_day', label: 'Full Day' },
]

function slugify(name) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, '')
}

const emptyForm = { name: '', hasDurations: false, durations: { '3hr': '', '6hr': '', full_day: '' } }

export default function BookingTypesPage() {
  const t = useTranslations('BookingTypes')
  const tCommon = useTranslations('Common')
  const { company, needsCompany } = useAuth()
  const supabase = createClient()
  const toast = useToast()
  const [types, setTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  async function load() {
    if (!company) { setLoading(false); return }
    setLoading(true)
    const { data, error } = await supabase.from('booking_types').select('*').eq('company_id', company.id).order('sort_order').order('name')
    if (error) toast.error(error.message)
    setTypes(data || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [company])

  if (needsCompany) return <EmptyState icon={<BrandIcon name="companySetup" size={48} />} title={tCommon('needsCompanyTitle')} />
  if (loading) return <PageLoader />

  // Adding a brand-new custom booking type is a Standard+ perk — everyone
  // can still see, edit, reprice and delete the presets seeded on signup
  // (Safari/Game Drive, Cultural Tour, Boat Cruise, Accommodation, Transfer,
  // Charter) regardless of tier, since those aren't a paid feature. Falls
  // back to subscription_tier if this company isn't linked to a package row
  // yet, same fallback pattern used elsewhere in the app.
  const tierSlug = company?.package?.slug || company?.subscription_tier || 'free'
  const canAddCustom = TIERS.indexOf(tierSlug) >= TIERS.indexOf('standard')

  function openForCreate() {
    setEditingId(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  function openForEdit(bt) {
    setEditingId(bt.id)
    setForm({
      name: bt.name,
      hasDurations: !!bt.durations,
      durations: { '3hr': bt.durations?.['3hr'] ?? '', '6hr': bt.durations?.['6hr'] ?? '', full_day: bt.durations?.full_day ?? '' },
    })
    setModalOpen(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!company) return
    setSaving(true)
    const durations = form.hasDurations
      ? { '3hr': Number(form.durations['3hr']) || 0, '6hr': Number(form.durations['6hr']) || 0, full_day: Number(form.durations.full_day) || 0 }
      : null
    const payload = { name: form.name, durations }
    let error
    if (editingId) {
      ;({ error } = await supabase.from('booking_types').update(payload).eq('id', editingId))
    } else {
      ;({ error } = await supabase.from('booking_types').insert([{
        ...payload, company_id: company.id, slug: slugify(form.name), is_preset: false,
        sort_order: types.length + 1,
      }]))
    }
    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success(editingId ? t('typeUpdated') : t('typeCreated'))
    setModalOpen(false)
    setEditingId(null)
    setForm(emptyForm)
    load()
  }

  async function remove(bt) {
    if (!confirm(t('confirmDelete', { name: bt.name }))) return
    const { error } = await supabase.from('booking_types').delete().eq('id', bt.id)
    if (error) { toast.error(error.message); return }
    toast.success(t('typeDeleted'))
    load()
  }

  async function toggleActive(bt) {
    const { error } = await supabase.from('booking_types').update({ active: !bt.active }).eq('id', bt.id)
    if (error) { toast.error(error.message); return }
    load()
  }

  return (
    <div>
      <ToastContainer toasts={toast.toasts} remove={toast.remove} />
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('title')}</h1>
          <p className="page-subtitle">{t('subtitle')}</p>
        </div>
        {canAddCustom ? (
          <button className="btn btn-primary" onClick={openForCreate}>
            <Plus size={16} /> {t('addType')}
          </button>
        ) : (
          <Link href="/settings/billing" className="btn btn-outline" title={t('customTypesLocked')}>
            <Lock size={14} /> {t('addType')}
          </Link>
        )}
      </div>

      {!canAddCustom && (
        <div style={{ background: 'var(--cream)', border: '1px solid var(--gray-100)', borderRadius: '0.75rem', padding: '0.875rem 1.25rem', marginBottom: '1.25rem', fontSize: '0.8125rem', color: 'var(--gray-500)' }}>
          {t('customTypesLocked')}
        </div>
      )}

      <div className="card card-shadow" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="table">
          <thead>
            <tr>
              <th>{t('colName')}</th>
              <th>{t('colRates')}</th>
              <th style={{ textAlign: 'right' }}>{t('colStatus')}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {types.map(bt => (
              <tr key={bt.id} style={{ opacity: bt.active ? 1 : 0.5 }}>
                <td style={{ fontWeight: 600, color: 'var(--navy)' }}>{bt.name}</td>
                <td style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>
                  {bt.durations ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
                      <Clock size={12} />
                      {DURATION_KEYS.map(d => `${d.label} ${company.currency}${bt.durations[d.key]}`).join(' · ')}
                    </span>
                  ) : t('noDurations')}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button className="btn btn-outline btn-sm" onClick={() => toggleActive(bt)}>
                    {bt.active ? t('active') : t('hidden')}
                  </button>
                </td>
                <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <button onClick={() => openForEdit(bt)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)', marginRight: '0.5rem' }}><Pencil size={15} /></button>
                  <button onClick={() => remove(bt)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)' }}><Trash2 size={15} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditingId(null) }} title={editingId ? t('editType') : t('newType')}
        footer={<>
          <button className="btn btn-outline" onClick={() => { setModalOpen(false); setEditingId(null) }}>{t('cancel')}</button>
          <button className="btn btn-primary" disabled={saving} onClick={handleSave}>{saving ? t('saving') : t('save')}</button>
        </>}>
        <form onSubmit={handleSave}>
          <Input label={t('typeName')} required placeholder={t('typeNamePlaceholder')} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--gray-500)', margin: '0.75rem 0', cursor: 'pointer' }}>
            <input type="checkbox" checked={form.hasDurations} onChange={e => setForm({ ...form, hasDurations: e.target.checked })} />
            {t('hasDurationsLabel')}
          </label>

          {form.hasDurations && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0 1rem' }}>
              {DURATION_KEYS.map(d => (
                <Input key={d.key} label={`${d.label} (${company.currency})`} type="number" min="0" step="0.01"
                  value={form.durations[d.key]}
                  onChange={e => setForm({ ...form, durations: { ...form.durations, [d.key]: e.target.value } })} />
              ))}
            </div>
          )}
        </form>
      </Modal>
    </div>
  )
}

export const dynamic = 'force-dynamic'
