import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import { FormField } from '@/components/common/FormField'
import { MoneyText } from '@/components/common/MoneyText'
import { TextareaField } from '@/components/common/TextareaField'
import { Button } from '@/components/ui/button'
import { FieldGroup } from '@/components/ui/field'
import { reviseQuote, submitQuote } from '@/features/quotes/store/quotesSlice'
import { quoteSchema, type QuoteValues } from '@/features/quotes/types/quote.schemas'
import type { OwnQuote, Quote, QuotePayload } from '@/features/quotes/types/quote.types'
import { toApiError } from '@/lib/apiError'
import { applyApiFieldErrors } from '@/lib/form'
import { useAppDispatch } from '@/store/hooks'
import type { ApiError } from '@/types/api'
import { istLocalToIso, isoToIstLocal, paiseToRupees, rupeesToPaise } from '@/utils/format'

const FIELDS = ['labour', 'materials', 'etaHours', 'proposedSlot', 'validUntil', 'notes'] as const

/** API paths are in paise (`body.labourPaise`); the form edits rupees (`labour`). */
function toFormFieldErrors(error: ApiError): ApiError {
  return {
    ...error,
    details: error.details.map((d) => ({ ...d, path: d.path.replace(/Paise$/, '') })),
  }
}

function toDefaults(quote?: OwnQuote): QuoteValues {
  return {
    labour: quote ? paiseToRupees(quote.labourPaise) : '',
    materials: quote ? paiseToRupees(quote.materialsPaise) : '0',
    etaHours: quote ? String(quote.etaHours) : '24',
    proposedSlot: quote?.proposedSlot ? isoToIstLocal(quote.proposedSlot) : '',
    validUntil: quote ? isoToIstLocal(quote.validUntil) : '',
    notes: quote?.notes ?? '',
  }
}

interface QuoteFormProps {
  requestId: string
  /** Existing quote → revise mode (PATCH, bumps the version). */
  quote?: OwnQuote
  onSaved: (quote: Quote) => void
  onCancel?: () => void
}

/** Worker quote form: rupee inputs converted to integer paise for the API. */
export function QuoteForm({ requestId, quote, onSaved, onCancel }: QuoteFormProps) {
  const dispatch = useAppDispatch()
  const [formError, setFormError] = useState<string | null>(null)
  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<QuoteValues>({ resolver: zodResolver(quoteSchema), defaultValues: toDefaults(quote) })
  const [labour, materials] = useWatch({ control, name: ['labour', 'materials'] })
  const total = (rupeesToPaise(labour || '0') ?? 0) + (rupeesToPaise(materials || '0') ?? 0)

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)
    const payload: QuotePayload = {
      labourPaise: rupeesToPaise(values.labour) ?? 0,
      materialsPaise: rupeesToPaise(values.materials) ?? 0,
      etaHours: Number(values.etaHours),
      notes: values.notes ? values.notes : null,
      proposedSlot: values.proposedSlot ? istLocalToIso(values.proposedSlot) : null,
      ...(values.validUntil ? { validUntil: istLocalToIso(values.validUntil) } : {}),
    }
    try {
      const saved = quote
        ? await dispatch(reviseQuote({ id: quote.id, payload })).unwrap()
        : await dispatch(submitQuote({ requestId, payload })).unwrap()
      onSaved(saved)
    } catch (err) {
      const error = toApiError(err)
      if (!applyApiFieldErrors(toFormFieldErrors(error), setError, FIELDS)) setFormError(error.message)
    }
  })

  return (
    <form noValidate onSubmit={onSubmit}>
      <FieldGroup>
        <ErrorAlert title={quote ? 'Could not revise the quote' : 'Could not send the quote'} message={formError} />
        <div className="grid gap-4 sm:grid-cols-3">
          <FormField
            id="labour"
            label="Labour (₹)"
            inputMode="decimal"
            placeholder="1500"
            error={errors.labour?.message}
            {...register('labour')}
          />
          <FormField
            id="materials"
            label="Materials (₹)"
            inputMode="decimal"
            placeholder="0"
            error={errors.materials?.message}
            {...register('materials')}
          />
          <FormField
            id="etaHours"
            label="Time needed (hours)"
            inputMode="numeric"
            error={errors.etaHours?.message}
            {...register('etaHours')}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            id="proposedSlot"
            label="Proposed visit (optional, IST)"
            type="datetime-local"
            error={errors.proposedSlot?.message}
            {...register('proposedSlot')}
          />
          <FormField
            id="validUntil"
            label="Valid until (optional, IST)"
            type="datetime-local"
            description="Defaults to the platform setting."
            error={errors.validUntil?.message}
            {...register('validUntil')}
          />
        </div>
        <TextareaField
          id="notes"
          label="Notes for the customer (optional)"
          rows={3}
          error={errors.notes?.message}
          {...register('notes')}
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm text-muted-foreground">
            Total <MoneyText paise={total} className="text-base font-semibold text-foreground" />
          </span>
          <div className="flex gap-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Sending…' : quote ? 'Save revision' : 'Send quote'}
            </Button>
          </div>
        </div>
      </FieldGroup>
    </form>
  )
}
