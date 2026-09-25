'use client'
import { BrandIcon } from '@/components/ui/BrandIcon'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { PageLoader } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { Modal } from '@/components/ui/Modal'
import { Input, Select, Textarea } from '@/components/ui/FormField'
import { useToast, ToastContainer } from '@/components/ui/Toast'
import { Plus, Milestone, Pencil, Trash2 } from 'lucide-react'

const DIFFICULTIES = ['easy', 'moderate', 'challenging', 'strenuous']

const emptyForm = {
  name: '', difficulty: 'moderate', distance_km: '', duration_hours: '', max_pax: '',
  description: '', highlights: '', start_point: '', end_point: '', active: true,
}

export default function TrailsPage() {
  const t = useTranslations('Trails')
  const tCommon = useTranslations('Common')
  const { company, needsCompany } = useAuth()
  const supabase = createClient()
  const toast = useToast()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  async function load() {
    if (!company) { setLoading(false); return }
    setLoading(true)
    const { data, error } = await supabase.from('trails').select('*').eq('company_id', company.id).order('name')
    if (error) toast.error(error.message)
    setRows(data || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [company])

  function openForCreate() { setEditingId(null); setForm(emptyForm); setModalOpen(true) }
  function openForEdit(trail) {
    setEditingId(trail.id)
    setForm({
      name: trail.name, difficulty: trail.difficulty || 'moderate', distance_km: trail.distance_km ?? '',
      duration_hours: trail.duration_hours ?? '', max_pax: trail.max_pax ?? '', description: trail.description || '',
      highlights: trail.highlights || '', start_point: trail.start_point || '', end_point: trail.end_point || '',
      active: trail.active !== false,
    })
    setModalOpen(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!company) return
    setSaving(true)
    const payload = {
      ...form,
      distance_km: form.distance_km === '' ? null : Number(form.distance_km),
      duration_hours: form.duration_hours === '' ? null : Number(form.duration_hours),
      max_pax: form.max_pax === '' ? null : Number(form.max_pax),
    }
    const { error } = editingId
      ? await supabase.from('trails').update(payload).eq('id', editingId)
      : await supabase.from('trails').insert([{ ...payload, company_id: company.id }])
    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success(editingId ? t('trailUpdated') : t('trailAdded'))
    setModalOpen(false); setEditingId(null); setForm(emptyForm); load()
  }

  async function remove(trail) {
    if (!confirm(t('confirmDelete', { name: trail.name }))) return
    const { error } = await supabase.from('trails').delete().eq('id', trail.id)
    if (error) { toast.error(error.message); return }
    toast.success(t('trailDeleted'))
    load()
  }

  if (needsCompany) return <EmptyState icon={<BrandIcon name="companySetup" size={48} />} title={tCommon('needsCompanyTitle')} />
  if (loading) return <PageLoader />

  return (
    <div>
      <ToastContainer toasts={toast.toasts} remove={toast.remove} />
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('title')}</h1>
          <p className="page-subtitle">{rows.length} {rows.length === 1 ? t('trailSingular') : t('trailPlural')}</p>
        </div>
        <button className="btn btn-primary" onClick={openForCreate}><Plus size={16} /> {t('addTrail')}</button>
      </div>

      {rows.length === 0 ? (
        <div className="card card-shadow">
          <EmptyState icon={<Milestone size={48} color="var(--gray-300)" />} title={t('noTrailsTitle')} description={t('noTrailsDesc')}
            action={<button className="btn btn-primary btn-sm" onClick={openForCreate}>{t('addTrail')}</button>} />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {rows.map(trail => (
            <div key={trail.id} className="card card-shadow" style={{ opacity: trail.active === false ? 0.6 : 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ margin: '0 0 0.25rem', fontSize: '1rem', color: 'var(--navy)' }}>{trail.name}</h3>
                <div>
                  <button onClick={() => openForEdit(trail)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)', marginRight: '0.375rem' }}><Pencil size={14} /></button>
                  <button onClick={() => remove(trail)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)' }}><Trash2 size={14} /></button>
                </div>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--gold)', fontWeight: 700, textTransform: 'uppercase', margin: '0 0 0.5rem' }}>{t(`difficulty.${trail.difficulty}`)}</p>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8125rem', color: 'var(--gray-500)', marginBottom: '0.5rem' }}>
                {trail.distance_km != null && <span>{trail.distance_km} {t('km')}</span>}
                {trail.duration_hours != null && <span>{trail.duration_hours} {t('hrs')}</span>}
                {trail.max_pax != null && <span>{t('maxPax', { count: trail.max_pax })}</span>}
              </div>
              {trail.description && <p style={{ fontSize: '0.8125rem', color: 'var(--gray-600)', margin: 0 }}>{trail.description}</p>}
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditingId(null) }} title={editingId ? t('editTrail') : t('addTrail')} size="lg"
        footer={<>
          <button className="btn btn-outline" onClick={() => { setModalOpen(false); setEditingId(null) }}>{t('cancel')}</button>
          <button className="btn btn-primary" disabled={saving} onClick={handleSave}>{saving ? t('saving') : t('addTrail')}</button>
        </>}>
        <form onSubmit={handleSave}>
          <Input label={t('trailName')} required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
            <Select label={t('difficultyLabel')} value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })}>
              {DIFFICULTIES.map(d => <option key={d} value={d}>{t(`difficulty.${d}`)}</option>)}
            </Select>
            <Input label={t('distanceKm')} type="number" step="0.1" min="0" value={form.distance_km} onChange={e => setForm({ ...form, distance_km: e.target.value })} />
            <Input label={t('durationHours')} type="number" step="0.5" min="0" value={form.duration_hours} onChange={e => setForm({ ...form, duration_hours: e.target.value })} />
            <Input label={t('maxPaxLabel')} type="number" min="1" value={form.max_pax} onChange={e => setForm({ ...form, max_pax: e.target.value })} />
            <Input label={t('startPoint')} value={form.start_point} onChange={e => setForm({ ...form, start_point: e.target.value })} />
            <Input label={t('endPoint')} value={form.end_point} onChange={e => setForm({ ...form, end_point: e.target.value })} />
          </div>
          <Textarea label={t('descriptionLabel')} rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <Textarea label={t('highlightsLabel')} rows={2} placeholder={t('highlightsPlaceholder')} value={form.highlights} onChange={e => setForm({ ...form, highlights: e.target.value })} />
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginTop: '0.5rem' }}>
            <input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} />
            <span style={{ fontSize: '0.875rem', color: 'var(--navy)' }}>{t('trailActive')}</span>
          </label>
        </form>
      </Modal>
    </div>
  )
}

export const dynamic = 'force-dynamic'
