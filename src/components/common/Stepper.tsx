import { CheckIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface StepperStep {
  id: string
  label: ReactNode
  description?: ReactNode
}

interface StepperProps {
  steps: StepperStep[]
  /** Index of the current step; earlier steps render as done. */
  current: number
  className?: string
  label?: string
}

/** Horizontal progress stepper (stacks vertically on small screens). */
export function Stepper({ steps, current, className, label = 'Progress' }: StepperProps) {
  return (
    <ol aria-label={label} className={cn('flex flex-col gap-3 sm:flex-row sm:gap-0', className)}>
      {steps.map((step, index) => {
        const done = index < current
        const active = index === current
        return (
          <li
            key={step.id}
            aria-current={active ? 'step' : undefined}
            className="flex flex-1 items-center gap-2 sm:flex-col sm:text-center"
          >
            <div className="flex w-full items-center sm:justify-center">
              <span
                className={cn(
                  'flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-medium',
                  done && 'border-primary bg-primary text-primary-foreground',
                  active && 'border-primary text-primary ring-3 ring-primary/20',
                  !done && !active && 'text-muted-foreground',
                )}
              >
                {done ? <CheckIcon className="size-3.5" /> : index + 1}
              </span>
            </div>
            <div className="flex flex-col text-sm">
              <span className={cn('font-medium', !done && !active && 'text-muted-foreground')}>{step.label}</span>
              {step.description && <span className="text-xs text-muted-foreground">{step.description}</span>}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
