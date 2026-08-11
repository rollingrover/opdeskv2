'use client'
import { useEffect, useState } from 'react'
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

const CATEGORIES = [
  { value: 'bug', label: 'Something\u2019s not working' },
  { value: 'billing', label: 'Billing or plan question' },
  { value: 'feature_request', label: 'Feature request' },
  { value: 'other', label: 'Other' },
]
const STATUS_LABELS = { open: 'Open', in_progress: 'In Progress', resolved: 'Resolved', closed: 'Closed' }

const emptyForm = { category: 'bug', subject: '', description: '', priority: 'normal' }

export default function SupportPage() {
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
    toast.success('Ticket submitted — our team will get back to you')
    setModalOpen(false); setForm(emptyForm); load()
  }

  if (loading) return <PageLoader />

  return (
    <div>
      <ToastContainer toasts={toast.toasts} remove={toast.remove} />
      <div className="page-header">
        <div>
          <h1 className="page-title">Support</h1>
          <p className="page-subtitle">{tickets.length} ticket{tickets.length === 1 ? '' : 's'}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={16} /> New Ticket
        </button>
      </div>

      <div className="card card-shadow">
        {tickets.length === 0 ? (
          <EmptyState icon={<BrandIcon name="errorIcon" size={48} />} title="No support tickets yet"
            description="Something not working, a billing question, or an idea for a feature — raise it here."
            action={<button className="btn btn-primary btn-sm" onClick={() => setModalOpen(true)}>New Ticket</button>} />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Subject</th><th>Category</th><th>Submitted</th><th>Status</th></tr></thead>
              <tbody>
                {tickets.map(t => (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 600, color: 'var(--navy)' }}>{t.subject}</td>
                    <td style={{ textTransform: 'capitalize' }}>{CATEGORIES.find(c => c.value === t.category)?.label || t.category}</td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>{new Date(t.created_at).toLocaleDateString('en-ZA')}</td>
                    <td><StatusBadge status={t.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Support Ticket"
        footer={<>
          <button className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
          <button className="btn btn-primary" disabled={saving} onClick={handleSave}>{saving ? 'Sending…' : 'Submit Ticket'}</button>
        </>}>
        <form onSubmit={handleSave}>
          <Select label="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </Select>
          <Input label="Subject" required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
          <Textarea label="Description" required rows={5} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <Select label="Priority" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </Select>
        </form>
      </Modal>
    </div>
  )
}

export const dynamic = 'force-dynamic'
