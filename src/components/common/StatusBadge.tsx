import { Badge } from '@/components/ui/badge'
import {
  DISPUTE_STATUS,
  INVOICE_STATUS,
  JOB_SUB_STATUS,
  PAYMENT_STATUS,
  QUOTE_STATUS,
  REQUEST_STATUS,
  WORKER_STATUS_SHORT,
  type StatusConfig,
} from '@/constants/status'
import { cn } from '@/lib/utils'

type StatusKind = 'request' | 'quote' | 'job' | 'invoice' | 'worker' | 'dispute' | 'payment'

const CONFIG: Record<StatusKind, Record<string, StatusConfig>> = {
  request: REQUEST_STATUS,
  quote: QUOTE_STATUS,
  job: JOB_SUB_STATUS,
  invoice: INVOICE_STATUS,
  worker: WORKER_STATUS_SHORT,
  dispute: DISPUTE_STATUS,
  payment: PAYMENT_STATUS,
}

interface StatusBadgeProps {
  status: string
  kind?: StatusKind
  className?: string
}

/** Badge for request (default), quote, job sub-status, invoice, worker verification, dispute or payment statuses; unknown values render as-is. */
export function StatusBadge({ status, kind = 'request', className }: StatusBadgeProps) {
  const config = CONFIG[kind][status] ?? { label: status, variant: 'outline' as const }
  return (
    <Badge variant={config.variant} className={cn(config.className, className)}>
      {config.label}
    </Badge>
  )
}
