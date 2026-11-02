import { useId, useState, type ReactElement, type ReactNode } from 'react'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import { TextareaField } from '@/components/common/TextareaField'
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

interface ReasonDialogProps {
  title: string
  description?: ReactNode
  label?: string
  confirmLabel: string
  destructive?: boolean
  minLength?: number
  trigger: ReactElement
  triggerLabel: ReactNode
  /** Resolve to close; reject with an `Error`/`ApiError` to show its message. */
  onSubmit: (reason: string) => Promise<void>
}

/** Dialog asking for a short reason (reject, cancel…). */
export function ReasonDialog({
  title,
  description,
  label = 'Reason',
  confirmLabel,
  destructive = false,
  minLength = 3,
  trigger,
  triggerLabel,
  onSubmit,
}: ReasonDialogProps) {
  const id = useId()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const onOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) {
      setReason('')
      setError(null)
      setSubmitError(null)
    }
  }

  const submit = async () => {
    if (reason.trim().length < minLength) {
      setError(`Please give a reason (at least ${minLength} characters).`)
      return
    }
    setBusy(true)
    setSubmitError(null)
    try {
      await onSubmit(reason.trim())
      onOpenChange(false)
    } catch (err) {
      setSubmitError(err && typeof err === 'object' && 'message' in err ? String(err.message) : 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger render={trigger}>{triggerLabel}</DialogTrigger>
      <DialogContent>
        <form
          noValidate
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            void submit()
          }}
        >
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
          <ErrorAlert title="Action failed" message={submitError} />
          <TextareaField
            id={`${id}-reason`}
            label={label}
            value={reason}
            error={error ?? undefined}
            onChange={(e) => {
              setReason(e.target.value)
              setError(null)
            }}
          />
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Back</DialogClose>
            <Button type="submit" variant={destructive ? 'destructive' : 'default'} disabled={busy}>
              {busy ? 'Working…' : confirmLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
