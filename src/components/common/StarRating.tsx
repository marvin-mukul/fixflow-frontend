import { StarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  value: number | null
  max?: number
  count?: number
  className?: string
}

/** Read-only star rating with the numeric value (e.g. "4.6 (12)"). */
export function StarRating({ value, max = 5, count, className }: StarRatingProps) {
  if (value === null) {
    return <span className={cn('text-xs text-muted-foreground', className)}>No ratings yet</span>
  }
  const rounded = Math.round(value)
  return (
    <span
      className={cn('inline-flex items-center gap-1 text-sm', className)}
      aria-label={`Rated ${value.toFixed(1)} out of ${max}`}
    >
      <span className="flex" aria-hidden>
        {Array.from({ length: max }, (_, i) => (
          <StarIcon
            key={i}
            className={cn('size-3.5', i < rounded ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/40')}
          />
        ))}
      </span>
      <span className="font-medium tabular-nums">{value.toFixed(1)}</span>
      {count !== undefined && <span className="text-xs text-muted-foreground">({count})</span>}
    </span>
  )
}
