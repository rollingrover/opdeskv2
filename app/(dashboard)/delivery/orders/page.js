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
import { Plus, Trash2, TrendingUp, TrendingDown } from 'lucide-react'

const emptyOrder = { client_id: '', order_date: new Date().toISOString().slice(0, 10), job_type: 'delivery', vehicle_id: '', vehicle_cost_estimate: 0, status: 'draft', notes: '' }

const JOB_TYPE_VALUES = ['delivery', 'maintenance', 'errand', 'procurement', 'other']

export default function DeliveryOrdersPage() {
  const t = useTranslations('DeliveryOrders')
  const tCommon = useTranslations('Common')
  const { company, profile, needsCompany } = useAuth()
  const supabase = createClient()
  const toast = useToast()
  const [orders, setOrders] = useState([])
  const [clients, setClients] = useState([])
  const [stockItems, setStockItems] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [staff, setStaff] = useState([])
  const [staffCosts, setStaffCosts] = useState({}) // staff_id -> latest cost_to_company
  const [addons, setAddons] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [modalOpen, setModalOpen] = useState(false)
  const [orderForm, setOrderForm] = useState(emptyOrder)
  const [lineItems, setLineItems] = useState([])
  const [workers, setWorkers] = useState([])

  async function load() {
    if (!company) { setLoading(false); return }
    setLoading(true)
    const [o, c, s, v, st, sc, a] = await Promise.all([
      supabase.from('delivery_orders').select('*, delivery_clients(name), delivery_order_items(quantity, unit_cost_price, unit_sell_price), delivery_order_workers(cost)').eq('company_id', company.id).order('order_date', { ascending: false }),
      supabase.from('delivery_clients').select('id, name').eq('company_id', company.id).eq('active', true).order('name'),
      supabase.from('stock_items').select('*').eq('company_id', company.id).eq('active', true).order('name'),
      supabase.from('vehicles').select('id, name').eq('company_id', company.id),
      supabase.from('staff').select('id, full_name, staff_type').eq('company_id', company.id).eq('status', 'active'),
      supabase.from('staff_cost').select('staff_id, cost_to_company, effective_from').order('effective_from', { ascending: false }),
      supabase.from('company_addons').select('addon_key, active').eq('company_id', company.id).eq('active', true),
    ])
    if (o.error) toast.error(o.error.message)
    setOrders(o.data || [])
    setClients(c.data || [])
    setStockItems(s.data || [])
    setVehicles(v.data || [])
    setStaff(st.data || [])
    // Keep only the most recent cost-to-company per staff member
    const latestCosts = {}
    ;(sc.data || []).forEach(row => { if (!latestCosts[row.staff_id]) latestCosts[row.staff_id] = row.cost_to_company })
    setStaffCosts(latestCosts)
    setAddons(a.data || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [company])

  const access = hasModuleAccess('delivery_management', { profile, company, companyAddons: addons })
  const hasVehicleCostSuggestions = !!company?.package?.limits?.vehicle_cost_suggestions

  function pickVehicle(vehicleId) {
    if (!hasVehicleCostSuggestions || !vehicleId) {
      setOrderForm(prev => ({ ...prev, vehicle_id: vehicleId }))
      return
    }
    // Suggest the average cost this vehicle has actually run in past orders,
    // rather than leaving a blank field every time — still fully editable,
    // just a smarter starting point than nothing.
    const pastCosts = orders.filter(o => o.vehicle_id === vehicleId).map(o => Number(o.vehicle_cost_estimate) || 0).filter(c => c > 0)
    const avg = pastCosts.length ? Math.round(pastCosts.reduce((s, c) => s + c, 0) / pastCosts.length) : 0
    setOrderForm(prev => ({ ...prev, vehicle_id: vehicleId, vehicle_cost_estimate: avg || prev.vehicle_cost_estimate }))
  }

  function startNewOrder() {
    setOrderForm({ ...emptyOrder, order_date: new Date().toISOString().slice(0, 10) })
    setLineItems([])
    setWorkers([])
    setModalOpen(true)
  }

  function addLineItem() {
    setLineItems(prev => [...prev, { stock_item_id: '', item_name: '', unit: '', quantity: 1, unit_cost_price: 0, unit_sell_price: 0 }])
  }
  function updateLineItem(idx, patch) {
    setLineItems(prev => prev.map((li, i) => i === idx ? { ...li, ...patch } : li))
  }
  function pickStockItem(idx, stockItemId) {
    const item = stockItems.find(s => s.id === stockItemId)
    if (!item) return
    updateLineItem(idx, { stock_item_id: item.id, item_name: item.name, unit: item.unit, unit_cost_price: item.current_cost_price, unit_sell_price: item.current_sell_price })
  }
  function removeLineItem(idx) {
    setLineItems(prev => prev.filter((_, i) => i !== idx))
  }

  function addWorker(role) {
    setWorkers(prev => [...prev, { role, staff_id: '', casual_name: '', cost: 0 }])
  }
  function updateWorker(idx, patch) {
    setWorkers(prev => prev.map((w, i) => i === idx ? { ...w, ...patch } : w))
  }
  function pickStaffWorker(idx, staffId) {
    // Suggest a daily rate from the staff member's most recent Cost to
    // Company record (monthly CTC ÷ ~22 working days) — a starting point,
    // not a locked number, since one order might be a half-day or several
    // orders might share one day's cost.
    const monthlyCtc = staffCosts[staffId]
    const suggested = monthlyCtc ? Math.round(Number(monthlyCtc) / 22) : 0
    updateWorker(idx, { staff_id: staffId, casual_name: '', cost: suggested })
  }
  function removeWorker(idx) {
    setWorkers(prev => prev.filter((_, i) => i !== idx))
  }

  const stockCost = lineItems.reduce((s, li) => s + (Number(li.quantity) || 0) * (Number(li.unit_cost_price) || 0), 0)
  const revenue = lineItems.reduce((s, li) => s + (Number(li.quantity) || 0) * (Number(li.unit_sell_price) || 0), 0)
  const workerCost = workers.reduce((s, w) => s + (Number(w.cost) || 0), 0)
  const vehicleCost = Number(orderForm.vehicle_cost_estimate) || 0
  const totalCost = stockCost + workerCost + vehicleCost
  const profit = revenue - totalCost
  const marginPct = revenue > 0 ? (profit / revenue * 100) : 0

  async function saveOrder(e) {
    e.preventDefault()
    if (!company) return
    if (!orderForm.client_id) { toast.error(t('selectClient')); return }
    if (lineItems.length === 0) { toast.error(t('addLineItem')); return }
    setSaving(true)

    const orderRef = 'ORD-' + Date.now().toString(36).toUpperCase()
    const { data: order, error: orderErr } = await supabase.from('delivery_orders').insert([{
      company_id: company.id, client_id: orderForm.client_id, order_ref: orderRef,
      order_date: orderForm.order_date, job_type: orderForm.job_type, vehicle_id: orderForm.vehicle_id || null,
      vehicle_cost_estimate: vehicleCost, status: orderForm.status, notes: orderForm.notes,
    }]).select().single()

    if (orderErr) { setSaving(false); toast.error(orderErr.message); return }

    const itemRows = lineItems.map(li => ({
      order_id: order.id, stock_item_id: li.stock_item_id || null, item_name: li.item_name || 'Item',
      unit: li.unit, quantity: Number(li.quantity) || 0, unit_cost_price: Number(li.unit_cost_price) || 0, unit_sell_price: Number(li.unit_sell_price) || 0,
    }))
    const { error: itemsErr } = await supabase.from('delivery_order_items').insert(itemRows)

    let workersErr = null
    if (workers.length > 0) {
      const workerRows = workers.map(w => ({
        order_id: order.id, role: w.role,
        staff_id: w.staff_id || null, casual_name: w.staff_id ? null : (w.casual_name || 'Casual worker'),
        cost: Number(w.cost) || 0,
      }))
      ;({ error: workersErr } = await supabase.from('delivery_order_workers').insert(workerRows))
    }

    setSaving(false)
    if (itemsErr || workersErr) { toast.error((itemsErr || workersErr).message); return }
    toast.success(t('orderCreated', { ref: orderRef }))
    setModalOpen(false)
    load()
  }

  async function updateStatus(id, status) {
    const { error } = await supabase.from('delivery_orders').update({ status }).eq('id', id)
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
          <p className="page-subtitle">{orders.length} {orders.length === 1 ? t('orderSingular') : t('orderPlural')}</p>
        </div>
        <button className="btn btn-primary" onClick={startNewOrder} disabled={clients.length === 0}><Plus size={16} /> {t('newOrder')}</button>
      </div>

      <div className="card card-shadow" style={{ padding: 0, overflow: 'hidden' }}>
        {clients.length === 0 ? (
          <EmptyState icon={<BrandIcon name="delivery" size={48} />} title={t('addClientFirstTitle')} description={t('addClientFirstDesc')} />
        ) : orders.length === 0 ? (
          <EmptyState icon={<BrandIcon name="delivery" size={48} />} title={t('noOrdersTitle')}
            description={t('noOrdersDesc')}
            action={<button className="btn btn-primary btn-sm" onClick={startNewOrder}>{t('newOrder')}</button>} />
        ) : (
          <table className="table">
            <thead><tr><th>{t('colOrder')}</th><th>{t('colType')}</th><th>{t('colClient')}</th><th>{t('colDate')}</th><th>{t('colRevenue')}</th><th>{t('colCost')}</th><th>{t('colProfit')}</th><th>{t('colStatus')}</th></tr></thead>
            <tbody>
              {orders.map(o => {
                const rev = (o.delivery_order_items || []).reduce((s, li) => s + li.quantity * li.unit_sell_price, 0)
                const stockC = (o.delivery_order_items || []).reduce((s, li) => s + li.quantity * li.unit_cost_price, 0)
                const workerC = (o.delivery_order_workers || []).reduce((s, w) => s + Number(w.cost), 0)
                const cost = stockC + workerC + Number(o.vehicle_cost_estimate || 0)
                const prof = rev - cost
                return (
                  <tr key={o.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--navy)' }}>{o.order_ref}</td>
                    <td style={{ textTransform: 'capitalize', color: 'var(--gray-500)' }}>{t(`jobTypes.${o.job_type}.label`)}</td>
                    <td>{o.delivery_clients?.name || '—'}</td>
                    <td style={{ color: 'var(--gray-500)' }}>{new Date(o.order_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}</td>
                    <td>{company.currency} {rev.toLocaleString()}</td>
                    <td style={{ color: 'var(--gray-500)' }}>{company.currency} {cost.toLocaleString()}</td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontWeight: 700, color: prof >= 0 ? 'var(--teal)' : '#ef4444' }}>
                        {prof >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />} {company.currency} {prof.toLocaleString()}
                      </span>
                    </td>
                    <td>
                      <select value={o.status} onChange={e => updateStatus(o.id, e.target.value)} style={{ border: '1px solid var(--gray-200)', borderRadius: '0.375rem', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                        <option value="draft">{t('orderStatuses.draft')}</option>
                        <option value="delivered">{t('orderStatuses.delivered')}</option>
                        <option value="invoiced">{t('orderStatuses.invoiced')}</option>
                        <option value="paid">{t('orderStatuses.paid')}</option>
                      </select>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={t('newOrder')} size="lg"
        footer={<>
          <button className="btn btn-outline" onClick={() => setModalOpen(false)}>{t('cancel')}</button>
          <button className="btn btn-primary" disabled={saving} onClick={saveOrder}>{saving ? t('saving') : t('createOrder')}</button>
        </>}>
        <form onSubmit={saveOrder}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
            <Select label={t('client')} required value={orderForm.client_id} onChange={e => setOrderForm({ ...orderForm, client_id: e.target.value })}>
              <option value="">{t('selectEllipsis')}</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
            <Input label={t('orderDate')} type="date" required value={orderForm.order_date} onChange={e => setOrderForm({ ...orderForm, order_date: e.target.value })} />
            <Select label={t('jobType')} value={orderForm.job_type} onChange={e => setOrderForm({ ...orderForm, job_type: e.target.value })}>
              {JOB_TYPE_VALUES.map(jt => <option key={jt} value={jt}>{t(`jobTypes.${jt}.label`)}</option>)}
            </Select>
            <Select label={t('vehicle')} value={orderForm.vehicle_id} onChange={e => pickVehicle(e.target.value)}>
              <option value="">{t('none')}</option>
              {vehicles.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
            </Select>
            <Input label={`${t('vehicleCostEstimate')} (${company.currency})${hasVehicleCostSuggestions ? t('suggestedFromPastOrders') : ''}`} type="number" step="0.01" value={orderForm.vehicle_cost_estimate} onChange={e => setOrderForm({ ...orderForm, vehicle_cost_estimate: e.target.value })} />
          </div>

          {/* Line items */}
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--gray-100)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', margin: 0 }}>{t(`jobTypes.${orderForm.job_type}.itemsLabel`)}</p>
              <button type="button" className="btn btn-outline btn-sm" onClick={addLineItem}><Plus size={13} /> {t('addItem')}</button>
            </div>
            {lineItems.map((li, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 0.7fr 1fr 1fr auto', gap: '0.5rem', alignItems: 'end', marginBottom: '0.5rem' }}>
                <Select label={idx === 0 ? t('item') : ''} value={li.stock_item_id} onChange={e => pickStockItem(idx, e.target.value)}>
                  <option value="">{t('selectEllipsis')}</option>
                  {stockItems.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </Select>
                <Input label={idx === 0 ? t('qty') : ''} type="number" value={li.quantity} onChange={e => updateLineItem(idx, { quantity: e.target.value })} />
                <Input label={idx === 0 ? t('costEa') : ''} type="number" step="0.01" value={li.unit_cost_price} onChange={e => updateLineItem(idx, { unit_cost_price: e.target.value })} />
                <Input label={idx === 0 ? t('sellEa') : ''} type="number" step="0.01" value={li.unit_sell_price} onChange={e => updateLineItem(idx, { unit_sell_price: e.target.value })} />
                <button type="button" onClick={() => removeLineItem(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', paddingBottom: '0.5rem' }}><Trash2 size={15} /></button>
              </div>
            ))}
          </div>

          {/* Workers */}
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--gray-100)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', margin: 0 }}>{t('driverAndLoaders')}</p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => addWorker('driver')}><Plus size={13} /> {t('driver')}</button>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => addWorker('loader')}><Plus size={13} /> {t('loader')}</button>
              </div>
            </div>
            {workers.map((w, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '0.6fr 1.4fr 1fr auto', gap: '0.5rem', alignItems: 'end', marginBottom: '0.5rem' }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--navy)', paddingBottom: '0.625rem' }}>{w.role === 'driver' ? t('driver') : t('loader')}</div>
                <Select label={idx === 0 ? t('worker') : ''} value={w.staff_id ? `staff:${w.staff_id}` : 'casual'}
                  onChange={e => e.target.value === 'casual' ? updateWorker(idx, { staff_id: '', casual_name: '' }) : pickStaffWorker(idx, e.target.value.replace('staff:', ''))}>
                  <option value="casual">{t('casualDayLabor')}</option>
                  {staff.map(s => <option key={s.id} value={`staff:${s.id}`}>{s.full_name} {t('staffSuffix')}</option>)}
                </Select>
                {!w.staff_id && (
                  <Input label={idx === 0 ? t('name') : ''} placeholder={t('workerNamePlaceholder')} value={w.casual_name} onChange={e => updateWorker(idx, { casual_name: e.target.value })} />
                )}
                <Input label={idx === 0 ? `${t('cost')} (${company.currency})` : ''} type="number" step="0.01" value={w.cost} onChange={e => updateWorker(idx, { cost: e.target.value })} />
                <button type="button" onClick={() => removeWorker(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', paddingBottom: '0.5rem' }}><Trash2 size={15} /></button>
              </div>
            ))}
          </div>

          {/* Live cost/profit summary */}
          <div style={{ marginTop: '1.25rem', background: 'var(--cream)', borderRadius: '0.625rem', padding: '1rem 1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', fontSize: '0.8125rem' }}>
              <div><div style={{ color: 'var(--gray-500)' }}>{t('revenue')}</div><div style={{ fontWeight: 700, color: 'var(--navy)' }}>{company.currency} {revenue.toLocaleString()}</div></div>
              <div><div style={{ color: 'var(--gray-500)' }}>{t(`jobTypes.${orderForm.job_type}.costLabel`)}</div><div style={{ fontWeight: 700, color: 'var(--navy)' }}>{company.currency} {stockCost.toLocaleString()}</div></div>
              <div><div style={{ color: 'var(--gray-500)' }}>{t('vehicleAndWorkerCost')}</div><div style={{ fontWeight: 700, color: 'var(--navy)' }}>{company.currency} {(vehicleCost + workerCost).toLocaleString()}</div></div>
              <div>
                <div style={{ color: 'var(--gray-500)' }}>{t('profit')}</div>
                <div style={{ fontWeight: 800, fontSize: '1.125rem', color: profit >= 0 ? 'var(--teal)' : '#ef4444' }}>
                  {company.currency} {profit.toLocaleString()} <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>({marginPct.toFixed(0)}%)</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export const dynamic = 'force-dynamic'
