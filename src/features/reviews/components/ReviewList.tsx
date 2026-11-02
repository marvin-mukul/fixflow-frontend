import { MessageSquareIcon, ThumbsUpIcon } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import { Loader } from '@/components/common/Loader'
import { StarRating } from '@/components/common/StarRating'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useWorkerReviews } from '@/features/reviews/hooks/useReviews'
import { DIMENSION_LABELS } from '@/features/reviews/utils/dimensions'
import type { RatingDimension } from '@/features/reviews/types/review.types'
import { formatDate } from '@/utils/format'

const DIMENSIONS: RatingDimension[] = ['quality', 'punctuality', 'behaviour', 'value']

/** Public reviews of a worker, newest first, cursor-paginated. */
export function ReviewList({ workerId }: { workerId: string }) {
  const { items, error, loading, hasMore, loadMore, reload } = useWorkerReviews(workerId)

  if (error && items.length === 0) return <ErrorAlert title="Could not load reviews" message={error.message} onRetry={reload} />
  if (loading && items.length === 0) return <Loader label="Loading reviews…" />
  if (items.length === 0) {
    return <EmptyState icon={<MessageSquareIcon />} title="No reviews yet" description="Reviews appear after completed jobs." />
  }

  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col">
        {items.map((r, index) => (
          <li key={r.id} className="flex flex-col gap-2">
            {index > 0 && <Separator className="mb-2" />}
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium">{r.reviewerName}</span>
              <Badge variant="outline">{r.category}</Badge>
              <span className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</span>
            </div>
            <StarRating value={r.overall} />
            <dl className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
              {DIMENSIONS.filter((d) => r[d] !== null).map((d) => (
                <div key={d} className="flex gap-1">
                  <dt>{DIMENSION_LABELS[d].label}</dt>
                  <dd className="font-medium text-foreground tabular-nums">{r[d]}</dd>
                </div>
              ))}
            </dl>
            {r.comment && <p className="text-sm whitespace-pre-line">{r.comment}</p>}
            {r.wouldRehire && (
              <p className="flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-300">
                <ThumbsUpIcon className="size-3.5" />
                Would hire again
              </p>
            )}
          </li>
        ))}
      </ul>
      {hasMore && (
        <Button variant="outline" className="self-center" onClick={loadMore} disabled={loading}>
          Load more
        </Button>
      )}
    </div>
  )
}
