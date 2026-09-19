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
import { Plus, Truck } from 'lucide-react'
import Link from 'next/link'

const emptyForm = { name: '', make: '', model: '', year: '', registration: '', capacity: '', status: 'available' }

export default function VehiclesPage() {
  const t = useTranslations('Fleet')
  const tCommon = useTranslations('Common')
  const tStatus = useTranslations('StatusBadge')
  const { company, profile, needsCompany } = useAuth()
  const supabase = createClient()
  const toast = useToast()
  const [rows, setRows] = useState([])
  const [addons, setAddons] = useState([])
  const [roomCount, setRoomCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  async function load() {
    if (!company) { setLoading(false); return }
    setLoading(true)
    // Rooms count is fetched too — vehicles and rooms now draw from one
    // shared capacity pool (see lib/limits.js), so "am I at my limit" for
    // vehicles depends on how many rooms this company already has as well.
    const [v, a, r] = await Promise.all([
      supabase.from('vehicles').select('*').eq('company_id', company.id).order('name'),
      supabase.from('company_addons').select('addon_key, quantity, active').eq('company_id', company.id).eq('active', true),
      supabase.from('rooms').select('id', { count: 'exact', head: true }).eq('company_id', company.id),
    ])
    if (v.error) toast.error(v.error.message)
    setRows(v.data || [])
    setAddons(a.data || [])
    setRoomCount(r.count || 0)
    setLoading(false)
  }
  useEffect(() => { load() }, [company])

  async function handleSave(e) {
    e.preventDefault()
    if (!company) return
    setSaving(true)
    const { error } = await supabase.from('vehicles').insert([{
      ...form, company_id: company.id,
      year: form.year ? Number(form.year) : null,
      capacity: form.capacity ? Number(form.capacity) : null,
    }])
    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success(t('vehicleAdded'))
    setModalOpen(false); setForm(emptyForm); load()
  }

  if (needsCompany) return <EmptyState icon={<BrandIcon name="companySetup" size={48} />} title={tCommon('needsCompanyTitle')} />
  if (loading) return <PageLoader />

  const vehiclesLimit = checkLimit('vehicles', rows.length, { profile, company, companyAddons: addons, poolUsage: rows.length + roomCount })

  return (
    <div>
      <ToastContainer toasts={toast.toasts} remove={toast.remove} />
      <LimitBanner resourceKey="vehicles" limitInfo={vehiclesLimit} />
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('vehiclesTitle')}</h1>
          <p className="page-subtitle">{rows.length} {rows.length === 1 ? t('vehicleSingular') : t('vehiclePlural')} · <Link href="/fleet/vessels" style={{ color: 'var(--gold)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>{t('viewVessels')} <BrandIcon name="arrowRight" size={11} /></Link></p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}><Plus size={16} /> {t('addVehicle')}</button>
      </div>

      <div className="card card-shadow">
        {rows.length === 0 ? (
          <EmptyState icon={<BrandIcon name="noVehicles" size={48} />} title={t('noVehiclesTitle')} description={t('noVehiclesDesc')}
            action={<button className="btn btn-primary btn-sm" onClick={() => setModalOpen(true)}>{t('addVehicle')}</button>} />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>{t('colVehicle')}</th><th>{t('colMakeModel')}</th><th>{t('colRegistration')}</th><th>{t('colCapacity')}</th><th>{t('colStatus')}</th></tr></thead>
              <tbody>
                {rows.map(v => (
                  <tr key={v.id}>
                    <td style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'var(--navy)' }}><Truck size={15} />{v.name}</td>
                    <td>{[v.make, v.model, v.year].filter(Boolean).join(' ') || '—'}</td>
                    <td style={{ fontFamily: 'monospace' }}>{v.registration || '—'}</td>
                    <td>{v.capacity ?? '—'}</td>
                    <td><StatusBadge status={v.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={t('addVehicle')}
        footer={<>
          <button className="btn btn-outline" onClick={() => setModalOpen(false)}>{t('cancel')}</button>
          <button className="btn btn-primary" disabled={saving} onClick={handleSave}>{saving ? t('saving') : t('addVehicle')}</button>
        </>}>
        <form onSubmit={handleSave}>
          <Input label={t('vehicleName')} required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
            <Input label={t('make')} value={form.make} onChange={e => setForm({ ...form, make: e.target.value })} />
            <Input label={t('model')} value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} />
            <Input label={t('year')} type="number" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} />
            <Input label={t('registration')} value={form.registration} onChange={e => setForm({ ...form, registration: e.target.value })} />
            <Input label={t('capacity')} type="number" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} />
            <Select label={t('status')} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              <option value="available">{tStatus('available')}</option>
              <option value="in_use">{tStatus('in_use')}</option>
              <option value="maintenance">{tStatus('maintenance')}</option>
            </Select>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export const dynamic = 'force-dynamic'
