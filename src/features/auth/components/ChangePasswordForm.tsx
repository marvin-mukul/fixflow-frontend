import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { FormField } from '@/components/common/FormField'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldGroup } from '@/components/ui/field'
import { FormErrorAlert } from '@/features/auth/components/FormErrorAlert'
import { useAuth } from '@/features/auth/hooks/useAuth'
import {
  changePasswordSchema,
  type ChangePasswordValues,
} from '@/features/auth/types/auth.schemas'
import { homePathForRole } from '@/features/auth/utils/roleHome'
import { applyApiFieldErrors } from '@/lib/form'
import { toApiError } from '@/lib/apiError'

const FIELDS = ['currentPassword', 'newPassword'] as const

export function ChangePasswordForm() {
  const { user, changePassword } = useAuth()
  const navigate = useNavigate()
  const [formError, setFormError] = useState<string | null>(null)
  const forced = user?.mustChangePassword ?? false
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  })

  const onSubmit = handleSubmit(async ({ currentPassword, newPassword }) => {
    setFormError(null)
    try {
      const { user: updated } = await changePassword({ currentPassword, newPassword })
      toast.success('Password updated')
      navigate(homePathForRole(updated.globalRole), { replace: true })
    } catch (err) {
      const error = toApiError(err)
      if (!applyApiFieldErrors(error, setError, FIELDS)) setFormError(error.message)
    }
  })

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Change password</CardTitle>
        <CardDescription>
          {forced
            ? 'For your security, set a new password before continuing.'
            : 'Choose a new password for your account.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form noValidate onSubmit={onSubmit}>
          <FieldGroup>
            <FormErrorAlert title="Could not change password" message={formError} />
            <FormField
              id="currentPassword"
              label="Current password"
              type="password"
              autoComplete="current-password"
              error={errors.currentPassword?.message}
              {...register('currentPassword')}
            />
            <FormField
              id="newPassword"
              label="New password"
              type="password"
              autoComplete="new-password"
              description="8–72 characters with an uppercase letter, a lowercase letter and a digit."
              error={errors.newPassword?.message}
              {...register('newPassword')}
            />
            <FormField
              id="confirmPassword"
              label="Confirm new password"
              type="password"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />
            <Field>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving…' : 'Update password'}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
