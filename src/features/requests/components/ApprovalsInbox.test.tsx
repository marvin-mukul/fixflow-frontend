import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { PATHS } from '@/constants/paths'
import { apiUrl, IDS, makeRequest, makeUser } from '@/test/fixtures'
import { authedState, renderApp } from '@/test/renderApp'
import { server } from '@/test/server'

const first = makeRequest()
const second = makeRequest({ id: IDS.request2, title: 'Fan not working', priority: 'LOW' })

function mockInbox() {
  const calls: { url: string; body: unknown }[] = []
  server.use(
    http.get(apiUrl('/requests'), ({ request }) => {
      const scope = new URL(request.url).searchParams.get('scope')
      return HttpResponse.json({ items: scope === 'approvals' ? [first, second] : [], nextCursor: null })
    }),
    http.post(apiUrl('/requests/:id/approve'), async ({ request, params }) => {
      calls.push({ url: request.url, body: await request.json() })
      return HttpResponse.json({ ...first, id: params.id, status: 'OPEN_FOR_QUOTES' })
    }),
    http.post(apiUrl('/requests/:id/reject'), async ({ request, params }) => {
      calls.push({ url: request.url, body: await request.json() })
      return HttpResponse.json({ ...second, id: params.id, status: 'REJECTED' })
    }),
  )
  return calls
}

describe('ApprovalsInbox', () => {
  it('approves with "tenant pays" and removes the request from the inbox', async () => {
    const calls = mockInbox()
    renderApp({ path: PATHS.CUSTOMER_APPROVALS, preloadedState: authedState(makeUser()) })
    const user = userEvent.setup()

    await user.click(await screen.findByRole('button', { name: `Approve ${first.title}` }))
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('switch', { name: 'Tenant pays' }))
    await user.click(within(dialog).getByRole('button', { name: 'Approve' }))

    await waitFor(() => expect(screen.queryByText(first.title)).not.toBeInTheDocument())
    expect(calls).toEqual([
      { url: apiUrl(`/requests/${first.id}/approve`), body: { tenantPays: true } },
    ])
    expect(screen.getByText(second.title)).toBeInTheDocument()
  })

  it('requires a reason to reject and sends it', async () => {
    const calls = mockInbox()
    renderApp({ path: PATHS.CUSTOMER_APPROVALS, preloadedState: authedState(makeUser()) })
    const user = userEvent.setup()

    await user.click(await screen.findByRole('button', { name: `Reject ${second.title}` }))
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Reject request' }))
    expect(await within(dialog).findByText(/Please give a reason/)).toBeInTheDocument()
    expect(calls).toHaveLength(0)

    await user.type(within(dialog).getByLabelText('Reason'), 'Fan is under warranty')
    await user.click(within(dialog).getByRole('button', { name: 'Reject request' }))

    await waitFor(() => expect(screen.queryByText(second.title)).not.toBeInTheDocument())
    expect(calls).toEqual([
      { url: apiUrl(`/requests/${second.id}/reject`), body: { reason: 'Fan is under warranty' } },
    ])
  })
})
