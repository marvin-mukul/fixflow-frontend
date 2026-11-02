import { useCallback, useEffect, useState } from 'react'
import {
  fetchEarnings,
  fetchInvoice,
  selectEarnings,
  selectEarningsError,
  selectEarningsStatus,
  selectInvoiceById,
  selectInvoiceDetailError,
  selectInvoiceDetailStatus,
} from '@/features/invoices/store/invoicesSlice'
import type { PaymentReturnStatus } from '@/features/invoices/types/invoice.types'
import { useAppDispatch, useAppSelector } from '@/store/hooks'

export const PAYMENT_POLL_INTERVAL_MS = 2000
export const PAYMENT_POLL_MAX_ATTEMPTS = 15

export function useInvoice(id: string) {
  const dispatch = useAppDispatch()
  const invoice = useAppSelector((state) => selectInvoiceById(state, id))
  const status = useAppSelector((state) => selectInvoiceDetailStatus(state, id))
  const error = useAppSelector((state) => selectInvoiceDetailError(state, id))

  const refresh = useCallback(() => {
    void dispatch(fetchInvoice(id))
  }, [dispatch, id])

  useEffect(() => {
    if (id) refresh()
  }, [id, refresh])

  return { invoice, status, error, refresh }
}

/**
 * After a gateway return (`?status=PAID|PENDING`) the webhook may land a moment
 * later: re-fetch every 2 s (≈30 s max) while the invoice is still ISSUED.
 */
export function usePaymentPolling(id: string, returnStatus: PaymentReturnStatus | null, invoiceStatus: string | undefined) {
  const dispatch = useAppDispatch()
  const [attempts, setAttempts] = useState(0)
  const awaiting = (returnStatus === 'PAID' || returnStatus === 'PENDING') && invoiceStatus === 'ISSUED'
  const polling = awaiting && attempts < PAYMENT_POLL_MAX_ATTEMPTS

  useEffect(() => {
    if (!polling) return
    const timer = setInterval(() => {
      void dispatch(fetchInvoice(id))
      setAttempts((n) => n + 1)
    }, PAYMENT_POLL_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [dispatch, id, polling])

  return { polling, timedOut: awaiting && !polling }
}

export function useEarnings() {
  const dispatch = useAppDispatch()
  const earnings = useAppSelector(selectEarnings)
  const status = useAppSelector(selectEarningsStatus)
  const error = useAppSelector(selectEarningsError)

  useEffect(() => {
    if (status === 'idle') void dispatch(fetchEarnings())
  }, [dispatch, status])

  return { earnings, error, loading: !earnings && (status === 'idle' || status === 'loading') }
}
