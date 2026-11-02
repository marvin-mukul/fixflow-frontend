import { SirenIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { PRIORITY, type Priority } from '@/constants/status'
import { cn } from '@/lib/utils'

export function PriorityBadge({ priority, className }: { priority: Priority; className?: string }) {
  const config = PRIORITY[priority]
  return (
    <Badge variant={config.variant} className={cn(config.className, className)}>
      {priority === 'EMERGENCY' && <SirenIcon data-icon="inline-start" />}
      {config.label}
    </Badge>
  )
}
