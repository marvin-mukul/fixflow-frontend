import { zodResolver } from '@hookform/resolvers/zod'
import { Building2Icon, PlusIcon, Trash2Icon } from 'lucide-react'
import { useState } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { Link } from 'react-router'
import { toast } from 'sonner'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import { FileUploader } from '@/components/common/FileUploader'
import { FormField } from '@/components/common/FormField'
import { Loader } from '@/components/common/Loader'
import { SelectField } from '@/components/common/SelectField'
import { TextareaField } from '@/components/common/TextareaField'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  FieldDescription,
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from '@/components/ui/field'
import { PATHS } from '@/constants/paths'
import { PRIORITIES, PRIORITY } from '@/constants/status'
import { useCategories } from '@/hooks/useCategories'
import { createRequest, uploadRequestMedia } from '@/features/requests/store/requestsSlice'
import {
  raiseRequestSchema,
  type RaiseRequestValues,
} from '@/features/requests/types/request.schemas'
import type { RepairRequest } from '@/features/requests/types/request.types'
import { toApiError } from '@/lib/apiError'
import { applyApiFieldErrors } from '@/lib/form'
import { useAppDispatch } from '@/store/hooks'
import { istLocalToIso } from '@/utils/format'

const MAX_SLOTS = 3
const FIELDS = [
  'propertyId',
  'categoryId',
  'title',
  'description',
  'priority',
  'preferredSlots',
  ...Array.from({ length: MAX_SLOTS }, (_, i) => [
    `preferredSlots.${i}.start` as const,
    `preferredSlots.${i}.end` as const,
  ]).flat(),
] as const

const PRIORITY_OPTIONS = PRIORITIES.map((p) => ({
  value: p,
  label: `${PRIORITY[p].label} — ${PRIORITY[p].description}`,
}))

export interface PropertyOption {
  id: string
  label: string
  relation: 'OWNER' | 'TENANT'
}

interface RaiseRequestFormProps {
  properties: PropertyOption[]
  propertiesLoading: boolean
  defaultPropertyId?: string
  onCreated: (request: RepairRequest) => void
}

export function RaiseRequestForm({
  properties,
  propertiesLoading,
  defaultPropertyId,
  onCreated,
}: RaiseRequestFormProps) {
  if (propertiesLoading) return <Loader />
  if (properties.length === 0) {
    return (
      <EmptyState
        icon={<Building2Icon />}
        title="Add a property first"
        description="Requests belong to a property. Add your home, or ask your landlord for an invite."
        className="rounded-xl border border-dashed"
        action={
          <Link to={PATHS.CUSTOMER_PROPERTY_NEW} className={buttonVariants()}>
            Add property
          </Link>
        }
      />
    )
  }
  const initialProperty =
    defaultPropertyId && properties.some((p) => p.id === defaultPropertyId)
      ? defaultPropertyId
      : properties.length === 1
        ? properties[0]!.id
        : ''
  return (
    <RaiseRequestFormInner
      properties={properties}
      initialPropertyId={initialProperty}
      onCreated={onCreated}
    />
  )
}

function RaiseRequestFormInner({
  properties,
  initialPropertyId,
  onCreated,
}: {
  properties: PropertyOption[]
  initialPropertyId: string
  onCreated: (request: RepairRequest) => void
}) {
  const dispatch = useAppDispatch()
  const categories = useCategories()
  const [photos, setPhotos] = useState<File[]>([])
  const [formError, setFormError] = useState<string | null>(null)
  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RaiseRequestValues>({
    resolver: zodResolver(raiseRequestSchema),
    defaultValues: {
      propertyId: initialPropertyId,
      categoryId: '',
      title: '',
      description: '',
      priority: 'MEDIUM',
      preferredSlots: [],
    },
  })
  const slots = useFieldArray({ control, name: 'preferredSlots' })

  const onSubmit = handleSubmit(async ({ preferredSlots, ...values }) => {
    setFormError(null)
    let created: RepairRequest
    try {
      created = await dispatch(
        createRequest({
          ...values,
          preferredSlots: preferredSlots.map((s) => ({
            start: istLocalToIso(s.start),
            end: istLocalToIso(s.end),
          })),
        }),
      ).unwrap()
    } catch (err) {
      const error = toApiError(err)
      if (!applyApiFieldErrors(error, setError, FIELDS)) setFormError(error.message)
      return
    }
    if (photos.length > 0) {
      try {
        created = await dispatch(uploadRequestMedia({ id: created.id, files: photos })).unwrap()
      } catch (err) {
        toast.warning('Request created, but the photos could not be uploaded', {
          description: toApiError(err).message,
        })
      }
    }
    onCreated(created)
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>What needs fixing?</CardTitle>
        <CardDescription>
          Tenants' requests go to the owner for approval first (emergencies may be auto-approved).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form noValidate onSubmit={onSubmit}>
          <FieldGroup>
            <ErrorAlert title="Could not raise the request" message={formError} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                control={control}
                name="propertyId"
                render={({ field }) => (
                  <SelectField
                    id="propertyId"
                    label="Property"
                    placeholder="Choose a property"
                    options={properties.map((p) => ({
                      value: p.id,
                      label: p.relation === 'TENANT' ? `${p.label} (tenant)` : p.label,
                    }))}
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.propertyId?.message}
                  />
                )}
              />
              <Controller
                control={control}
                name="categoryId"
                render={({ field }) => (
                  <SelectField
                    id="categoryId"
                    label="Category"
                    placeholder={categories.loading ? 'Loading…' : 'Choose a category'}
                    disabled={categories.loading}
                    options={categories.items.map((c) => ({ value: c.id, label: c.name }))}
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.categoryId?.message ?? categories.error?.message}
                  />
                )}
              />
            </div>
            <FormField
              id="title"
              label="Title"
              placeholder="Kitchen sink is leaking"
              error={errors.title?.message}
              {...register('title')}
            />
            <TextareaField
              id="description"
              label="Description"
              placeholder="What happened, since when, anything the worker should know…"
              rows={4}
              error={errors.description?.message}
              {...register('description')}
            />
            <Controller
              control={control}
              name="priority"
              render={({ field }) => (
                <SelectField
                  id="priority"
                  label="Priority"
                  options={PRIORITY_OPTIONS}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.priority?.message}
                />
              )}
            />
            <FieldSeparator />
            <FieldSet>
              <FieldLegend variant="label">Preferred time slots (optional)</FieldLegend>
              <FieldDescription>Up to 3 windows that suit you. Times are in IST.</FieldDescription>
              {slots.fields.map((slot, index) => (
                <div key={slot.id} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-start">
                  <FormField
                    id={`slot-${index}-start`}
                    label={`Slot ${index + 1} from`}
                    type="datetime-local"
                    error={errors.preferredSlots?.[index]?.start?.message}
                    {...register(`preferredSlots.${index}.start`)}
                  />
                  <FormField
                    id={`slot-${index}-end`}
                    label={`Slot ${index + 1} to`}
                    type="datetime-local"
                    error={errors.preferredSlots?.[index]?.end?.message}
                    {...register(`preferredSlots.${index}.end`)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="sm:mt-6"
                    aria-label={`Remove slot ${index + 1}`}
                    onClick={() => slots.remove(index)}
                  >
                    <Trash2Icon />
                  </Button>
                </div>
              ))}
              {errors.preferredSlots?.message && (
                <p className="text-sm text-destructive">{errors.preferredSlots.message}</p>
              )}
              <Button
                type="button"
                variant="outline"
                className="self-start"
                disabled={slots.fields.length >= MAX_SLOTS}
                onClick={() => slots.append({ start: '', end: '' })}
              >
                <PlusIcon />
                Add time slot
              </Button>
            </FieldSet>
            <FieldSeparator />
            <FieldSet>
              <FieldLegend variant="label">Photos (optional)</FieldLegend>
              <FileUploader files={photos} onChange={setPhotos} disabled={isSubmitting} />
            </FieldSet>
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting…' : 'Raise request'}
              </Button>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
