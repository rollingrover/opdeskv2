'use client'
import { useEffect } from 'react'
import { X } from 'lucide-react'

export function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null
  const maxW = { sm:'420px', md:'560px', lg:'720px', xl:'900px' }[size]

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: maxW }}>
        <div className="modal-header">
          <h3 style={{ margin:0, fontSize:'1rem', fontWeight:700, color:'var(--navy)' }}>{title}</h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ padding:'0.25rem' }}>
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  )
}
