import { CheckCheckIcon } from 'lucide-react'
import { useId, useState } from 'react'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import { FileUploader } from '@/components/common/FileUploader'
import { FormField } from '@/components/common/FormField'
import { MoneyText } from '@/components/common/MoneyText'
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
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { completeJob } from '@/features/jobs/store/jobsSlice'
import type { Job } from '@/features/jobs/types/job.types'
import { toApiError } from '@/lib/apiError'
import { useAppDispatch } from '@/store/hooks'
import { paiseToRupees, rupeesToPaise } from '@/utils/format'

const MAX_AFTER_PHOTOS = 5

interface CompleteJobDialogProps {
  job: Job
  onCompleted: () => void
}

/** "Mark complete": 1–5 after photos plus an optional final amount (≤ the quote). */
export function CompleteJobDialog({ job, onCompleted }: CompleteJobDialogProps) {
  const id = useId()
  const dispatch = useAppDispatch()
  const [open, setOpen] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [amount, setAmount] = useState('')
  const [photoError, setPhotoError] = useState<string | null>(null)
  const [amountError, setAmountError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const onOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) {
      setFiles([])
      setAmount('')
      setPhotoError(null)
      setAmountError(null)
      setSubmitError(null)
    }
  }

  const submit = async () => {
    let valid = true
    if (files.length === 0) {
      setPhotoError('Add at least one photo of the finished work.')
      valid = false
    }
    let finalAmountPaise: number | undefined
    if (amount.trim() !== '') {
      const paise = rupeesToPaise(amount)
      if (paise === null || paise <= 0) {
        setAmountError('Enter a valid amount in rupees.')
        valid = false
      } else if (paise > job.quote.totalPaise) {
        setAmountError(`The final amount cannot exceed the quote (₹${paiseToRupees(job.quote.totalPaise)}).`)
        valid = false
      } else {
        finalAmountPaise = paise
      }
    }
    if (!valid) return

    setBusy(true)
    setSubmitError(null)
    try {
      await dispatch(completeJob({ id: job.id, payload: { files, finalAmountPaise } })).unwrap()
      onOpenChange(false)
      onCompleted()
    } catch (err) {
      setSubmitError(toApiError(err).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger render={<Button />}>
        <CheckCheckIcon />
        Mark complete
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <form
          noValidate
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            void submit()
          }}
        >
          <DialogHeader>
            <DialogTitle>Complete the job</DialogTitle>
            <DialogDescription>
              Add photos of the finished work. The customer then confirms and the invoice is issued.
            </DialogDescription>
          </DialogHeader>
          <ErrorAlert title="Could not complete the job" message={submitError} />
          <Field data-invalid={!!photoError || undefined}>
            <FieldLabel>After photos</FieldLabel>
            <FileUploader
              files={files}
              maxFiles={MAX_AFTER_PHOTOS}
              label="Add after photos"
              disabled={busy}
              onChange={(next) => {
                setFiles(next)
                setPhotoError(null)
              }}
            />
            {photoError && <FieldError>{photoError}</FieldError>}
          </Field>
          <FormField
            id={`${id}-amount`}
            label="Final amount (₹, optional)"
            inputMode="decimal"
            placeholder={paiseToRupees(job.quote.totalPaise)}
            value={amount}
            error={amountError ?? undefined}
            description={
              <>
                Leave empty to bill the quoted <MoneyText paise={job.quote.totalPaise} />. It can only go down.
              </>
            }
            onChange={(e) => {
              setAmount(e.target.value)
              setAmountError(null)
            }}
          />
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Back</DialogClose>
            <Button type="submit" disabled={busy}>
              {busy ? 'Uploading…' : 'Complete job'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
