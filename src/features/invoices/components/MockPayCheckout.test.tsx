import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { buildPath, PATHS } from '@/constants/paths'
import { browserLocation } from '@/lib/navigation'
import { apiUrl, INVOICE_ID, makeUser } from '@/test/fixtures'
import { authedState, renderApp } from '@/test/renderApp'
import { server } from '@/test/server'

const ORDER_ID = 'pay_mock_1'
const returnUrl = (status: string) => `http://localhost:4000/api/v1/payments/return?order_id=${ORDER_ID}&s=${status}`

function mockOrder(onComplete: (outcome: string) => void) {
  server.use(
    http.get(apiUrl(`/payments/mock/${ORDER_ID}`), () =>
      HttpResponse.json({
        providerOrderId: ORDER_ID,
        status: 'CREATED',
        amountPaise: 236000,
        invoiceId: INVOICE_ID,
        invoiceNumber: 'FF-2026-000001',
        title: 'Kitchen sink leaking',
      }),
    ),
    http.post(apiUrl(`/payments/mock/${ORDER_ID}/complete`), async ({ request }) => {
      const { outcome } = (await request.json()) as { outcome: string }
      onComplete(outcome)
      return HttpResponse.json({
        status: outcome === 'success' ? 'PAID' : 'FAILED',
        invoiceId: INVOICE_ID,
        returnUrl: returnUrl(outcome),
      })
    }),
  )
}

describe('mock pay page', () => {
  it.each([
    ['Pay (success)', 'success'],
    ['Fail', 'failure'],
  ])('"%s" completes the order with outcome=%s and follows the return URL', async (button, outcome) => {
    const assign = vi.spyOn(browserLocation, 'assign').mockImplementation(() => {})
    const outcomes: string[] = []
    mockOrder((o) => outcomes.push(o))
    renderApp({
      path: buildPath(PATHS.MOCK_PAY, { orderId: ORDER_ID }),
      preloadedState: authedState(makeUser()),
    })

    expect(await screen.findByText('Invoice FF-2026-000001')).toBeInTheDocument()
    expect(screen.getByText('₹2,360.00')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: button }))

    await vi.waitFor(() => expect(assign).toHaveBeenCalledWith(returnUrl(outcome)))
    expect(outcomes).toEqual([outcome])
  })
})
