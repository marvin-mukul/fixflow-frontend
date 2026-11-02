import { CrosshairIcon } from 'lucide-react'
import { lazy, Suspense, useId, useState } from 'react'
import { Loader } from '@/components/common/Loader'
import { MapUnavailableNotice } from '@/components/common/map/MapUnavailableNotice'
import {
  formatCoords,
  hasMapboxToken,
  type LocationValue,
} from '@/components/common/map/mapConfig'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

const MapboxLocationPicker = lazy(() => import('@/components/common/map/mapbox/MapboxLocationPicker'))

export interface LocationPickerProps {
  value: LocationValue | null
  onChange: (value: LocationValue) => void
  error?: string
}

/**
 * Map with search, draggable pin and geolocate (Mapbox, lazy-loaded). Without a
 * Mapbox token it falls back to manual latitude/longitude inputs.
 */
export function LocationPicker(props: LocationPickerProps) {
  if (!hasMapboxToken()) return <ManualLocationPicker {...props} />
  return (
    <div className="flex flex-col gap-2">
      <Suspense fallback={<Loader label="Loading map…" className="h-72 rounded-xl border" />}>
        <MapboxLocationPicker value={props.value} onChange={props.onChange} />
      </Suspense>
      {props.value && (
        <p className="font-mono text-xs text-muted-foreground">{formatCoords(props.value)}</p>
      )}
      {props.error && <FieldError>{props.error}</FieldError>}
    </div>
  )
}

function parseCoord(raw: string): number | null {
  if (raw.trim() === '') return null
  const n = Number(raw)
  return Number.isFinite(n) ? n : null
}

function ManualLocationPicker({ value, onChange, error }: LocationPickerProps) {
  const id = useId()
  const [lat, setLat] = useState(value ? String(value.lat) : '')
  const [lng, setLng] = useState(value ? String(value.lng) : '')
  const [geoError, setGeoError] = useState<string | null>(null)

  const emit = (nextLat: string, nextLng: string) => {
    const a = parseCoord(nextLat)
    const b = parseCoord(nextLng)
    if (a !== null && b !== null) onChange({ lat: a, lng: b })
  }

  const useMyLocation = () => {
    setGeoError(null)
    if (!('geolocation' in navigator)) {
      setGeoError('Geolocation is not supported by this browser.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const nextLat = pos.coords.latitude.toFixed(6)
        const nextLng = pos.coords.longitude.toFixed(6)
        setLat(nextLat)
        setLng(nextLng)
        emit(nextLat, nextLng)
      },
      () => setGeoError('Could not read your location. Enter coordinates manually.'),
    )
  }

  return (
    <div className="flex flex-col gap-3" data-testid="location-picker-fallback">
      <MapUnavailableNotice>
        Set VITE_MAPBOX_TOKEN to pick the location on a map. Enter the coordinates manually for
        now.
      </MapUnavailableNotice>
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <Field data-invalid={!!error || undefined}>
          <FieldLabel htmlFor={`${id}-lat`}>Latitude</FieldLabel>
          <Input
            id={`${id}-lat`}
            inputMode="decimal"
            placeholder="30.3165"
            value={lat}
            aria-invalid={!!error || undefined}
            onChange={(e) => {
              setLat(e.target.value)
              emit(e.target.value, lng)
            }}
          />
        </Field>
        <Field data-invalid={!!error || undefined}>
          <FieldLabel htmlFor={`${id}-lng`}>Longitude</FieldLabel>
          <Input
            id={`${id}-lng`}
            inputMode="decimal"
            placeholder="78.0322"
            value={lng}
            aria-invalid={!!error || undefined}
            onChange={(e) => {
              setLng(e.target.value)
              emit(lat, e.target.value)
            }}
          />
        </Field>
        <Button type="button" variant="outline" onClick={useMyLocation}>
          <CrosshairIcon />
          Use my location
        </Button>
      </div>
      {(error || geoError) && <FieldError>{error ?? geoError}</FieldError>}
    </div>
  )
}
