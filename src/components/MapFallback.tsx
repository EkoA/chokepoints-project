import React from 'react'
import { useAtlasStore } from '../store/useAtlasStore'

export function TileFallbackBadge() {
  const tileSource = useAtlasStore((s) => s.tileSource)
  if (tileSource === 'openfreemap') return null

  return (
    <div
      style={{
        position: 'absolute', bottom: 14, left: 14, zIndex: 50,
        background: 'rgba(22,18,14,.75)',
        border: '1px solid rgba(255,255,255,.12)',
        borderRadius: 4, padding: '5px 10px',
        fontSize: 10, color: 'rgba(255,255,255,.5)',
        fontFamily: 'DM Sans, sans-serif',
        letterSpacing: '.02em',
      }}
    >
      Using fallback map tiles
    </div>
  )
}
