import React from 'react'
import { useAtlasStore } from '../store/useAtlasStore'
import { LAYER_COLORS, LAYER_NAMES, LAYER_HINTS } from '../utils/nodeHelpers'
import type { LayerKey } from '../types'

const LAYERS: LayerKey[] = ['maritime', 'cables', 'financial', 'tech', 'energy']

export function TopBar() {
  const { activeLayers, toggleLayer } = useAtlasStore()

  return (
    <div
      className="flex items-stretch flex-shrink-0 z-10"
      style={{ height: 52, background: 'var(--ink)', borderBottom: '1px solid rgba(255,255,255,.06)' }}
    >
      {/* Brand */}
      <div
        className="flex items-center gap-2.5 px-5 flex-shrink-0"
        style={{ borderRight: '1px solid rgba(255,255,255,.07)' }}
      >
        <div style={{ fontFamily: 'Fraunces, serif', fontSize: 15, fontWeight: 600, color: '#fff' }}>
          Chokepoints
        </div>
      </div>

      {/* Layer tabs — scrollable with right fade mask on narrow viewports */}
      <div style={{ position: 'relative', flex: 1, overflow: 'hidden' }}>
        <div className="flex h-full overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {LAYERS.map((layer) => {
          const on = activeLayers.has(layer)
          const color = LAYER_COLORS[layer]
          return (
            <button
              key={layer}
              onClick={() => toggleLayer(layer)}
              title={`Toggle ${LAYER_NAMES[layer]}`}
              className="flex items-center gap-2 px-4 h-full relative flex-shrink-0 border-none cursor-pointer transition-colors"
              style={{
                borderRight: '1px solid rgba(255,255,255,.06)',
                background: on ? 'rgba(255,255,255,.05)' : 'transparent',
              }}
            >
              {/* Pip */}
              <div
                style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: color,
                  opacity: on ? 1 : 0.15,
                  flexShrink: 0,
                }}
              />
              {/* Labels */}
              <div className="flex flex-col items-start">
                <span style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,.88)', opacity: on ? 1 : 0.2 }}>
                  {LAYER_NAMES[layer]}
                </span>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,.24)', marginTop: 1, opacity: on ? 1 : 0.2 }}>
                  {LAYER_HINTS[layer]}
                </span>
              </div>
              {/* Bottom bar */}
              <div
                style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  height: 2, background: color,
                  opacity: on ? 1 : 0,
                  transition: 'opacity .2s',
                }}
              />
            </button>
          )
        })}
        </div>
        {/* Fade mask — indicates scrollable overflow on narrow viewports */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', top: 0, right: 0, bottom: 0, width: 40,
            background: 'linear-gradient(to right, transparent, var(--ink))',
            pointerEvents: 'none',
          }}
        />
      </div>
    </div>
  )
}
