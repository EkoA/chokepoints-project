import { useAtlasStore } from '../store/useAtlasStore'
import { WelcomePanel } from './WelcomePanel'
import { ExploreDetail } from './ExploreDetail'
import { ScenarioDetail } from './ScenarioDetail'
import { ItemBrowser } from './ItemBrowser'
import { ItemDetail } from './ItemDetail'
import { buildReferenceCount } from '../utils/nodeHelpers'
import { getItem } from '../utils/itemHelpers'
import type { Node } from '../types'
import nodes from '../data/nodes.json'

const ALL_NODES = nodes as Node[]
const REF_COUNTS = buildReferenceCount(ALL_NODES)

export function Panel() {
  const { selectedNodeId, selectedItemId, mode } = useAtlasStore()

  const selectedNode = selectedNodeId ? ALL_NODES.find((n) => n.id === selectedNodeId) ?? null : null
  const selectedItem = getItem(selectedItemId)

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
      {mode === 'everyday' ? (
        selectedItem ? <ItemDetail item={selectedItem} /> : <ItemBrowser />
      ) : !selectedNode ? (
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
