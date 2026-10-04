'use client'
import { useEffect, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { PageLoader } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { useToast, ToastContainer } from '@/components/ui/Toast'
import { BrandIcon } from '@/components/ui/BrandIcon'
import DocButton from '@/components/compliance/DocButton'
import { BUSINESS_DOC_TYPES, loadComplianceItems, todayIn } from '@/lib/compliance'
import { ShieldCheck, Plus, Lock, Bell } from 'lucide-react'

const COLORS = { expired: '#b91c1c', d7: '#ea580c', d30: '#d97706', d60: '#ca8a04', ok: '#16a34a', none: '#9ca3af' }
const EMPTY = { doc_type: 'operating_licence', title: '', reference_number: '', issuing_body: '', issue_date: '', expiry_date: '', notes: '' }

export default function CompliancePage() {
  const t = useTranslations('Compliance')
  const tCommon = useTranslations('Common')
  const { company, needsCompany } = useAuth()
  const supabase = createClient()
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState([])
  const [filter, setFilter] = useState('attention')
  const [form, setForm] = useState(null) // null = closed; {} new; {id,...} edit
  const today = todayIn(company?.timezone || 'Africa/Johannesburg')
  const paid = !!company && company.subscription_tier !== 'free'
  const canUpload = !!company && (company.comped || !['free', 'basic'].includes(company.subscription_tier))

  async function fetchItems() { return loadComplianceItems(supabase, company.id, today) }
  function apply(list) { setItems(list); setLoading(false) }
  async function load() { apply(await fetchItems()) }
  useEffect(() => {
    if (!company) return
    let alive = true
    fetchItems().then(r => { if (alive) apply(r) })
    return () => { alive = false }
  }, [company]) // eslint-disable-line react-hooks/exhaustive-deps

  const counts = useMemo(() => items.reduce((m, i) => ({ ...m, [i.bucket]: (m[i.bucket] || 0) + 1 }), {}), [items])
  const shown = items.filter(i => filter === 'all' ? true : filter === 'attention' ? ['expired', 'd7', 'd30', 'd60'].includes(i.bucket) : i.source === filter)
  const label = i => (i.source === 'business' ? t(`doc_${i.kind}`) : i.source === 'vehicle' ? t(`v_${i.kind}`) : i.source === 'firearm' ? t('firearmLicence') : i.kind)

  async function saveDoc() {
    const payload = { ...form, company_id: company.id, issue_date: form.issue_date || null, expiry_date: form.expiry_date || null, updated_at: new Date().toISOString() }
    const q = form.id ? supabase.from('business_documents').update(payload).eq('id', form.id) : supabase.from('business_documents').insert([payload])
    const { error } = await q
    if (error) { toast.error(error.message); return }
    toast.success(t('saved')); setForm(null); load()
  }
  async function deleteDoc(id, path) {
    if (!confirm(t('confirmDelete'))) return
    if (path) await supabase.storage.from('documents').remove([path])
    const { error } = await supabase.from('business_documents').delete().eq('id', id)
    if (error) toast.error(error.message); else { setForm(null); load() }
  }

  if (needsCompany) return <EmptyState icon={<BrandIcon name="companySetup" size={48} />} title={tCommon('needsCompanyTitle')} />
  if (loading) return <PageLoader />

  const fld = { display: 'flex', flexDirection: 'column', gap: 4, fontSize: '0.8125rem', fontWeight: 600, color: 'var(--gray-600)' }
  return (
    <div>
      <ToastContainer toasts={toast.toasts} remove={toast.remove} />
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('title')}</h1>
          <p className="page-subtitle">{t('subtitle')}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Link href="/settings/notifications" className="btn btn-outline"><Bell size={16} /> {t('reminders')}</Link>
          <button className="btn btn-primary" onClick={() => setForm({ ...EMPTY })}><Plus size={16} /> {t('addDocument')}</button>
        </div>
      </div>

      {!paid && (
        <div className="card card-shadow" style={{ marginBottom: '1rem', borderLeft: '4px solid var(--gold)', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Lock size={18} color="var(--gold)" /><span style={{ flex: 1, fontSize: '0.9rem' }}>{t('freeBanner')}</span>
          <Link href="/settings/billing" className="btn btn-primary btn-sm">{t('upgrade')}</Link>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
        {['expired', 'd7', 'd30', 'd60'].map(b => (
          <div key={b} className="card card-shadow" style={{ borderTop: `4px solid ${COLORS[b]}` }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', textTransform: 'uppercase', fontWeight: 700 }}>{t(`bucket_${b}`)}</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: COLORS[b] }}>{counts[b] || 0}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {['attention', 'business', 'vehicle', 'staff', 'firearm', 'all'].map(f => (
          <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter(f)}>{t(`filter_${f}`)}</button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="card card-shadow"><EmptyState icon={<ShieldCheck size={40} color="var(--gray-400)" />} title={filter === 'attention' ? t('allGood') : t('empty')} description={t('emptyDesc')} /></div>
      ) : (
        <div className="card card-shadow" style={{ padding: 0, overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%' }}>
            <thead><tr><th>{t('col_item')}</th><th>{t('col_what')}</th><th>{t('col_expiry')}</th><th>{t('col_status')}</th><th>{t('col_document')}</th></tr></thead>
            <tbody>
              {shown.map(i => (
                <tr key={i.key}>
                  <td><strong>{i.subject || t(`doc_${i.kind}`)}</strong><div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{t(`src_${i.source}`)}{i.reference ? ` · ${i.reference}` : ''}</div></td>
                  <td>{label(i)}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{i.expiry || '—'}</td>
                  <td><span style={{ color: COLORS[i.bucket], fontWeight: 700, fontSize: '0.8125rem' }}>
                    {i.days === null ? t('noExpiry') : i.days < 0 ? t('expiredAgo', { days: -i.days }) : i.days === 0 ? t('today') : t('inDays', { days: i.days })}
                  </span></td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <DocButton companyId={company.id} table={i.table} rowId={i.rowId} column={i.docColumn} path={i.docPath} canUpload={canUpload} onChange={load} toast={toast} />
                    {i.source === 'business' && <button className="btn btn-outline btn-sm" style={{ marginLeft: 6 }} onClick={() => setForm({ ...EMPTY, ...i.raw })}>{t('edit')}</button>}
                    {!canUpload && !i.docPath && <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{t('uploadsOnStandard')}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', marginTop: '0.75rem' }}>{t('whereElse')}</p>

      {form && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 60, display: 'grid', placeItems: 'center', padding: '1rem' }} onClick={() => setForm(null)}>
          <div className="card" style={{ width: 'min(560px, 100%)', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ marginTop: 0, fontSize: '1.125rem' }}>{form.id ? t('editDocument') : t('addDocument')}</h2>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <label style={fld}>{t('docType')}
                <select className="input" value={form.doc_type} onChange={e => setForm(f => ({ ...f, doc_type: e.target.value }))}>
                  {BUSINESS_DOC_TYPES.map(d => <option key={d} value={d}>{t(`doc_${d}`)}</option>)}
                </select>
              </label>
              <label style={fld}>{t('docTitle')}<input className="input" value={form.title || ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <label style={fld}>{t('reference')}<input className="input" value={form.reference_number || ''} onChange={e => setForm(f => ({ ...f, reference_number: e.target.value }))} /></label>
                <label style={fld}>{t('issuedBy')}<input className="input" value={form.issuing_body || ''} onChange={e => setForm(f => ({ ...f, issuing_body: e.target.value }))} /></label>
                <label style={fld}>{t('issueDate')}<input type="date" className="input" value={form.issue_date || ''} onChange={e => setForm(f => ({ ...f, issue_date: e.target.value }))} /></label>
                <label style={fld}>{t('expiryDate')}<input type="date" className="input" value={form.expiry_date || ''} onChange={e => setForm(f => ({ ...f, expiry_date: e.target.value }))} /></label>
              </div>
              <label style={fld}>{t('notes')}<textarea className="input" rows={3} value={form.notes || ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></label>
              {!form.id && <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--gray-500)' }}>{t('uploadAfterSave')}</p>}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'space-between', marginTop: '1rem' }}>
              {form.id ? <button className="btn btn-outline" style={{ color: '#b91c1c' }} onClick={() => deleteDoc(form.id, form.document_path)}>{t('delete')}</button> : <span />}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-outline" onClick={() => setForm(null)}>{t('cancel')}</button>
                <button className="btn btn-primary" onClick={saveDoc}>{t('save')}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export const dynamic = 'force-dynamic'
