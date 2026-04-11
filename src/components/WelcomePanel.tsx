import React from 'react'
import { useAtlasStore } from '../store/useAtlasStore'
import { LAYER_COLORS, LAYER_EMOJIS, LAYER_DESCS, LAYER_NAMES } from '../utils/nodeHelpers'
import type { LayerKey, Node } from '../types'
import nodes from '../data/nodes.json'

const ALL_NODES = nodes as Node[]
const LAYERS: LayerKey[] = ['maritime', 'cables', 'financial', 'tech', 'energy']

// Pre-compute counts per layer
const LAYER_COUNTS = LAYERS.reduce<Record<LayerKey, number>>((acc, layer) => {
  acc[layer] = ALL_NODES.filter((n) => n.layer === layer).length
  return acc
}, {} as Record<LayerKey, number>)

export function WelcomePanel() {
  const { soloLayer, searchQuery, setSearchQuery } = useAtlasStore()
  const [searchFocused, setSearchFocused] = React.useState(false)

  const matchingNodes = searchQuery
    ? ALL_NODES.filter((n) => {
        const q = searchQuery.toLowerCase()
        return (
          n.name.toLowerCase().includes(q) ||
          (n.country?.toLowerCase().includes(q) ?? false)
        )
      })
    : []

  return (
    <div className="panel-scroll flex-1 flex flex-col gap-5" style={{ padding: '26px 24px' }}>
      <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 25, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.22 }}>
        Where does<br />the <em style={{ fontStyle: 'italic', fontWeight: 300, color: 'var(--ink3)' }}>world break?</em>
      </h2>

      {/* Search */}
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          placeholder="Search nodes by name or country…"
          style={{
            width: '100%', padding: '8px 12px',
            paddingRight: searchQuery ? 32 : 12,
            border: `1px solid ${searchFocused ? 'var(--ink3)' : 'var(--rule)'}`,
            borderRadius: 4,
            background: 'var(--paper2)',
            color: 'var(--ink)',
            fontSize: 12,
            fontFamily: 'DM Sans, sans-serif',
            outline: 'none',
            transition: 'border-color .15s',
          }}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            aria-label="Clear search"
            style={{
              position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--ink3)', fontSize: 14, lineHeight: 1,
              padding: '2px 4px', fontFamily: 'DM Sans, sans-serif',
            }}
          >
            ×
          </button>
        )}
      </div>

      {/* Search results */}
      {searchQuery ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--ink3)', marginBottom: 4 }}>
            {matchingNodes.length === 0 ? 'No matches' : `${matchingNodes.length} result${matchingNodes.length === 1 ? '' : 's'}`}
          </div>
          {matchingNodes.map((node) => {
            const color = LAYER_COLORS[node.layer]
            return (
              <button
                key={node.id}
                onClick={() => {
                  const cascadeIds = new Set(node.cascades.map((c) => c.id))
                  useAtlasStore.setState({ selectedNodeId: node.id, cascadeNodeIds: cascadeIds })
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 11px',
                  border: '1px solid var(--rule)',
                  borderRadius: 4,
                  background: 'var(--paper2)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  transition: 'background .12s',
                  fontFamily: 'DM Sans, sans-serif',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--paper3)' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--paper2)' }}
              >
                <div style={{ width: 8, height: 8, borderRadius: node.category === 'physical' ? '50%' : 2, background: color, flexShrink: 0, transform: node.category === 'institutional' ? 'rotate(45deg)' : 'none' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink)', marginBottom: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{node.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink3)' }}>{[LAYER_NAMES[node.layer], node.country].filter(Boolean).join(' · ')}</div>
                </div>
              </button>
            )
          })}
        </div>
      ) : (
        <>
          <p style={{ fontSize: 13.5, color: 'var(--ink2)', lineHeight: 1.8 }}>
            Not all chokepoints are the same kind of thing. This atlas distinguishes two types — and that distinction changes how you think about risk.
          </p>

          {/* Physical vs Institutional distinction box */}
          <div style={{
            background: 'var(--paper2)', border: '1px solid var(--rule)',
            borderRadius: 4, padding: '14px 16px',
          }}>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--ink3)', marginBottom: 10 }}>
              Two kinds of chokepoint
            </div>

            <div style={{ display: 'flex', gap: 14, marginBottom: 10 }}>
              <div style={{ fontSize: 18, flexShrink: 0, width: 24 }}>●</div>
              <div style={{ fontSize: 12.5, color: 'var(--ink2)', lineHeight: 1.6 }}>
                <strong style={{ color: 'var(--ink)' }}>Physical</strong> — geography creates the bottleneck. Ships must pass through a narrow strait. Cables must cross an ocean through limited corridors. These can only be bypassed by changing your route.
              </div>
            </div>

            <div style={{ display: 'flex', gap: 14 }}>
              <div style={{ fontSize: 18, flexShrink: 0, width: 24 }}>◇</div>
              <div style={{ fontSize: 12.5, color: 'var(--ink2)', lineHeight: 1.6 }}>
                <strong style={{ color: 'var(--ink)' }}>Institutional</strong> — network effects and law create the bottleneck. SWIFT emerged because every bank joined. TSMC built capabilities no one else could replicate. These can theoretically be bypassed given enough money and time — which is exactly what China has been attempting since 2019.
              </div>
            </div>
          </div>

          {/* Layer rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {LAYERS.map((layer) => (
              <LayerRow key={layer} layer={layer} count={LAYER_COUNTS[layer]} onSolo={soloLayer} />
            ))}
          </div>

          <div style={{
            fontSize: 12, color: 'var(--ink3)', lineHeight: 1.65,
            padding: '11px 13px',
            border: '1px solid var(--rule)',
            borderRadius: 4,
            background: 'var(--paper2)',
          }}>
            💡 <strong>Click any marker</strong> to explore. Use <strong>Scenario mode</strong> above to see how disrupting one node cascades through others.
          </div>
        </>
      )}
    </div>
  )
}

function LayerRow({ layer, count, onSolo }: { layer: LayerKey; count: number; onSolo: (l: LayerKey) => void }) {
  const [hovered, setHovered] = React.useState(false)
  const color = LAYER_COLORS[layer]

  return (
    <button
      onClick={() => onSolo(layer)}
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
      <div style={{ width: 9, height: 9, borderRadius: '50%', background: color, flexShrink: 0, marginTop: 4 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 2 }}>
          <div style={{ fontWeight: 500, fontSize: 13, color: 'var(--ink)' }}>
            {LAYER_EMOJIS[layer]} {LAYER_NAMES[layer]}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <span style={{ fontSize: 10, color: 'var(--ink3)', background: 'var(--paper)', border: '1px solid var(--rule)', borderRadius: 10, padding: '1px 7px' }}>
              {count}
            </span>
            <span style={{ fontSize: 11, color: hovered ? color : 'var(--ink3)', transition: 'color .12s', whiteSpace: 'nowrap' }}>
              Show only →
            </span>
          </div>
        </div>
        <div style={{ fontSize: 12, color: 'var(--ink3)', lineHeight: 1.5 }}>
          {LAYER_DESCS[layer]}
        </div>
      </div>
    </button>
  )
}
