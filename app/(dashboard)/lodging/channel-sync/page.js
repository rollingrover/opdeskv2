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
import { Copy, Plus, Trash2, RefreshCw, AlertTriangle, Check } from 'lucide-react'

const emptyForm = { source_name: 'airbnb', feed_url: '' }

export default function ChannelSyncPage() {
  const t = useTranslations('ChannelSync')
  const tCommon = useTranslations('Common')
  const tStaff = useTranslations('Staff')
  const { company, profile, needsCompany } = useAuth()
  const supabase = createClient()
  const toast = useToast()
  const [rooms, setRooms] = useState([])
  const [feeds, setFeeds] = useState([])
  const [addons, setAddons] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalRoom, setModalRoom] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  async function load() {
    if (!company) { setLoading(false); return }
    setLoading(true)
    const [r, f, a] = await Promise.all([
      supabase.from('rooms').select('id, name, ical_export_token').eq('company_id', company.id).order('name'),
      supabase.from('room_ical_feeds').select('*').eq('company_id', company.id).order('created_at'),
      supabase.from('company_addons').select('addon_key, active').eq('company_id', company.id).eq('active', true),
    ])
    if (r.error) toast.error(r.error.message)
    setRooms(r.data || [])
    setFeeds(f.data || [])
    setAddons(a.data || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [company])

  const access = hasModuleAccess('ical_sync', { profile, company, companyAddons: addons })

  function exportUrl(room) {
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    return `${origin}/api/ical/export/${room.id}?token=${room.ical_export_token}`
  }

  function copyUrl(room) {
    navigator.clipboard.writeText(exportUrl(room))
    toast.success(t('urlCopied'))
  }

  async function addFeed(e) {
    e.preventDefault()
    if (!modalRoom) return
    setSaving(true)
    const { error } = await supabase.from('room_ical_feeds').insert([{
      room_id: modalRoom.id, company_id: company.id, source_name: form.source_name, feed_url: form.feed_url,
    }])
    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success(t('feedAdded'))
    setModalRoom(null); setForm(emptyForm); load()
  }

  async function removeFeed(id) {
    if (!confirm(t('confirmRemoveFeed'))) return
    const { error } = await supabase.from('room_ical_feeds').delete().eq('id', id)
    if (error) { toast.error(error.message); return }
    toast.success(t('feedRemoved'))
    load()
  }

  if (needsCompany) return <EmptyState icon={<BrandIcon name="companySetup" size={48} />} title={tCommon('needsCompanyTitle')} />
  if (loading) return <PageLoader />
  if (!access) return <ModuleLocked moduleKey="ical_sync" />

  return (
    <div>
      <ToastContainer toasts={toast.toasts} remove={toast.remove} />
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('title')}</h1>
          <p className="page-subtitle">{t('subtitle')}</p>
        </div>
      </div>

      <div style={{ background: 'var(--cream)', border: '1px solid var(--gray-100)', borderRadius: '0.75rem', padding: '0.875rem 1.125rem', marginBottom: '1.25rem', fontSize: '0.8125rem', color: 'var(--gray-500)' }}>
        {t('infoBanner')}
      </div>

      {rooms.length === 0 ? (
        <div className="card card-shadow">
          <EmptyState icon={<BrandIcon name="noRooms" size={48} />} title={t('addRoomsFirstTitle')} description={t('addRoomsFirstDesc')} />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {rooms.map(room => {
            const roomFeeds = feeds.filter(f => f.room_id === room.id)
            return (
              <div key={room.id} className="card card-shadow">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--navy)' }}>{room.name}</h3>
                  <button className="btn btn-outline btn-sm" onClick={() => { setModalRoom(room); setForm(emptyForm) }}>
                    <Plus size={14} /> {t('addFeed')}
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--gray-50)', borderRadius: '0.5rem', padding: '0.625rem 0.875rem', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 600 }}>{t('exportUrlLabel')}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{exportUrl(room)}</span>
                  <button onClick={() => copyUrl(room)} style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer', flexShrink: 0 }}><Copy size={14} /></button>
                </div>

                {roomFeeds.length === 0 ? (
                  <p style={{ fontSize: '0.8125rem', color: 'var(--gray-400)', margin: 0 }}>{t('noFeedsYet')}</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {roomFeeds.map(feed => (
                      <div key={feed.id} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.8125rem' }}>
                        <span style={{ fontWeight: 700, color: 'var(--navy)', textTransform: 'capitalize', minWidth: 90 }}>{feed.source_name.replace(/_/g, ' ')}</span>
                        <span style={{ color: 'var(--gray-400)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{feed.feed_url}</span>
                        {feed.last_sync_status === 'ok' && <span title={feed.last_synced_at ? new Date(feed.last_synced_at).toLocaleString('en-ZA') : ''} style={{ color: 'var(--teal)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Check size={13} /></span>}
                        {feed.last_sync_status === 'error' && <span title={feed.last_sync_error || t('syncFailed')} style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><AlertTriangle size={13} /></span>}
                        {!feed.last_synced_at && <span title={t('notYetSynced')} style={{ color: 'var(--gray-300)' }}><RefreshCw size={13} /></span>}
                        <button onClick={() => removeFeed(feed.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={13} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <Modal open={!!modalRoom} onClose={() => setModalRoom(null)} title={`${t('addFeed')} — ${modalRoom?.name || ''}`}
        footer={<>
          <button className="btn btn-outline" onClick={() => setModalRoom(null)}>{tStaff('cancel')}</button>
          <button className="btn btn-primary" disabled={saving || !form.feed_url} onClick={addFeed}>{saving ? tStaff('saving') : t('addFeed')}</button>
        </>}>
        <form onSubmit={addFeed}>
          <Select label={t('source')} value={form.source_name} onChange={e => setForm({ ...form, source_name: e.target.value })}>
            <option value="airbnb">Airbnb</option>
            <option value="booking_com">Booking.com</option>
            <option value="other">{t('other')}</option>
          </Select>
          <Input label={t('calendarExportUrl')} required placeholder="https://www.airbnb.com/calendar/ical/....ics"
            value={form.feed_url} onChange={e => setForm({ ...form, feed_url: e.target.value })} />
          <p style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginTop: '-0.5rem' }}>
            {t('findThisHint')}
          </p>
        </form>
      </Modal>
    </div>
  )
}

export const dynamic = 'force-dynamic'
