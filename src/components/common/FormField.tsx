import type { ComponentProps, ReactNode } from 'react'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

interface FormFieldProps extends ComponentProps<typeof Input> {
  id: string
  label: ReactNode
  error?: string
  description?: ReactNode
  /** Rendered on the label row, right-aligned (e.g. a "Forgot password?" link). */
  labelAction?: ReactNode
}

/** shadcn Field + Label + Input + error text. Spread `register('x')` into it. */
export function FormField({
  id,
  label,
  error,
  description,
  labelAction,
  ...inputProps
}: FormFieldProps) {
  const describedBy = error ? `${id}-error` : description ? `${id}-description` : undefined
  return (
    <Field data-invalid={!!error || undefined}>
      <div className="flex items-center">
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
        {labelAction && <div className="ml-auto text-sm">{labelAction}</div>}
      </div>
      <Input id={id} aria-invalid={!!error || undefined} aria-describedby={describedBy} {...inputProps} />
      {description && !error && (
        <FieldDescription id={`${id}-description`}>{description}</FieldDescription>
      )}
      {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
    </Field>
  )
}
