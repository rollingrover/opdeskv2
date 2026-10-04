'use client'
import { useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { FileUp, FileText } from 'lucide-react'

// Upload / view a compliance document in the private `documents` bucket.
// Path: <company_id>/<table>/<row_id>-<timestamp>-<file> (storage RLS only
// allows a company's own folder). Stores the path on the row.
export default function DocButton({ companyId, table, rowId, column, path, canUpload, onChange, toast }) {
  const t = useTranslations('Compliance')
  const supabase = createClient()
  const input = useRef(null)
  const [busy, setBusy] = useState(false)

  async function view() {
    const { data, error } = await supabase.storage.from('documents').createSignedUrl(path, 300)
    if (error) { toast.error(error.message); return }
    window.open(data.signedUrl, '_blank', 'noopener')
  }
  async function upload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { toast.error(t('tooLarge')); return }
    setBusy(true)
    const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-80)
    const p = `${companyId}/${table}/${rowId}-${Date.now()}-${safe}`
    const { error } = await supabase.storage.from('documents').upload(p, file, { upsert: false, contentType: file.type || undefined })
    if (error) { setBusy(false); toast.error(error.message); return }
    const { error: e2 } = await supabase.from(table).update({ [column]: p }).eq('id', rowId)
    if (!e2 && path) await supabase.storage.from('documents').remove([path]) // replace old file
    setBusy(false)
    if (e2) toast.error(e2.message); else { toast.success(t('uploaded')); onChange?.() }
    e.target.value = ''
  }
  return (
    <span style={{ display: 'inline-flex', gap: '0.375rem' }}>
      {path && <button className="btn btn-outline btn-sm" onClick={view}><FileText size={14} /> {t('view')}</button>}
      {canUpload && (
        <>
          <button className="btn btn-outline btn-sm" disabled={busy} onClick={() => input.current?.click()}><FileUp size={14} /> {busy ? t('uploading') : path ? t('replace') : t('upload')}</button>
          <input ref={input} type="file" accept=".pdf,image/*" hidden onChange={upload} />
        </>
      )}
    </span>
  )
}
