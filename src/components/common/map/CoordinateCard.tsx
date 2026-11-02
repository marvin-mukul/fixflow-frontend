import { ExternalLinkIcon, MapPinIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { formatCoords, openMapUrl, type LatLng } from '@/components/common/map/mapConfig'

interface CoordinateCardProps {
  point: LatLng
  label?: ReactNode
  /** Extra link (e.g. directions); defaults to an OpenStreetMap link. */
  link?: { href: string; label: string }
}

/** Static stand-in for a map: coordinates plus an external map link. */
export function CoordinateCard({ point, label, link }: CoordinateCardProps) {
  const target = link ?? { href: openMapUrl(point), label: 'Open in map' }
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-muted/40 p-3 text-sm">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-background">
        <MapPinIcon className="size-4" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        {label && <span className="truncate font-medium">{label}</span>}
        <span className="font-mono text-xs text-muted-foreground">{formatCoords(point)}</span>
      </div>
      <a
        href={target.href}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1 text-xs font-medium text-primary underline-offset-4 hover:underline"
      >
        {target.label}
        <ExternalLinkIcon className="size-3" />
      </a>
    </div>
  )
}
