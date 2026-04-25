import { useAtlasStore } from '../store/useAtlasStore'
import { buildMainSiteUrl } from '../utils/embedUrl'

export function EmbedBadge() {
  const activeLayers = useAtlasStore((s) => s.activeLayers)
  const href = buildMainSiteUrl(activeLayers)

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="View full Chokepoints map"
      style={{
        position: 'absolute',
        bottom: 14,
        right: 14,
        zIndex: 60,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: 'rgba(22,18,14,.82)',
        border: '1px solid rgba(255,255,255,.12)',
        borderRadius: 4,
        padding: '7px 12px',
        textDecoration: 'none',
        backdropFilter: 'blur(4px)',
        color: '#fff',
        fontFamily: 'DM Sans, sans-serif',
        fontSize: 12,
        fontWeight: 500,
        letterSpacing: '0.01em',
        transition: 'background .15s',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(22,18,14,.95)' }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(22,18,14,.82)' }}
    >
      <span style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 13 }}>
        Chokepoints
      </span>
      <span style={{ color: 'rgba(255,255,255,.35)', fontSize: 10 }}>·</span>
      <span style={{ color: 'rgba(255,255,255,.65)', fontSize: 11 }}>
        View full map →
      </span>
    </a>
  )
}
