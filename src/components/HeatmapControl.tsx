import React from 'react'
import { useAtlasStore } from '../store/useAtlasStore'
import type { HeatmapField } from '../types'

const COMMODITIES: { field: Exclude<HeatmapField, 'off'>; label: string }[] = [
  { field: 'tot',  label: 'All Traffic' },
  { field: 'tank', label: 'Oil & LNG'   },
  { field: 'con',  label: 'Containers'  },
  { field: 'bulk', label: 'Bulk Cargo'  },
]

const LEGEND_GRADIENT =
  'linear-gradient(to right, rgba(255,200,50,0.35), rgba(255,140,20,0.65), rgba(210,50,10,0.85), rgba(100,0,0,1))'

export function HeatmapControl() {
  const { heatmapField, setHeatmapField, activeLayers, isEmbed } = useAtlasStore()

  if (isEmbed) return null

  const hasData = activeLayers.has('maritime')
  const activeLabel = COMMODITIES.find((c) => c.field === heatmapField)?.label

  return (
    <div
      style={{
        position: 'absolute', top: 14, right: 14, zIndex: 50,
        background: 'rgba(22,18,14,.82)',
        border: '1px solid rgba(255,255,255,.08)',
        borderRadius: 5, padding: '10px 12px',
        fontFamily: 'DM Sans, sans-serif',
        backdropFilter: 'blur(4px)',
        minWidth: 148,
      }}
    >
      <div style={{
        fontSize: 9, letterSpacing: '.14em', textTransform: 'uppercase',
        color: 'rgba(255,255,255,.28)', marginBottom: 8, fontWeight: 500,
      }}>
        Traffic Heat
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {COMMODITIES.map(({ field, label }) => {
          const active = heatmapField === field
          return (
            <button
              key={field}
              onClick={() => setHeatmapField(active ? 'off' : field)}
              disabled={!hasData}
              style={{
                fontSize: 10, fontWeight: 500, padding: '3px 9px',
                borderRadius: 12,
                border: `1px solid ${active ? 'rgba(220,100,20,0.9)' : 'rgba(255,255,255,.15)'}`,
                background: active ? 'rgba(210,80,10,0.9)' : 'transparent',
                color: !hasData ? 'rgba(255,255,255,.2)' : active ? '#fff' : 'rgba(255,255,255,.6)',
                cursor: !hasData ? 'default' : 'pointer',
                transition: 'all .15s',
              }}
            >
              {label}
            </button>
          )
        })}
      </div>

      {!hasData && (
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,.28)', marginTop: 7, fontStyle: 'italic' }}>
          Enable shipping layer for data
        </div>
      )}

      {heatmapField !== 'off' && (
        <div style={{ marginTop: 10 }}>
          <div style={{ height: 7, borderRadius: 3, background: LEGEND_GRADIENT, marginBottom: 5 }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'rgba(255,255,255,.35)' }}>
            <span>Low</span>
            <span style={{ color: 'rgba(255,255,255,.5)' }}>{activeLabel}</span>
            <span>High</span>
          </div>
        </div>
      )}
    </div>
  )
}
