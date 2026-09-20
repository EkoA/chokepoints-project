import { create } from 'zustand'
import type { HeatmapField, LayerKey, Mode, TileSource } from '../types'

interface FlyToTarget {
  lon: number
  lat: number
  zoom: number
}

interface AtlasStore {
  activeLayers: Set<LayerKey>
  mode: Mode
  selectedNodeId: string | null
  cascadeNodeIds: Set<string>
  selectedItemId: string | null
  itemNodeIds: Set<string>
  mapReady: boolean
  tileSource: TileSource
  searchQuery: string
  aboutOpen: boolean
  flyToTarget: FlyToTarget | null
  isEmbed: boolean
  heatmapField: HeatmapField
  embedModalOpen: boolean
  setEmbedModalOpen: (open: boolean) => void

  setHeatmapField: (field: HeatmapField) => void
  toggleLayer: (layer: LayerKey) => void
  soloLayer: (layer: LayerKey) => void
  setMode: (mode: Mode) => void
  selectNode: (id: string | null) => void
  selectItem: (id: string | null, nodeIds?: Set<string>) => void
  clearSelection: () => void
  setMapReady: (ready: boolean) => void
  setTileSource: (source: TileSource) => void
  setSearchQuery: (q: string) => void
  setAboutOpen: (open: boolean) => void
  triggerFlyTo: (target: FlyToTarget) => void
  clearFlyTo: () => void
}

const ALL_LAYERS: LayerKey[] = ['maritime', 'cables', 'financial', 'tech', 'energy']

// Read embed mode synchronously so the first render is already correct — avoids
// a flash of the full chrome before the useEffect in App.tsx could set it.
const _isEmbed = new URLSearchParams(window.location.search).get('embed') === '1'

export const useAtlasStore = create<AtlasStore>((set, _get) => ({
  activeLayers: new Set(ALL_LAYERS),
  mode: 'explore',
  selectedNodeId: null,
  cascadeNodeIds: new Set(),
  selectedItemId: null,
  itemNodeIds: new Set(),
  mapReady: false,
  tileSource: 'openfreemap',
  searchQuery: '',
  aboutOpen: false,
  flyToTarget: null,
  isEmbed: _isEmbed,
  embedModalOpen: false,
  heatmapField: 'off',
  setEmbedModalOpen: (open) => set({ embedModalOpen: open }),
  setHeatmapField: (field) => set({ heatmapField: field }),

  toggleLayer: (layer) => {
    set((state) => {
      const next = new Set(state.activeLayers)
      if (next.has(layer)) next.delete(layer)
      else next.add(layer)
      return { activeLayers: next }
    })
  },

  soloLayer: (layer) => {
    set({ activeLayers: new Set([layer]) })
  },

  setMode: (mode) => {
    // The two selection kinds are mutually exclusive: an item selection is
    // meaningless outside everyday mode, and a node selection would sit behind
    // the item browser unseen. Clear whichever no longer applies.
    if (mode === 'everyday') {
      set({ mode, selectedNodeId: null, cascadeNodeIds: new Set() })
    } else {
      set({ mode, selectedItemId: null, itemNodeIds: new Set() })
    }
  },

  selectNode: (id) => {
    if (!id) {
      set({ selectedNodeId: null, cascadeNodeIds: new Set() })
      return
    }
    // cascadeNodeIds will be set by the component after resolving the node
    set({ selectedNodeId: id })
  },

  // Items have no coordinates, so selecting one highlights the nodes it depends
  // on instead. Callers pass the resolved id set, mirroring how selectNode
  // leaves cascade resolution to the component that has the node to hand.
  selectItem: (id, nodeIds) => {
    if (!id) {
      set({ selectedItemId: null, itemNodeIds: new Set() })
      return
    }
    set({ selectedItemId: id, itemNodeIds: nodeIds ?? new Set() })
  },

  clearSelection: () => {
    set({
      selectedNodeId: null,
      cascadeNodeIds: new Set(),
      selectedItemId: null,
      itemNodeIds: new Set(),
    })
  },

  setMapReady: (ready) => set({ mapReady: ready }),
  setTileSource: (source) => set({ tileSource: source }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setAboutOpen: (open) => set({ aboutOpen: open }),
  triggerFlyTo: (target) => set({ flyToTarget: target }),
  clearFlyTo: () => set({ flyToTarget: null }),
}))
