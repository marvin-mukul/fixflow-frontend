import { PencilIcon } from 'lucide-react'
import { useState } from 'react'
import { StarRating } from '@/components/common/StarRating'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ReviewForm } from '@/features/reviews/components/ReviewForm'
import { selectMyReviewForJob } from '@/features/reviews/store/reviewsSlice'
import type { MyReviewSummary } from '@/features/reviews/types/review.types'
import { isWorkerReviewer } from '@/features/reviews/utils/dimensions'
import { useAppSelector } from '@/store/hooks'

interface JobReviewPanelProps {
  jobId: string
  relations: readonly string[]
  /** `myReview` from the job (null when not reviewed yet). */
  myReview: MyReviewSummary | null
  /** Called after a review is created/updated (e.g. refresh the job). */
  onSaved?: () => void
}

/** Review card on a completed job: form, or the user's review with a one-time edit. */
export function JobReviewPanel({ jobId, relations, myReview, onSaved }: JobReviewPanelProps) {
  const saved = useAppSelector((state) => selectMyReviewForJob(state, jobId))
  const [editing, setEditing] = useState(false)
  const workerVariant = isWorkerReviewer(relations)

  const current = saved ?? myReview
  // The server decides editability (one edit within 24 h); a review saved this session carries it too.
  const editable = saved ? saved.editable : !!myReview?.editable

  const title = workerVariant ? 'Rate the customer' : 'Rate the worker'

  return (
    <Card>
      <CardHeader>
        <CardTitle>{current ? 'Your review' : title}</CardTitle>
        <CardDescription>
          {current
            ? editable
              ? 'You can edit your review once within 24 hours.'
              : 'Thanks for your feedback.'
            : workerVariant
              ? 'Only an overall rating and a comment for the customer.'
              : 'Your ratings help other customers and rank workers on future quotes.'}
        </CardDescription>
        {current && editable && !editing && (
          <CardAction>
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              <PencilIcon />
              Edit review
            </Button>
          </CardAction>
        )}
      </CardHeader>
      <CardContent>
        {!current || editing ? (
          <ReviewForm
            jobId={jobId}
            relations={relations}
            existing={current && editing ? (saved ?? { id: current.id, overall: current.overall }) : undefined}
            onCancel={editing ? () => setEditing(false) : undefined}
            onSaved={() => {
              setEditing(false)
              onSaved?.()
            }}
          />
        ) : (
          <div className="flex flex-col gap-2">
            <StarRating value={current.overall} />
            {saved?.comment && <p className="text-sm whitespace-pre-line text-muted-foreground">{saved.comment}</p>}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
