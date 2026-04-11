// Great-circle arc between two lon/lat points
// Returns a GeoJSON LineString feature
// We sample N points along the arc to get a curved line

interface Point { lon: number; lat: number }

function toRad(d: number) { return (d * Math.PI) / 180 }
function toDeg(r: number) { return (r * 180) / Math.PI }

function interpolate(p1: Point, p2: Point, t: number): Point {
  const lat1 = toRad(p1.lat)
  const lon1 = toRad(p1.lon)
  const lat2 = toRad(p2.lat)
  const lon2 = toRad(p2.lon)

  const d = 2 * Math.asin(
    Math.sqrt(
      Math.pow(Math.sin((lat2 - lat1) / 2), 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin((lon2 - lon1) / 2), 2)
    )
  )

  if (d === 0) return p1

  const A = Math.sin((1 - t) * d) / Math.sin(d)
  const B = Math.sin(t * d) / Math.sin(d)

  const x = A * Math.cos(lat1) * Math.cos(lon1) + B * Math.cos(lat2) * Math.cos(lon2)
  const y = A * Math.cos(lat1) * Math.sin(lon1) + B * Math.cos(lat2) * Math.sin(lon2)
  const z = A * Math.sin(lat1) + B * Math.sin(lat2)

  const lat = toDeg(Math.atan2(z, Math.sqrt(x * x + y * y)))
  const lon = toDeg(Math.atan2(y, x))

  return { lat, lon }
}

export function greatCircleArc(
  from: Point,
  to: Point,
  steps = 64
): [number, number][] {
  const coords: [number, number][] = []
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const pt = interpolate(from, to, t)
    coords.push([pt.lon, pt.lat])
  }
  return coords
}

export interface ArcFeature {
  type: 'Feature'
  geometry: {
    type: 'LineString'
    coordinates: [number, number][]
  }
  properties: { id: string }
}

export function buildArcFeatures(
  sourceCoords: Point,
  targets: Array<Point & { id: string }>
): ArcFeature[] {
  return targets.map((t) => ({
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: greatCircleArc(sourceCoords, t),
    },
    properties: { id: t.id },
  }))
}
