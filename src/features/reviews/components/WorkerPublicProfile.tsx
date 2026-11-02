import { BadgeCheckIcon, BriefcaseIcon, CalendarIcon, MapPinIcon } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'
import { Loader } from '@/components/common/Loader'
import { PageHeader } from '@/components/common/PageHeader'
import { StarRating } from '@/components/common/StarRating'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ReviewList } from '@/features/reviews/components/ReviewList'
import { usePublicWorker } from '@/features/reviews/hooks/useReviews'
import type { RatingDimension } from '@/features/reviews/types/review.types'
import { DIMENSION_LABELS } from '@/features/reviews/utils/dimensions'
import { formatDate } from '@/utils/format'

const DIMENSIONS: RatingDimension[] = ['quality', 'punctuality', 'behaviour', 'value']

/** A worker's public profile: rating breakdown, categories and reviews. */
export function WorkerPublicProfile({ id }: { id: string }) {
  const { worker, status, error } = usePublicWorker(id)

  if (!worker) {
    if (status === 'failed') return <EmptyState title="Worker not found" description={error?.message} />
    return <Loader />
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={worker.name}
        description={
          <span className="flex flex-wrap items-center gap-3">
            {worker.verified && (
              <Badge className="bg-emerald-600 text-white">
                <BadgeCheckIcon data-icon="inline-start" />
                Verified
              </Badge>
            )}
            <span className="inline-flex items-center gap-1">
              <BriefcaseIcon className="size-3.5" />
              {worker.jobsCompleted} jobs completed
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPinIcon className="size-3.5" />
              {worker.state}
            </span>
            <span className="inline-flex items-center gap-1">
              <CalendarIcon className="size-3.5" />
              Member since {formatDate(worker.memberSince)}
            </span>
          </span>
        }
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Ratings</CardTitle>
              <CardDescription>
                <StarRating value={worker.rating.overall} count={worker.rating.count} />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="flex flex-col gap-3" aria-label="Rating breakdown">
                {DIMENSIONS.map((d) => {
                  const value = worker.rating[d]
                  return (
                    <div key={d} className="flex flex-col gap-1 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">{DIMENSION_LABELS[d].label}</dt>
                        <dd className="font-medium tabular-nums">{value === null ? '—' : value.toFixed(1)}</dd>
                      </div>
                      <Progress value={value === null ? 0 : (value / 5) * 100} aria-label={DIMENSION_LABELS[d].label} />
                    </div>
                  )
                })}
              </dl>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Skills</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {worker.categories.map((c) => (
                <Badge key={c.id} variant="secondary">
                  {c.name} · {c.yearsExperience} yr
                </Badge>
              ))}
            </CardContent>
          </Card>
        </div>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Reviews</CardTitle>
            {worker.bio && <CardDescription className="whitespace-pre-line">{worker.bio}</CardDescription>}
          </CardHeader>
          <CardContent>
            <ReviewList workerId={worker.id} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
