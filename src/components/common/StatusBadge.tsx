import { Badge } from '@/components/ui/badge'
import {
  QUOTE_STATUS,
  REQUEST_STATUS,
  type StatusConfig,
} from '@/constants/status'
import { cn } from '@/lib/utils'

type StatusKind = 'request' | 'quote'

const CONFIG: Record<StatusKind, Record<string, StatusConfig>> = {
  request: REQUEST_STATUS,
  quote: QUOTE_STATUS,
}

interface StatusBadgeProps {
  status: string
  kind?: StatusKind
  className?: string
}

/** Badge for request (default) or quote statuses; unknown values render as-is. */
export function StatusBadge({ status, kind = 'request', className }: StatusBadgeProps) {
  const config = CONFIG[kind][status] ?? { label: status, variant: 'outline' as const }
  return (
    <Badge variant={config.variant} className={cn(config.className, className)}>
      {config.label}
    </Badge>
  )
}
