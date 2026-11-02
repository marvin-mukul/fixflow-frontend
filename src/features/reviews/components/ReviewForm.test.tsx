import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { Provider } from 'react-redux'
import { describe, expect, it, vi } from 'vitest'
import { ReviewForm } from '@/features/reviews/components/ReviewForm'
import { connectApiToStore, makeStore } from '@/store/index'
import { apiUrl, JOB_ID, makeUser } from '@/test/fixtures'
import { authedState } from '@/test/renderApp'
import { server } from '@/test/server'

function renderForm(relations: string[]) {
  const store = makeStore(authedState(makeUser()))
  connectApiToStore(store)
  return render(
    <Provider store={store}>
      <ReviewForm jobId={JOB_ID} relations={relations} />
    </Provider>,
  )
}

const ON_SITE = ['Quality of work', 'Punctuality', 'Behaviour']

describe('ReviewForm dimensions', () => {
  it('tenant who raised the request rates on-site dimensions but not value', () => {
    renderForm(['TENANT', 'RAISER'])
    for (const label of ON_SITE) expect(screen.getByRole('group', { name: label })).toBeInTheDocument()
    expect(screen.queryByRole('group', { name: 'Value for money' })).not.toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Overall' })).toBeInTheDocument()
    expect(screen.getByText('Would you hire them again?')).toBeInTheDocument()
  })

  it('owner who pays (but did not raise) rates value only', () => {
    renderForm(['OWNER', 'PAYER'])
    expect(screen.getByRole('group', { name: 'Value for money' })).toBeInTheDocument()
    for (const label of ON_SITE) expect(screen.queryByRole('group', { name: label })).not.toBeInTheDocument()
    expect(screen.getByText('Did the final cost match the quote?')).toBeInTheDocument()
  })

  it('worker rates the customer with overall + comment only', () => {
    renderForm(['WORKER'])
    expect(screen.getByRole('form', { name: 'Rate the customer' })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'How was working with this customer?' })).toBeInTheDocument()
    for (const label of [...ON_SITE, 'Value for money']) {
      expect(screen.queryByRole('group', { name: label })).not.toBeInTheDocument()
    }
    expect(screen.queryByText('Would you hire them again?')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Comment (optional)')).toBeInTheDocument()
  })

  it('sends only the allowed dimensions', async () => {
    let body: Record<string, unknown> | null = null
    server.use(
      http.post(apiUrl(`/jobs/${JOB_ID}/reviews`), async ({ request }) => {
        body = (await request.json()) as Record<string, unknown>
        return HttpResponse.json(
          {
            id: 'r_1',
            jobId: JOB_ID,
            revieweeType: 'WORKER',
            overall: 5,
            quality: null,
            punctuality: null,
            behaviour: null,
            value: 4,
            wouldRehire: true,
            finalCostMatchedQuote: null,
            comment: null,
            editable: true,
            createdAt: '2026-11-02T10:00:00.000Z',
            editedAt: null,
          },
          { status: 201 },
        )
      }),
    )
    renderForm(['OWNER', 'PAYER'])

    await userEvent.click(screen.getByRole('button', { name: 'Submit review' }))
    expect(await screen.findByText('Give an overall rating.')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Overall: 5 stars' }))
    await userEvent.click(screen.getByRole('button', { name: 'Value for money: 4 stars' }))
    await userEvent.click(screen.getByLabelText('Yes', { selector: '[id$="-rehire-yes"]' }))
    await userEvent.click(screen.getByRole('button', { name: 'Submit review' }))

    await vi.waitFor(() => expect(body).toEqual({ overall: 5, value: 4, wouldRehire: true }))
  })
})
