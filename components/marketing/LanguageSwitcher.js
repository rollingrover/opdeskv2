'use client'
import { useLocale } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/navigation'
import { useState } from 'react'
import { Globe } from 'lucide-react'

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'af', label: 'Afrikaans' },
  { code: 'zu', label: 'isiZulu' },
  { code: 'fr', label: 'Français' },
  { code: 'pt', label: 'Português' },
  { code: 'de', label: 'Deutsch' },
  { code: 'it', label: 'Italiano' },
]

export function LanguageSwitcher() {
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  function change(code) {
    setOpen(false)
    router.replace(pathname, { locale: code })
  }

  const current = LANGUAGES.find(l => l.code === locale) || LANGUAGES[0]

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(v => !v)}
        style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', padding: 0 }}>
        <Globe size={15} /> {current.code.toUpperCase()}
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 90 }} />
          <div style={{ position: 'absolute', top: '2rem', right: 0, background: 'white', borderRadius: '0.5rem', boxShadow: '0 8px 30px rgba(0,0,0,0.2)', overflow: 'hidden', zIndex: 100, minWidth: 140 }}>
            {LANGUAGES.map(l => (
              <button key={l.code} onClick={() => change(l.code)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left', padding: '0.625rem 0.875rem',
                  background: l.code === locale ? 'var(--cream)' : 'white', border: 'none', cursor: 'pointer',
                  fontSize: '0.8125rem', color: 'var(--navy)', fontWeight: l.code === locale ? 700 : 500,
                }}>
                {l.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
