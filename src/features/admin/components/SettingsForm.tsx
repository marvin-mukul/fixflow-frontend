import { zodResolver } from '@hookform/resolvers/zod'
import { InfoIcon, LockIcon } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Controller, useForm, type Path } from 'react-hook-form'
import { toast } from 'sonner'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import { FormField } from '@/components/common/FormField'
import { Loader } from '@/components/common/Loader'
import { SwitchField } from '@/components/common/SwitchField'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useSettings } from '@/features/admin/hooks/useAdmin'
import { saveSettings } from '@/features/admin/store/adminSlice'
import { settingsSchema, type SettingsValues } from '@/features/admin/types/admin.schemas'
import type { PlatformSettings } from '@/features/admin/types/admin.types'
import { toApiError } from '@/lib/apiError'
import { applyApiFieldErrors } from '@/lib/form'
import { useAppDispatch } from '@/store/hooks'

type NumberField = Exclude<Path<SettingsValues>, 'gstOnCommission' | 'quoteWindowHours' | 'rankingWeights'>

const ALL_FIELDS: readonly Path<SettingsValues>[] = [
  'commissionPercent',
  'gstPercent',
  'tcsPercent',
  'gstOnCommission',
  'matchRadiusKm',
  'reopenRadiusKm',
  'fanoutLimit',
  'newcomerSlots',
  'quoteWindowHours.LOW',
  'quoteWindowHours.MEDIUM',
  'quoteWindowHours.HIGH',
  'quoteWindowHours.EMERGENCY',
  'autoConfirmHours',
  'reviewWindowDays',
  'rankingWeights.rating',
  'rankingWeights.distance',
  'rankingWeights.completion',
  'rankingWeights.response',
  'bayesianC',
  'bayesianPriorMean',
]

interface FieldSpec {
  name: NumberField
  label: string
  description?: string
  step?: string
}

const SECTIONS: { title: string; description: string; fields: FieldSpec[]; note?: ReactNode }[] = [
  {
    title: 'Money',
    description: 'Commission and tax rates applied when an invoice is issued.',
    note: 'Changes only affect new invoices. Issued invoices keep the rates they were created with.',
    fields: [
      { name: 'commissionPercent', label: 'Commission (%)', description: '0–50, deducted from the worker payout.', step: '0.01' },
      { name: 'gstPercent', label: 'GST (%)', description: '0–40, charged to the customer.', step: '0.01' },
      { name: 'tcsPercent', label: 'TCS (%)', description: '0–5, for GST-registered workers.', step: '0.01' },
    ],
  },
  {
    title: 'Matching',
    description: 'How far and how widely new requests are sent to workers.',
    fields: [
      { name: 'matchRadiusKm', label: 'Match radius (km)', description: '1–50' },
      { name: 'reopenRadiusKm', label: 'Reopen radius (km)', description: '1–100, used when a request is reopened.' },
      { name: 'fanoutLimit', label: 'Fan-out limit', description: '1–100 workers per request.' },
      { name: 'newcomerSlots', label: 'Newcomer slots', description: '0–10 slots reserved for new workers.' },
    ],
  },
  {
    title: 'Timing',
    description: 'Quote windows per priority and follow-up deadlines.',
    fields: [
      { name: 'quoteWindowHours.LOW', label: 'Quote window: low (h)', step: '0.25' },
      { name: 'quoteWindowHours.MEDIUM', label: 'Quote window: medium (h)', step: '0.25' },
      { name: 'quoteWindowHours.HIGH', label: 'Quote window: high (h)', step: '0.25' },
      { name: 'quoteWindowHours.EMERGENCY', label: 'Quote window: emergency (h)', step: '0.25' },
      { name: 'autoConfirmHours', label: 'Auto-confirm after (h)', description: 'Completed jobs are confirmed automatically.' },
      { name: 'reviewWindowDays', label: 'Review window (days)' },
    ],
  },
  {
    title: 'Ranking',
    description: 'Weights (0–1) for ranking quotes, and the Bayesian rating prior.',
    fields: [
      { name: 'rankingWeights.rating', label: 'Weight: rating', step: '0.01' },
      { name: 'rankingWeights.distance', label: 'Weight: distance', step: '0.01' },
      { name: 'rankingWeights.completion', label: 'Weight: completion', step: '0.01' },
      { name: 'rankingWeights.response', label: 'Weight: response', step: '0.01' },
      { name: 'bayesianC', label: 'Bayesian C', description: 'Confidence weight of the prior.', step: '0.1' },
      { name: 'bayesianPriorMean', label: 'Bayesian prior mean', description: '1–5', step: '0.1' },
    ],
  },
]

function fieldError(errors: object, name: string): string | undefined {
  const value = name.split('.').reduce<unknown>((node, key) => (node as Record<string, unknown> | undefined)?.[key], errors)
  return (value as { message?: string } | undefined)?.message
}

interface SettingsFormProps {
  /** Only superadmins may change settings; admins see them read-only. */
  canEdit: boolean
}

/** Platform settings grouped by money, matching, timing and ranking. */
export function SettingsForm({ canEdit }: SettingsFormProps) {
  const dispatch = useAppDispatch()
  const { value: settings, error: loadError, reload } = useSettings()
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isDirty, dirtyFields },
  } = useForm<SettingsValues>({
    resolver: zodResolver(settingsSchema),
    values: settings ?? undefined,
  })

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)
    // Partial update: send only the top-level keys that changed.
    const payload: Partial<PlatformSettings> = {}
    for (const key of Object.keys(dirtyFields) as (keyof SettingsValues)[]) {
      Object.assign(payload, { [key]: values[key] })
    }
    try {
      await dispatch(saveSettings(payload)).unwrap()
      toast.success('Settings saved')
    } catch (err) {
      const error = toApiError(err)
      if (!applyApiFieldErrors(error, setError, ALL_FIELDS)) setFormError(error.message)
    }
  })

  if (!settings) {
    return loadError ? (
      <ErrorAlert
        title="Could not load settings"
        message={loadError.message}
        action={
          <Button size="sm" variant="outline" onClick={reload}>
            Retry
          </Button>
        }
      />
    ) : (
      <Loader label="Loading settings…" />
    )
  }

  const readOnly = !canEdit

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-6">
      {readOnly && (
        <Alert>
          <LockIcon />
          <AlertTitle>Read-only</AlertTitle>
          <AlertDescription>Only a superadmin can change platform settings.</AlertDescription>
        </Alert>
      )}
      <ErrorAlert title="Could not save settings" message={formError} />
      {SECTIONS.map((section) => (
        <Card key={section.title}>
          <CardHeader>
            <CardTitle>{section.title}</CardTitle>
            <CardDescription>{section.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {section.note && (
              <Alert>
                <InfoIcon />
                <AlertDescription>{section.note}</AlertDescription>
              </Alert>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              {section.fields.map((field) => (
                <FormField
                  key={field.name}
                  id={`settings-${field.name}`}
                  label={field.label}
                  type="number"
                  inputMode="decimal"
                  step={field.step ?? '1'}
                  description={field.description}
                  error={fieldError(errors, field.name)}
                  {...register(field.name, { valueAsNumber: true })}
                  disabled={readOnly}
                />
              ))}
            </div>
            {section.title === 'Money' && (
              <Controller
                control={control}
                name="gstOnCommission"
                render={({ field }) => (
                  <SwitchField
                    id="settings-gstOnCommission"
                    label="Charge GST on commission"
                    description="Adds GST on the platform commission deducted from payouts."
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={readOnly}
                  />
                )}
              />
            )}
          </CardContent>
        </Card>
      ))}
      {canEdit && (
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting || !isDirty}>
            {isSubmitting ? 'Saving…' : 'Save settings'}
          </Button>
        </div>
      )}
    </form>
  )
}
