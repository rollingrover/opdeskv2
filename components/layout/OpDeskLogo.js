'use client'
export function OpDeskLogo({ size = 32, showText = true, white = false }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'0.625rem', textDecoration:'none' }}>
      <img src="/compass-icon.png" alt="OpDesk" width={size} height={size}
        style={{ borderRadius:'0.375rem', flexShrink:0 }} />
      {showText && (
        <span style={{ fontFamily:'Montserrat, sans-serif', fontWeight:800, fontSize: size * 0.55, lineHeight:1, letterSpacing:'-0.02em' }}>
          <span style={{ color: white ? 'white' : 'var(--orange)' }}>op</span>
          <span style={{ color: white ? 'rgba(255,255,255,0.9)' : 'var(--navy)' }}>desk</span>
        </span>
      )}
    </div>
  )
}
