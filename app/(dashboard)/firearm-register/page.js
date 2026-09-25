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
import { Plus, Shield, Pencil, Trash2, AlertTriangle } from 'lucide-react'

const emptyForm = {
  staff_id: '', firearm_make: '', firearm_model: '', calibre: '', serial_number: '',
  licence_number: '', licence_expiry: '', safe_location: '', status: 'stored', notes: '',
}

export default function FirearmRegisterPage() {
  const t = useTranslations('FirearmRegister')
  const tCommon = useTranslations('Common')
  const { company, needsCompany } = useAuth()
  const supabase = createClient()
  const toast = useToast()
  const [rows, setRows] = useState([])
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  async function load() {
    if (!company) { setLoading(false); return }
    setLoading(true)
    const [f, s] = await Promise.all([
      supabase.from('firearm_register').select('*, staff:staff_id(full_name)').eq('company_id', company.id).order('licence_expiry'),
      supabase.from('staff').select('id, full_name').eq('company_id', company.id).eq('status', 'active').order('full_name'),
    ])
    if (f.error) toast.error(f.error.message)
    setRows(f.data || [])
    setStaff(s.data || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [company])

  function expiryStatus(dateStr) {
    if (!dateStr) return null
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const in30 = new Date(today); in30.setDate(in30.getDate() + 30)
    const d = new Date(dateStr)
    if (d < today) return { label: t('licenceExpired'), expired: true, color: '#ef4444' }
    if (d < in30) return { label: t('licenceExpiringSoon'), expired: false, color: '#f59e0b' }
    return { label: t('licenceValid'), expired: false, color: '#22c55e' }
  }

  function openForCreate() { setEditingId(null); setForm(emptyForm); setModalOpen(true) }
  function openForEdit(item) {
    setEditingId(item.id)
    setForm({
      staff_id: item.staff_id || '', firearm_make: item.firearm_make || '', firearm_model: item.firearm_model || '',
      calibre: item.calibre || '', serial_number: item.serial_number || '', licence_number: item.licence_number || '',
      licence_expiry: item.licence_expiry || '', safe_location: item.safe_location || '', status: item.status || 'stored',
      notes: item.notes || '',
    })
    setModalOpen(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!company) return
    setSaving(true)
    const payload = { ...form, staff_id: form.staff_id || null, licence_expiry: form.licence_expiry || null }
    const { error } = editingId
      ? await supabase.from('firearm_register').update(payload).eq('id', editingId)
      : await supabase.from('firearm_register').insert([{ ...payload, company_id: company.id }])
    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success(editingId ? t('entryUpdated') : t('entryAdded'))
    setModalOpen(false); setEditingId(null); setForm(emptyForm); load()
  }

  async function remove(item) {
    if (!confirm(t('confirmDelete', { name: `${item.firearm_make} ${item.firearm_model}` }))) return
    const { error } = await supabase.from('firearm_register').delete().eq('id', item.id)
    if (error) { toast.error(error.message); return }
    toast.success(t('entryDeleted'))
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
          <p className="page-subtitle">{t('subtitle')}</p>
        </div>
        <button className="btn btn-primary" onClick={openForCreate}><Plus size={16} /> {t('addEntry')}</button>
      </div>

      <div className="card card-shadow">
        {rows.length === 0 ? (
          <EmptyState icon={<Shield size={48} color="var(--gray-300)" />} title={t('noEntriesTitle')} description={t('noEntriesDesc')}
            action={<button className="btn btn-primary btn-sm" onClick={openForCreate}>{t('addEntry')}</button>} />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>{t('colFirearm')}</th><th>{t('colSerial')}</th><th>{t('colResponsible')}</th>
                  <th>{t('colLicenceExpiry')}</th><th>{t('colLocation')}</th><th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map(item => {
                  const exp = expiryStatus(item.licence_expiry)
                  return (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 600, color: 'var(--navy)' }}>{[item.firearm_make, item.firearm_model].filter(Boolean).join(' ')} {item.calibre && <span style={{ color: 'var(--gray-400)', fontWeight: 400 }}>({item.calibre})</span>}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.8125rem' }}>{item.serial_number || '—'}</td>
                      <td>{item.staff?.full_name || '—'}</td>
                      <td>
                        {item.licence_expiry ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: exp.color, fontWeight: 600, fontSize: '0.8125rem' }}>
                            {exp.expired && <AlertTriangle size={12} />} {new Date(item.licence_expiry).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        ) : '—'}
                      </td>
                      <td style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>{item.safe_location || '—'}</td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <button onClick={() => openForEdit(item)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)', marginRight: '0.5rem' }}><Pencil size={15} /></button>
                        <button onClick={() => remove(item)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)' }}><Trash2 size={15} /></button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditingId(null) }} title={editingId ? t('editEntry') : t('addEntry')} size="lg"
        footer={<>
          <button className="btn btn-outline" onClick={() => { setModalOpen(false); setEditingId(null) }}>{t('cancel')}</button>
          <button className="btn btn-primary" disabled={saving} onClick={handleSave}>{saving ? t('saving') : t('addEntry')}</button>
        </>}>
        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
            <Input label={t('firearmMake')} value={form.firearm_make} onChange={e => setForm({ ...form, firearm_make: e.target.value })} />
            <Input label={t('firearmModel')} value={form.firearm_model} onChange={e => setForm({ ...form, firearm_model: e.target.value })} />
            <Input label={t('calibre')} value={form.calibre} onChange={e => setForm({ ...form, calibre: e.target.value })} />
            <Input label={t('serialNumber')} value={form.serial_number} onChange={e => setForm({ ...form, serial_number: e.target.value })} />
            <Input label={t('licenceNumber')} value={form.licence_number} onChange={e => setForm({ ...form, licence_number: e.target.value })} />
            <Input label={t('licenceExpiry')} type="date" value={form.licence_expiry} onChange={e => setForm({ ...form, licence_expiry: e.target.value })} />
            <Select label={t('responsiblePerson')} value={form.staff_id} onChange={e => setForm({ ...form, staff_id: e.target.value })}>
              <option value="">{t('none')}</option>
              {staff.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
            </Select>
            <Input label={t('safeLocation')} value={form.safe_location} onChange={e => setForm({ ...form, safe_location: e.target.value })} />
            <Select label={t('statusLabel')} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              <option value="stored">{t('statusStored')}</option>
              <option value="checked_out">{t('statusCheckedOut')}</option>
              <option value="decommissioned">{t('statusDecommissioned')}</option>
            </Select>
          </div>
          <Textarea label={t('notesLabel')} rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
        </form>
      </Modal>
    </div>
  )
}

export const dynamic = 'force-dynamic'
