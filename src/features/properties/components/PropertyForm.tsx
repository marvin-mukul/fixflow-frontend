import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import { FormField } from '@/components/common/FormField'
import { LocationPicker } from '@/components/common/map/LocationPicker'
import type { LocationValue } from '@/components/common/map/mapConfig'
import { SelectField } from '@/components/common/SelectField'
import { SwitchField } from '@/components/common/SwitchField'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel, FieldSeparator } from '@/components/ui/field'
import { createProperty, updateProperty } from '@/features/properties/store/propertiesSlice'
import { propertySchema, type PropertyValues } from '@/features/properties/types/property.schemas'
import {
  PROPERTY_TYPE_LABELS,
  type Property,
  type PropertyType,
} from '@/features/properties/types/property.types'
import { toApiError } from '@/lib/apiError'
import { applyApiFieldErrors } from '@/lib/form'
import { useAppDispatch } from '@/store/hooks'

const FIELDS = [
  'label',
  'type',
  'addressLine1',
  'addressLine2',
  'city',
  'state',
  'pincode',
  'lat',
  'lng',
  'isOwnerOccupied',
  'autoApproveEmergency',
] as const

const TYPE_OPTIONS = (Object.keys(PROPERTY_TYPE_LABELS) as PropertyType[]).map((value) => ({
  value,
  label: PROPERTY_TYPE_LABELS[value],
}))

interface PropertyFormProps {
  property?: Property
  onSaved: (property: Property) => void
  onCancel?: () => void
}

function toDefaults(property?: Property): Partial<PropertyValues> {
  if (!property) {
    return {
      label: '',
      type: 'FLAT',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      pincode: '',
      isOwnerOccupied: true,
      autoApproveEmergency: false,
    }
  }
  return {
    label: property.label,
    type: property.type,
    addressLine1: property.addressLine1,
    addressLine2: property.addressLine2 ?? '',
    city: property.city,
    state: property.state,
    pincode: property.pincode,
    lat: property.lat,
    lng: property.lng,
    isOwnerOccupied: property.isOwnerOccupied,
    autoApproveEmergency: property.autoApproveEmergency,
  }
}

/** Create or edit a property; location comes from the (lazy) `LocationPicker`. */
export function PropertyForm({ property, onSaved, onCancel }: PropertyFormProps) {
  const dispatch = useAppDispatch()
  const [formError, setFormError] = useState<string | null>(null)
  const {
    control,
    register,
    handleSubmit,
    setError,
    setValue,
    getValues,
    formState: { errors, isSubmitting, isSubmitted },
  } = useForm<PropertyValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: toDefaults(property),
  })
  const [lat, lng] = useWatch({ control, name: ['lat', 'lng'] })
  const location = typeof lat === 'number' && typeof lng === 'number' ? { lat, lng } : null

  const onLocation = (value: LocationValue) => {
    const opts = { shouldValidate: isSubmitted, shouldDirty: true }
    setValue('lat', value.lat, opts)
    setValue('lng', value.lng, opts)
    if (value.address && !getValues('addressLine1')) setValue('addressLine1', value.address, opts)
    if (value.city) setValue('city', value.city, opts)
    if (value.state) setValue('state', value.state, opts)
    if (value.pincode) setValue('pincode', value.pincode, opts)
  }

  const onSubmit = handleSubmit(async ({ addressLine2, ...values }) => {
    setFormError(null)
    const payload = { ...values, addressLine2: addressLine2 ? addressLine2 : null }
    try {
      const saved = property
        ? await dispatch(updateProperty({ id: property.id, payload })).unwrap()
        : await dispatch(createProperty(payload)).unwrap()
      onSaved(saved)
    } catch (err) {
      const error = toApiError(err)
      if (!applyApiFieldErrors(error, setError, FIELDS)) setFormError(error.message)
    }
  })

  const locationError = errors.lat?.message ?? errors.lng?.message

  return (
    <Card>
      <CardHeader>
        <CardTitle>{property ? 'Edit property' : 'Property details'}</CardTitle>
        <CardDescription>Workers only see the exact address once you accept their quote.</CardDescription>
      </CardHeader>
      <CardContent>
        <form noValidate onSubmit={onSubmit}>
          <FieldGroup>
            <ErrorAlert title="Could not save the property" message={formError} />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                id="label"
                label="Name"
                placeholder="Home, Mom's flat…"
                error={errors.label?.message}
                {...register('label')}
              />
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <SelectField
                    id="type"
                    label="Type"
                    options={TYPE_OPTIONS}
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.type?.message}
                  />
                )}
              />
            </div>
            <Field>
              <FieldLabel>Location</FieldLabel>
              <LocationPicker value={location} onChange={onLocation} error={locationError} />
            </Field>
            <FormField
              id="addressLine1"
              label="Address line 1"
              placeholder="House no., street"
              error={errors.addressLine1?.message}
              {...register('addressLine1')}
            />
            <FormField
              id="addressLine2"
              label="Address line 2 (optional)"
              placeholder="Landmark, area"
              error={errors.addressLine2?.message}
              {...register('addressLine2')}
            />
            <div className="grid gap-4 sm:grid-cols-3">
              <FormField id="city" label="City" error={errors.city?.message} {...register('city')} />
              <FormField id="state" label="State" error={errors.state?.message} {...register('state')} />
              <FormField
                id="pincode"
                label="Pincode"
                inputMode="numeric"
                maxLength={6}
                error={errors.pincode?.message}
                {...register('pincode')}
              />
            </div>
            <FieldSeparator />
            <Controller
              control={control}
              name="isOwnerOccupied"
              render={({ field }) => (
                <SwitchField
                  id="isOwnerOccupied"
                  label="I live here"
                  description="Turn off if the property is rented out."
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Controller
              control={control}
              name="autoApproveEmergency"
              render={({ field }) => (
                <SwitchField
                  id="autoApproveEmergency"
                  label="Auto-approve tenant emergencies"
                  description="Emergency requests from tenants go straight to workers."
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <div className="flex justify-end gap-2">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving…' : property ? 'Save changes' : 'Add property'}
              </Button>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
