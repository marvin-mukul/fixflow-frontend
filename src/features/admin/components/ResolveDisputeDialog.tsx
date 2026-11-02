import { GavelIcon } from 'lucide-react'
import { useId, useState } from 'react'
import { toast } from 'sonner'
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
import { Field, FieldContent, FieldDescription, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { resolveDispute } from '@/features/admin/store/adminSlice'
import type { AdminDispute, DisputeOutcome } from '@/features/admin/types/admin.types'
import { toApiError } from '@/lib/apiError'
import { useAppDispatch } from '@/store/hooks'

const OUTCOMES: { value: DisputeOutcome; label: string; description: string }[] = [
  {
    value: 'COMPLETE',
    label: 'Mark the job complete',
    description: 'The work stands; the invoice is issued to the payer.',
  },
  {
    value: 'CANCEL',
    label: 'Cancel the job',
    description: 'The request is cancelled and nothing is billed.',
  },
]

const MIN_RESOLUTION = 5

/** Resolve an open dispute: outcome radio + a written resolution (≥ 5 characters). */
export function ResolveDisputeDialog({ dispute }: { dispute: AdminDispute }) {
  const id = useId()
  const dispatch = useAppDispatch()
  const [open, setOpen] = useState(false)
  const [outcome, setOutcome] = useState<DisputeOutcome | null>(null)
  const [resolution, setResolution] = useState('')
  const [errors, setErrors] = useState<{ outcome?: string; resolution?: string }>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const onOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) {
      setOutcome(null)
      setResolution('')
      setErrors({})
      setSubmitError(null)
    }
  }

  const submit = async () => {
    const nextErrors: typeof errors = {}
    if (!outcome) nextErrors.outcome = 'Choose an outcome.'
    if (resolution.trim().length < MIN_RESOLUTION)
      nextErrors.resolution = `Explain the decision (at least ${MIN_RESOLUTION} characters).`
    setErrors(nextErrors)
    if (!outcome || nextErrors.resolution) return

    setBusy(true)
    setSubmitError(null)
    try {
      await dispatch(
        resolveDispute({ id: dispute.id, payload: { outcome, resolution: resolution.trim() } }),
      ).unwrap()
      toast.success('Dispute resolved')
      onOpenChange(false)
    } catch (err) {
      setSubmitError(toApiError(err).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger render={<Button size="sm" aria-label={`Resolve dispute on ${dispute.requestTitle}`} />}>
        <GavelIcon />
        Resolve
      </DialogTrigger>
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
            <DialogTitle>Resolve dispute</DialogTitle>
            <DialogDescription>
              {dispute.requestTitle} · raised by {dispute.raisedBy.name}: “{dispute.reason}”
            </DialogDescription>
          </DialogHeader>
          <ErrorAlert title="Could not resolve the dispute" message={submitError} />
          <FieldSet data-invalid={!!errors.outcome || undefined}>
            <FieldLegend variant="label">Outcome</FieldLegend>
            <RadioGroup
              value={outcome}
              onValueChange={(next) => {
                setOutcome(next as DisputeOutcome)
                setErrors((e) => ({ ...e, outcome: undefined }))
              }}
            >
              {OUTCOMES.map((o) => (
                <Field key={o.value} orientation="horizontal">
                  <RadioGroupItem value={o.value} id={`${id}-${o.value}`} />
                  <FieldContent>
                    <FieldLabel htmlFor={`${id}-${o.value}`}>{o.label}</FieldLabel>
                    <FieldDescription>{o.description}</FieldDescription>
                  </FieldContent>
                </Field>
              ))}
            </RadioGroup>
            {errors.outcome && <p className="text-sm text-destructive">{errors.outcome}</p>}
          </FieldSet>
          <TextareaField
            id={`${id}-resolution`}
            label="Resolution"
            description="Both parties see this note."
            value={resolution}
            error={errors.resolution}
            onChange={(e) => {
              setResolution(e.target.value)
              setErrors((prev) => ({ ...prev, resolution: undefined }))
            }}
          />
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Back</DialogClose>
            <Button type="submit" disabled={busy}>
              {busy ? 'Resolving…' : 'Resolve dispute'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
