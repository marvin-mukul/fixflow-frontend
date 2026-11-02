import { StarIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { cn } from '@/lib/utils'

interface RatingInputProps {
  id: string
  label: ReactNode
  /** Accessible name prefix for the star buttons, e.g. "Quality". */
  name: string
  value: number | null
  onChange: (value: number) => void
  description?: ReactNode
  error?: string
  max?: number
  disabled?: boolean
}

/** 1–5 star picker built from toggle buttons (keyboard and screen-reader friendly). */
export function RatingInput({
  id,
  label,
  name,
  value,
  onChange,
  description,
  error,
  max = 5,
  disabled,
}: RatingInputProps) {
  return (
    <Field data-invalid={!!error || undefined}>
      <FieldLabel id={`${id}-label`}>{label}</FieldLabel>
      <div role="group" aria-labelledby={`${id}-label`} className="flex gap-1">
        {Array.from({ length: max }, (_, i) => {
          const star = i + 1
          const filled = value !== null && star <= value
          return (
            <button
              key={star}
              type="button"
              disabled={disabled}
              aria-pressed={value === star}
              aria-label={`${name}: ${star} star${star === 1 ? '' : 's'}`}
              onClick={() => onChange(star)}
              className="rounded-md p-0.5 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
            >
              <StarIcon
                className={cn('size-6 transition-colors', filled ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/40 hover:text-amber-300')}
              />
            </button>
          )
        })}
      </div>
      {description && !error && <FieldDescription>{description}</FieldDescription>}
      {error && <FieldError>{error}</FieldError>}
    </Field>
  )
}
