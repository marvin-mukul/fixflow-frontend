import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { PATHS } from '@/constants/paths'
import { apiUrl, makePayment, makeUser } from '@/test/fixtures'
import { authedState, renderApp } from '@/test/renderApp'
import { server } from '@/test/server'

describe('RefundDialog', () => {
  it('sends a partial refund amount in paise', async () => {
    const payment = makePayment()
    const bodies: unknown[] = []
    server.use(
      http.get(apiUrl('/admin/payments'), () => HttpResponse.json({ items: [payment] })),
      http.post(apiUrl('/admin/payments/:id/refund'), async ({ request }) => {
        bodies.push(await request.json())
        return HttpResponse.json({
          paymentId: payment.id,
          status: 'PARTIALLY_REFUNDED',
          refundedPaise: 50050,
          providerRefundId: 'rf_1',
          providerStatus: 'DONE',
        })
      }),
    )
    renderApp({ path: PATHS.ADMIN_PAYMENTS, preloadedState: authedState(makeUser({ globalRole: 'ADMIN' })) })
    const user = userEvent.setup()

    await user.click(await screen.findByRole('button', { name: `Refund ${payment.invoice.number}` }))
    const dialog = await screen.findByRole('dialog')
    await user.type(within(dialog).getByLabelText('Amount (₹, optional)'), '3000')
    await user.type(within(dialog).getByLabelText('Reason'), 'Overcharged')
    await user.click(within(dialog).getByRole('button', { name: 'Refund' }))
    expect(await within(dialog).findByText(/At most ₹2,360.00 can be refunded/)).toBeInTheDocument()
    expect(bodies).toHaveLength(0)

    await user.clear(within(dialog).getByLabelText('Amount (₹, optional)'))
    await user.type(within(dialog).getByLabelText('Amount (₹, optional)'), '500.50')
    await user.click(within(dialog).getByRole('button', { name: 'Refund' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(bodies).toEqual([{ amountPaise: 50050, reason: 'Overcharged' }])
    expect(await screen.findByText('Partly refunded')).toBeInTheDocument()
  })
})
