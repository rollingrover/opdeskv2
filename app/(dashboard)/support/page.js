'use client'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { PageLoader } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { StatusBadge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Input, Select, Textarea } from '@/components/ui/FormField'
import { useToast, ToastContainer } from '@/components/ui/Toast'
import { notify } from '@/lib/notify'
import { BrandIcon } from '@/components/ui/BrandIcon'
import { Plus } from 'lucide-react'

const CATEGORY_VALUES = ['bug', 'billing', 'feature_request', 'other']
const emptyForm = { category: 'bug', subject: '', description: '', priority: 'normal' }

export default function SupportPage() {
  const t = useTranslations('Support')
  const { company, profile, needsCompany } = useAuth()
  const supabase = createClient()
  const toast = useToast()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  async function load() {
    if (!profile) { setLoading(false); return }
    setLoading(true)
    const { data, error } = await supabase
      .from('support_tickets').select('*').eq('submitted_by', profile.id).order('created_at', { ascending: false })
    if (error) toast.error(error.message)
    setTickets(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [profile])

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase.from('support_tickets').insert([{
      ...form, company_id: company?.id || null, submitted_by: profile.id,
    }])
    setSaving(false)
    if (error) { toast.error(error.message); return }
    notify('support_ticket_created', {
      companyName: company?.name, submitterEmail: profile?.email,
      category: form.category, priority: form.priority, subject: form.subject, description: form.description,
    })
    toast.success(t('ticketSubmitted'))
    setModalOpen(false); setForm(emptyForm); load()
  }

  if (loading) return <PageLoader />

  return (
    <div>
      <ToastContainer toasts={toast.toasts} remove={toast.remove} />
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('title')}</h1>
          <p className="page-subtitle">{tickets.length} {tickets.length === 1 ? t('ticketSingular') : t('ticketPlural')}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={16} /> {t('newTicket')}
        </button>
      </div>

      <div className="card card-shadow">
        {tickets.length === 0 ? (
          <EmptyState icon={<BrandIcon name="errorIcon" size={48} />} title={t('noTicketsTitle')}
            description={t('noTicketsDesc')}
            action={<button className="btn btn-primary btn-sm" onClick={() => setModalOpen(true)}>{t('newTicket')}</button>} />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>{t('colSubject')}</th><th>{t('colCategory')}</th><th>{t('colSubmitted')}</th><th>{t('colStatus')}</th></tr></thead>
              <tbody>
                {tickets.map(tk => (
                  <tr key={tk.id}>
                    <td style={{ fontWeight: 600, color: 'var(--navy)' }}>{tk.subject}</td>
                    <td>{CATEGORY_VALUES.includes(tk.category) ? t(`categories.${tk.category}`) : tk.category}</td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>{new Date(tk.created_at).toLocaleDateString('en-ZA')}</td>
                    <td><StatusBadge status={tk.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={t('newSupportTicket')}
        footer={<>
          <button className="btn btn-outline" onClick={() => setModalOpen(false)}>{t('cancel')}</button>
          <button className="btn btn-primary" disabled={saving} onClick={handleSave}>{saving ? t('sending') : t('submitTicket')}</button>
        </>}>
        <form onSubmit={handleSave}>
          <Select label={t('category')} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
            {CATEGORY_VALUES.map(c => <option key={c} value={c}>{t(`categories.${c}`)}</option>)}
          </Select>
          <Input label={t('subject')} required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
          <Textarea label={t('description')} required rows={5} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <Select label={t('priority')} value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
            <option value="low">{t('priorities.low')}</option>
            <option value="normal">{t('priorities.normal')}</option>
            <option value="high">{t('priorities.high')}</option>
            <option value="urgent">{t('priorities.urgent')}</option>
          </Select>
        </form>
      </Modal>
    </div>
  )
}

export const dynamic = 'force-dynamic'
