import React from 'react'
import { useAtlasStore } from '../store/useAtlasStore'
import { LAYER_COLORS, LAYER_LABELS } from '../utils/nodeHelpers'
import type { Node } from '../types'
import nodes from '../data/nodes.json'

const ALL_NODES = nodes as Node[]

interface Props {
  node: Node
}

export function ScenarioDetail({ node }: Props) {
  const store = useAtlasStore()
  const color = LAYER_COLORS[node.layer]

  const jumpTo = (id: string) => {
    const target = ALL_NODES.find((n) => n.id === id)
    if (!target) return
    const cascadeIds = new Set(target.cascades.map((c) => c.id))
    useAtlasStore.setState({ selectedNodeId: id, cascadeNodeIds: cascadeIds })
  }

  return (
    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Back */}
      <button
        onClick={() => store.clearSelection()}
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
        ← Overview
      </button>

      {/* Header */}
      <div style={{ padding: '18px 22px 14px', borderBottom: '1px solid var(--rule)', flexShrink: 0 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 8, color }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: color }} />
          {LAYER_LABELS[node.layer]}
        </div>
        <div style={{ fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.25, marginBottom: 4 }}>
          {node.name}
        </div>
        <div style={{
          padding: '11px 13px',
          background: 'var(--paper2)',
          borderLeft: '3px solid #e65100',
          borderRadius: '0 4px 4px 0',
          fontSize: 13, color: 'var(--ink2)', lineHeight: 1.7, fontStyle: 'italic',
        }}>
          If {node.name} was disrupted…
        </div>
      </div>

      {/* Body */}
      <div className="panel-scroll" style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Image */}
        {node.image && (
          <div style={{ borderRadius: 4, overflow: 'hidden', lineHeight: 0, flexShrink: 0 }}>
            <img
              src={node.image}
              alt={node.name}
              onError={(e) => { (e.currentTarget as HTMLImageElement).parentElement!.style.display = 'none' }}
              style={{
                width: '100%',
                height: 180,
                objectFit: 'cover',
                display: 'block',
                borderRadius: 4,
              }}
            />
            <div style={{
              fontSize: 10, color: 'var(--ink3)', padding: '4px 2px',
              textAlign: 'right', lineHeight: 1.4,
            }}>
              {node.imageCredit ?? 'Image: Wikimedia Commons (CC)'}
            </div>
          </div>
        )}
        {/* Immediate effects */}
        <div style={{ background: '#fff8f0', border: '1px solid #f0d8b4', borderRadius: 4, padding: '12px 14px' }}>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 7, color: 'var(--high)' }}>⚠ Immediate effects</div>
          <div style={{ fontSize: 13, color: 'var(--ink2)', lineHeight: 1.75 }}>{node.disruption}</div>
        </div>

        {/* Cascade chain */}
        {node.cascades.length > 0 ? (
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--ink3)', marginBottom: 10 }}>
              Cascade effects on other systems
            </div>
            <div style={{ background: 'var(--paper2)', border: '1px solid var(--rule)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ padding: '10px 14px', background: '#fff4ee', borderBottom: '1px solid #f0d8c8', fontSize: 10, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--high)' }}>
                ⛓ The disruption doesn't stop here
              </div>
              {node.cascades.map((c) => {
                const target = ALL_NODES.find((n) => n.id === c.id)
                const col = LAYER_COLORS[c.layer as keyof typeof LAYER_COLORS] ?? '#888'
                return (
                  <button
                    key={c.id}
                    onClick={() => jumpTo(c.id)}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 10,
                      padding: '10px 14px',
                      cursor: 'pointer',
                      background: 'transparent',
                      border: 'none',
                      borderBottom: '1px solid var(--rule)',
                      width: '100%', textAlign: 'left',
                      fontFamily: 'DM Sans, sans-serif',
                      transition: 'background .12s',
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--paper3)' }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                  >
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: col, flexShrink: 0, marginTop: 4 }} />
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink)', marginBottom: 2 }}>{target?.name ?? c.id}</div>
                      <div style={{ fontSize: 11, color: 'var(--ink3)', lineHeight: 1.5 }}>{c.effect}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          <p style={{ fontSize: 13, color: 'var(--ink3)', lineHeight: 1.6 }}>
            No direct cascade links identified to other mapped nodes — but the economic effects of this disruption would still spread broadly.
          </p>
        )}

        {/* Historical precedent */}
        {node.realEvent && (
          <div style={{ background: '#f8f4e8', border: '1px solid #e0d098', borderRadius: 4, padding: '12px 14px' }}>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 7, color: 'var(--mod)' }}>📋 Historical precedent</div>
            <div style={{ fontSize: 13, color: 'var(--ink2)', lineHeight: 1.75 }}>{node.realEvent}</div>
          </div>
        )}
      </div>
    </div>
  )
}
