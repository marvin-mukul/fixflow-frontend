import { PencilIcon, Undo2Icon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { MoneyText } from '@/components/common/MoneyText'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { QuoteForm } from '@/features/quotes/components/QuoteForm'
import { withdrawQuote } from '@/features/quotes/store/quotesSlice'
import type { OwnQuote } from '@/features/quotes/types/quote.types'
import { toApiError } from '@/lib/apiError'
import { useAppDispatch } from '@/store/hooks'
import { formatDateTime } from '@/utils/format'

interface LeadQuotePanelProps {
  requestId: string
  myQuote: OwnQuote | null
  canQuote: boolean
  /** Called after submit / revise / withdraw so the lead can be refetched. */
  onChanged: () => void
}

/** Worker side of a lead: send a quote, or review / revise / withdraw the current one. */
export function LeadQuotePanel({ requestId, myQuote, canQuote, onChanged }: LeadQuotePanelProps) {
  const dispatch = useAppDispatch()
  const [editing, setEditing] = useState(false)
  const active = myQuote && myQuote.status !== 'WITHDRAWN' && myQuote.status !== 'EXPIRED' ? myQuote : null

  const withdraw = async () => {
    if (!active) return
    try {
      await dispatch(withdrawQuote(active.id)).unwrap()
      toast.success('Quote withdrawn')
      onChanged()
    } catch (err) {
      toast.error('Could not withdraw', { description: toApiError(err).message })
    }
  }

  if (!active) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{myQuote ? 'Send a new quote' : 'Send a quote'}</CardTitle>
          <CardDescription>
            {canQuote
              ? 'The customer compares quotes on price, your rating and distance.'
              : 'Quoting is closed for this request.'}
          </CardDescription>
        </CardHeader>
        {canQuote && (
          <CardContent>
            <QuoteForm
              requestId={requestId}
              onSaved={() => {
                toast.success('Quote sent')
                onChanged()
              }}
            />
          </CardContent>
        )}
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Your quote <StatusBadge kind="quote" status={active.status} />
        </CardTitle>
        <CardDescription>
          Version {active.version} · valid until {formatDateTime(active.validUntil)}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {editing ? (
          <QuoteForm
            requestId={requestId}
            quote={active}
            onCancel={() => setEditing(false)}
            onSaved={() => {
              toast.success('Quote revised')
              setEditing(false)
              onChanged()
            }}
          />
        ) : (
          <>
            <dl className="grid gap-3 text-sm sm:grid-cols-4">
              <div>
                <dt className="text-xs text-muted-foreground">Total</dt>
                <dd>
                  <MoneyText paise={active.totalPaise} className="text-lg font-semibold" />
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Labour</dt>
                <dd><MoneyText paise={active.labourPaise} /></dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Materials</dt>
                <dd><MoneyText paise={active.materialsPaise} /></dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Time needed</dt>
                <dd>{active.etaHours} h</dd>
              </div>
            </dl>
            {active.proposedSlot && (
              <p className="text-sm">Proposed visit: {formatDateTime(active.proposedSlot)}</p>
            )}
            {active.notes && <p className="text-sm text-muted-foreground">{active.notes}</p>}
            {active.status === 'SUBMITTED' && (
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => setEditing(true)}>
                  <PencilIcon />
                  Revise
                </Button>
                <ConfirmDialog
                  title="Withdraw your quote?"
                  description="The customer will no longer see it. You can quote again while the request is open."
                  confirmLabel="Withdraw"
                  destructive
                  onConfirm={() => void withdraw()}
                  trigger={
                    <Button variant="ghost">
                      <Undo2Icon />
                      Withdraw
                    </Button>
                  }
                />
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
