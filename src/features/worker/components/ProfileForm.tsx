import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import { FormField } from '@/components/common/FormField'
import { LocationPicker } from '@/components/common/map/LocationPicker'
import type { LocationValue } from '@/components/common/map/mapConfig'
import { TextareaField } from '@/components/common/TextareaField'
import { Button } from '@/components/ui/button'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { saveWorkerProfile } from '@/features/worker/store/workerSlice'
import {
  workerProfileSchema,
  type WorkerProfileValues,
} from '@/features/worker/types/worker.schemas'
import type { WorkerProfile } from '@/features/worker/types/worker.types'
import { toApiError } from '@/lib/apiError'
import { applyApiFieldErrors } from '@/lib/form'
import { useAppDispatch } from '@/store/hooks'

const FIELDS = ['bio', 'baseLat', 'baseLng', 'serviceRadiusKm', 'state', 'gstin'] as const

interface ProfileFormProps {
  profile: WorkerProfile | null
  onSaved: (profile: WorkerProfile) => void
  submitLabel?: string
}

/** Base location, service radius, state and GSTIN (`PUT /worker/profile`). */
export function ProfileForm({ profile, onSaved, submitLabel = 'Save profile' }: ProfileFormProps) {
  const dispatch = useAppDispatch()
  const [formError, setFormError] = useState<string | null>(null)
  const {
    control,
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isSubmitting, isSubmitted },
  } = useForm<WorkerProfileValues>({
    resolver: zodResolver(workerProfileSchema),
    defaultValues: {
      bio: profile?.bio ?? '',
      baseLat: profile?.baseLat,
      baseLng: profile?.baseLng,
      serviceRadiusKm: profile?.serviceRadiusKm ?? 10,
      state: profile?.state ?? '',
      gstin: profile?.gstin ?? '',
    },
  })
  const [lat, lng] = useWatch({ control, name: ['baseLat', 'baseLng'] })
  const location = typeof lat === 'number' && typeof lng === 'number' ? { lat, lng } : null

  const onLocation = (value: LocationValue) => {
    const opts = { shouldValidate: isSubmitted, shouldDirty: true }
    setValue('baseLat', value.lat, opts)
    setValue('baseLng', value.lng, opts)
    if (value.state) setValue('state', value.state, opts)
  }

  const onSubmit = handleSubmit(async ({ gstin, ...values }) => {
    setFormError(null)
    try {
      onSaved(await dispatch(saveWorkerProfile({ ...values, gstin: gstin ? gstin : null })).unwrap())
    } catch (err) {
      const error = toApiError(err)
      if (!applyApiFieldErrors(error, setError, FIELDS)) setFormError(error.message)
    }
  })

  return (
    <form noValidate onSubmit={onSubmit}>
      <FieldGroup>
        <ErrorAlert title="Could not save your profile" message={formError} />
        <Field>
          <FieldLabel>Base location</FieldLabel>
          <LocationPicker
            value={location}
            onChange={onLocation}
            error={errors.baseLat?.message ?? errors.baseLng?.message}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <FormField
            id="serviceRadiusKm"
            label="Service radius (km)"
            type="number"
            min={1}
            max={20}
            error={errors.serviceRadiusKm?.message}
            {...register('serviceRadiusKm', { valueAsNumber: true })}
          />
          <FormField id="state" label="State" error={errors.state?.message} {...register('state')} />
          <FormField
            id="gstin"
            label="GSTIN (optional)"
            placeholder="05ABCDE1234F1Z5"
            maxLength={15}
            error={errors.gstin?.message}
            {...register('gstin')}
          />
        </div>
        <TextareaField
          id="bio"
          label="About you (optional)"
          rows={3}
          placeholder="Years of experience, specialities, languages…"
          error={errors.bio?.message}
          {...register('bio')}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : submitLabel}
          </Button>
        </div>
      </FieldGroup>
    </form>
  )
}
