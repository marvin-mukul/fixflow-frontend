import { WrenchIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export function BrandMark({ className }: { className?: string }) {
  return (
    <span className={cn('flex items-center gap-2 font-heading font-semibold', className)}>
      <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <WrenchIcon className="size-4" />
      </span>
      FixFlow
    </span>
  )
}
