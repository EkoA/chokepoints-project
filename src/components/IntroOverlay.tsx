import React, { useState } from 'react'

const STORAGE_KEY = 'atlas-intro-dismissed'

function shouldSkipIntro() {
  if (new URLSearchParams(window.location.search).has('node')) return true
  try { return localStorage.getItem(STORAGE_KEY) === '1' } catch { return false }
}

export function IntroOverlay() {
  const [dismissed, setDismissed] = useState(shouldSkipIntro)
  const [fading, setFading] = useState(false)

  const dismiss = () => {
    setFading(true)
    try { localStorage.setItem(STORAGE_KEY, '1') } catch { /* ignore */ }
    setTimeout(() => setDismissed(true), 600)
  }

  if (dismissed) return null

  return (
    <div
      onClick={dismiss}
      style={{
        position: 'fixed', inset: 0, zIndex: 9000,
        background: '#16120e',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: fading ? 0 : 1,
        transition: 'opacity 0.6s ease',
        pointerEvents: fading ? 'none' : 'auto',
      }}
    >
      <div
        style={{ maxWidth: 540, textAlign: 'center', padding: 'clamp(28px, 6vw, 48px) clamp(20px, 6vw, 32px)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'rgba(255,255,255,.28)', marginBottom: 20 }}>
          Global Infrastructure Atlas
        </div>
        <div style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(36px, 10vw, 58px)', fontWeight: 700, color: '#fff', lineHeight: 1.06, marginBottom: 'clamp(18px, 4vw, 28px)' }}>
          Where the <em style={{ fontStyle: 'italic', fontWeight: 300, color: 'rgba(255,255,255,.4)' }}>World</em>
          <br />Breaks
        </div>
        <p style={{ fontSize: 'clamp(13px, 3.5vw, 15px)', color: 'rgba(255,255,255,.48)', lineHeight: 1.82, maxWidth: 420, margin: '0 auto 28px' }}>
          Global trade, the internet, financial markets and energy all depend on a surprisingly small number of places and systems. Some are geographic — ships must pass through a narrow strait. Others are institutional — one company controls access to a technology the world depends on. Both can be weaponised.
        </p>
        <button
          onClick={dismiss}
          style={{
            fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,.85)', cursor: 'pointer',
            border: '1px solid rgba(255,255,255,.25)', background: 'rgba(255,255,255,.07)',
            fontFamily: 'DM Sans, sans-serif',
            padding: '12px 32px', borderRadius: 4, transition: 'all .2s',
          }}
          onMouseEnter={(e) => {
            const btn = e.currentTarget
            btn.style.background = 'rgba(255,255,255,.14)'
            btn.style.borderColor = 'rgba(255,255,255,.45)'
          }}
          onMouseLeave={(e) => {
            const btn = e.currentTarget
            btn.style.background = 'rgba(255,255,255,.07)'
            btn.style.borderColor = 'rgba(255,255,255,.25)'
          }}
        >
          Explore the map →
        </button>
      </div>
    </div>
  )
}
