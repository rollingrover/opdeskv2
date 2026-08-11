'use client'
export function OpDeskLogo({ size = 32, showText = true, white = false }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'0.625rem', textDecoration:'none' }}>
      {/* Inline SVG compass mark — avoids depending on /public/compass-icon.png,
          which doesn't exist yet and was causing a 404 on every page load.
          Drop a real compass-icon.png into /public and swap this back to an
          <img> tag whenever the brand asset is ready. */}
      <svg width={size} height={size} viewBox="0 0 32 32" style={{ borderRadius:'0.375rem', flexShrink:0 }}>
        <rect width="32" height="32" rx="7" fill={white ? 'rgba(255,255,255,0.12)' : 'var(--navy)'} />
        <circle cx="16" cy="16" r="10.5" fill="none" stroke="var(--gold)" strokeWidth="1.6" />
        <path d="M20 12 L14.5 14.5 L12 20 L17.5 17.5 Z" fill="var(--gold)" />
        <circle cx="16" cy="16" r="1.4" fill={white ? '#fff' : 'var(--cream)'} />
      </svg>
      {showText && (
        <span style={{ fontFamily:'Montserrat, sans-serif', fontWeight:800, fontSize: size * 0.55, lineHeight:1, letterSpacing:'-0.02em' }}>
          <span style={{ color: white ? 'white' : 'var(--orange)' }}>op</span>
          <span style={{ color: white ? 'rgba(255,255,255,0.9)' : 'var(--navy)' }}>desk</span>
        </span>
      )}
    </div>
  )
}
