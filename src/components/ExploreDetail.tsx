import React from 'react'
import { useAtlasStore } from '../store/useAtlasStore'
import { RiskMeter } from './RiskMeter'
import { LAYER_COLORS, LAYER_LABELS, fmtN } from '../utils/nodeHelpers'
import type { Node } from '../types'
import nodes from '../data/nodes.json'

const ALL_NODES = nodes as Node[]

function sec(label: string, content: React.ReactNode) {
  return (
    <div style={{ padding: '16px 0', borderBottom: '1px solid var(--rule)' }}>
      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--ink3)', marginBottom: 7 }}>
        {label}
      </div>
      {content}
    </div>
  )
}

function txt(content: string) {
  return <div style={{ fontSize: 13, color: 'var(--ink2)', lineHeight: 1.78 }}>{content}</div>
}

interface Props {
  node: Node
  referenceCount: number
}

export function ExploreDetail({ node, referenceCount }: Props) {
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
        <div style={{ fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.25, marginBottom: 4 }}>
          {node.name}
        </div>
        {(node.country || node.type || node.cables) && (
          <div style={{ fontSize: 12, color: 'var(--ink3)' }}>
            {[node.country, node.type, node.cables ? `${node.cables} cable systems` : ''].filter(Boolean).join(' · ')}
          </div>
        )}

        {/* Category tag */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          marginTop: 10, padding: '5px 10px', borderRadius: 3,
          fontSize: 11, fontWeight: 500,
          background: node.category === 'physical'
            ? 'rgba(21,101,192,.08)'
            : node.category === 'institutional'
            ? 'rgba(198,40,40,.08)'
            : 'rgba(130,119,23,.08)',
          color: node.category === 'physical'
            ? '#1565c0'
            : node.category === 'institutional'
            ? '#c62828'
            : '#827717',
          border: `1px solid ${node.category === 'physical'
            ? 'rgba(21,101,192,.2)'
            : node.category === 'institutional'
            ? 'rgba(198,40,40,.2)'
            : 'rgba(130,119,23,.2)'}`,
        }}>
          {node.category === 'physical'
            ? '● Physical chokepoint — geography creates the bottleneck'
            : node.category === 'institutional'
            ? '◇ Institutional chokepoint — network effects & law create the bottleneck'
            : '◎ Hidden chokepoint — upstream dependency'}
        </div>

        {/* Cross-reference badge */}
        {referenceCount > 0 && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            marginTop: 8, marginLeft: 6, padding: '4px 9px',
            borderRadius: 12,
            fontSize: 11,
            background: 'rgba(183,121,31,.1)',
            color: 'var(--financial, #b7791f)',
            border: '1px solid rgba(183,121,31,.25)',
          }}>
            ⛓ Referenced by {referenceCount} other {referenceCount === 1 ? 'node' : 'nodes'}
          </div>
        )}

        {/* Plain */}
        <div style={{
          marginTop: 12, padding: '11px 13px',
          background: 'var(--paper2)',
          borderLeft: `3px solid ${color}`,
          borderRadius: '0 4px 4px 0',
          fontSize: 13, color: 'var(--ink2)', lineHeight: 1.7, fontStyle: 'italic',
        }}>
          {node.plain}
        </div>

      </div>

      {/* Body */}
      <div className="panel-scroll" style={{ padding: '0 22px 28px', flex: 1 }}>
        {/* Image */}
        {node.image && (
          <div style={{ margin: '16px 0 4px', borderRadius: 4, overflow: 'hidden', lineHeight: 0 }}>
            <img
              src={node.image}
              alt={node.name}
              onError={(e) => { (e.currentTarget as HTMLImageElement).parentElement!.style.display = 'none' }}
              style={{
                width: '100%',
                maxHeight: 220,
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
        {/* Maritime stats */}
        {node.layer === 'maritime' && node.tot && (
          sec('Annual Traffic (IMF PortWatch)',
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 7 }}>
              {[
                { v: fmtN(node.tot), k: 'Vessels/yr' },
                { v: fmtN(node.con ?? 0), k: 'Container' },
                { v: fmtN(node.tank ?? 0), k: 'Tanker' },
              ].map(({ v, k }) => (
                <div key={k} style={{ background: 'var(--paper2)', border: '1px solid var(--rule)', borderRadius: 3, padding: '9px 10px' }}>
                  <div style={{ fontFamily: 'Fraunces, serif', fontSize: 17, fontWeight: 600, color: 'var(--ink)' }}>{v}</div>
                  <div style={{ fontSize: 10, color: 'var(--ink3)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '.04em' }}>{k}</div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Scale / metric */}
        {(node.flow || node.metric) && (
          sec('Scale',
            <div style={{ display: 'inline-flex', background: 'var(--paper2)', border: '1px solid var(--rule)', borderRadius: 3, padding: '9px 14px' }}>
              <span style={{ fontFamily: 'Fraunces, serif', fontSize: 19, fontWeight: 600, color: 'var(--ink)' }}>
                {node.flow ?? node.metric}
              </span>
            </div>
          )
        )}

        {sec('What is this?', txt(node.what))}
        {sec('Why does it matter?', txt(node.why))}

        {sec('Risk level', <RiskMeter risk={node.risk} />)}

        {sec('If this was disrupted…',
          <div style={{ background: 'var(--callout-warn-bg)', border: '1px solid var(--callout-warn-border)', borderRadius: 4, padding: '12px 14px' }}>
            <div style={{ fontSize: 13, color: 'var(--ink2)', lineHeight: 1.75 }}>{node.disruption}</div>
          </div>
        )}

        {node.realEvent && (
          sec('Historical record',
            <div style={{ background: 'var(--callout-hist-bg)', border: '1px solid var(--callout-hist-border)', borderRadius: 4, padding: '12px 14px' }}>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 7, color: 'var(--mod)' }}>📋 It has already happened</div>
              <div style={{ fontSize: 13, color: 'var(--ink2)', lineHeight: 1.75 }}>{node.realEvent}</div>
            </div>
          )
        )}

        {node.institutional_note && (
          sec('On institutional chokepoints',
            <div style={{ background: 'var(--callout-note-bg)', border: '1px solid var(--callout-note-border)', borderRadius: 4, padding: '12px 14px' }}>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 7, color: 'var(--callout-note-ink)' }}>◇ On institutional chokepoints</div>
              <div style={{ fontSize: 13, color: 'var(--ink2)', lineHeight: 1.75 }}>{node.institutional_note}</div>
            </div>
          )
        )}

        {node.cascades.length > 0 && (
          sec('Connected vulnerabilities',
            <div style={{ background: 'var(--paper2)', border: '1px solid var(--rule)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ padding: '10px 14px', background: '#fff4ee', borderBottom: '1px solid #f0d8c8', fontSize: 10, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--high)' }}>
                ⛓ If this node fails, these are also affected
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
          )
        )}

        <div style={{ padding: '16px 0' }}>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--ink3)', marginBottom: 7 }}>Source</div>
          <div style={{ fontSize: 11, color: 'var(--ink3)' }}>{node.source}</div>
        </div>
      </div>
    </div>
  )
}
