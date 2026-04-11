import React, { useEffect, useState } from 'react'
import type { RiskLevel } from '../types'

const RISK_CFG: Record<RiskLevel, { label: string; width: string; color: string }> = {
  critical: { label: '⚠ Critical Risk', width: '100%', color: 'var(--crit)' },
  high:     { label: '▲ High Risk',     width: '66%',  color: 'var(--high)' },
  moderate: { label: '◆ Moderate Risk', width: '33%',  color: 'var(--mod)' },
}

export function RiskMeter({ risk }: { risk: RiskLevel }) {
  const cfg = RISK_CFG[risk]
  const [barWidth, setBarWidth] = useState('0%')

  useEffect(() => {
    const id = requestAnimationFrame(() => setBarWidth(cfg.width))
    return () => cancelAnimationFrame(id)
  }, [cfg.width])

  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 600, color: cfg.color }}>
        {cfg.label}
      </div>
      <div style={{ height: 5, background: 'var(--rule)', borderRadius: 3, overflow: 'hidden', marginTop: 8 }}>
        <div style={{ height: '100%', borderRadius: 3, background: cfg.color, width: barWidth, transition: 'width 0.5s ease' }} />
      </div>
    </div>
  )
}
