'use client'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { PageLoader } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { ModuleLocked } from '@/components/ui/ModuleLocked'
import { Modal } from '@/components/ui/Modal'
import { Input, Textarea } from '@/components/ui/FormField'
import { useToast, ToastContainer } from '@/components/ui/Toast'
import { BrandIcon } from '@/components/ui/BrandIcon'
import { hasModuleAccess } from '@/lib/moduleAccess'
import { Plus, Phone, Mail, MapPin } from 'lucide-react'

const emptyForm = { name: '', contact_person: '', phone: '', email: '', delivery_address: '', notes: '' }

export default function DeliveryClientsPage() {
  const t = useTranslations('DeliveryClients')
  const tCommon = useTranslations('Common')
  const { company, profile, needsCompany } = useAuth()
  const supabase = createClient()
  const toast = useToast()
  const [clients, setClients] = useState([])
  const [addons, setAddons] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  async function load() {
    if (!company) { setLoading(false); return }
    setLoading(true)
    const [c, a] = await Promise.all([
      supabase.from('delivery_clients').select('*').eq('company_id', company.id).order('name'),
      supabase.from('company_addons').select('addon_key, active').eq('company_id', company.id).eq('active', true),
    ])
    if (c.error) toast.error(c.error.message)
    setClients(c.data || [])
    setAddons(a.data || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [company])

  const access = hasModuleAccess('delivery_management', { profile, company, companyAddons: addons })

  async function handleSave(e) {
    e.preventDefault()
    if (!company) return
    setSaving(true)
    const { error } = await supabase.from('delivery_clients').insert([{ ...form, company_id: company.id }])
    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success(t('clientAdded'))
    setModalOpen(false); setForm(emptyForm); load()
  }

  async function toggleActive(client) {
    const { error } = await supabase.from('delivery_clients').update({ active: !client.active }).eq('id', client.id)
    if (error) { toast.error(error.message); return }
    load()
  }

  if (needsCompany) return <EmptyState icon={<BrandIcon name="companySetup" size={48} />} title={tCommon('needsCompanyTitle')} />
  if (loading) return <PageLoader />
  if (!access) return <ModuleLocked moduleKey="delivery_management" />

  return (
    <div>
      <ToastContainer toasts={toast.toasts} remove={toast.remove} />
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('title')}</h1>
          <p className="page-subtitle">{clients.length} {clients.length === 1 ? t('clientSingular') : t('clientPlural')}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}><Plus size={16} /> {t('addClient')}</button>
      </div>

      <div className="card card-shadow">
        {clients.length === 0 ? (
          <EmptyState icon={<BrandIcon name="delivery" size={48} />} title={t('noClientsTitle')}
            description={t('noClientsDesc')}
            action={<button className="btn btn-primary btn-sm" onClick={() => setModalOpen(true)}>{t('addClient')}</button>} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {clients.map(c => (
              <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem 1rem', border: '1px solid var(--gray-100)', borderRadius: '0.625rem', opacity: c.active ? 1 : 0.5 }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, color: 'var(--navy)' }}>{c.name}</p>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem', fontSize: '0.8125rem', color: 'var(--gray-500)' }}>
                    {c.contact_person && <span>{c.contact_person}</span>}
                    {c.phone && <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Phone size={12} /> {c.phone}</span>}
                    {c.email && <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Mail size={12} /> {c.email}</span>}
                    {c.delivery_address && <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><MapPin size={12} /> {c.delivery_address}</span>}
                  </div>
                </div>
                <button onClick={() => toggleActive(c)} className="btn btn-outline btn-sm">{c.active ? t('deactivate') : t('reactivate')}</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={t('addClient')}
        footer={<>
          <button className="btn btn-outline" onClick={() => setModalOpen(false)}>{t('cancel')}</button>
          <button className="btn btn-primary" disabled={saving} onClick={handleSave}>{saving ? t('saving') : t('addClient')}</button>
        </>}>
        <form onSubmit={handleSave}>
          <Input label={t('clientName')} required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
            <Input label={t('contactPerson')} value={form.contact_person} onChange={e => setForm({ ...form, contact_person: e.target.value })} />
            <Input label={t('phone')} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          </div>
          <Input label={t('email')} type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          <Input label={t('deliveryAddress')} value={form.delivery_address} onChange={e => setForm({ ...form, delivery_address: e.target.value })} />
          <Textarea label={t('notes')} placeholder={t('notesPlaceholder')} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
        </form>
      </Modal>
    </div>
  )
}

export const dynamic = 'force-dynamic'
