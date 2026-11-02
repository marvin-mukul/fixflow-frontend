import { NavigationIcon } from 'lucide-react'
import { lazy, Suspense } from 'react'
import { Loader } from '@/components/common/Loader'
import { CoordinateCard } from '@/components/common/map/CoordinateCard'
import { MapUnavailableNotice } from '@/components/common/map/MapUnavailableNotice'
import { directionsUrl, hasMapboxToken, type LatLng } from '@/components/common/map/mapConfig'
import { buttonVariants } from '@/components/ui/button'

const MapboxPointMap = lazy(() => import('@/components/common/map/mapbox/MapboxPointMap'))

interface JobMapProps {
  location: LatLng
  label?: string
}

/** Exact job-site pin plus a directions link (for the assigned worker). */
export function JobMap({ location, label }: JobMapProps) {
  const directions = { href: directionsUrl(location), label: 'Directions' }
  if (!hasMapboxToken()) {
    return (
      <div className="flex flex-col gap-2">
        <MapUnavailableNotice />
        <CoordinateCard point={location} label={label} link={directions} />
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-2">
      <Suspense fallback={<Loader label="Loading map…" className="h-64 rounded-xl border" />}>
        <MapboxPointMap location={location} label={label} />
      </Suspense>
      <a
        href={directions.href}
        target="_blank"
        rel="noreferrer"
        className={buttonVariants({ variant: 'outline', className: 'self-start' })}
      >
        <NavigationIcon />
        Get directions
      </a>
    </div>
  )
}
