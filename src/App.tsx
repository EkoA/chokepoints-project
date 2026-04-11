import React, { useEffect } from 'react'
import { TopBar } from './components/TopBar'
import { ModeBar } from './components/ModeBar'
import { MapView } from './components/MapView'
import { Panel } from './components/Panel'
import { IntroOverlay } from './components/IntroOverlay'
import { useAtlasStore } from './store/useAtlasStore'
import type { Node, LayerKey } from './types'
import nodes from './data/nodes.json'

const ALL_NODES = nodes as Node[]
const ALL_LAYER_KEYS: LayerKey[] = ['maritime', 'cables', 'financial', 'tech', 'energy']

function App() {
  const store = useAtlasStore()

  // ── URL state sync ─────────────────────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const nodeParam = params.get('node')
    const layersParam = params.get('layers')

    if (nodeParam) {
      const node = ALL_NODES.find((n) => n.id === nodeParam)
      if (node) {
        const cascadeIds = new Set(node.cascades.map((c) => c.id))
        useAtlasStore.setState({ selectedNodeId: nodeParam, cascadeNodeIds: cascadeIds })
      }
    }

    if (layersParam) {
      const layersList = layersParam.split(',').filter((l): l is LayerKey =>
        ALL_LAYER_KEYS.includes(l as LayerKey)
      )
      if (layersList.length > 0) {
        useAtlasStore.setState({ activeLayers: new Set(layersList) })
      }
    }
  }, [])

  // Push URL state on selection/layer changes
  useEffect(() => {
    const params = new URLSearchParams()
    if (store.selectedNodeId) params.set('node', store.selectedNodeId)
    const layers = Array.from(store.activeLayers)
    if (layers.length < ALL_LAYER_KEYS.length) params.set('layers', layers.join(','))
    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname
    window.history.replaceState({}, '', newUrl)
  }, [store.selectedNodeId, store.activeLayers])

  // ── Keyboard navigation ────────────────────────────────────────────────────
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        store.clearSelection()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [store])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <IntroOverlay />
      <TopBar />
      <ModeBar />

      {/* Main content area */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <MapView />

        {/* Desktop panel (hidden below 768px via CSS in index.css) */}
        <div className="desktop-panel">
          <Panel />
        </div>
      </div>

      {/* Mobile panel drawer — shown on small screens */}
      <MobileDrawer />
    </div>
  )
}

function MobileDrawer() {
  const selectedNodeId = useAtlasStore((s) => s.selectedNodeId)
  const [open, setOpen] = React.useState(false)

  useEffect(() => {
    setOpen(!!selectedNodeId)
  }, [selectedNodeId])

  return (
    <>
      {/* Shown on mobile only */}
      <div
        className="md:hidden"
        style={{
          position: 'fixed', inset: 0, zIndex: 200,
          pointerEvents: open ? 'auto' : 'none',
        }}
      >
        {/* Backdrop */}
        {open && (
          <div
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.3)' }}
            onClick={() => useAtlasStore.getState().clearSelection()}
          />
        )}

        {/* Drawer */}
        <div
          style={{
            position: 'absolute', left: 0, right: 0, bottom: 0,
            height: '70vh',
            background: 'var(--paper)',
            borderTop: '1px solid var(--rule)',
            borderRadius: '12px 12px 0 0',
            transform: open ? 'translateY(0)' : 'translateY(100%)',
            transition: 'transform .3s ease',
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <Panel />
        </div>
      </div>
    </>
  )
}

export default App
