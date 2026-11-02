import { act, screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { buildPath, PATHS } from '@/constants/paths'
import { PAYMENT_POLL_INTERVAL_MS } from '@/features/invoices/hooks/useInvoices'
import { apiUrl, INVOICE_ID, makeInvoice, makeUser } from '@/test/fixtures'
import { authedState, renderApp } from '@/test/renderApp'
import { server } from '@/test/server'

const payer = makeUser()
const invoicePath = `${buildPath(PATHS.INVOICE_DETAIL, { id: INVOICE_ID })}?status=PAID`

afterEach(() => {
  vi.useRealTimers()
})

describe('invoice page after a payment return', () => {
  it('polls the invoice until the webhook marks it PAID', async () => {
    // Only intervals are faked so MSW/RTL timers keep running.
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] })
    let calls = 0
    server.use(
      http.get(apiUrl(`/invoices/${INVOICE_ID}`), () => {
        calls += 1
        return HttpResponse.json(
          calls < 3 ? makeInvoice() : makeInvoice({ status: 'PAID', paidAt: '2026-11-02T10:05:00.000Z' }),
        )
      }),
    )
    renderApp({ path: invoicePath, preloadedState: authedState(payer) })

    expect(await screen.findByText('Confirming your payment…')).toBeInTheDocument()
    expect(calls).toBe(1)
    // Customers never see the worker payout.
    expect(screen.queryByText('Your payout')).not.toBeInTheDocument()
    // No pay buttons while the payment is being confirmed.
    expect(screen.queryByRole('button', { name: /^Pay/ })).not.toBeInTheDocument()

    await act(() => vi.advanceTimersByTimeAsync(PAYMENT_POLL_INTERVAL_MS))
    await vi.waitFor(() => expect(calls).toBe(2))
    expect(screen.getByText('Confirming your payment…')).toBeInTheDocument()

    await act(() => vi.advanceTimersByTimeAsync(PAYMENT_POLL_INTERVAL_MS))
    expect(await screen.findByText('Payment received')).toBeInTheDocument()
    expect(calls).toBe(3)

    // Stops polling once paid.
    await act(() => vi.advanceTimersByTimeAsync(PAYMENT_POLL_INTERVAL_MS * 3))
    expect(calls).toBe(3)
  })

  it('shows the payout breakdown and the cash confirmation to the worker', async () => {
    server.use(
      http.get(apiUrl(`/invoices/${INVOICE_ID}`), () =>
        HttpResponse.json(
          makeInvoice({
            offlineMarkedAt: '2026-11-02T10:03:00.000Z',
            breakdown: {
              commissionPaise: 20000,
              commissionGstPaise: 3600,
              tcsPaise: 0,
              workerPayoutPaise: 176400,
              ratesSnapshot: { commissionPercent: 10, gstPercent: 18, tcsPercent: 1 },
            },
          }),
        ),
      ),
    )
    renderApp({
      path: buildPath(PATHS.INVOICE_DETAIL, { id: INVOICE_ID }),
      preloadedState: authedState(makeUser({ id: 'u_w', globalRole: 'WORKER', hasWorkerProfile: true })),
    })

    expect(await screen.findByText('Your payout')).toBeInTheDocument()
    expect(screen.getByText('₹1,764.00')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Confirm cash received' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^Pay/ })).not.toBeInTheDocument()
  })
})
