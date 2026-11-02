import { CircleCheckIcon, CircleXIcon, FlaskConicalIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import { Loader } from '@/components/common/Loader'
import { MoneyText } from '@/components/common/MoneyText'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { buildPath, PATHS } from '@/constants/paths'
import { completeMockOrder, fetchMockOrder } from '@/features/invoices/store/invoicesSlice'
import type { MockOrder, MockOutcome } from '@/features/invoices/types/invoice.types'
import { toApiError } from '@/lib/apiError'
import { browserLocation } from '@/lib/navigation'
import { useAppDispatch } from '@/store/hooks'
import type { ApiError } from '@/types/api'

type LoadState = { orderId: string; order: MockOrder | null; error: ApiError | null }

/** Fake gateway page for `PAYMENT_PROVIDER=mock`: pay or fail, then follow the return URL. */
export function MockPayCheckout({ orderId }: { orderId: string }) {
  const dispatch = useAppDispatch()
  const [state, setState] = useState<LoadState | null>(null)
  const [busy, setBusy] = useState<MockOutcome | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    dispatch(fetchMockOrder(orderId))
      .unwrap()
      .then((order) => !cancelled && setState({ orderId, order, error: null }))
      .catch((err: unknown) => !cancelled && setState({ orderId, order: null, error: toApiError(err) }))
    return () => {
      cancelled = true
    }
  }, [dispatch, orderId])

  const complete = async (outcome: MockOutcome) => {
    setBusy(outcome)
    setSubmitError(null)
    try {
      const result = await dispatch(completeMockOrder({ orderId, outcome })).unwrap()
      // The API return URL verifies the payment and redirects to /invoices/:id?status=…
      browserLocation.assign(result.returnUrl)
    } catch (err) {
      setSubmitError(toApiError(err).message)
      setBusy(null)
    }
  }

  const current = state?.orderId === orderId ? state : null
  if (!current) return <Loader label="Loading payment…" />
  if (!current.order) {
    return <ErrorAlert title="Payment not found" message={current.error?.message ?? 'Unknown order'} />
  }
  const { order } = current
  const open = order.status === 'CREATED'

  return (
    <Card>
      <CardHeader>
        <Badge variant="outline" className="mb-1 w-fit">
          <FlaskConicalIcon data-icon="inline-start" />
          Test payment
        </Badge>
        <CardTitle>{order.title}</CardTitle>
        <CardDescription>Invoice {order.invoiceNumber}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-muted-foreground">Amount</span>
          <MoneyText paise={order.amountPaise} className="text-2xl font-semibold" />
        </div>
        <p className="text-xs text-muted-foreground">
          This is the mock payment provider. No real money moves; pick an outcome to simulate the gateway.
        </p>
        <ErrorAlert title="Could not complete the payment" message={submitError} />
        {!open && (
          <p className="text-sm">
            This payment is already <span className="font-medium">{order.status.toLowerCase()}</span>.
          </p>
        )}
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        {open ? (
          <>
            <Button onClick={() => void complete('success')} disabled={busy !== null}>
              <CircleCheckIcon />
              {busy === 'success' ? 'Paying…' : 'Pay (success)'}
            </Button>
            <Button variant="destructive" onClick={() => void complete('failure')} disabled={busy !== null}>
              <CircleXIcon />
              {busy === 'failure' ? 'Failing…' : 'Fail'}
            </Button>
          </>
        ) : (
          <Link to={buildPath(PATHS.INVOICE_DETAIL, { id: order.invoiceId })} className={buttonVariants()}>
            View invoice
          </Link>
        )}
      </CardFooter>
    </Card>
  )
}
