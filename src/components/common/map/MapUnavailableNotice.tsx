import { MapPinOffIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

/** Warning banner shown instead of a map when `VITE_MAPBOX_TOKEN` is not configured. */
export function MapUnavailableNotice({ children }: { children?: ReactNode }) {
  return (
    <Alert className="border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
      <MapPinOffIcon />
      <AlertTitle>Map unavailable</AlertTitle>
      <AlertDescription className="text-current/80">
        {children ?? 'Set VITE_MAPBOX_TOKEN to enable the interactive map.'}
      </AlertDescription>
    </Alert>
  )
}
