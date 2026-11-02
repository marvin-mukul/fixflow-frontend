import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router'
import { FormField } from '@/components/common/FormField'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from '@/components/ui/field'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { PATHS } from '@/constants/paths'
import { FormErrorAlert } from '@/features/auth/components/FormErrorAlert'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { registerSchema, type RegisterValues } from '@/features/auth/types/auth.schemas'
import type { SelfRegisterRole } from '@/features/auth/types/auth.types'
import { applyApiFieldErrors } from '@/lib/form'
import { toApiError } from '@/lib/apiError'

const FIELDS = ['name', 'email', 'phone', 'password', 'role'] as const

const ROLE_OPTIONS: { value: SelfRegisterRole; title: string; description: string }[] = [
  {
    value: 'CUSTOMER',
    title: 'I need repairs',
    description: 'Owner or tenant raising repair requests',
  },
  {
    value: 'WORKER',
    title: 'I do repairs',
    description: 'Plumber, electrician, carpenter and more',
  },
]

export function RegisterForm() {
  const { register: registerUser } = useAuth()
  const [formError, setFormError] = useState<string | null>(null)
  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'CUSTOMER', name: '', email: '', phone: '', password: '' },
  })

  const onSubmit = handleSubmit(async ({ phone, ...values }) => {
    setFormError(null)
    try {
      await registerUser({ ...values, ...(phone ? { phone } : {}) })
    } catch (err) {
      const error = toApiError(err)
      if (error.code === 'EMAIL_TAKEN') {
        setError('email', { type: 'server', message: error.message })
      } else if (!applyApiFieldErrors(error, setError, FIELDS)) {
        setFormError(error.message)
      }
    }
  })

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Create your account</CardTitle>
        <CardDescription>Join FixFlow as a customer or a worker</CardDescription>
      </CardHeader>
      <CardContent>
        <form noValidate onSubmit={onSubmit}>
          <FieldGroup>
            <FormErrorAlert title="Could not create account" message={formError} />
            <FieldSet>
              <FieldLegend variant="label">I am joining as</FieldLegend>
              <Controller
                control={control}
                name="role"
                render={({ field }) => (
                  <RadioGroup
                    name={field.name}
                    value={field.value}
                    onValueChange={(value) => field.onChange(value as SelfRegisterRole)}
                    className="grid grid-cols-2 gap-3"
                  >
                    {ROLE_OPTIONS.map((option) => (
                      <FieldLabel key={option.value} htmlFor={`role-${option.value}`}>
                        <Field orientation="horizontal">
                          <FieldContent>
                            <FieldTitle>{option.title}</FieldTitle>
                            <FieldDescription>{option.description}</FieldDescription>
                          </FieldContent>
                          <RadioGroupItem value={option.value} id={`role-${option.value}`} />
                        </Field>
                      </FieldLabel>
                    ))}
                  </RadioGroup>
                )}
              />
            </FieldSet>
            <FormField
              id="name"
              label="Full name"
              autoComplete="name"
              error={errors.name?.message}
              {...register('name')}
            />
            <FormField
              id="email"
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <FormField
              id="phone"
              label="Phone (optional)"
              type="tel"
              autoComplete="tel"
              placeholder="+919800000001"
              error={errors.phone?.message}
              {...register('phone')}
            />
            <FormField
              id="password"
              label="Password"
              type="password"
              autoComplete="new-password"
              description="8–72 characters with an uppercase letter, a lowercase letter and a digit."
              error={errors.password?.message}
              {...register('password')}
            />
            <Field>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating account…' : 'Create account'}
              </Button>
              <FieldDescription className="text-center">
                Already have an account? <Link to={PATHS.LOGIN}>Log in</Link>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
