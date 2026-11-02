import 'mapbox-gl/dist/mapbox-gl.css'
import { SearchIcon } from 'lucide-react'
import { useRef, useState } from 'react'
import Map, {
  GeolocateControl,
  Marker,
  NavigationControl,
  type MapRef,
} from 'react-map-gl/mapbox'
import {
  INDIA_CENTER,
  MAP_STYLE,
  MAPBOX_TOKEN,
  type LocationValue,
} from '@/components/common/map/mapConfig'
import {
  reverseGeocode,
  searchPlaces,
  type GeocodeResult,
} from '@/components/common/map/mapbox/geocoding'
import { Input } from '@/components/ui/input'

interface Props {
  value: LocationValue | null
  onChange: (value: LocationValue) => void
}

export default function MapboxLocationPicker({ value, onChange }: Props) {
  const mapRef = useRef<MapRef>(null)
  const abortRef = useRef<AbortController | null>(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GeocodeResult[]>([])

  const pick = async (lat: number, lng: number) => {
    onChange({ lat, lng })
    try {
      const match = await reverseGeocode(lat, lng)
      if (match) onChange({ ...match, lat, lng })
    } catch {
      // Coordinates alone are enough; address autofill is best-effort.
    }
  }

  const runSearch = async (text: string) => {
    setQuery(text)
    abortRef.current?.abort()
    if (text.trim().length < 3) {
      setResults([])
      return
    }
    const controller = new AbortController()
    abortRef.current = controller
    try {
      setResults(await searchPlaces(text, controller.signal))
    } catch {
      // Aborted or failed: keep the previous results.
    }
  }

  const choose = (result: GeocodeResult) => {
    setResults([])
    setQuery(result.label)
    onChange(result)
    mapRef.current?.flyTo({ center: [result.lng, result.lat], zoom: 15 })
  }

  return (
    <div className="relative flex flex-col gap-2">
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          aria-label="Search address"
          placeholder="Search an address, locality or pincode"
          className="pl-8"
          value={query}
          onChange={(e) => void runSearch(e.target.value)}
        />
        {results.length > 0 && (
          <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border bg-popover text-sm shadow-md">
            {results.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  className="w-full px-3 py-2 text-left hover:bg-muted"
                  onClick={() => choose(r)}
                >
                  {r.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="h-72 overflow-hidden rounded-xl border">
        <Map
          ref={mapRef}
          mapboxAccessToken={MAPBOX_TOKEN}
          mapStyle={MAP_STYLE}
          initialViewState={{
            latitude: value?.lat ?? INDIA_CENTER.lat,
            longitude: value?.lng ?? INDIA_CENTER.lng,
            zoom: value ? 14 : 4,
          }}
          onClick={(e) => void pick(e.lngLat.lat, e.lngLat.lng)}
        >
          <NavigationControl position="top-right" />
          <GeolocateControl
            position="top-right"
            onGeolocate={(e) => void pick(e.coords.latitude, e.coords.longitude)}
          />
          {value && (
            <Marker
              latitude={value.lat}
              longitude={value.lng}
              draggable
              onDragEnd={(e) => void pick(e.lngLat.lat, e.lngLat.lng)}
            />
          )}
        </Map>
      </div>
      <p className="text-xs text-muted-foreground">
        Search, click the map or drag the pin to set the exact location.
      </p>
    </div>
  )
}
