import type { Item, ItemCategory, ItemLink, ImpactBasis, Node, TimeBand } from '../types'
import items from '../data/items.json'

export const ALL_ITEMS = items as Item[]

export const ITEM_CATEGORY_LABELS: Record<ItemCategory, string> = {
  food:      'Food & drink',
  transport: 'Getting around',
  home:      'Home & energy',
  money:     'Money',
  digital:   'Digital life',
  health:    'Health',
}

export const ITEM_CATEGORY_ORDER: ItemCategory[] = [
  'food', 'transport', 'home', 'money', 'digital', 'health',
]

// ── Time to impact ───────────────────────────────────────────────────────────
// Sorting by how fast a disruption reaches the reader is the point of the
// feature: "you'd feel this in days" lands harder than any severity score.

export const TIME_BAND_ORDER: Record<TimeBand, number> = {
  days: 0, weeks: 1, months: 2, years: 3,
}

export const TIME_BAND_LABELS: Record<TimeBand, string> = {
  days:   'Within days',
  weeks:  'Within weeks',
  months: 'Within months',
  years:  'Years out',
}

export const TIME_BAND_COLORS: Record<TimeBand, string> = {
  days:   '#c62828',
  weeks:  '#e65100',
  months: '#b7791f',
  years:  '#6b7280',
}

// ── Evidential basis ─────────────────────────────────────────────────────────
// The atlas cites a named source on every node. The item layer inherits that
// discipline: each link says how well supported it is, in the reader's view.

export const BASIS_LABELS: Record<ImpactBasis, string> = {
  observed:     'Observed',
  estimated:    'Estimated',
  illustrative: 'Illustrative',
}

export const BASIS_HINTS: Record<ImpactBasis, string> = {
  observed:     'This has measurably happened before.',
  estimated:    'Inferred from the node’s documented role, not directly measured.',
  illustrative: 'A plausible mechanism shown to explain the chain — not a claim.',
}

export const BASIS_COLORS: Record<ImpactBasis, string> = {
  observed:     '#2e7d32',
  estimated:    '#b7791f',
  illustrative: '#6b7280',
}

// ── Lookups ──────────────────────────────────────────────────────────────────

export function getItem(id: string | null): Item | null {
  if (!id) return null
  return ALL_ITEMS.find((i) => i.id === id) ?? null
}

/** Links for an item, fastest-biting first. */
export function sortedLinks(item: Item): ItemLink[] {
  return [...item.dependsOn].sort(
    (a, b) => TIME_BAND_ORDER[a.timeToImpact] - TIME_BAND_ORDER[b.timeToImpact]
  )
}

/** The node ids an item touches — drives map highlighting. */
export function itemNodeIdSet(item: Item | null): Set<string> {
  return new Set(item ? item.dependsOn.map((l) => l.nodeId) : [])
}

/**
 * Reverse index: nodeId → the items that depend on it, with the link that
 * connects them. This is what makes "what does this node break?" answerable
 * from any node panel. Built once at module load.
 */
export interface ReverseEntry {
  item: Item
  link: ItemLink
}

const REVERSE_INDEX: Record<string, ReverseEntry[]> = (() => {
  const idx: Record<string, ReverseEntry[]> = {}
  for (const item of ALL_ITEMS) {
    for (const link of item.dependsOn) {
      ;(idx[link.nodeId] ??= []).push({ item, link })
    }
  }
  // Fastest-biting first, so the most arresting entry leads.
  for (const list of Object.values(idx)) {
    list.sort(
      (a, b) =>
        TIME_BAND_ORDER[a.link.timeToImpact] - TIME_BAND_ORDER[b.link.timeToImpact]
    )
  }
  return idx
})()

export function itemsForNode(nodeId: string): ReverseEntry[] {
  return REVERSE_INDEX[nodeId] ?? []
}

/** Items grouped into the category order used by the browser. */
export function itemsByCategory(): { category: ItemCategory; items: Item[] }[] {
  return ITEM_CATEGORY_ORDER.map((category) => ({
    category,
    items: ALL_ITEMS.filter((i) => i.category === category),
  })).filter((g) => g.items.length > 0)
}

/** The fastest band across an item's links — used for the browser card badge. */
export function fastestBand(item: Item): TimeBand {
  return item.dependsOn.reduce<TimeBand>(
    (fastest, l) =>
      TIME_BAND_ORDER[l.timeToImpact] < TIME_BAND_ORDER[fastest] ? l.timeToImpact : fastest,
    'years'
  )
}

/**
 * Evidence shown beside an `observed` badge.
 *
 * A link may carry its own evidence. Where it does not, the claim is still
 * backed — by the node's own sourced historical record — so we inherit that
 * rather than leave an "Observed" badge asserting something the reader cannot
 * check. Inherited text is attributed differently in the UI, because it
 * describes the node's history and not this item's specifically.
 *
 * An `observed` link with neither is a data error; `basis` should be
 * `estimated` instead. Guarded by scripts/validateItems.mjs.
 */
export function resolveEvidence(
  link: ItemLink,
  node: Node | undefined
): { text: string; inherited: boolean } | null {
  if (link.evidence) return { text: link.evidence, inherited: false }
  if (link.basis === 'observed' && node?.realEvent) {
    return { text: node.realEvent, inherited: true }
  }
  return null
}
