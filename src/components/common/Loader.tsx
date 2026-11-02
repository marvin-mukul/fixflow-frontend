import { Loader2Icon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoaderProps {
  label?: string
  fullScreen?: boolean
  className?: string
}

export function Loader({ label = 'Loading…', fullScreen = false, className }: LoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex items-center justify-center gap-2 p-6 text-sm text-muted-foreground',
        fullScreen && 'min-h-svh bg-background',
        className,
      )}
    >
      <Loader2Icon className="size-5 animate-spin" aria-hidden />
      <span>{label}</span>
    </div>
  )
}
