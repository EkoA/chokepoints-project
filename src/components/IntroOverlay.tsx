import React, { useState } from 'react'
import { useAtlasStore } from '../store/useAtlasStore'
import type { Node } from '../types'
import nodes from '../data/nodes.json'

const ALL_NODES = nodes as Node[]
const STORAGE_KEY = 'atlas-intro-dismissed'

function shouldSkipIntro() {
  if (new URLSearchParams(window.location.search).has('node')) return true
  try { return localStorage.getItem(STORAGE_KEY) === '1' } catch { return false }
}

const STAT_CARDS = [
  { emoji: '🚢', text: 'A single ship ran aground in Egypt and held up $10B of goods — every day' },
  { emoji: '💳', text: 'Two US companies cut off 100M Russian bank cards in 72 hours' },
  { emoji: '🛢️', text: 'A fifth of the world\'s oil passes through a gap just 33km wide' },
]

export function IntroOverlay() {
  const [dismissed, setDismissed] = useState(shouldSkipIntro)
  const [fading, setFading] = useState(false)

  const dismiss = () => {
    setFading(true)
    try { localStorage.setItem(STORAGE_KEY, '1') } catch { /* ignore */ }
    setTimeout(() => setDismissed(true), 600)
  }

  const dismissAndOpenSuez = () => {
    const suezNode = ALL_NODES.find((n) => n.id === 'suez')
    if (suezNode) {
      const cascadeIds = new Set(suezNode.cascades.map((c) => c.id))
      useAtlasStore.setState({ selectedNodeId: 'suez', cascadeNodeIds: cascadeIds })
    }
    dismiss()
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
      <style>{`
        @media (min-width: 640px) {
          .intro-stat-cards { flex-direction: row !important; }
        }
      `}</style>
      <div
        style={{ width: '100%', maxWidth: 620, textAlign: 'center', padding: 'clamp(28px, 6vw, 48px) clamp(20px, 6vw, 32px)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Eyebrow */}
        <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'rgba(255,255,255,.28)', marginBottom: 18 }}>
          Global Infrastructure Atlas
        </div>

        {/* Headline */}
        <div style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(30px, 8vw, 52px)', fontWeight: 700, color: '#fff', lineHeight: 1.08, marginBottom: 'clamp(14px, 3vw, 20px)' }}>
          The world is more fragile<br />than you think
        </div>

        {/* Subheading */}
        <p style={{ fontSize: 'clamp(13px, 3.5vw, 15px)', color: 'rgba(255,255,255,.52)', lineHeight: 1.78, maxWidth: 460, margin: '0 auto clamp(24px, 5vw, 36px)' }}>
          Your energy bills, your deliveries, your phone signal — all of them depend on a handful of places most people have never heard of. This map shows you where they are.
        </p>

        {/* Stat cards */}
        <div
          className="intro-stat-cards"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            marginBottom: 'clamp(24px, 5vw, 36px)',
            textAlign: 'left',
          }}
        >
          {STAT_CARDS.map((card, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                background: 'rgba(255,255,255,.05)',
                border: '1px solid rgba(255,255,255,.11)',
                borderRadius: 6,
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
              }}
            >
              <span style={{ fontSize: 20, lineHeight: 1, flexShrink: 0, marginTop: 1 }}>{card.emoji}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,.82)', lineHeight: 1.45 }}>{card.text}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={dismissAndOpenSuez}
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
          Show me where the world breaks →
        </button>
      </div>
    </div>
  )
}
