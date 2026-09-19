'use client'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { PageLoader } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { ModuleLocked } from '@/components/ui/ModuleLocked'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/FormField'
import { useToast, ToastContainer } from '@/components/ui/Toast'
import { BrandIcon } from '@/components/ui/BrandIcon'
import { hasModuleAccess } from '@/lib/moduleAccess'
import { Plus, TrendingUp, TrendingDown, History } from 'lucide-react'

const emptyForm = { name: '', unit: '', current_cost_price: '', current_sell_price: '' }

export default function PriceListPage() {
  const t = useTranslations('PriceList')
  const tCommon = useTranslations('Common')
  const { company, profile, needsCompany } = useAuth()
  const supabase = createClient()
  const toast = useToast()
  const [items, setItems] = useState([])
  const [addons, setAddons] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [historyItem, setHistoryItem] = useState(null)
  const [history, setHistory] = useState([])

  async function load() {
    if (!company) { setLoading(false); return }
    setLoading(true)
    const [i, a] = await Promise.all([
      supabase.from('stock_items').select('*').eq('company_id', company.id).eq('active', true).order('name'),
      supabase.from('company_addons').select('addon_key, active').eq('company_id', company.id).eq('active', true),
    ])
    if (i.error) toast.error(i.error.message)
    setItems(i.data || [])
    setAddons(a.data || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [company])

  const access = hasModuleAccess('delivery_management', { profile, company, companyAddons: addons })

  function startNew() {
    setEditItem(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  function startEdit(item) {
    setEditItem(item)
    setForm({ name: item.name, unit: item.unit || '', current_cost_price: item.current_cost_price, current_sell_price: item.current_sell_price })
    setModalOpen(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!company) return
    setSaving(true)
    const payload = {
      name: form.name, unit: form.unit,
      current_cost_price: Number(form.current_cost_price) || 0,
      current_sell_price: Number(form.current_sell_price) || 0,
    }
    let error
    if (editItem) {
      ;({ error } = await supabase.from('stock_items').update(payload).eq('id', editItem.id))
    } else {
      ;({ error } = await supabase.from('stock_items').insert([{ ...payload, company_id: company.id }]))
    }
    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success(editItem ? t('priceUpdated') : t('itemAdded'))
    setModalOpen(false); load()
  }

  async function viewHistory(item) {
    setHistoryItem(item)
    const { data } = await supabase.from('stock_price_history').select('*').eq('stock_item_id', item.id).order('created_at', { ascending: false })
    setHistory(data || [])
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
          <p className="page-subtitle">{items.length} {items.length === 1 ? t('itemSingular') : t('itemPlural')} · {t('autoLoggedSuffix')}</p>
        </div>
        <button className="btn btn-primary" onClick={startNew}><Plus size={16} /> {t('addItem')}</button>
      </div>

      <div className="card card-shadow" style={{ padding: 0, overflow: 'hidden' }}>
        {items.length === 0 ? (
          <EmptyState icon={<BrandIcon name="delivery" size={48} />} title={t('noItemsTitle')}
            description={t('noItemsDesc')}
            action={<button className="btn btn-primary btn-sm" onClick={startNew}>{t('addItem')}</button>} />
        ) : (
          <table className="table">
            <thead><tr><th>{t('colItem')}</th><th>{t('colUnit')}</th><th>{t('colCostPrice')}</th><th>{t('colSellPrice')}</th><th>{t('colMargin')}</th><th></th></tr></thead>
            <tbody>
              {items.map(item => {
                const margin = item.current_sell_price - item.current_cost_price
                const marginPct = item.current_cost_price > 0 ? (margin / item.current_cost_price * 100) : 0
                return (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 600, color: 'var(--navy)' }}>{item.name}</td>
                    <td style={{ color: 'var(--gray-500)' }}>{item.unit || '—'}</td>
                    <td>{company.currency} {Number(item.current_cost_price).toLocaleString()}</td>
                    <td>{company.currency} {Number(item.current_sell_price).toLocaleString()}</td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: margin >= 0 ? 'var(--teal)' : '#ef4444', fontWeight: 600 }}>
                        {margin >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />} {marginPct.toFixed(0)}%
                      </span>
                    </td>
                    <td style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => viewHistory(item)} className="btn btn-outline btn-sm"><History size={13} /> {t('history')}</button>
                      <button onClick={() => startEdit(item)} className="btn btn-outline btn-sm">{t('edit')}</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? t('editTitle', { name: editItem.name }) : t('addStockItem')}
        footer={<>
          <button className="btn btn-outline" onClick={() => setModalOpen(false)}>{t('cancel')}</button>
          <button className="btn btn-primary" disabled={saving} onClick={handleSave}>{saving ? t('saving') : editItem ? t('saveChanges') : t('addItem')}</button>
        </>}>
        <form onSubmit={handleSave}>
          <Input label={t('itemName')} required placeholder={t('itemNamePlaceholder')} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <Input label={t('unit')} placeholder={t('unitPlaceholder')} value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
            <Input label={`${t('costPrice')} (${company.currency})`} type="number" step="0.01" required value={form.current_cost_price} onChange={e => setForm({ ...form, current_cost_price: e.target.value })} />
            <Input label={`${t('sellPrice')} (${company.currency})`} type="number" step="0.01" required value={form.current_sell_price} onChange={e => setForm({ ...form, current_sell_price: e.target.value })} />
          </div>
        </form>
      </Modal>

      <Modal open={!!historyItem} onClose={() => setHistoryItem(null)} title={`${t('priceHistory')} — ${historyItem?.name || ''}`}
        footer={<button className="btn btn-outline" onClick={() => setHistoryItem(null)}>{t('close')}</button>}>
        {history.length === 0 ? (
          <p style={{ color: 'var(--gray-400)' }}>{t('noHistoryYet')}</p>
        ) : (
          <table className="table">
            <thead><tr><th>{t('colDate')}</th><th>{t('colCostPrice')}</th><th>{t('colSellPrice')}</th></tr></thead>
            <tbody>
              {history.map(h => (
                <tr key={h.id}>
                  <td>{new Date(h.effective_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td>{company.currency} {Number(h.cost_price).toLocaleString()}</td>
                  <td>{company.currency} {Number(h.sell_price).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Modal>
    </div>
  )
}

export const dynamic = 'force-dynamic'
