export type LayerKey = 'maritime' | 'cables' | 'financial' | 'tech' | 'energy'
export type CategoryType = 'physical' | 'institutional' | 'hidden'
export type RiskLevel = 'critical' | 'high' | 'moderate'
export type Mode = 'explore' | 'scenario'
export type TileSource = 'openfreemap' | 'cartodb'

export interface CascadeLink {
  id: string
  layer: string
  effect: string
}

export interface Node {
  id: string
  name: string
  lat: number
  lon: number
  category: CategoryType
  layer: LayerKey
  plain: string
  what: string
  why: string
  disruption: string
  realEvent?: string
  risk: RiskLevel
  source: string
  cascades: CascadeLink[]
  // maritime stats
  tot?: number
  con?: number
  tank?: number
  bulk?: number
  // scale metric
  flow?: string
  metric?: string
  // cables
  cables?: number
  // location info
  country?: string
  type?: string
  // institutional
  institutional_note?: string
  // image
  image?: string
  imageCredit?: string
}
