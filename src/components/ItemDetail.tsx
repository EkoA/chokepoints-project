import React from 'react'
import { useAtlasStore } from '../store/useAtlasStore'
import { LAYER_COLORS, LAYER_NAMES } from '../utils/nodeHelpers'
import {
  BASIS_COLORS,
  BASIS_HINTS,
  BASIS_LABELS,
  TIME_BAND_COLORS,
  TIME_BAND_LABELS,
  resolveEvidence,
  sortedLinks,
} from '../utils/itemHelpers'
import type { Item, ItemLink, Node, TimeBand } from '../types'
import nodes from '../data/nodes.json'

const ALL_NODES = nodes as Node[]

interface Props {
  item: Item
}

export function ItemDetail({ item }: Props) {
  const links = sortedLinks(item)

  // Group by time band so the reader reads down a clock, not a list.
  const banded = (['days', 'weeks', 'months', 'years'] as TimeBand[])
    .map((band) => ({ band, links: links.filter((l) => l.timeToImpact === band) }))
    .filter((g) => g.links.length > 0)

  const layersTouched = new Set(
    links
      .map((l) => ALL_NODES.find((n) => n.id === l.nodeId)?.layer)
      .filter(Boolean) as string[]
  )

  return (
    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Back */}
      <button
        onClick={() => useAtlasStore.getState().selectItem(null)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '10px 22px', fontSize: 12, color: 'var(--ink3)',
          cursor: 'pointer', border: 'none', background: 'transparent',
          width: '100%', textAlign: 'left',
          borderBottom: '1px solid var(--rule)',
          transition: 'all .12s',
          fontFamily: 'DM Sans, sans-serif',
          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background = 'var(--paper2)'
          ;(e.currentTarget as HTMLElement).style.color = 'var(--ink)'
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background = 'transparent'
          ;(e.currentTarget as HTMLElement).style.color = 'var(--ink3)'
        }}
      >
        ← All everyday items
      </button>

      {/* Header */}
      <div style={{ padding: '18px 22px 16px', borderBottom: '1px solid var(--rule)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span style={{ fontSize: 26, lineHeight: 1 }} aria-hidden="true">{item.emoji}</span>
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.25 }}>
            {item.name}
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
          <span style={{
            fontSize: 11, padding: '4px 9px', borderRadius: 12,
            background: 'var(--paper3)', color: 'var(--ink2)',
            border: '1px solid var(--rule)',
          }}>
            {item.dependsOn.length} chokepoints
          </span>
          <span style={{
            fontSize: 11, padding: '4px 9px', borderRadius: 12,
            background: 'var(--paper3)', color: 'var(--ink2)',
            border: '1px solid var(--rule)',
          }}>
            {layersTouched.size} of 5 layers
          </span>
        </div>

        <div style={{
          padding: '11px 13px',
          background: 'var(--paper2)',
          borderLeft: '3px solid var(--ink3)',
          borderRadius: '0 4px 4px 0',
          fontSize: 13, color: 'var(--ink2)', lineHeight: 1.7, fontStyle: 'italic',
        }}>
          {item.headline}
        </div>
      </div>

      {/* Body */}
      <div className="panel-scroll" style={{ padding: '0 22px 28px', flex: 1 }}>
        {/* How you'd notice */}
        <div style={{ padding: '16px 0', borderBottom: '1px solid var(--rule)' }}>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--ink3)', marginBottom: 7 }}>
            How you'd notice
          </div>
          <div style={{
            background: 'var(--callout-warn-bg)',
            border: '1px solid var(--callout-warn-border)',
            borderRadius: 4, padding: '12px 14px',
            fontSize: 13, color: 'var(--ink2)', lineHeight: 1.75,
          }}>
            {item.noticeWhen}
          </div>
        </div>

        {/* Dependency chain, ordered by how fast it reaches you */}
        <div style={{ padding: '16px 0' }}>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--ink3)', marginBottom: 4 }}>
            What it depends on
          </div>
          <div style={{ fontSize: 11, color: 'var(--ink3)', lineHeight: 1.55, marginBottom: 12 }}>
            Ordered by how quickly a disruption would reach you. Tap any node to
            open it on the map.
          </div>

          {banded.map(({ band, links: bandLinks }) => (
            <div key={band} style={{ marginBottom: 18 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8,
              }}>
                <span style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: TIME_BAND_COLORS[band], flexShrink: 0,
                }} />
                <span style={{
                  fontSize: 11, fontWeight: 600, letterSpacing: '.06em',
                  textTransform: 'uppercase', color: TIME_BAND_COLORS[band],
                }}>
                  {TIME_BAND_LABELS[band]}
                </span>
                <div style={{ flex: 1, height: 1, background: 'var(--rule)' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {bandLinks.map((link) => (
                  <LinkRow key={link.nodeId} link={link} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Method note — the app cites sources on every node; say what these are */}
        <div style={{ padding: '16px 0', borderTop: '1px solid var(--rule)' }}>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--ink3)', marginBottom: 7 }}>
            About these links
          </div>
          <div style={{ fontSize: 11, color: 'var(--ink3)', lineHeight: 1.7 }}>
            Each link is labelled by how well supported it is.{' '}
            <strong style={{ color: BASIS_COLORS.observed }}>Observed</strong> links
            cite something that measurably happened.{' '}
            <strong style={{ color: BASIS_COLORS.estimated }}>Estimated</strong> links
            are inferred from a node's documented role.{' '}
            <strong style={{ color: BASIS_COLORS.illustrative }}>Illustrative</strong>{' '}
            links show a plausible mechanism and are not claims about magnitude.
            No price forecasts are given anywhere in this view.
          </div>
        </div>
      </div>
    </div>
  )
}

function LinkRow({ link }: { link: ItemLink }) {
  const [hovered, setHovered] = React.useState(false)
  const node = ALL_NODES.find((n) => n.id === link.nodeId)
  if (!node) return null

  const color = LAYER_COLORS[node.layer]
  const basisColor = BASIS_COLORS[link.basis]
  const evidence = resolveEvidence(link, node)

  const openNode = () => {
    const cascadeIds = new Set(node.cascades.map((c) => c.id))
    useAtlasStore.setState({
      mode: 'explore',
      selectedItemId: null,
      itemNodeIds: new Set(),
      selectedNodeId: node.id,
      cascadeNodeIds: cascadeIds,
    })
  }

  return (
    <div
      style={{
        border: '1px solid var(--rule)',
        borderRadius: 4,
        background: hovered ? 'var(--paper3)' : 'var(--paper2)',
        transition: 'background .12s',
        overflow: 'hidden',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        onClick={openNode}
        style={{
          display: 'flex', alignItems: 'flex-start', gap: 9,
          padding: '10px 12px 9px',
          background: 'transparent', border: 'none',
          width: '100%', textAlign: 'left', cursor: 'pointer',
          fontFamily: 'DM Sans, sans-serif',
        }}
      >
        {node.category === 'hidden' ? (
          <div style={{ width: 9, height: 9, borderRadius: '50%', background: 'transparent', border: `1.5px solid ${color}`, flexShrink: 0, marginTop: 4 }} />
        ) : (
          <div style={{
            width: 9, height: 9,
            borderRadius: node.category === 'physical' ? '50%' : 2,
            background: color, flexShrink: 0, marginTop: 4,
            transform: node.category === 'institutional' ? 'rotate(45deg)' : 'none',
          }} />
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8, marginBottom: 3 }}>
            <span style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--ink)' }}>
              {node.name}
            </span>
            <span style={{ fontSize: 10, color: 'var(--ink3)', flexShrink: 0, whiteSpace: 'nowrap' }}>
              {LAYER_NAMES[node.layer]} →
            </span>
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--ink2)', lineHeight: 1.6 }}>
            {link.via}
          </div>
        </div>
      </button>

      {/* Basis badge + evidence */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 7,
        padding: '7px 12px 9px 30px',
        borderTop: '1px solid var(--rule)',
      }}>
        <span
          title={BASIS_HINTS[link.basis]}
          style={{
            fontSize: 9, fontWeight: 600, letterSpacing: '.08em',
            textTransform: 'uppercase',
            color: basisColor,
            border: `1px solid ${basisColor}`,
            borderRadius: 3, padding: '1px 5px',
            flexShrink: 0, whiteSpace: 'nowrap',
            opacity: 0.85,
          }}
        >
          {BASIS_LABELS[link.basis]}
        </span>
        {evidence && (
          <span style={{ fontSize: 10.5, color: 'var(--ink3)', lineHeight: 1.55 }}>
            {evidence.inherited && (
              <em style={{ fontStyle: 'italic', opacity: 0.8 }}>
                From this node's record:{' '}
              </em>
            )}
            {evidence.text}
          </span>
        )}
      </div>
    </div>
  )
}
