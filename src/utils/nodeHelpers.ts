import type { Node, LayerKey } from '../types'

export const LAYER_COLORS: Record<LayerKey, string> = {
  maritime:  '#1565c0',
  cables:    '#6a1b9a',
  financial: '#b7791f',
  tech:      '#c62828',
  energy:    '#2e7d32',
}

export const LAYER_LABELS: Record<LayerKey, string> = {
  maritime:  '🚢 Shipping Lane',
  cables:    '🌐 Internet Cable Hub',
  financial: '💰 Financial Network',
  tech:      '💻 Technology',
  energy:    '⚡ Energy',
}

export const LAYER_NAMES: Record<LayerKey, string> = {
  maritime:  'Shipping Lanes',
  cables:    'Internet Cables',
  financial: 'Financial',
  tech:      'Technology',
  energy:    'Energy',
}

export const LAYER_HINTS: Record<LayerKey, string> = {
  maritime:  'Physical straits & canals',
  cables:    'Undersea cable hubs',
  financial: 'Payment & clearing systems',
  tech:      'Chips, OS & platforms',
  energy:    'Oil, gas & pipelines',
}

export const LAYER_DESCS: Record<LayerKey, string> = {
  maritime:  'Physical straits where ships must pass. Close one and global trade breaks within days.',
  cables:    'Undersea cable hubs where the physical internet is most concentrated and fragile.',
  financial: 'Institutional systems that move money internationally. Cut a country off and its economy can collapse in days.',
  tech:      'Chips, operating systems and platforms that run the global economy — controlled by a handful of companies.',
  energy:    'Pipelines and transit points where disruption sends fuel prices spiralling globally.',
}

export const LAYER_EMOJIS: Record<LayerKey, string> = {
  maritime:  '🚢',
  cables:    '🌐',
  financial: '💰',
  tech:      '💻',
  energy:    '⚡',
}

export function markerRadius(node: Node): number {
  if (node.layer === 'maritime' && node.tot) {
    if (node.tot > 60000) return 13
    if (node.tot > 30000) return 10
    if (node.tot > 10000) return 8
    return 7
  }
  if (node.layer === 'cables' && node.cables) {
    const r = 7 + (node.cables / 100) * 6
    return Math.min(13, Math.max(7, r))
  }
  return 10
}

export function fmtN(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
  return String(n)
}

// Build a lookup map: nodeId → count of how many other nodes cascade into it
export function buildReferenceCount(nodes: Node[]): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const node of nodes) {
    for (const c of node.cascades) {
      counts[c.id] = (counts[c.id] || 0) + 1
    }
  }
  return counts
}
