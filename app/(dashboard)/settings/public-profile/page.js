'use client'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { PageLoader } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input, Textarea } from '@/components/ui/FormField'
import { useToast, ToastContainer } from '@/components/ui/Toast'
import { BrandIcon } from '@/components/ui/BrandIcon'
import { Upload, Trash2, ExternalLink, Globe } from 'lucide-react'

function slugify(name) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export default function PublicProfileSettingsPage() {
  const t = useTranslations('SettingsPublicProfile')
  const tCommon = useTranslations('Common')
  const { company, needsCompany, reload } = useAuth()
  const supabase = createClient()
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [photos, setPhotos] = useState([])
  const [form, setForm] = useState({ public_profile_enabled: false, public_calendar_enabled: false, public_description: '', public_slug: '' })

  async function load() {
    if (!company) { setLoading(false); return }
    setForm({
      public_profile_enabled: company.public_profile_enabled || false,
      public_calendar_enabled: company.public_calendar_enabled || false,
      public_description: company.public_description || '',
      public_slug: company.public_slug || slugify(company.name),
    })
    const { data } = await supabase.from('company_photos').select('*').eq('company_id', company.id).order('sort_order')
    setPhotos(data || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [company])

  async function save(e) {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase.from('companies').update({
      public_profile_enabled: form.public_profile_enabled,
      public_calendar_enabled: form.public_calendar_enabled,
      public_description: form.public_description,
      public_slug: form.public_slug || slugify(company.name),
    }).eq('id', company.id)
    setSaving(false)
    if (error) { toast.error(error.code === '23505' ? t('urlTaken') : error.message); return }
    toast.success(t('profileSaved'))
    reload?.()
  }

  async function uploadPhoto(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error(t('photosTooLarge')); return }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { toast.error(t('photosWrongType')); return }
    if (photos.length >= 6) { toast.error(t('maxPhotos')); return }

    setUploading(true)
    const path = `${company.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '')}`
    const { error: uploadErr } = await supabase.storage.from('company-photos').upload(path, file)
    if (uploadErr) { setUploading(false); toast.error(uploadErr.message); return }

    const { error: dbErr } = await supabase.from('company_photos').insert([{ company_id: company.id, storage_path: path, sort_order: photos.length }])
    setUploading(false)
    if (dbErr) { toast.error(dbErr.message); return }
    toast.success(t('photoAdded'))
    load()
    e.target.value = ''
  }

  async function removePhoto(photo) {
    if (!confirm(t('removePhotoConfirm'))) return
    await supabase.storage.from('company-photos').remove([photo.storage_path])
    const { error } = await supabase.from('company_photos').delete().eq('id', photo.id)
    if (error) { toast.error(error.message); return }
    toast.success(t('photoRemoved'))
    load()
  }

  function photoUrl(path) {
    return supabase.storage.from('company-photos').getPublicUrl(path).data.publicUrl
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
      </div>

      <div style={{ background: 'var(--cream)', border: '1px solid var(--gray-100)', borderRadius: '0.75rem', padding: '0.875rem 1.125rem', marginBottom: '1.25rem', fontSize: '0.8125rem', color: 'var(--gray-500)' }}>
        {t('infoBanner')}
      </div>

      <form onSubmit={save} className="card card-shadow" style={{ marginBottom: '1.25rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem', cursor: 'pointer' }}>
          <input type="checkbox" checked={form.public_profile_enabled} onChange={e => setForm({ ...form, public_profile_enabled: e.target.checked })} />
          <div>
            <p style={{ margin: 0, fontWeight: 700, color: 'var(--navy)' }}>{t('listPublicly')}</p>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--gray-500)' }}>{t('listPubliclyDesc')}</p>
          </div>
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem', cursor: 'pointer' }}>
          <input type="checkbox" checked={form.public_calendar_enabled} onChange={e => setForm({ ...form, public_calendar_enabled: e.target.checked })} disabled={!form.public_profile_enabled} />
          <div>
            <p style={{ margin: 0, fontWeight: 700, color: form.public_profile_enabled ? 'var(--navy)' : 'var(--gray-400)' }}>{t('showCalendar')}</p>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--gray-500)' }}>{t('showCalendarDesc')}</p>
          </div>
        </label>

        <Input label={t('publicUrl')} value={form.public_slug} onChange={e => setForm({ ...form, public_slug: slugify(e.target.value) })}
          placeholder={slugify(company.name)} />
        <p style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginTop: '-0.5rem', marginBottom: '1rem' }}>
          opdesk.app/operators/<strong>{form.public_slug || slugify(company.name)}</strong>
        </p>

        <Textarea label={t('description')} rows={4} placeholder={t('descriptionPlaceholder')} value={form.public_description} onChange={e => setForm({ ...form, public_description: e.target.value })} />

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: '1rem' }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? t('saving') : t('save')}</button>
          {form.public_profile_enabled && (
            <a href={`/operators/${form.public_slug || slugify(company.name)}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
              <ExternalLink size={14} /> {t('viewPublicPage')}
            </a>
          )}
        </div>
      </form>

      <div className="card card-shadow">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '0.9375rem', color: 'var(--navy)' }}>{t('photosHeading')} ({photos.length}/6)</h3>
          <label className="btn btn-outline btn-sm" style={{ cursor: photos.length >= 6 ? 'not-allowed' : 'pointer', opacity: photos.length >= 6 ? 0.5 : 1 }}>
            <Upload size={14} /> {uploading ? t('uploading') : t('addPhoto')}
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadPhoto} disabled={uploading || photos.length >= 6} style={{ display: 'none' }} />
          </label>
        </div>
        {photos.length === 0 ? (
          <EmptyState icon={<Globe size={40} color="var(--gray-400)" />} title={t('noPhotosTitle')} description={t('noPhotosDesc')} />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem' }}>
            {photos.map(p => (
              <div key={p.id} style={{ position: 'relative', borderRadius: '0.5rem', overflow: 'hidden', aspectRatio: '4/3', background: 'var(--gray-50)' }}>
                <img src={photoUrl(p.storage_path)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button onClick={() => removePhoto(p)} style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '0.375rem', padding: '0.25rem', cursor: 'pointer', color: 'white' }}>
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export const dynamic = 'force-dynamic'
