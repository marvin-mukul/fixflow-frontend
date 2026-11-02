import { Badge } from '@/components/ui/badge'
import {
  JOB_SUB_STATUS,
  QUOTE_STATUS,
  REQUEST_STATUS,
  type StatusConfig,
} from '@/constants/status'
import { cn } from '@/lib/utils'

type StatusKind = 'request' | 'quote' | 'job'

const CONFIG: Record<StatusKind, Record<string, StatusConfig>> = {
  request: REQUEST_STATUS,
  quote: QUOTE_STATUS,
  job: JOB_SUB_STATUS,
}

interface StatusBadgeProps {
  status: string
  kind?: StatusKind
  className?: string
}

/** Badge for request (default), quote or job sub-statuses; unknown values render as-is. */
export function StatusBadge({ status, kind = 'request', className }: StatusBadgeProps) {
  const config = CONFIG[kind][status] ?? { label: status, variant: 'outline' as const }
  return (
    <Badge variant={config.variant} className={cn(config.className, className)}>
      {config.label}
    </Badge>
  )
}
