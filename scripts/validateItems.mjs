#!/usr/bin/env node
/**
 * Integrity check for the everyday-items layer.
 *
 * The atlas cites a named source on every node; the item layer inherits that
 * discipline. This guards the invariants that keep it honest as items are
 * added — most importantly that nothing is badged "Observed" unless something
 * in the data actually backs it.
 *
 * Run: npm run validate:items
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const read = (p) => JSON.parse(readFileSync(resolve(here, '..', p), 'utf8'))

const items = read('src/data/items.json')
const nodes = read('src/data/nodes.json')
const nodeById = new Map(nodes.map((n) => [n.id, n]))

const CATEGORIES = new Set(['food', 'transport', 'home', 'money', 'digital', 'health'])
const BANDS = new Set(['days', 'weeks', 'months', 'years'])
const BASES = new Set(['observed', 'estimated', 'illustrative'])

const errors = []
const warnings = []
const seenItemIds = new Set()

for (const item of items) {
  const where = `item "${item.id ?? '(no id)'}"`

  for (const field of ['id', 'name', 'emoji', 'category', 'headline', 'noticeWhen']) {
    if (!item[field]) errors.push(`${where}: missing "${field}"`)
  }
  if (seenItemIds.has(item.id)) errors.push(`${where}: duplicate item id`)
  seenItemIds.add(item.id)

  if (!CATEGORIES.has(item.category)) {
    errors.push(`${where}: unknown category "${item.category}"`)
  }
  if (!Array.isArray(item.dependsOn) || item.dependsOn.length === 0) {
    errors.push(`${where}: must depend on at least one node`)
    continue
  }

  const seenNodeIds = new Set()
  for (const link of item.dependsOn) {
    const at = `${where} → "${link.nodeId}"`
    const node = nodeById.get(link.nodeId)

    if (!node) errors.push(`${at}: no such node in nodes.json`)
    if (seenNodeIds.has(link.nodeId)) errors.push(`${at}: duplicate link to the same node`)
    seenNodeIds.add(link.nodeId)

    if (!link.via?.trim()) errors.push(`${at}: missing "via" (the mechanism)`)
    if (!BANDS.has(link.timeToImpact)) errors.push(`${at}: bad timeToImpact "${link.timeToImpact}"`)
    if (!BASES.has(link.basis)) errors.push(`${at}: bad basis "${link.basis}"`)

    // The core rule: an "Observed" badge must be backed by something the
    // reader can actually check — either the link's own evidence, or the
    // node's sourced historical record, which the UI inherits and attributes.
    if (link.basis === 'observed' && !link.evidence && !node?.realEvent) {
      errors.push(
        `${at}: basis is "observed" but neither the link nor the node carries ` +
        `evidence. Add evidence, or change basis to "estimated".`
      )
    }

    // Evidence on a non-observed link reads as a stronger claim than the badge.
    if (link.basis !== 'observed' && link.evidence) {
      warnings.push(`${at}: has evidence text but basis is "${link.basis}"`)
    }
  }
}

// Every node should be reachable from at least one item, or the reverse view
// ("what does this node reach?") is empty for a reader who lands there.
const linked = new Set(items.flatMap((i) => i.dependsOn.map((l) => l.nodeId)))
for (const node of nodes) {
  if (!linked.has(node.id)) {
    warnings.push(`node "${node.id}" (${node.name}) is not reached by any item`)
  }
}

const linkCount = items.reduce((n, i) => n + i.dependsOn.length, 0)

for (const w of warnings) console.warn(`  warn  ${w}`)
for (const e of errors) console.error(`  ERROR ${e}`)

if (errors.length > 0) {
  console.error(`\n✗ ${errors.length} error(s) in the item layer.`)
  process.exit(1)
}
console.log(
  `✓ items OK — ${items.length} items, ${linkCount} links, ` +
  `${linked.size}/${nodes.length} nodes reached` +
  (warnings.length ? `, ${warnings.length} warning(s)` : '')
)
