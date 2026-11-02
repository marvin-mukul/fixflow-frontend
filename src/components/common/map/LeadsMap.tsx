import { lazy, Suspense } from 'react'
import { Loader } from '@/components/common/Loader'
import { MapUnavailableNotice } from '@/components/common/map/MapUnavailableNotice'
import { formatCoords, hasMapboxToken, type LatLng } from '@/components/common/map/mapConfig'

const MapboxLeadsMap = lazy(() => import('@/components/common/map/mapbox/MapboxLeadsMap'))

export interface LeadsMapPoint extends LatLng {
  id: string
  title: string
}

export interface LeadsMapProps {
  /** Worker base location; draws the service radius around it. */
  center?: LatLng | null
  radiusKm?: number
  /** Lead locations (already rounded by the API). */
  leads: LeadsMapPoint[]
  onSelect?: (id: string) => void
}

/** Leads around the worker base with the service radius circle. */
export function LeadsMap(props: LeadsMapProps) {
  if (!hasMapboxToken()) {
    return (
      <div className="flex flex-col gap-3">
        <MapUnavailableNotice>
          Set VITE_MAPBOX_TOKEN to see leads on a map. Approximate lead locations are listed
          below.
        </MapUnavailableNotice>
        {props.leads.length > 0 && (
          <ul className="grid gap-2 sm:grid-cols-2">
            {props.leads.map((lead) => (
              <li key={lead.id}>
                <button
                  type="button"
                  disabled={!props.onSelect}
                  onClick={() => props.onSelect?.(lead.id)}
                  className="flex w-full flex-col items-start rounded-lg border px-3 py-2 text-left text-sm hover:bg-muted disabled:hover:bg-transparent"
                >
                  <span className="font-medium">{lead.title}</span>
                  <span className="font-mono text-xs text-muted-foreground">~ {formatCoords(lead, 2)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    )
  }
  return (
    <Suspense fallback={<Loader label="Loading map…" className="h-80 rounded-xl border" />}>
      <MapboxLeadsMap {...props} />
    </Suspense>
  )
}
