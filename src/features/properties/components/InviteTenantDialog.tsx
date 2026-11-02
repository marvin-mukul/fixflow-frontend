import { zodResolver } from '@hookform/resolvers/zod'
import { MailPlusIcon } from 'lucide-react'
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
import { inviteTenant } from '@/features/properties/store/propertiesSlice'
import { inviteSchema, type InviteValues } from '@/features/properties/types/property.schemas'
import { toApiError } from '@/lib/apiError'
import { applyApiFieldErrors } from '@/lib/form'
import { useAppDispatch } from '@/store/hooks'
import { formatDate } from '@/utils/format'

export function InviteTenantDialog({ propertyId }: { propertyId: string }) {
  const dispatch = useAppDispatch()
  const [open, setOpen] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InviteValues>({ resolver: zodResolver(inviteSchema), defaultValues: { email: '' } })

  const onOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) {
      reset()
      setFormError(null)
    }
  }

  const onSubmit = handleSubmit(async ({ email }) => {
    setFormError(null)
    try {
      const { created } = await dispatch(inviteTenant({ propertyId, email })).unwrap()
      toast.success(`Invitation sent to ${created.email}`, {
        description: `The link expires on ${formatDate(created.expiresAt)}.`,
      })
      onOpenChange(false)
    } catch (err) {
      const error = toApiError(err)
      if (!applyApiFieldErrors(error, setError, ['email'])) setFormError(error.message)
    }
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger render={<Button variant="outline" />}>
        <MailPlusIcon />
        Invite tenant
      </DialogTrigger>
      <DialogContent>
        <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Invite a tenant</DialogTitle>
            <DialogDescription>
              We email them a link. Once they accept, they can raise repair requests for this
              property.
            </DialogDescription>
          </DialogHeader>
          <ErrorAlert title="Could not send the invitation" message={formError} />
          <FormField
            id="invite-email"
            label="Tenant email"
            type="email"
            autoComplete="off"
            error={errors.email?.message}
            {...register('email')}
          />
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Sending…' : 'Send invitation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
