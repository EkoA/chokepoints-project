import React from 'react'
import { useAtlasStore } from '../store/useAtlasStore'
import type { Mode } from '../types'

export function ModeBar() {
  const { mode, setMode } = useAtlasStore()

  const pill = (m: Mode, label: string, shortLabel?: string) => (
    <button
      onClick={() => setMode(m)}
      style={{
        fontSize: 11, fontWeight: 500, padding: '5px 14px',
        borderRadius: 20, border: `1px solid ${mode === m ? 'var(--ink)' : 'var(--rule2)'}`,
        background: mode === m ? 'var(--ink)' : 'transparent',
        color: mode === m ? '#fff' : 'var(--ink3)',
        cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
        transition: 'all .15s', whiteSpace: 'nowrap',
      }}
    >
      {shortLabel ? (
        <>
          <span className="hidden sm:inline">{label}</span>
          <span className="sm:hidden">{shortLabel}</span>
        </>
      ) : label}
    </button>
  )

  return (
    <div
      className="flex items-center gap-2 sm:gap-4 flex-shrink-0 z-[90] px-3 sm:px-4 overflow-x-auto"
      style={{
        height: 40,
        background: 'var(--paper2)',
        borderBottom: '1px solid var(--rule)',
        scrollbarWidth: 'none',
      }}
    >
      <span style={{ fontSize: 11, color: 'var(--ink3)', letterSpacing: '0.04em', flexShrink: 0 }}>Mode:</span>
      <div className="flex gap-1.5 flex-shrink-0">
        {pill('explore', 'Explore')}
        {pill('scenario', 'Scenario — if this breaks…', 'Scenario')}
      </div>

      {/* Shape key — hidden on small screens */}
      <div className="hidden sm:flex items-center gap-1" style={{ flexShrink: 0 }}>
        <div style={{ width: 1, height: 20, background: 'var(--rule)', marginRight: 12 }} />
        <div className="flex items-center gap-4" style={{ fontSize: 11, color: 'var(--ink3)' }}>
          <div className="flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 12 12">
              <circle cx="6" cy="6" r="5" fill="#1565c0" opacity=".8" />
            </svg>
            <span>Physical chokepoint</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 14 14">
              <polygon points="7,1 13,7 7,13 1,7" fill="none" stroke="#c62828" strokeWidth="2" />
            </svg>
            <span>Institutional chokepoint</span>
          </div>
        </div>
      </div>
    </div>
  )
}
