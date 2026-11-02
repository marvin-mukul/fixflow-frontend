import { MAPBOX_TOKEN, type LocationValue } from '@/components/common/map/mapConfig'

const BASE = 'https://api.mapbox.com/search/geocode/v6'

interface GeocodeFeature {
  properties: {
    mapbox_id: string
    full_address?: string
    name?: string
    coordinates: { latitude: number; longitude: number }
    context?: {
      postcode?: { name: string }
      place?: { name: string }
      locality?: { name: string }
      district?: { name: string }
      region?: { name: string }
    }
  }
}

export interface GeocodeResult extends LocationValue {
  id: string
  label: string
}

function toResult(feature: GeocodeFeature): GeocodeResult {
  const p = feature.properties
  const ctx = p.context ?? {}
  return {
    id: p.mapbox_id,
    label: p.full_address ?? p.name ?? '',
    lat: p.coordinates.latitude,
    lng: p.coordinates.longitude,
    address: p.name,
    city: ctx.place?.name ?? ctx.district?.name ?? ctx.locality?.name,
    state: ctx.region?.name,
    pincode: ctx.postcode?.name,
  }
}

async function query(path: string, params: Record<string, string>, signal?: AbortSignal) {
  const search = new URLSearchParams({ ...params, country: 'in', access_token: MAPBOX_TOKEN })
  const res = await fetch(`${BASE}/${path}?${search.toString()}`, { signal })
  if (!res.ok) throw new Error(`Geocoding failed (${res.status})`)
  const body = (await res.json()) as { features: GeocodeFeature[] }
  return body.features.map(toResult)
}

/** Forward search restricted to India. */
export function searchPlaces(text: string, signal?: AbortSignal) {
  return query('forward', { q: text, limit: '5', autocomplete: 'true' }, signal)
}

/** Best address match for a point, or null. */
export async function reverseGeocode(lat: number, lng: number): Promise<GeocodeResult | null> {
  const results = await query('reverse', {
    latitude: String(lat),
    longitude: String(lng),
    limit: '1',
  })
  return results[0] ?? null
}
