import { env } from '@/config/env'

export interface LatLng {
  lat: number
  lng: number
}

/** What `LocationPicker` reports: coordinates plus whatever address parts geocoding found. */
export interface LocationValue extends LatLng {
  address?: string
  city?: string
  state?: string
  pincode?: string
}

export const MAPBOX_TOKEN = env.MAPBOX_TOKEN
export const MAP_STYLE = 'mapbox://styles/mapbox/streets-v12'
/** Roughly the centre of India, used when nothing is picked yet. */
export const INDIA_CENTER: LatLng = { lat: 22.5, lng: 79 }

export function hasMapboxToken(): boolean {
  return MAPBOX_TOKEN.trim().length > 0
}

export function formatCoords({ lat, lng }: LatLng, digits = 5): string {
  return `${lat.toFixed(digits)}, ${lng.toFixed(digits)}`
}

export function directionsUrl({ lat, lng }: LatLng): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
}

export function openMapUrl({ lat, lng }: LatLng): string {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=15/${lat}/${lng}`
}

/** GeoJSON polygon approximating a circle (for the worker's service radius). */
export function circlePolygon(center: LatLng, radiusKm: number, steps = 64) {
  const coords: [number, number][] = []
  const latRad = (center.lat * Math.PI) / 180
  const dLat = radiusKm / 110.574
  const dLng = radiusKm / (111.32 * Math.cos(latRad))
  for (let i = 0; i <= steps; i++) {
    const theta = (i / steps) * 2 * Math.PI
    coords.push([center.lng + dLng * Math.cos(theta), center.lat + dLat * Math.sin(theta)])
  }
  return {
    type: 'Feature' as const,
    properties: {},
    geometry: { type: 'Polygon' as const, coordinates: [coords] },
  }
}
