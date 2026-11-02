import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { buildPath, PATHS } from '@/constants/paths'
import { apiUrl, IDS, makeQuote, makeRequest, makeUser } from '@/test/fixtures'
import { authedState, renderApp } from '@/test/renderApp'
import { server } from '@/test/server'

const openRequest = makeRequest({
  status: 'OPEN_FOR_QUOTES',
  availableActions: ['accept_quote', 'cancel'],
})

// Deliberately not in rank order.
const quotes = [
  makeQuote({ id: 'q_mid', rankScore: 0.61, totalPaise: 250000, worker: { ...makeQuote().worker, name: 'Mid Match' } }),
  makeQuote({ id: 'q_none', rankScore: null, totalPaise: 100000, worker: { ...makeQuote().worker, name: 'Unranked' } }),
  makeQuote({ id: 'q_best', rankScore: 0.93, version: 3, totalPaise: 320000, worker: { ...makeQuote().worker, name: 'Best Match' } }),
  makeQuote({ id: 'q_low', rankScore: 0.2, totalPaise: 90000, worker: { ...makeQuote().worker, name: 'Low Match' } }),
]

function mockRequest(accept: Parameters<typeof http.post>[1]) {
  server.use(
    http.get(apiUrl(`/requests/${IDS.request}`), () => HttpResponse.json(openRequest)),
    http.get(apiUrl(`/requests/${IDS.request}/timeline`), () => HttpResponse.json({ items: [] })),
    http.get(apiUrl(`/requests/${IDS.request}/quotes`), () => HttpResponse.json({ items: quotes })),
    http.post(apiUrl('/quotes/:id/accept'), accept),
  )
}

async function acceptBest() {
  const user = userEvent.setup()
  await user.click(await screen.findByRole('button', { name: 'Accept quote from Best Match' }))
  const dialog = await screen.findByRole('alertdialog')
  await user.click(within(dialog).getByRole('button', { name: 'Accept quote' }))
  return user
}

const path = buildPath(PATHS.CUSTOMER_REQUEST_DETAIL, { id: IDS.request })

describe('QuoteComparison', () => {
  it('lists quotes by rankScore (best first, unranked last)', async () => {
    mockRequest(() => HttpResponse.json({}))
    renderApp({ path, preloadedState: authedState(makeUser()) })

    await screen.findByText('Best Match')
    const names = screen
      .getAllByTestId('quote-card')
      .map((card) => within(card).getByText(/Match|Unranked/).textContent)
    expect(names).toEqual(['Best Match', 'Mid Match', 'Low Match', 'Unranked'])
    expect(within(screen.getAllByTestId('quote-card')[0]!).getByText('Best match')).toBeInTheDocument()
    expect(screen.getByText('₹3,200.00')).toBeInTheDocument()
  })

  it('accepts with the quote version and an Idempotency-Key, reusing the key on retry', async () => {
    const calls: { id: string; key: string | null; body: unknown }[] = []
    mockRequest(async ({ request, params }) => {
      calls.push({
        id: String(params.id),
        key: request.headers.get('Idempotency-Key'),
        body: await request.json(),
      })
      if (calls.length === 1) {
        return HttpResponse.json({ error: { code: 'SERVER_ERROR', message: 'Boom', details: [], requestId: 'r' } }, { status: 503 })
      }
      return HttpResponse.json(
        { request: { ...openRequest, status: 'SCHEDULED' }, job: { id: 'j_1', subStatus: 'ASSIGNED', workerProfileId: 'wp', scheduledStart: null } },
        { status: 201 },
      )
    })
    renderApp({ path, preloadedState: authedState(makeUser()) })

    const user = await acceptBest()
    await waitFor(() => expect(calls).toHaveLength(1))
    expect(calls[0]).toMatchObject({ id: 'q_best', body: { version: 3 } })
    expect(calls[0]!.key).toMatch(/^[0-9a-f-]{36}$/)

    await user.click(await screen.findByRole('button', { name: 'Accept quote from Best Match' }))
    await user.click(within(await screen.findByRole('alertdialog')).getByRole('button', { name: 'Accept quote' }))
    await waitFor(() => expect(calls).toHaveLength(2))
    expect(calls[1]).toMatchObject({ id: 'q_best', body: { version: 3 } })
    expect(calls[1]!.key).toBe(calls[0]!.key)
  })

  it('refetches and explains a QUOTE_VERSION_MISMATCH conflict', async () => {
    let quoteFetches = 0
    mockRequest(() =>
      HttpResponse.json(
        { error: { code: 'QUOTE_VERSION_MISMATCH', message: 'Version changed', details: [], requestId: 'r' } },
        { status: 409 },
      ),
    )
    server.use(
      http.get(apiUrl(`/requests/${IDS.request}/quotes`), () => {
        quoteFetches += 1
        return HttpResponse.json({ items: quotes })
      }),
    )
    renderApp({ path, preloadedState: authedState(makeUser()) })

    await acceptBest()
    expect(await screen.findByText(/revised this quote while you were looking/)).toBeInTheDocument()
    await waitFor(() => expect(quoteFetches).toBeGreaterThanOrEqual(2))
  })
})
