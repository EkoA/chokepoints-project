export type LayerKey = 'maritime' | 'cables' | 'financial' | 'tech' | 'energy'
export type CategoryType = 'physical' | 'institutional' | 'hidden'
export type RiskLevel = 'critical' | 'high' | 'moderate'
export type Mode = 'explore' | 'scenario' | 'everyday'
export type TileSource = 'openfreemap' | 'cartodb'
export type HeatmapField = 'off' | 'tot' | 'tank' | 'con' | 'bulk'

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

// ── Everyday items ───────────────────────────────────────────────────────────
// The consumer-facing layer: ordinary things people buy or do, linked to the
// nodes they depend on. Authored in src/data/items.json.

export type ItemCategory = 'food' | 'transport' | 'home' | 'money' | 'digital' | 'health'

/** How quickly a disruption at the node reaches the item. */
export type TimeBand = 'days' | 'weeks' | 'months' | 'years'

/**
 * Evidential standing of a link, shown to the reader as a badge.
 * - observed:    it has measurably happened, and `evidence` says when.
 * - estimated:   a well-supported inference from the node's documented role.
 * - illustrative: a plausible mechanism offered to explain the chain, not a claim.
 */
export type ImpactBasis = 'observed' | 'estimated' | 'illustrative'

export interface ItemLink {
  nodeId: string
  /** How this node reaches this item — one sentence, mechanism first. */
  via: string
  timeToImpact: TimeBand
  basis: ImpactBasis
  /** Required in practice for `observed`; what actually happened. */
  evidence?: string
}

export interface Item {
  id: string
  name: string
  emoji: string
  category: ItemCategory
  /** The hook — why this item is worth looking at. */
  headline: string
  /** The concrete symptom a reader would actually experience. */
  noticeWhen: string
  dependsOn: ItemLink[]
}
