import 'mapbox-gl/dist/mapbox-gl.css'
import Map, { Marker, NavigationControl } from 'react-map-gl/mapbox'
import { MAP_STYLE, MAPBOX_TOKEN, type LatLng } from '@/components/common/map/mapConfig'

interface Props {
  location: LatLng
  label?: string
  zoom?: number
}

/** Read-only map with a single pin (property / job site). */
export default function MapboxPointMap({ location, label, zoom = 15 }: Props) {
  return (
    <div className="h-64 overflow-hidden rounded-xl border" aria-label={label ?? 'Map'}>
      <Map
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle={MAP_STYLE}
        initialViewState={{ latitude: location.lat, longitude: location.lng, zoom }}
      >
        <NavigationControl position="top-right" />
        <Marker latitude={location.lat} longitude={location.lng} />
      </Map>
    </div>
  )
}
