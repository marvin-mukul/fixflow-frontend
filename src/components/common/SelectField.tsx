import type { ReactNode } from 'react'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export interface SelectOption {
  value: string
  label: string
}

interface SelectFieldProps {
  id: string
  label: ReactNode
  options: SelectOption[]
  value: string | null | undefined
  onChange: (value: string) => void
  placeholder?: string
  error?: string
  description?: ReactNode
  disabled?: boolean
}

/** shadcn Field + Select with label, error text and option labels in the trigger. */
export function SelectField({
  id,
  label,
  options,
  value,
  onChange,
  placeholder = 'Select…',
  error,
  description,
  disabled,
}: SelectFieldProps) {
  return (
    <Field data-invalid={!!error || undefined}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Select
        items={options}
        value={value || null}
        onValueChange={(next) => {
          if (typeof next === 'string') onChange(next)
        }}
        disabled={disabled}
      >
        <SelectTrigger
          id={id}
          className="w-full"
          aria-invalid={!!error || undefined}
          aria-describedby={error ? `${id}-error` : undefined}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {description && !error && <FieldDescription>{description}</FieldDescription>}
      {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
    </Field>
  )
}
