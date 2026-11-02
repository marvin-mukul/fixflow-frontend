import { useId, useState } from 'react'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import { RatingInput } from '@/components/common/RatingInput'
import { TextareaField } from '@/components/common/TextareaField'
import { YesNoField } from '@/components/common/YesNoField'
import { Button } from '@/components/ui/button'
import { createReview, updateReview } from '@/features/reviews/store/reviewsSlice'
import type { RatingDimension, Review, ReviewPayload } from '@/features/reviews/types/review.types'
import { allowedDimensions, DIMENSION_LABELS, isWorkerReviewer } from '@/features/reviews/utils/dimensions'
import { toApiError } from '@/lib/apiError'
import { useAppDispatch } from '@/store/hooks'

type Scores = Partial<Record<RatingDimension | 'overall', number>>

interface ReviewFormProps {
  jobId: string
  /** The viewer's relations to the job (`myRelations`), which decide the dimensions. */
  relations: readonly string[]
  /** Edit mode: the review to update (PATCH, allowed once within 24 h). */
  existing?: Pick<Review, 'id' | 'overall'> & Partial<Review>
  onSaved?: (review: Review) => void
  onCancel?: () => void
}

const COMMENT_MAX = 1000

/** Dimension-aware review form: only the ratings the API allows for this viewer are shown. */
export function ReviewForm({ jobId, relations, existing, onSaved, onCancel }: ReviewFormProps) {
  const id = useId()
  const dispatch = useAppDispatch()
  const workerVariant = isWorkerReviewer(relations)
  const dimensions = allowedDimensions(relations)

  const [scores, setScores] = useState<Scores>(() => {
    const initial: Scores = { overall: existing?.overall }
    for (const d of dimensions) {
      const value = existing?.[d]
      if (typeof value === 'number') initial[d] = value
    }
    return initial
  })
  const [wouldRehire, setWouldRehire] = useState<boolean | null>(existing?.wouldRehire ?? null)
  const [costMatched, setCostMatched] = useState<boolean | null>(existing?.finalCostMatchedQuote ?? null)
  const [comment, setComment] = useState(existing?.comment ?? '')
  const [overallError, setOverallError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const setScore = (key: keyof Scores, value: number) => {
    setScores((s) => ({ ...s, [key]: value }))
    if (key === 'overall') setOverallError(null)
  }

  const submit = async () => {
    if (!scores.overall) {
      setOverallError('Give an overall rating.')
      return
    }
    const payload: ReviewPayload = { overall: scores.overall }
    for (const d of dimensions) {
      const value = scores[d]
      if (value) payload[d] = value
    }
    if (!workerVariant) {
      if (wouldRehire !== null) payload.wouldRehire = wouldRehire
      if (costMatched !== null) payload.finalCostMatchedQuote = costMatched
    }
    if (comment.trim()) payload.comment = comment.trim()

    setBusy(true)
    setSubmitError(null)
    try {
      const review = existing
        ? await dispatch(updateReview({ id: existing.id, payload })).unwrap()
        : await dispatch(createReview({ jobId, payload })).unwrap()
      onSaved?.(review)
    } catch (err) {
      const error = toApiError(err)
      setSubmitError(error.details.length > 0 ? error.details.map((d) => d.message).join(' ') : error.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form
      noValidate
      aria-label={workerVariant ? 'Rate the customer' : 'Rate the worker'}
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault()
        void submit()
      }}
    >
      <ErrorAlert title="Could not save your review" message={submitError} />
      <RatingInput
        id={`${id}-overall`}
        name="Overall"
        label={workerVariant ? 'How was working with this customer?' : 'Overall'}
        value={scores.overall ?? null}
        onChange={(v) => setScore('overall', v)}
        error={overallError ?? undefined}
        disabled={busy}
      />
      {dimensions.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {dimensions.map((d) => (
            <RatingInput
              key={d}
              id={`${id}-${d}`}
              name={DIMENSION_LABELS[d].label}
              label={DIMENSION_LABELS[d].label}
              description={DIMENSION_LABELS[d].hint}
              value={scores[d] ?? null}
              onChange={(v) => setScore(d, v)}
              disabled={busy}
            />
          ))}
        </div>
      )}
      {!workerVariant && (
        <div className="grid gap-4 sm:grid-cols-2">
          <YesNoField
            id={`${id}-rehire`}
            legend="Would you hire them again?"
            value={wouldRehire}
            onChange={setWouldRehire}
            disabled={busy}
          />
          <YesNoField
            id={`${id}-cost`}
            legend="Did the final cost match the quote?"
            value={costMatched}
            onChange={setCostMatched}
            disabled={busy}
          />
        </div>
      )}
      <TextareaField
        id={`${id}-comment`}
        label="Comment (optional)"
        maxLength={COMMENT_MAX}
        value={comment}
        disabled={busy}
        onChange={(e) => setComment(e.target.value)}
      />
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={busy}>
          {busy ? 'Saving…' : existing ? 'Update review' : 'Submit review'}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={busy}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}
