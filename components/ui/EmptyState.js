'use client'
export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="empty-state">
      {icon && <div style={{ fontSize:'2.5rem', marginBottom:'0.75rem' }}>{icon}</div>}
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action && <div style={{ marginTop:'1rem' }}>{action}</div>}
    </div>
  )
}
