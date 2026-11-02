import type { ReactNode } from 'react'
import { Field, FieldLabel, FieldSet, FieldLegend } from '@/components/ui/field'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

interface YesNoFieldProps {
  id: string
  legend: ReactNode
  /** `null` = not answered. */
  value: boolean | null
  onChange: (value: boolean) => void
  disabled?: boolean
}

/** Optional yes/no question as a horizontal radio group. */
export function YesNoField({ id, legend, value, onChange, disabled }: YesNoFieldProps) {
  return (
    <FieldSet>
      <FieldLegend variant="label">{legend}</FieldLegend>
      <RadioGroup
        className="flex gap-6"
        value={value === null ? null : value ? 'yes' : 'no'}
        onValueChange={(next) => onChange(next === 'yes')}
        disabled={disabled}
      >
        {(['yes', 'no'] as const).map((option) => (
          <Field key={option} orientation="horizontal" className="w-auto">
            <RadioGroupItem value={option} id={`${id}-${option}`} />
            <FieldLabel htmlFor={`${id}-${option}`} className="font-normal">
              {option === 'yes' ? 'Yes' : 'No'}
            </FieldLabel>
          </Field>
        ))}
      </RadioGroup>
    </FieldSet>
  )
}
