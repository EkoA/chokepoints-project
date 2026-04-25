import type { LayerKey } from '../types'

const ALL_LAYER_KEYS: LayerKey[] = ['maritime', 'cables', 'financial', 'tech', 'energy']

function getBase(): string {
  return (window.location.origin + import.meta.env.BASE_URL).replace(/\/$/, '')
}

export function buildMainSiteUrl(activeLayers: Set<LayerKey>, nodeId?: string | null): string {
  const params = new URLSearchParams()
  if (nodeId) params.set('node', nodeId)
  const layers = Array.from(activeLayers)
  if (layers.length < ALL_LAYER_KEYS.length) params.set('layers', layers.join(','))
  const qs = params.toString()
  return qs ? `${getBase()}/?${qs}` : `${getBase()}/`
}

export function buildEmbedSrc(activeLayers: Set<LayerKey>, selectedNodeId: string | null): string {
  const params = new URLSearchParams()
  params.set('embed', '1')
  const layers = Array.from(activeLayers)
  if (layers.length < ALL_LAYER_KEYS.length) params.set('layers', layers.join(','))
  if (selectedNodeId) params.set('node', selectedNodeId)
  return `${getBase()}/?${params.toString()}`
}
