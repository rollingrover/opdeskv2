'use client'
import { BrandIcon } from '@/components/ui/BrandIcon'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { PageLoader } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { Modal } from '@/components/ui/Modal'
import { Input, Textarea } from '@/components/ui/FormField'
import { useToast, ToastContainer } from '@/components/ui/Toast'
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown, Download, BookOpen } from 'lucide-react'

const emptyForm = { title: '', content: '' }

export default function HandbookPage() {
  const t = useTranslations('Handbook')
  const tCommon = useTranslations('Common')
  const { company, needsCompany } = useAuth()
  const supabase = createClient()
  const toast = useToast()
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [downloading, setDownloading] = useState(false)

  async function load() {
    if (!company) { setLoading(false); return }
    setLoading(true)
    const { data, error } = await supabase.from('company_policies').select('*').eq('company_id', company.id).order('sort_order').order('created_at')
    if (error) toast.error(error.message)
    setSections(data || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [company])

  if (needsCompany) return <EmptyState icon={<BrandIcon name="companySetup" size={48} />} title={tCommon('needsCompanyTitle')} />
  if (loading) return <PageLoader />

  function openForCreate() {
    setEditingId(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  function openForEdit(s) {
    setEditingId(s.id)
    setForm({ title: s.title, content: s.content || '' })
    setModalOpen(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    const payload = { title: form.title, content: form.content, updated_at: new Date().toISOString() }
    const { error } = editingId
      ? await supabase.from('company_policies').update(payload).eq('id', editingId)
      : await supabase.from('company_policies').insert([{ ...payload, company_id: company.id, sort_order: sections.length }])
    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success(editingId ? t('sectionUpdated') : t('sectionCreated'))
    setModalOpen(false)
    setEditingId(null)
    setForm(emptyForm)
    load()
  }

  async function remove(s) {
    if (!confirm(t('confirmDelete', { title: s.title }))) return
    const { error } = await supabase.from('company_policies').delete().eq('id', s.id)
    if (error) { toast.error(error.message); return }
    toast.success(t('sectionDeleted'))
    load()
  }

  async function move(index, direction) {
    const target = index + direction
    if (target < 0 || target >= sections.length) return
    const a = sections[index], b = sections[target]
    await Promise.all([
      supabase.from('company_policies').update({ sort_order: target }).eq('id', a.id),
      supabase.from('company_policies').update({ sort_order: index }).eq('id', b.id),
    ])
    load()
  }

  async function downloadPdf() {
    setDownloading(true)
    try {
      const res = await fetch('/api/pdf/handbook')
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to generate PDF')
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div>
      <ToastContainer toasts={toast.toasts} remove={toast.remove} />
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('title')}</h1>
          <p className="page-subtitle">{t('subtitle')}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-outline" disabled={downloading || sections.length === 0} onClick={downloadPdf} title={sections.length === 0 ? t('noSectionsYet') : ''}>
            <Download size={16} /> {downloading ? t('generating') : t('downloadPdf')}
          </button>
          <button className="btn btn-primary" onClick={openForCreate}>
            <Plus size={16} /> {t('addSection')}
          </button>
        </div>
      </div>

      {sections.length === 0 ? (
        <EmptyState icon={<BookOpen size={48} color="var(--gray-300)" />} title={t('noSectionsTitle')} description={t('noSectionsDesc')}
          action={<button className="btn btn-primary btn-sm" onClick={openForCreate}>{t('addSection')}</button>} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {sections.map((s, i) => (
            <div key={s.id} className="card card-shadow" style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                <button onClick={() => move(i, -1)} disabled={i === 0} style={{ background: 'none', border: 'none', cursor: i === 0 ? 'default' : 'pointer', color: i === 0 ? 'var(--gray-200)' : 'var(--gray-400)' }}><ChevronUp size={16} /></button>
                <button onClick={() => move(i, 1)} disabled={i === sections.length - 1} style={{ background: 'none', border: 'none', cursor: i === sections.length - 1 ? 'default' : 'pointer', color: i === sections.length - 1 ? 'var(--gray-200)' : 'var(--gray-400)' }}><ChevronDown size={16} /></button>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: '0 0 0.25rem', fontWeight: 700, color: 'var(--navy)' }}>{s.title}</p>
                <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--gray-500)', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {s.content}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                <button onClick={() => openForEdit(s)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)' }}><Pencil size={16} /></button>
                <button onClick={() => remove(s)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)' }}><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditingId(null) }} title={editingId ? t('editSection') : t('newSection')} size="lg"
        footer={<>
          <button className="btn btn-outline" onClick={() => { setModalOpen(false); setEditingId(null) }}>{t('cancel')}</button>
          <button className="btn btn-primary" disabled={saving} onClick={handleSave}>{saving ? t('saving') : t('save')}</button>
        </>}>
        <form onSubmit={handleSave}>
          <Input label={t('sectionTitle')} required placeholder={t('sectionTitlePlaceholder')} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <Textarea label={t('sectionContent')} rows={10} placeholder={t('sectionContentPlaceholder')} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} />
          <p style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginTop: '-0.5rem' }}>{t('contentHint')}</p>
        </form>
      </Modal>
    </div>
  )
}

export const dynamic = 'force-dynamic'
