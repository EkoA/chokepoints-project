import { useCallback, useEffect, useMemo, useRef } from 'react'
import Map, { Layer, Source } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useAtlasStore } from '../store/useAtlasStore'
import { NodeMarker } from './NodeMarker'
import { CascadeArcs } from './CascadeArcs'
import { HeatmapControl } from './HeatmapControl'
import { TileFallbackBadge } from './MapFallback'
import { EmbedBadge } from './EmbedBadge'
import { buildMainSiteUrl } from '../utils/embedUrl'
import nodes from '../data/nodes.json'
import type { HeatmapField, Node } from '../types'

const FIELD_MAX: Record<Exclude<HeatmapField, 'off'>, number> = {
  tot: Math.max(...(nodes as Node[]).map((n) => n.tot ?? 0)),
  tank: Math.max(...(nodes as Node[]).map((n) => n.tank ?? 0)),
  con: Math.max(...(nodes as Node[]).map((n) => n.con ?? 0)),
  bulk: Math.max(...(nodes as Node[]).map((n) => n.bulk ?? 0)),
}

const ALL_NODES = nodes as Node[]

const OPENFREEMAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty'

const CARTODB_STYLE = {
  version: 8 as const,
  sources: {
    cartodb: {
      type: 'raster' as const,
      tiles: [
        'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
        'https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
      ],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors © CARTO',
    },
  },
  layers: [
    {
      id: 'cartodb-tiles',
      type: 'raster' as const,
      source: 'cartodb',
      minzoom: 0,
      maxzoom: 19,
    },
  ],
}

export function MapView() {
  const {
    activeLayers,
    mode,
    selectedNodeId,
    cascadeNodeIds,
    tileSource,
    setTileSource,
    setMapReady,
    searchQuery,
    isEmbed,
    heatmapField,
  } = useAtlasStore()

  const fallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mapLoadedRef = useRef(false)

  const handleMapLoad = useCallback(() => {
    mapLoadedRef.current = true
    if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current)
    setMapReady(true)
  }, [setMapReady])

  const handleMapError = useCallback(() => {
    if (tileSource !== 'cartodb') {
      setTileSource('cartodb')
    }
  }, [tileSource, setTileSource])

  // Start 3-second fallback timer on mount (OpenFreeMap only)
  useEffect(() => {
    if (tileSource !== 'openfreemap') return
    fallbackTimerRef.current = setTimeout(() => {
      if (!mapLoadedRef.current) {
        setTileSource('cartodb')
      }
    }, 3000)
    return () => {
      if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const mapStyle = tileSource === 'openfreemap'
    ? OPENFREEMAP_STYLE
    : (CARTODB_STYLE as unknown as string)

  // Which nodes to show
  const visibleNodes = ALL_NODES.filter((n) => {
    if (!activeLayers.has(n.layer)) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return (
        n.name.toLowerCase().includes(q) ||
        (n.country?.toLowerCase().includes(q) ?? false)
      )
    }
    return true
  })

  const selectedNode = selectedNodeId
    ? ALL_NODES.find((n) => n.id === selectedNodeId) ?? null
    : null

  const cascadeTargetNodes = selectedNode
    ? selectedNode.cascades
        .map((c) => ALL_NODES.find((n) => n.id === c.id))
        .filter((n): n is Node => n !== undefined)
    : []

  // Zustand creates a new Set reference on every toggleLayer call, so activeLayers
  // is a stable dep here — no workaround needed.
  const heatmapGeoJSON = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: ALL_NODES
      .filter((n) => activeLayers.has(n.layer))
      .map((n) => ({
        type: 'Feature' as const,
        geometry: { type: 'Point' as const, coordinates: [n.lon, n.lat] },
        properties: { tot: n.tot ?? 0, tank: n.tank ?? 0, con: n.con ?? 0, bulk: n.bulk ?? 0 },
      })),
  }), [activeLayers])

  const heatmapPaint = useMemo(() => {
    // When off or in scenario mode, keep the layer mounted but fully transparent.
    const field = heatmapField === 'off' ? 'tot' : heatmapField
    const maxVal = FIELD_MAX[field]
    const visible = heatmapField !== 'off' && mode !== 'scenario'
    return {
      'heatmap-weight': ['interpolate', ['linear'], ['coalesce', ['get', field], 0], 0, 0, maxVal, 1],
      // Intensity ramps up with zoom so close-in views stay readable
      'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 2, 5, 5],
      // Color starts showing at density 0.05 — needed for lower-weight nodes (e.g. Hormuz
      // under "All Traffic" has relative weight 0.38 and would be invisible at the old 0.35 floor)
      'heatmap-color': [
        'interpolate', ['linear'], ['heatmap-density'],
        0,    'rgba(0,0,0,0)',
        0.05, 'rgba(255,210,50,0.35)',
        0.2,  'rgba(255,160,20,0.65)',
        0.5,  'rgba(215,55,10,0.82)',
        0.8,  'rgba(165,10,10,0.93)',
        1,    'rgba(100,0,0,1)',
      ],
      // Larger radius at world zoom so each node glows across a visible area
      'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 80, 5, 130],
      // Fade out as user zooms into marker detail; markers are legible by zoom 7
      'heatmap-opacity': visible
        ? ['interpolate', ['linear'], ['zoom'], 6, 0.88, 9, 0]
        : 0,
    }
  }, [heatmapField, mode])

  return (
    <div className="flex-1 relative overflow-hidden" style={{ background: '#c8dae8' }}>
      <Map
        initialViewState={{ longitude: 15, latitude: 20, zoom: 2 }}
        style={{ width: '100%', height: '100%' }}
        mapStyle={mapStyle}
        attributionControl={false}
        onLoad={handleMapLoad}
        onError={handleMapError}
        onClick={() => {
          if (!isEmbed) useAtlasStore.getState().clearSelection()
        }}
      >
        {/* Heatmap — always mounted; opacity driven to 0 when off or in scenario mode */}
        <Source id="heatmap-nodes" type="geojson" data={heatmapGeoJSON}>
          <Layer
            id="chokepoint-heat"
            type="heatmap"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            paint={heatmapPaint as any}
          />
        </Source>

        {/* Cascade arcs — rendered below markers in both modes */}
        {selectedNode && cascadeTargetNodes.length > 0 && (
          <CascadeArcs
            sourceNode={selectedNode}
            targetNodes={cascadeTargetNodes}
          />
        )}

        {/* Markers */}
        {visibleNodes.map((node) => {
          const isSelected = node.id === selectedNodeId
          const isCascaded = cascadeNodeIds.has(node.id)
          const isDimmed =
            mode === 'scenario' && !!selectedNodeId && !isSelected && !isCascaded

          return (
            <NodeMarker
              key={node.id}
              node={node}
              isSelected={isSelected}
              isCascaded={isCascaded}
              isDimmed={isDimmed}
              onClick={() => {
                if (isEmbed) {
                  window.open(buildMainSiteUrl(activeLayers, node.id), '_blank', 'noopener,noreferrer')
                  return
                }
                const cascadeIds = new Set(node.cascades.map((c) => c.id))
                useAtlasStore.setState({
                  selectedNodeId: node.id,
                  cascadeNodeIds: cascadeIds,
                })
              }}
            />
          )
        })}
      </Map>

      {/* Scenario hint */}
      {mode === 'scenario' && !selectedNodeId && (
        <div
          style={{
            position: 'absolute', top: 14, left: 14, zIndex: 50,
            background: 'rgba(22,18,14,.82)',
            border: '1px solid rgba(255,100,50,.3)',
            borderRadius: 4, padding: '9px 13px',
            fontSize: 12, color: 'rgba(255,255,255,.7)',
            fontFamily: 'DM Sans, sans-serif',
            backdropFilter: 'blur(4px)',
          }}
        >
          ⚡ Scenario mode: click any node to see cascading effects
        </div>
      )}

      {/* Map legend */}
      <div
        style={{
          position: 'absolute', bottom: 40, right: 14, zIndex: 50,
          background: 'rgba(22,18,14,.82)',
          borderRadius: 4, padding: '10px 14px',
          display: 'flex', flexDirection: 'column', gap: 7,
          backdropFilter: 'blur(4px)',
        }}
      >
        <div style={{ fontSize: 9, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,.28)', marginBottom: 3, fontWeight: 500 }}>
          Layer
        </div>
        {(
          [
            ['maritime',  '#1565c0', 'Shipping'],
            ['cables',    '#6a1b9a', 'Cables'],
            ['financial', '#b7791f', 'Financial'],
            ['tech',      '#c62828', 'Technology'],
            ['energy',    '#2e7d32', 'Energy'],
          ] as [string, string, string][]
        ).map(([key, color, label]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="10" height="10"><circle cx="5" cy="5" r="4" fill={color} /></svg>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,.65)' }}>{label}</span>
          </div>
        ))}
        <div style={{ height: 1, background: 'rgba(255,255,255,.08)', margin: '3px 0' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="12" height="12"><circle cx="6" cy="6" r="5" fill="rgba(255,255,255,.3)" /></svg>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,.45)' }}>● Physical</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="12" height="12"><polygon points="6,1 11,6 6,11 1,6" fill="none" stroke="rgba(255,255,255,.5)" strokeWidth="1.5" /></svg>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,.45)' }}>◇ Institutional</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="12" height="12"><circle cx="6" cy="6" r="4.5" fill="rgba(255,255,255,.08)" stroke="rgba(255,255,255,.5)" strokeWidth="1.5" /></svg>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,.45)' }}>◎ Hidden (upstream)</span>
        </div>
      </div>

      <HeatmapControl />
      <TileFallbackBadge />
      {isEmbed && <EmbedBadge />}

      {/* Credit */}
      <div
        style={{
          position: 'absolute', bottom: 14, left: 14, zIndex: 40,
          fontSize: 10, color: 'rgba(0,0,0,.35)', letterSpacing: '.03em',
        }}
      >
        OpenFreeMap / CartoDB · IMF PortWatch, TeleGeography, BIS, IEA
      </div>
    </div>
  )
}
