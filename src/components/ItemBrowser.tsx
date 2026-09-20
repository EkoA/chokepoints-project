import React from 'react'
import { useAtlasStore } from '../store/useAtlasStore'
import {
  ALL_ITEMS,
  ITEM_CATEGORY_LABELS,
  TIME_BAND_COLORS,
  TIME_BAND_LABELS,
  fastestBand,
  itemNodeIdSet,
  itemsByCategory,
} from '../utils/itemHelpers'
import type { Item } from '../types'

const TOTAL_LINKS = ALL_ITEMS.reduce((n, i) => n + i.dependsOn.length, 0)

export function ItemBrowser() {
  const groups = itemsByCategory()

  return (
    <div className="panel-scroll flex-1 flex flex-col gap-5" style={{ padding: '26px 24px' }}>
      <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 25, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.22 }}>
        What does<br />
        <em style={{ fontStyle: 'italic', fontWeight: 300, color: 'var(--ink3)' }}>your day depend on?</em>
      </h2>

      <div style={{ fontSize: 12, color: 'var(--ink3)', lineHeight: 1.65 }}>
        Pick something ordinary. The map shows the chokepoints it passes through
        — and how long each one would take to reach you.
      </div>

      {groups.map(({ category, items }) => (
        <div key={category} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--ink3)' }}>
            {ITEM_CATEGORY_LABELS[category]}
          </div>
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      ))}

      <div style={{
        fontSize: 11, color: 'var(--ink3)', lineHeight: 1.65,
        padding: '11px 13px',
        border: '1px solid var(--rule)',
        borderRadius: 4,
        background: 'var(--paper2)',
      }}>
        {ALL_ITEMS.length} everyday items · {TOTAL_LINKS} links to the {' '}
        31 nodes in the atlas. Every link is labelled with how well supported it
        is — <strong>observed</strong> where it has measurably happened before.
      </div>
    </div>
  )
}

function ItemCard({ item }: { item: Item }) {
  const [hovered, setHovered] = React.useState(false)
  const band = fastestBand(item)
  const bandColor = TIME_BAND_COLORS[band]

  return (
    <button
      onClick={() => useAtlasStore.getState().selectItem(item.id, itemNodeIdSet(item))}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 11,
        padding: '11px 13px',
        border: '1px solid var(--rule)',
        borderRadius: 4,
        background: hovered ? 'var(--paper3)' : 'var(--paper2)',
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
        transition: 'background .12s',
        fontFamily: 'DM Sans, sans-serif',
      }}
    >
      <span style={{ fontSize: 18, lineHeight: 1.2, flexShrink: 0 }} aria-hidden="true">
        {item.emoji}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 3 }}>
          <div style={{ fontWeight: 500, fontSize: 13, color: 'var(--ink)' }}>{item.name}</div>
          <span style={{
            fontSize: 10, color: 'var(--ink3)', background: 'var(--paper)',
            border: '1px solid var(--rule)', borderRadius: 10, padding: '1px 7px',
            flexShrink: 0,
          }}>
            {item.dependsOn.length}
          </span>
        </div>
        <div style={{ fontSize: 11, color: 'var(--ink3)', lineHeight: 1.5, marginBottom: 6 }}>
          {item.headline}
        </div>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          fontSize: 10, fontWeight: 500, color: bandColor,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: bandColor, display: 'inline-block' }} />
          Fastest effect: {TIME_BAND_LABELS[band].toLowerCase()}
        </div>
      </div>
    </button>
  )
}
