import { ClockIcon, MapPinIcon, ReceiptIndianRupeeIcon, TrophyIcon, WrenchIcon } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import { Loader } from '@/components/common/Loader'
import { MoneyText } from '@/components/common/MoneyText'
import { StarRating } from '@/components/common/StarRating'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { buildPath, PATHS } from '@/constants/paths'
import {
  acceptQuote,
  fetchRequestQuotes,
  makeSelectRankedQuotes,
} from '@/features/quotes/store/quotesSlice'
import type { AcceptQuoteResult, Quote } from '@/features/quotes/types/quote.types'
import { toApiError } from '@/lib/apiError'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { formatDateTime, formatKm } from '@/utils/format'

const CONFLICT_MESSAGES: Record<string, string> = {
  QUOTE_VERSION_MISMATCH:
    'The worker revised this quote while you were looking. Review the updated price and accept again.',
  QUOTE_ALREADY_ACCEPTED: 'A quote has already been accepted for this request.',
  QUOTE_EXPIRED: 'This quote has expired. Choose another quote or wait for new ones.',
}

const RATING_PARTS: { key: 'quality' | 'punctuality' | 'behaviour' | 'value'; label: string }[] = [
  { key: 'quality', label: 'Quality' },
  { key: 'punctuality', label: 'Punctuality' },
  { key: 'behaviour', label: 'Behaviour' },
  { key: 'value', label: 'Value' },
]

interface QuoteComparisonProps {
  requestId: string
  /** From the request's `availableActions` (`accept_quote`). */
  canAccept: boolean
  onAccepted: (result: AcceptQuoteResult) => void
}

/** Payer view: quotes ranked by the API's `rankScore`, accept with version + Idempotency-Key. */
export function QuoteComparison({ requestId, canAccept, onAccepted }: QuoteComparisonProps) {
  const dispatch = useAppDispatch()
  const selectQuotes = useMemo(() => makeSelectRankedQuotes(requestId), [requestId])
  const { items, status, error } = useAppSelector(selectQuotes)
  const [confirming, setConfirming] = useState<Quote | null>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [acceptError, setAcceptError] = useState<{ quoteId: string; message: string; retryable: boolean } | null>(null)
  /** One key per accept attempt (quote id + version); reused when the same attempt is retried. */
  const attemptKeys = useRef(new Map<string, string>())

  useEffect(() => {
    void dispatch(fetchRequestQuotes(requestId))
  }, [dispatch, requestId])

  const accept = async (quote: Quote) => {
    const attempt = `${quote.id}:${quote.version}`
    let key = attemptKeys.current.get(attempt)
    if (!key) {
      key = crypto.randomUUID()
      attemptKeys.current.set(attempt, key)
    }
    setPendingId(quote.id)
    setAcceptError(null)
    try {
      const result = await dispatch(
        acceptQuote({ id: quote.id, version: quote.version, idempotencyKey: key }),
      ).unwrap()
      attemptKeys.current.delete(attempt)
      toast.success(`Accepted ${quote.worker.name}'s quote`, { description: 'The job is scheduled.' })
      void dispatch(fetchRequestQuotes(requestId))
      onAccepted(result)
    } catch (err) {
      const apiError = toApiError(err)
      const retryable = apiError.status === 0 || apiError.status >= 500
      if (!retryable) attemptKeys.current.delete(attempt)
      const message = CONFLICT_MESSAGES[apiError.code] ?? apiError.message
      setAcceptError({ quoteId: quote.id, message, retryable })
      if (apiError.status === 409) {
        toast.error('Could not accept the quote', { description: message })
        void dispatch(fetchRequestQuotes(requestId))
      }
    } finally {
      setPendingId(null)
    }
  }

  if (status === 'failed' && error?.status === 403) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quotes</CardTitle>
        <CardDescription>
          Ranked by price, rating, experience and distance. The best match is first.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <ErrorAlert title="Could not load quotes" message={status === 'failed' ? error?.message : null} />
        {status === 'loading' && items.length === 0 ? (
          <Loader label="Loading quotes…" />
        ) : items.length === 0 && status !== 'failed' ? (
          <EmptyState
            icon={<ReceiptIndianRupeeIcon />}
            title="No quotes yet"
            description="Nearby workers have been notified. Quotes appear here as they arrive."
          />
        ) : (
          <ol className="flex flex-col gap-3" aria-label="Ranked quotes">
            {items.map((quote, index) => (
              <li
                key={quote.id}
                data-testid="quote-card"
                className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="flex min-w-0 flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {index === 0 && quote.rankScore !== null && (
                      <Badge className="bg-amber-500 text-white">
                        <TrophyIcon data-icon="inline-start" />
                        Best match
                      </Badge>
                    )}
                    <Link
                      to={buildPath(PATHS.WORKER_PUBLIC_PROFILE, { id: quote.worker.id })}
                      className="font-medium underline-offset-4 hover:underline"
                    >
                      {quote.worker.name}
                    </Link>
                    <StatusBadge kind="quote" status={quote.status} />
                  </div>
                  <StarRating value={quote.worker.rating.overall} count={quote.worker.rating.count} />
                  {quote.worker.rating.count > 0 && (
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs text-muted-foreground sm:grid-cols-4">
                      {RATING_PARTS.map((part) => (
                        <div key={part.key} className="flex gap-1">
                          <dt>{part.label}</dt>
                          <dd className="font-medium text-foreground tabular-nums">
                            {quote.worker.rating[part.key]?.toFixed(1) ?? '—'}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  )}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <WrenchIcon className="size-3.5" />
                      {quote.worker.jobsCompleted} jobs done
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPinIcon className="size-3.5" />
                      {formatKm(quote.distanceKm)} away
                    </span>
                    <span className="flex items-center gap-1">
                      <ClockIcon className="size-3.5" />
                      ETA {quote.etaHours} h
                    </span>
                    {quote.proposedSlot && <span>Can come {formatDateTime(quote.proposedSlot)}</span>}
                    <span>Valid until {formatDateTime(quote.validUntil)}</span>
                  </div>
                  {quote.notes && <p className="text-sm">{quote.notes}</p>}
                  {acceptError?.quoteId === quote.id && (
                    <ErrorAlert title="Not accepted" message={acceptError.message} />
                  )}
                </div>
                <div className="flex shrink-0 flex-col items-start gap-1 sm:items-end">
                  <MoneyText paise={quote.totalPaise} className="text-xl font-semibold" />
                  <span className="text-xs text-muted-foreground">
                    Labour <MoneyText paise={quote.labourPaise} /> · Materials{' '}
                    <MoneyText paise={quote.materialsPaise} />
                  </span>
                  {canAccept && quote.status === 'SUBMITTED' && (
                    <Button
                      className="mt-2"
                      disabled={pendingId !== null}
                      onClick={() => setConfirming(quote)}
                      aria-label={`Accept quote from ${quote.worker.name}`}
                    >
                      {pendingId === quote.id
                        ? 'Accepting…'
                        : acceptError?.quoteId === quote.id && acceptError.retryable
                          ? 'Retry accept'
                          : 'Accept'}
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
      <ConfirmDialog
        open={confirming !== null}
        onOpenChange={(open) => !open && setConfirming(null)}
        title="Accept this quote?"
        description={
          confirming ? (
            <>
              {confirming.worker.name} will be booked for <MoneyText paise={confirming.totalPaise} />.
              Other quotes are declined automatically.
            </>
          ) : undefined
        }
        confirmLabel="Accept quote"
        onConfirm={() => {
          if (confirming) void accept(confirming)
        }}
      />
    </Card>
  )
}
