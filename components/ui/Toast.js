'use client'
import { useState, useCallback, useEffect } from 'react'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'

export function useToast() {
  const [toasts, setToasts] = useState([])
  const show = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now()
    setToasts(p => [...p, { id, message, type }])
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), duration)
  }, [])
  const remove = useCallback((id) => setToasts(p => p.filter(t => t.id !== id)), [])
  return { toasts, show, remove,
    success: (m, d) => show(m, 'success', d),
    error:   (m, d) => show(m, 'error', d),
    info:    (m, d) => show(m, 'info', d),
    warning: (m, d) => show(m, 'warning', d),
  }
}

const ICONS = {
  success: <CheckCircle size={18} />,
  error:   <XCircle size={18} />,
  warning: <AlertCircle size={18} />,
  info:    <Info size={18} />,
}

export function ToastContainer({ toasts, remove }) {
  if (!toasts?.length) return null
  return (
    <div style={{ position:'fixed', bottom:'1.5rem', right:'1.5rem', zIndex:9999, display:'flex', flexDirection:'column', gap:'0.5rem' }}>
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          {ICONS[t.type]}
          <span style={{ flex:1 }}>{t.message}</span>
          <button onClick={() => remove(t.id)} style={{ background:'none', border:'none', cursor:'pointer', padding:'0 0 0 0.5rem', opacity:0.6 }}>
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
