import { Undo2Icon } from 'lucide-react'
import { useId, useState } from 'react'
import { toast } from 'sonner'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import { FormField } from '@/components/common/FormField'
import { MoneyText } from '@/components/common/MoneyText'
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
import { refundPayment } from '@/features/admin/store/adminSlice'
import type { AdminPayment } from '@/features/admin/types/admin.types'
import { toApiError } from '@/lib/apiError'
import { useAppDispatch } from '@/store/hooks'
import { formatPaise, paiseToRupees, rupeesToPaise } from '@/utils/format'

const MIN_REASON = 3

/** Full or partial refund: optional amount in rupees (sent as paise) + reason. */
export function RefundDialog({ payment }: { payment: AdminPayment }) {
  const id = useId()
  const dispatch = useAppDispatch()
  const remaining = payment.amountPaise - payment.refundedPaise
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')
  const [errors, setErrors] = useState<{ amount?: string; reason?: string }>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const onOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) {
      setAmount('')
      setReason('')
      setErrors({})
      setSubmitError(null)
    }
  }

  const submit = async () => {
    const nextErrors: typeof errors = {}
    let amountPaise: number | undefined
    if (amount.trim() !== '') {
      const paise = rupeesToPaise(amount)
      if (paise === null || paise <= 0) nextErrors.amount = 'Enter a valid amount in rupees.'
      else if (paise > remaining) nextErrors.amount = `At most ${formatPaise(remaining)} can be refunded.`
      else amountPaise = paise
    }
    if (reason.trim().length < MIN_REASON) nextErrors.reason = `Give a reason (at least ${MIN_REASON} characters).`
    setErrors(nextErrors)
    if (nextErrors.amount || nextErrors.reason) return

    setBusy(true)
    setSubmitError(null)
    try {
      const result = await dispatch(
        refundPayment({ id: payment.id, payload: { amountPaise, reason: reason.trim() } }),
      ).unwrap()
      toast.success(`Refund ${result.providerStatus === 'DONE' ? 'completed' : 'requested'}`, {
        description: `${formatPaise(result.refundedPaise)} refunded on ${payment.invoice.number} so far.`,
      })
      onOpenChange(false)
    } catch (err) {
      const apiError = toApiError(err)
      const amountDetail = apiError.details.find((d) => d.path === 'body.amountPaise')
      if (amountDetail) setErrors({ amount: amountDetail.message })
      else setSubmitError(apiError.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger
        render={<Button size="sm" variant="outline" aria-label={`Refund ${payment.invoice.number}`} />}
      >
        <Undo2Icon />
        Refund
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
            <DialogTitle>Refund {payment.invoice.number}</DialogTitle>
            <DialogDescription>
              Paid <MoneyText paise={payment.amountPaise} />, already refunded{' '}
              <MoneyText paise={payment.refundedPaise} />. Up to <MoneyText paise={remaining} /> can be refunded.
            </DialogDescription>
          </DialogHeader>
          <ErrorAlert title="Refund failed" message={submitError} />
          <FormField
            id={`${id}-amount`}
            label="Amount (₹, optional)"
            inputMode="decimal"
            placeholder={paiseToRupees(remaining)}
            description="Leave empty to refund the full remaining amount."
            value={amount}
            error={errors.amount}
            onChange={(e) => {
              setAmount(e.target.value)
              setErrors((prev) => ({ ...prev, amount: undefined }))
            }}
          />
          <TextareaField
            id={`${id}-reason`}
            label="Reason"
            value={reason}
            error={errors.reason}
            onChange={(e) => {
              setReason(e.target.value)
              setErrors((prev) => ({ ...prev, reason: undefined }))
            }}
          />
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Back</DialogClose>
            <Button type="submit" variant="destructive" disabled={busy}>
              {busy ? 'Refunding…' : 'Refund'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
