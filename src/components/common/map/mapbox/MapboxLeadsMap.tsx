import 'mapbox-gl/dist/mapbox-gl.css'
import { useMemo, useState } from 'react'
import Map, { Layer, Marker, NavigationControl, Popup, Source } from 'react-map-gl/mapbox'
import type { LeadsMapProps } from '@/components/common/map/LeadsMap'
import {
  circlePolygon,
  INDIA_CENTER,
  MAP_STYLE,
  MAPBOX_TOKEN,
} from '@/components/common/map/mapConfig'

export default function MapboxLeadsMap({ center, radiusKm, leads, onSelect }: LeadsMapProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const active = leads.find((l) => l.id === activeId) ?? null
  const focus = center ?? leads[0] ?? INDIA_CENTER
  const circle = useMemo(
    () => (center && radiusKm ? circlePolygon(center, radiusKm) : null),
    [center, radiusKm],
  )

  return (
    <div className="h-80 overflow-hidden rounded-xl border">
      <Map
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle={MAP_STYLE}
        initialViewState={{ latitude: focus.lat, longitude: focus.lng, zoom: center ? 11 : 4 }}
      >
        <NavigationControl position="top-right" />
        {circle && (
          <Source id="service-radius" type="geojson" data={circle}>
            <Layer id="service-radius-fill" type="fill" paint={{ 'fill-color': '#2563eb', 'fill-opacity': 0.08 }} />
            <Layer id="service-radius-line" type="line" paint={{ 'line-color': '#2563eb', 'line-width': 1.5 }} />
          </Source>
        )}
        {center && <Marker latitude={center.lat} longitude={center.lng} color="#111827" />}
        {leads.map((lead) => (
          <Marker
            key={lead.id}
            latitude={lead.lat}
            longitude={lead.lng}
            color="#dc2626"
            onClick={(e) => {
              e.originalEvent.stopPropagation()
              setActiveId(lead.id)
            }}
          />
        ))}
        {active && (
          <Popup latitude={active.lat} longitude={active.lng} onClose={() => setActiveId(null)} closeOnClick={false}>
            <button
              type="button"
              className="text-sm font-medium text-gray-900 underline-offset-4 hover:underline"
              onClick={() => onSelect?.(active.id)}
            >
              {active.title}
            </button>
          </Popup>
        )}
      </Map>
    </div>
  )
}
