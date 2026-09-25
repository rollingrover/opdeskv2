'use client'
import { BrandIcon } from '@/components/ui/BrandIcon'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { PageLoader } from '@/components/ui/Spinner'
import { StatusBadge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { Modal } from '@/components/ui/Modal'
import { Input, Select, Textarea } from '@/components/ui/FormField'
import { useToast, ToastContainer } from '@/components/ui/Toast'
import { LimitBanner } from '@/components/ui/LimitBanner'
import { checkLimit } from '@/lib/limits'
import { Plus, BedDouble, Pencil, Trash2 } from 'lucide-react'
import Link from 'next/link'

const ROOM_TYPES = ['single', 'double', 'twin', 'family', 'suite', 'chalet', 'tent', 'tented_camp', 'campsite_small', 'campsite_large', 'dormitory']

const emptyForm = {
  name: '', room_type: 'double', floor: '', capacity: 2, rate_per_night: '', currency: '',
  status: 'available', description: '', notes: '', active: true,
}

export default function RoomsPage() {
  const t = useTranslations('Lodging')
  const tCommon = useTranslations('Common')
  const tStatus = useTranslations('StatusBadge')
  const { company, profile, needsCompany } = useAuth()
  const supabase = createClient()
  const toast = useToast()
  const [rows, setRows] = useState([])
  const [addons, setAddons] = useState([])
  const [vehicleCount, setVehicleCount] = useState(0)
  const [vesselCount, setVesselCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  async function load() {
    if (!company) { setLoading(false); return }
    setLoading(true)
    // Vehicles and vessels are fetched too — rooms, vehicles and vessels
    // all draw from one shared capacity pool (see lib/limits.js).
    const [r, a, v, ve] = await Promise.all([
      supabase.from('rooms').select('*').eq('company_id', company.id).order('name'),
      supabase.from('company_addons').select('addon_key, quantity, active').eq('company_id', company.id).eq('active', true),
      supabase.from('vehicles').select('id', { count: 'exact', head: true }).eq('company_id', company.id),
      supabase.from('vessels').select('id', { count: 'exact', head: true }).eq('company_id', company.id),
    ])
    if (r.error) toast.error(r.error.message)
    setRows(r.data || [])
    setAddons(a.data || [])
    setVehicleCount(v.count || 0)
    setVesselCount(ve.count || 0)
    setLoading(false)
  }
  useEffect(() => { load() }, [company])

  function openForCreate() {
    setEditingId(null)
    setForm({ ...emptyForm, currency: company.currency })
    setModalOpen(true)
  }

  function openForEdit(room) {
    setEditingId(room.id)
    setForm({
      name: room.name, room_type: room.room_type || 'double', floor: room.floor ?? '', capacity: room.capacity || 2,
      rate_per_night: room.rate_per_night || 0, currency: room.currency || company.currency, status: room.status || 'available',
      description: room.description || '', notes: room.notes || '', active: room.active !== false,
    })
    setModalOpen(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!company) return
    setSaving(true)
    const payload = {
      ...form, floor: form.floor === '' ? null : Number(form.floor),
      capacity: Number(form.capacity) || 1, rate_per_night: Number(form.rate_per_night) || 0,
    }
    const { error } = editingId
      ? await supabase.from('rooms').update(payload).eq('id', editingId)
      : await supabase.from('rooms').insert([{ ...payload, company_id: company.id }])
    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success(editingId ? t('roomUpdated') : t('roomAdded'))
    setModalOpen(false); setEditingId(null); setForm(emptyForm); load()
  }

  async function remove(room) {
    if (!confirm(t('confirmDelete', { name: room.name }))) return
    const { error } = await supabase.from('rooms').delete().eq('id', room.id)
    if (error) { toast.error(error.message); return }
    toast.success(t('roomDeleted'))
    load()
  }

  if (needsCompany) return <EmptyState icon={<BrandIcon name="companySetup" size={48} />} title={tCommon('needsCompanyTitle')} />
  if (loading) return <PageLoader />

  const activeRooms = rows.filter(r => r.active !== false)
  const poolUsage = activeRooms.length + vehicleCount + vesselCount
  const roomsLimit = checkLimit('rooms', activeRooms.length, { profile, company, companyAddons: addons, poolUsage })
  const occupiedCount = rows.filter(r => r.status === 'occupied').length

  return (
    <div>
      <ToastContainer toasts={toast.toasts} remove={toast.remove} />
      <LimitBanner resourceKey="rooms" limitInfo={roomsLimit} />
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('title')}</h1>
          <p className="page-subtitle">
            {rows.length} {rows.length === 1 ? t('roomSingular') : t('roomPlural')} · {occupiedCount} {t('occupiedTonight')} ·{' '}
            <Link href="/lodging/calendar" style={{ color: 'var(--gold)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>{t('viewCalendar')} <BrandIcon name="arrowRight" size={11} /></Link>
          </p>
        </div>
        <button className="btn btn-primary" onClick={openForCreate}><Plus size={16} /> {t('addRoom')}</button>
      </div>

      <div className="card card-shadow">
        {rows.length === 0 ? (
          <EmptyState icon={<BedDouble size={48} color="var(--gray-300)" />} title={t('noRoomsTitle')} description={t('noRoomsDesc')}
            action={<button className="btn btn-primary btn-sm" onClick={openForCreate}>{t('addRoom')}</button>} />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>{t('roomName')}</th><th>{t('roomType')}</th><th>{t('floor')}</th><th>{t('capacity')}</th>
                  <th>{t('ratePerNight')}</th><th>{t('status')}</th><th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.id} style={{ opacity: r.active === false ? 0.5 : 1 }}>
                    <td style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'var(--navy)' }}><BedDouble size={15} />{r.name}</td>
                    <td>{t(`types.${r.room_type}`)}</td>
                    <td>{r.floor ?? '—'}</td>
                    <td>{r.capacity} {t('sleeps')}</td>
                    <td>{r.currency} {Number(r.rate_per_night).toLocaleString()}{t('perNight')}</td>
                    <td><StatusBadge status={r.status} /></td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button onClick={() => openForEdit(r)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)', marginRight: '0.5rem' }}><Pencil size={15} /></button>
                      <button onClick={() => remove(r)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)' }}><Trash2 size={15} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditingId(null) }} title={editingId ? t('editRoom') : t('addRoom')} size="lg"
        footer={<>
          <button className="btn btn-outline" onClick={() => { setModalOpen(false); setEditingId(null) }}>{t('cancel')}</button>
          <button className="btn btn-primary" disabled={saving} onClick={handleSave}>{saving ? t('saving') : t('addRoom')}</button>
        </>}>
        <form onSubmit={handleSave}>
          <Input label={t('roomName')} required placeholder={t('roomNamePlaceholder')} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
            <Select label={t('roomType')} value={form.room_type} onChange={e => setForm({ ...form, room_type: e.target.value })}>
              {ROOM_TYPES.map(rt => <option key={rt} value={rt}>{t(`types.${rt}`)}</option>)}
            </Select>
            <Input label={t('floor')} type="number" value={form.floor} onChange={e => setForm({ ...form, floor: e.target.value })} />
            <Input label={t('capacity')} type="number" min="1" required value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} />
            <Input label={`${t('ratePerNight')} (${form.currency || company.currency})`} type="number" min="0" step="0.01" value={form.rate_per_night} onChange={e => setForm({ ...form, rate_per_night: e.target.value })} />
            <Select label={t('status')} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              <option value="available">{tStatus('available')}</option>
              <option value="occupied">{tStatus('occupied')}</option>
              <option value="maintenance">{tStatus('maintenance')}</option>
            </Select>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginTop: '1.5rem' }}>
              <input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} />
              <span style={{ fontSize: '0.875rem', color: 'var(--navy)' }}>{t('roomActive')}</span>
            </label>
          </div>
          <Textarea label={t('description')} rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <Textarea label={t('notes')} rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
        </form>
      </Modal>
    </div>
  )
}

export const dynamic = 'force-dynamic'
