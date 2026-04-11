import React from 'react'
import { Marker } from 'react-map-gl/maplibre'
import type { Node } from '../types'
import { LAYER_COLORS, markerRadius } from '../utils/nodeHelpers'

interface Props {
  node: Node
  isSelected: boolean
  isCascaded: boolean
  isDimmed: boolean
  onClick: () => void
}

export function NodeMarker({ node, isSelected, isCascaded, isDimmed, onClick }: Props) {
  const color = LAYER_COLORS[node.layer]
  const r = markerRadius(node)
  const opacity = isDimmed ? 0.15 : 0.92
  const fillColor = isCascaded ? '#e65100' : color

  // Size of SVG container: diameter + glow ring + padding
  const glowR = isCascaded ? r + 5 : r + 6
  const svgSize = (isSelected || isCascaded ? glowR : r) * 2 + 8

  const cx = svgSize / 2
  const cy = svgSize / 2

  return (
    <Marker
      longitude={node.lon}
      latitude={node.lat}
      anchor="center"
      onClick={(e) => {
        e.originalEvent.stopPropagation()
        onClick()
      }}
    >
      <svg
        className="atlas-marker"
        width={svgSize}
        height={svgSize}
        viewBox={`0 0 ${svgSize} ${svgSize}`}
        style={{ opacity, overflow: 'visible', display: 'block' }}
        role="button"
        aria-label={node.name}
      >
        {/* Glow ring for active/cascaded */}
        {(isSelected || isCascaded) && (
          <circle
            cx={cx} cy={cy}
            r={glowR}
            fill={isCascaded ? 'rgba(230,81,0,.3)' : color}
            style={{ pointerEvents: 'none' }}
          />
        )}

        {node.category === 'physical' ? (
          <circle
            cx={cx} cy={cy}
            r={r}
            fill={fillColor}
            stroke="#fff"
            strokeWidth={1.8}
          />
        ) : (
          // Diamond (rotated square)
          <polygon
            points={`${cx},${cy - r * 1.3} ${cx + r * 1.3},${cy} ${cx},${cy + r * 1.3} ${cx - r * 1.3},${cy}`}
            fill={fillColor}
            stroke="#fff"
            strokeWidth={1.8}
          />
        )}
      </svg>
    </Marker>
  )
}
