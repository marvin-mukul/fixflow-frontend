import { lazy, Suspense } from 'react'
import { Loader } from '@/components/common/Loader'
import { CoordinateCard } from '@/components/common/map/CoordinateCard'
import { MapUnavailableNotice } from '@/components/common/map/MapUnavailableNotice'
import { hasMapboxToken, type LatLng } from '@/components/common/map/mapConfig'

const MapboxPointMap = lazy(() => import('@/components/common/map/mapbox/MapboxPointMap'))

interface PropertyMapProps {
  location: LatLng
  label?: string
}

/** Read-only map with the property pin (static coordinate card without a token). */
export function PropertyMap({ location, label }: PropertyMapProps) {
  if (!hasMapboxToken()) {
    return (
      <div className="flex flex-col gap-2">
        <MapUnavailableNotice />
        <CoordinateCard point={location} label={label} />
      </div>
    )
  }
  return (
    <Suspense fallback={<Loader label="Loading map…" className="h-64 rounded-xl border" />}>
      <MapboxPointMap location={location} label={label} />
    </Suspense>
  )
}
