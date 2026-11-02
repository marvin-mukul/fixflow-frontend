import { zodResolver } from '@hookform/resolvers/zod'
import { UserPlusIcon } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import { FormField } from '@/components/common/FormField'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { createAdmin } from '@/features/admin/store/adminSlice'
import { createAdminSchema, type CreateAdminValues } from '@/features/admin/types/admin.schemas'
import { toApiError } from '@/lib/apiError'
import { applyApiFieldErrors } from '@/lib/form'
import { useAppDispatch } from '@/store/hooks'

const DEFAULTS: CreateAdminValues = { name: '', email: '', password: '' }

/** Superadmin: create an admin with a temporary password (changed on first login). */
export function CreateAdminDialog() {
  const dispatch = useAppDispatch()
  const [open, setOpen] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateAdminValues>({ resolver: zodResolver(createAdminSchema), defaultValues: DEFAULTS })

  const onOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) {
      reset(DEFAULTS)
      setFormError(null)
    }
  }

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)
    try {
      const created = await dispatch(createAdmin(values)).unwrap()
      toast.success(`Admin ${created.name} created`, {
        description: 'Share the temporary password securely; they must change it on first login.',
      })
      onOpenChange(false)
    } catch (err) {
      const error = toApiError(err)
      if (error.status === 409) {
        setError('email', { type: 'server', message: 'An account with this email already exists.' })
      } else if (!applyApiFieldErrors(error, setError, ['name', 'email', 'password'])) {
        setFormError(error.message)
      }
    }
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger render={<Button />}>
        <UserPlusIcon />
        New admin
      </DialogTrigger>
      <DialogContent>
        <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>New admin</DialogTitle>
            <DialogDescription>
              Admins verify workers, resolve disputes and issue refunds. They must change this password on
              first login.
            </DialogDescription>
          </DialogHeader>
          <ErrorAlert title="Could not create the admin" message={formError} />
          <FormField id="admin-name" label="Name" error={errors.name?.message} {...register('name')} />
          <FormField
            id="admin-email"
            label="Email"
            type="email"
            autoComplete="off"
            error={errors.email?.message}
            {...register('email')}
          />
          <FormField
            id="admin-password"
            label="Temporary password"
            type="password"
            autoComplete="new-password"
            description="At least 8 characters."
            error={errors.password?.message}
            {...register('password')}
          />
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating…' : 'Create admin'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
