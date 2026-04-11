import { useEffect, useRef } from 'react'
import { Source, Layer } from 'react-map-gl/maplibre'
import type { Node } from '../types'
import { buildArcFeatures } from '../utils/arcGeometry'

interface Props {
  sourceNode: Node
  targetNodes: Node[]
}

export function CascadeArcs({ sourceNode, targetNodes }: Props) {
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const features = buildArcFeatures(
    { lon: sourceNode.lon, lat: sourceNode.lat },
    targetNodes.map((t) => ({ lon: t.lon, lat: t.lat, id: t.id }))
  )

  const geojson = {
    type: 'FeatureCollection' as const,
    features,
  }

  return (
    <Source id="cascade-arcs-source" type="geojson" data={geojson}>
      <Layer
        id="cascade-arcs"
        type="line"
        paint={{
          'line-color': '#e65100',
          'line-width': 2,
          'line-dasharray': [2, 2],
          'line-opacity': 0.7,
        }}
      />
    </Source>
  )
}
