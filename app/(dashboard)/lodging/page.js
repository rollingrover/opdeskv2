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
import { Input, Select } from '@/components/ui/FormField'
import { useToast, ToastContainer } from '@/components/ui/Toast'
import { LimitBanner } from '@/components/ui/LimitBanner'
import { checkLimit } from '@/lib/limits'
import { ROOM_TYPES } from '@/lib/constants'
import { Plus, Bed } from 'lucide-react'
import Link from 'next/link'

const emptyForm = { name: '', room_type: 'double', floor: '', capacity: 2, rate_per_night: 0, status: 'available' }

export default function LodgingPage() {
  const t = useTranslations('Lodging')
  const tSidebar = useTranslations('Sidebar')
  const tCommon = useTranslations('Common')
  const tStatus = useTranslations('StatusBadge')
  const { company, profile, needsCompany } = useAuth()
  const supabase = createClient()
  const toast = useToast()
  const [rooms, setRooms] = useState([])
  const [addons, setAddons] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  async function load() {
    if (!company) { setLoading(false); return }
    setLoading(true)
    const [r, a] = await Promise.all([
      supabase.from('rooms').select('*').eq('company_id', company.id).order('name'),
      supabase.from('company_addons').select('addon_key, quantity, active').eq('company_id', company.id).eq('active', true),
    ])
    if (r.error) toast.error(r.error.message)
    setRooms(r.data || [])
    setAddons(a.data || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [company])

  async function handleSave(e) {
    e.preventDefault()
    if (!company) return
    setSaving(true)
    const { error } = await supabase.from('rooms').insert([{
      ...form, company_id: company.id, currency: company.currency,
      floor: form.floor ? Number(form.floor) : null,
      capacity: Number(form.capacity) || 1,
      rate_per_night: Number(form.rate_per_night) || 0,
    }])
    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success(t('roomAdded'))
    setModalOpen(false); setForm(emptyForm); load()
  }

  if (needsCompany) return <EmptyState icon={<BrandIcon name="companySetup" size={48} />} title={tCommon('needsCompanyTitle')} />
  if (loading) return <PageLoader />

  const occupied = rooms.filter(r => r.status === 'occupied').length
  const roomsLimit = checkLimit('rooms', rooms.length, { profile, company, companyAddons: addons })

  return (
    <div>
      <ToastContainer toasts={toast.toasts} remove={toast.remove} />
      <LimitBanner resourceKey="rooms" limitInfo={roomsLimit} />
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('title')}</h1>
          <p className="page-subtitle">{occupied}/{rooms.length} {t('occupiedTonight')}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link href="/lodging/housekeeping" className="btn btn-outline btn-sm">{tSidebar('items.housekeeping')}</Link>
          <Link href="/lodging/guests" className="btn btn-outline btn-sm">{tSidebar('items.guests')}</Link>
          <button className="btn btn-primary" onClick={() => setModalOpen(true)}><Plus size={16} /> {t('addRoom')}</button>
        </div>
      </div>

      {rooms.length === 0 ? (
        <div className="card card-shadow">
          <EmptyState icon={<BrandIcon name="noRooms" size={48} />} title={t('noRoomsTitle')} description={t('noRoomsDesc')}
            action={<button className="btn btn-primary btn-sm" onClick={() => setModalOpen(true)}>{t('addRoom')}</button>} />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
          {rooms.map(r => (
            <div key={r.id} className="card card-shadow">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Bed size={16} color="var(--gold)" />
                  <span style={{ fontWeight: 700, color: 'var(--navy)' }}>{r.name}</span>
                </div>
                <StatusBadge status={r.status} />
              </div>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--gray-500)' }}>{t(`types.${r.room_type}`)} · {t('sleeps')} {r.capacity}</p>
              <p style={{ margin: '0.375rem 0 0', fontSize: '0.875rem', fontWeight: 600, color: 'var(--navy)' }}>{r.currency} {Number(r.rate_per_night).toLocaleString()}{t('perNight')}</p>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={t('addRoom')}
        footer={<>
          <button className="btn btn-outline" onClick={() => setModalOpen(false)}>{t('cancel')}</button>
          <button className="btn btn-primary" disabled={saving} onClick={handleSave}>{saving ? t('saving') : t('addRoom')}</button>
        </>}>
        <form onSubmit={handleSave}>
          <Input label={t('roomName')} required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
            <Select label={t('roomType')} value={form.room_type} onChange={e => setForm({ ...form, room_type: e.target.value })}>
              {ROOM_TYPES.map(rt => <option key={rt.value} value={rt.value}>{t(`types.${rt.value}`)}</option>)}
            </Select>
            <Input label={t('floor')} type="number" value={form.floor} onChange={e => setForm({ ...form, floor: e.target.value })} />
            <Input label={t('capacity')} type="number" min="1" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} />
            <Input label={`${t('ratePerNight')} (${company.currency})`} type="number" step="0.01" value={form.rate_per_night} onChange={e => setForm({ ...form, rate_per_night: e.target.value })} />
            <Select label={t('status')} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              <option value="available">{tStatus('available')}</option>
              <option value="occupied">{tStatus('occupied')}</option>
              <option value="maintenance">{tStatus('maintenance')}</option>
            </Select>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export const dynamic = 'force-dynamic'
