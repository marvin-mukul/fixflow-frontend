import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router'
import { FormField } from '@/components/common/FormField'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldDescription, FieldGroup } from '@/components/ui/field'
import { PATHS } from '@/constants/paths'
import { FormErrorAlert } from '@/features/auth/components/FormErrorAlert'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { loginSchema, type LoginValues } from '@/features/auth/types/auth.schemas'
import { applyApiFieldErrors } from '@/lib/form'
import { toApiError } from '@/lib/apiError'

const FIELDS = ['email', 'password'] as const

/**
 * Successful login updates the store; the guest-only route guard then
 * redirects to `from` or the user's role home.
 */
export function LoginForm() {
  const { login } = useAuth()
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)
    try {
      await login(values)
    } catch (err) {
      const error = toApiError(err)
      if (!applyApiFieldErrors(error, setError, FIELDS)) setFormError(error.message)
    }
  })

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Welcome back</CardTitle>
        <CardDescription>Log in to manage your repairs and jobs</CardDescription>
      </CardHeader>
      <CardContent>
        <form noValidate onSubmit={onSubmit}>
          <FieldGroup>
            <FormErrorAlert title="Could not log in" message={formError} />
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
              id="password"
              label="Password"
              type="password"
              autoComplete="current-password"
              error={errors.password?.message}
              {...register('password')}
            />
            <Field>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Logging in…' : 'Log in'}
              </Button>
              <FieldDescription className="text-center">
                Don&apos;t have an account? <Link to={PATHS.REGISTER}>Sign up</Link>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
