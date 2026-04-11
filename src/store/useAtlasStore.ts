import { create } from 'zustand'
import type { LayerKey, Mode, TileSource } from '../types'

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
  mapReady: boolean
  tileSource: TileSource
  searchQuery: string
  aboutOpen: boolean
  flyToTarget: FlyToTarget | null

  toggleLayer: (layer: LayerKey) => void
  soloLayer: (layer: LayerKey) => void
  setMode: (mode: Mode) => void
  selectNode: (id: string | null) => void
  clearSelection: () => void
  setMapReady: (ready: boolean) => void
  setTileSource: (source: TileSource) => void
  setSearchQuery: (q: string) => void
  setAboutOpen: (open: boolean) => void
  triggerFlyTo: (target: FlyToTarget) => void
  clearFlyTo: () => void
}

const ALL_LAYERS: LayerKey[] = ['maritime', 'cables', 'financial', 'tech', 'energy']

export const useAtlasStore = create<AtlasStore>((set, _get) => ({
  activeLayers: new Set(ALL_LAYERS),
  mode: 'explore',
  selectedNodeId: null,
  cascadeNodeIds: new Set(),
  mapReady: false,
  tileSource: 'openfreemap',
  searchQuery: '',
  aboutOpen: false,
  flyToTarget: null,

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
    set({ mode })
  },

  selectNode: (id) => {
    if (!id) {
      set({ selectedNodeId: null, cascadeNodeIds: new Set() })
      return
    }
    // cascadeNodeIds will be set by the component after resolving the node
    set({ selectedNodeId: id })
  },

  clearSelection: () => {
    set({ selectedNodeId: null, cascadeNodeIds: new Set() })
  },

  setMapReady: (ready) => set({ mapReady: ready }),
  setTileSource: (source) => set({ tileSource: source }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setAboutOpen: (open) => set({ aboutOpen: open }),
  triggerFlyTo: (target) => set({ flyToTarget: target }),
  clearFlyTo: () => set({ flyToTarget: null }),
}))
