import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { buildPath, PATHS } from '@/constants/paths'
import { apiUrl, IDS, JOB_ID, makeJob, makeRequest, makeUser } from '@/test/fixtures'
import { authedState, renderApp } from '@/test/renderApp'
import { server } from '@/test/server'

const owner = makeUser()
const requestPath = buildPath(PATHS.CUSTOMER_REQUEST_DETAIL, { id: IDS.request })

describe('customer job tracking', () => {
  it('shows the job progress and confirms completion', async () => {
    let request = makeRequest({ status: 'PENDING_SIGN_OFF', jobId: JOB_ID, availableActions: ['confirm', 'dispute'] })
    let job = makeJob({
      subStatus: 'DONE',
      requestStatus: 'PENDING_SIGN_OFF',
      myRelations: ['OWNER', 'PAYER'],
      workerActions: [],
      customerActions: ['confirm', 'dispute'],
    })
    let confirmed = 0
    server.use(
      http.get(apiUrl(`/requests/${IDS.request}`), () => HttpResponse.json(request)),
      http.get(apiUrl(`/requests/${IDS.request}/timeline`), () => HttpResponse.json({ items: [] })),
      http.get(apiUrl(`/requests/${IDS.request}/quotes`), () => HttpResponse.json({ items: [] })),
      http.get(apiUrl(`/jobs/${JOB_ID}`), () => HttpResponse.json(job)),
      http.post(apiUrl(`/jobs/${JOB_ID}/confirm`), () => {
        confirmed += 1
        request = { ...request, status: 'COMPLETED', availableActions: [] }
        job = { ...job, requestStatus: 'COMPLETED', customerActions: [] }
        return HttpResponse.json({ request, job })
      }),
    )
    renderApp({ path: requestPath, preloadedState: authedState(owner) })

    expect(await screen.findByRole('list', { name: 'Job progress' })).toBeInTheDocument()
    expect(screen.getByText('+919811111111')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Dispute' })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Confirm completion' }))
    const dialog = await screen.findByRole('alertdialog')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Confirm completion' }))

    await screen.findByText('Completed', { selector: '[data-slot="badge"]' })
    expect(confirmed).toBe(1)
    expect(screen.queryByRole('button', { name: 'Confirm completion' })).not.toBeInTheDocument()
  })
})
