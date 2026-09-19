'use client'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { PageLoader } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { ModuleLocked } from '@/components/ui/ModuleLocked'
import { Modal } from '@/components/ui/Modal'
import { Input, Select } from '@/components/ui/FormField'
import { useToast, ToastContainer } from '@/components/ui/Toast'
import { BrandIcon } from '@/components/ui/BrandIcon'
import { hasModuleAccess } from '@/lib/moduleAccess'
import { Plus, Trash2, FileDown, ClipboardList } from 'lucide-react'

const CATEGORY_VALUES = ['trip_check', 'room_inventory', 'general']

// Starting points only — every list is fully editable, items can be
// renamed, removed, or added to freely after creation. Keys are stable
// identifiers used to look up the translated name and a fixed quantity;
// quantities don't need translation.
const EXAMPLE_ITEM_KEYS = {
  trip_check: [
    { key: 'cooldrinks', quantity: '12' }, { key: 'lunchPacks', quantity: '' },
    { key: 'waterBottles', quantity: '12' }, { key: 'coolerBox', quantity: '1' },
    { key: 'blankets', quantity: '4' }, { key: 'raincoats', quantity: '4' },
    { key: 'fireExtinguisher', quantity: '1' }, { key: 'firstAidKit', quantity: '1' },
  ],
  room_inventory: [
    { key: 'towels', quantity: '4' }, { key: 'pillows', quantity: '4' },
    { key: 'blankets', quantity: '2' }, { key: 'coffeeTable', quantity: '1' },
    { key: 'kettle', quantity: '1' }, { key: 'hangers', quantity: '6' },
    { key: 'bedsideLamp', quantity: '2' }, { key: 'ironAndBoard', quantity: '1' },
  ],
  general: [],
}

const emptyTemplateForm = { name: '', category: 'trip_check', useExamples: true }
const emptyItemForm = { name: '', quantity: '' }

export default function ChecklistsPage() {
  const t = useTranslations('Checklists')
  const tCommon = useTranslations('Common')
  const { company, profile, needsCompany } = useAuth()
  const supabase = createClient()
  const toast = useToast()
  const [templates, setTemplates] = useState([])
  const [itemCounts, setItemCounts] = useState({})
  const [addons, setAddons] = useState([])
  const [loading, setLoading] = useState(true)
  const [newModalOpen, setNewModalOpen] = useState(false)
  const [templateForm, setTemplateForm] = useState(emptyTemplateForm)
  const [saving, setSaving] = useState(false)

  const [activeTemplate, setActiveTemplate] = useState(null)
  const [activeItems, setActiveItems] = useState([])
  const [itemForm, setItemForm] = useState(emptyItemForm)

  async function load() {
    if (!company) { setLoading(false); return }
    setLoading(true)
    const [tRes, a] = await Promise.all([
      supabase.from('checklist_templates').select('*').eq('company_id', company.id).order('created_at', { ascending: false }),
      supabase.from('company_addons').select('addon_key, active').eq('company_id', company.id).eq('active', true),
    ])
    if (tRes.error) toast.error(tRes.error.message)
    const list = tRes.data || []
    setTemplates(list)
    setAddons(a.data || [])
    if (list.length > 0) {
      const { data: allItems } = await supabase.from('checklist_items').select('template_id').in('template_id', list.map(x => x.id))
      const counts = {}
      ;(allItems || []).forEach(i => { counts[i.template_id] = (counts[i.template_id] || 0) + 1 })
      setItemCounts(counts)
    }
    setLoading(false)
  }
  useEffect(() => { load() }, [company])

  const access = hasModuleAccess('checklists', { profile, company, companyAddons: addons })

  async function createTemplate(e) {
    e.preventDefault()
    if (!company) return
    setSaving(true)
    const { data: created, error } = await supabase.from('checklist_templates').insert([{
      company_id: company.id, name: templateForm.name, category: templateForm.category,
    }]).select().single()
    if (error) { setSaving(false); toast.error(error.message); return }

    if (templateForm.useExamples) {
      const examples = EXAMPLE_ITEM_KEYS[templateForm.category] || []
      if (examples.length > 0) {
        await supabase.from('checklist_items').insert(
          examples.map((it, i) => ({ template_id: created.id, name: t(`examples.${templateForm.category}.${it.key}`), quantity: it.quantity, sort_order: i }))
        )
      }
    }
    setSaving(false)
    toast.success(t('listCreated'))
    setNewModalOpen(false); setTemplateForm(emptyTemplateForm)
    load()
  }

  async function deleteTemplate(tpl) {
    if (!confirm(t('deleteConfirm', { name: tpl.name }))) return
    const { error } = await supabase.from('checklist_templates').delete().eq('id', tpl.id)
    if (error) { toast.error(error.message); return }
    toast.success(t('listDeleted'))
    load()
  }

  async function openTemplate(tpl) {
    setActiveTemplate(tpl)
    const { data } = await supabase.from('checklist_items').select('*').eq('template_id', tpl.id).order('sort_order')
    setActiveItems(data || [])
  }

  async function addItem(e) {
    e.preventDefault()
    if (!itemForm.name.trim()) return
    const { error } = await supabase.from('checklist_items').insert([{
      template_id: activeTemplate.id, name: itemForm.name, quantity: itemForm.quantity, sort_order: activeItems.length,
    }])
    if (error) { toast.error(error.message); return }
    setItemForm(emptyItemForm)
    openTemplate(activeTemplate)
    load()
  }

  async function removeItem(item) {
    const { error } = await supabase.from('checklist_items').delete().eq('id', item.id)
    if (error) { toast.error(error.message); return }
    openTemplate(activeTemplate)
    load()
  }

  if (needsCompany) return <EmptyState icon={<BrandIcon name="companySetup" size={48} />} title={tCommon('needsCompanyTitle')} />
  if (loading) return <PageLoader />
  if (!access) return <ModuleLocked moduleKey="checklists" />

  return (
    <div>
      <ToastContainer toasts={toast.toasts} remove={toast.remove} />
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('title')}</h1>
          <p className="page-subtitle">{t('subtitle')}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setNewModalOpen(true)}><Plus size={16} /> {t('newList')}</button>
      </div>

      {templates.length === 0 ? (
        <div className="card card-shadow">
          <EmptyState icon={<ClipboardList size={40} color="var(--gray-400)" />} title={t('noListsTitle')}
            description={t('noListsDesc')}
            action={<button className="btn btn-primary btn-sm" onClick={() => setNewModalOpen(true)}>{t('newList')}</button>} />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
          {templates.map(tpl => (
            <div key={tpl.id} className="card card-shadow">
              <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', margin: '0 0 0.25rem' }}>
                {CATEGORY_VALUES.includes(tpl.category) ? t(`categories.${tpl.category}`) : tpl.category}
              </p>
              <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.0625rem', color: 'var(--navy)' }}>{tpl.name}</h3>
              <p style={{ margin: '0 0 1rem', fontSize: '0.8125rem', color: 'var(--gray-500)' }}>{itemCounts[tpl.id] || 0} {(itemCounts[tpl.id] || 0) === 1 ? t('itemSingular') : t('itemPlural')}</p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => openTemplate(tpl)} className="btn btn-outline btn-sm">{t('manageItems')}</button>
                <a href={`/api/pdf/checklist?templateId=${tpl.id}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm"><FileDown size={13} /> {t('pdf')}</a>
                <button onClick={() => deleteTemplate(tpl)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', marginLeft: 'auto' }}><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={newModalOpen} onClose={() => setNewModalOpen(false)} title={t('newList')}
        footer={<>
          <button className="btn btn-outline" onClick={() => setNewModalOpen(false)}>{t('cancel')}</button>
          <button className="btn btn-primary" disabled={saving || !templateForm.name} onClick={createTemplate}>{saving ? t('creating') : t('createList')}</button>
        </>}>
        <form onSubmit={createTemplate}>
          <Input label={t('listName')} required placeholder={t('listNamePlaceholder')} value={templateForm.name} onChange={e => setTemplateForm({ ...templateForm, name: e.target.value })} />
          <Select label={t('category')} value={templateForm.category} onChange={e => setTemplateForm({ ...templateForm, category: e.target.value })}>
            {CATEGORY_VALUES.map(c => <option key={c} value={c}>{t(`categories.${c}`)}</option>)}
          </Select>
          {EXAMPLE_ITEM_KEYS[templateForm.category]?.length > 0 && (
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--navy)', cursor: 'pointer', marginTop: '0.5rem' }}>
              <input type="checkbox" checked={templateForm.useExamples} onChange={e => setTemplateForm({ ...templateForm, useExamples: e.target.checked })} />
              {t('startWithExamples', { count: EXAMPLE_ITEM_KEYS[templateForm.category].length })}
            </label>
          )}
        </form>
      </Modal>

      <Modal open={!!activeTemplate} onClose={() => setActiveTemplate(null)} title={activeTemplate?.name || ''}
        footer={<button className="btn btn-outline" onClick={() => setActiveTemplate(null)}>{t('close')}</button>}>
        {activeTemplate && (
          <>
            {activeItems.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                {activeItems.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--gray-100)' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--navy)' }}>{item.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {item.quantity && <span style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>x{item.quantity}</span>}
                      <button onClick={() => removeItem(item)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <form onSubmit={addItem} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
              <div style={{ flex: 2 }}><Input label={t('item')} placeholder={t('itemPlaceholder')} value={itemForm.name} onChange={e => setItemForm({ ...itemForm, name: e.target.value })} /></div>
              <div style={{ flex: 1 }}><Input label={t('qty')} placeholder="1" value={itemForm.quantity} onChange={e => setItemForm({ ...itemForm, quantity: e.target.value })} /></div>
              <button type="submit" className="btn btn-outline btn-sm" style={{ marginBottom: '0.5rem' }}><Plus size={14} /></button>
            </form>
          </>
        )}
      </Modal>
    </div>
  )
}

export const dynamic = 'force-dynamic'
