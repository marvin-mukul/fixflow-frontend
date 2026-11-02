import type { ComponentProps, ReactNode } from 'react'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'

interface TextareaFieldProps extends ComponentProps<typeof Textarea> {
  id: string
  label: ReactNode
  error?: string
  description?: ReactNode
}

/** shadcn Field + Label + Textarea + error text. Spread `register('x')` into it. */
export function TextareaField({ id, label, error, description, ...props }: TextareaFieldProps) {
  return (
    <Field data-invalid={!!error || undefined}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Textarea
        id={id}
        aria-invalid={!!error || undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />
      {description && !error && <FieldDescription>{description}</FieldDescription>}
      {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
    </Field>
  )
}
