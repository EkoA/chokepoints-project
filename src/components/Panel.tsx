import React from 'react'
import { useAtlasStore } from '../store/useAtlasStore'
import { WelcomePanel } from './WelcomePanel'
import { ExploreDetail } from './ExploreDetail'
import { ScenarioDetail } from './ScenarioDetail'
import { buildReferenceCount } from '../utils/nodeHelpers'
import type { Mode, Node } from '../types'
import nodes from '../data/nodes.json'

const ALL_NODES = nodes as Node[]
const REF_COUNTS = buildReferenceCount(ALL_NODES)

export function Panel() {
  const { selectedNodeId, mode, setMode } = useAtlasStore()

  const selectedNode = selectedNodeId ? ALL_NODES.find((n) => n.id === selectedNodeId) ?? null : null

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 400,
        flex: 1,
        minHeight: 0,
        background: 'var(--paper)',
        borderLeft: '1px solid var(--rule)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
      className="panel-container"
    >
      {/* Inline mode toggle — only shown when a node is selected */}
      {selectedNode && (
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 14px',
            background: 'var(--paper2)',
            borderBottom: '1px solid var(--rule)',
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 10, color: 'var(--ink3)', letterSpacing: '.04em', marginRight: 2 }}>View:</span>
          {(['explore', 'scenario'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                fontSize: 11, fontWeight: 500, padding: '3px 11px',
                borderRadius: 20,
                border: `1px solid ${mode === m ? 'var(--ink)' : 'var(--rule2)'}`,
                background: mode === m ? 'var(--ink)' : 'transparent',
                color: mode === m ? '#fff' : 'var(--ink3)',
                cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                transition: 'all .15s',
              }}
            >
              {m === 'explore' ? 'Explore' : 'Scenario'}
            </button>
          ))}
        </div>
      )}

      {!selectedNode ? (
        <WelcomePanel />
      ) : mode === 'explore' ? (
        <ExploreDetail
          node={selectedNode}
          referenceCount={REF_COUNTS[selectedNode.id] ?? 0}
        />
      ) : (
        <ScenarioDetail node={selectedNode} />
      )}
    </div>
  )
}
