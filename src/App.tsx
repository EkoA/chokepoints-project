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
    if (store.isEmbed) return
    const params = new URLSearchParams()
    if (store.selectedNodeId) params.set('node', store.selectedNodeId)
    const layers = Array.from(store.activeLayers)
    if (layers.length < ALL_LAYER_KEYS.length) params.set('layers', layers.join(','))
    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname
    window.history.replaceState({}, '', newUrl)
  }, [store.selectedNodeId, store.activeLayers, store.isEmbed])

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
      {!store.isEmbed && <IntroOverlay />}
      {!store.isEmbed && <TopBar />}
      {!store.isEmbed && <ModeBar />}

      {/* Main content area */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <MapView />

        {/* Desktop panel (hidden below 768px via CSS in index.css) */}
        {!store.isEmbed && (
          <div className="desktop-panel">
            <Panel />
          </div>
        )}
      </div>

      {/* Mobile panel drawer — shown on small screens */}
      {!store.isEmbed && <MobileDrawer />}
    </div>
  )
}

function MobileDrawer() {
  const selectedNodeId = useAtlasStore((s) => s.selectedNodeId)
  const [open, setOpen] = React.useState(false)

  // Open when a node is selected; don't auto-close on deselect so
  // "← Overview" stays inside the drawer showing WelcomePanel.
  useEffect(() => {
    if (selectedNodeId) setOpen(true)
  }, [selectedNodeId])

  const closeDrawer = () => {
    useAtlasStore.getState().clearSelection()
    setOpen(false)
  }

  return (
    <>
      {/* Floating "Browse" button — only on mobile when drawer is closed */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="md:hidden"
          aria-label="Browse nodes"
          style={{
            position: 'fixed', bottom: 24, left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 150,
            background: 'var(--ink)',
            color: '#fff',
            border: 'none',
            borderRadius: 24,
            padding: '12px 28px',
            fontSize: 13,
            fontWeight: 500,
            fontFamily: 'DM Sans, sans-serif',
            boxShadow: '0 4px 20px rgba(0,0,0,.35)',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            letterSpacing: '0.01em',
          }}
        >
          Browse nodes ↑
        </button>
      )}

      {/* Drawer overlay — mobile only */}
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
            onClick={closeDrawer}
          />
        )}

        {/* Drawer */}
        <div
          style={{
            position: 'absolute', left: 0, right: 0, bottom: 0,
            height: '76vh',
            background: 'var(--paper)',
            borderTop: '1px solid var(--rule)',
            borderRadius: '14px 14px 0 0',
            transform: open ? 'translateY(0)' : 'translateY(100%)',
            transition: 'transform .3s ease',
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Drag handle + close button */}
          <div
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '10px 16px 4px', flexShrink: 0, position: 'relative',
            }}
          >
            <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--rule2)' }} />
            <button
              onClick={closeDrawer}
              aria-label="Close panel"
              style={{
                position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--ink3)', fontSize: 22, lineHeight: 1,
                padding: '4px 6px', fontFamily: 'DM Sans, sans-serif',
              }}
            >
              ×
            </button>
          </div>

          <Panel />
        </div>
      </div>
    </>
  )
}

export default App
