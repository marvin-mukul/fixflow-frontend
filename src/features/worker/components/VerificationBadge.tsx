import { Badge } from '@/components/ui/badge'
import { WORKER_VERIFICATION, type WorkerVerificationStatus } from '@/constants/status'

export function VerificationBadge({ status }: { status: WorkerVerificationStatus }) {
  const config: { label: string; variant: 'default' | 'outline' | 'destructive'; className?: string } =
    WORKER_VERIFICATION[status]
  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  )
}
