'use client'
export function FormField({ label, error, required, children, hint }) {
  return (
    <div style={{ marginBottom:'1rem' }}>
      {label && (
        <label className="label">
          {label}{required && <span style={{ color:'var(--orange)', marginLeft:2 }}>*</span>}
        </label>
      )}
      {children}
      {hint && <p style={{ fontSize:'0.75rem', color:'var(--gray-400)', marginTop:'0.25rem' }}>{hint}</p>}
      {error && <p style={{ fontSize:'0.75rem', color:'var(--danger)', marginTop:'0.25rem' }}>{error}</p>}
    </div>
  )
}

export function Input({ label, error, required, hint, ...props }) {
  return (
    <FormField label={label} error={error} required={required} hint={hint}>
      <input className="input" {...props} />
    </FormField>
  )
}

export function Select({ label, error, required, hint, children, ...props }) {
  return (
    <FormField label={label} error={error} required={required} hint={hint}>
      <select className="select" {...props}>{children}</select>
    </FormField>
  )
}

export function Textarea({ label, error, required, hint, ...props }) {
  return (
    <FormField label={label} error={error} required={required} hint={hint}>
      <textarea className="input" rows={3} style={{ resize:'vertical' }} {...props} />
    </FormField>
  )
}
