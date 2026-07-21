'use client'
export function Spinner({ size = 20, color = 'var(--gold)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
      strokeWidth="2.5" strokeLinecap="round"
      style={{ animation:'spin 0.7s linear infinite' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  )
}

export function PageLoader() {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh', flexDirection:'column', gap:'1rem' }}>
      <Spinner size={36} />
      <p style={{ color:'var(--gray-400)', fontSize:'0.875rem' }}>Loading…</p>
    </div>
  )
}
