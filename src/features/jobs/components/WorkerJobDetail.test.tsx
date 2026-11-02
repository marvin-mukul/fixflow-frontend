import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { buildPath, PATHS } from '@/constants/paths'
import { apiUrl, JOB_ID, makeJob, makeUser, makeWorkerProfile } from '@/test/fixtures'
import { authedState, renderApp } from '@/test/renderApp'
import { server } from '@/test/server'

const worker = makeUser({ id: 'u_w', name: 'Ravi Worker', globalRole: 'WORKER', hasWorkerProfile: true })
const jobPath = buildPath(PATHS.WORKER_JOB_DETAIL, { id: JOB_ID })

function mockJob(job: ReturnType<typeof makeJob>) {
  server.use(
    http.get(apiUrl('/worker/profile'), () => HttpResponse.json(makeWorkerProfile())),
    http.get(apiUrl(`/jobs/${JOB_ID}`), () => HttpResponse.json(job)),
  )
}

describe('worker job detail', () => {
  it('shows only the next allowed action, the full address and contact', async () => {
    let called = 0
    mockJob(makeJob())
    server.use(
      http.post(apiUrl(`/jobs/${JOB_ID}/en-route`), () => {
        called += 1
        return HttpResponse.json(makeJob({ subStatus: 'EN_ROUTE', workerActions: ['arrive'] }))
      }),
    )
    renderApp({ path: jobPath, preloadedState: authedState(worker) })

    const onMyWay = await screen.findByRole('button', { name: "I'm on my way" })
    expect(screen.queryByRole('button', { name: 'Mark arrived' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Start work' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Mark complete' })).not.toBeInTheDocument()
    expect(screen.getByTestId('job-address')).toHaveTextContent('12 Rajpur Road')
    expect(screen.getByText('+919800000000')).toBeInTheDocument()

    await userEvent.click(onMyWay)
    expect(await screen.findByRole('button', { name: 'Mark arrived' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: "I'm on my way" })).not.toBeInTheDocument()
    expect(called).toBe(1)
  })

  it('requires at least one after photo before completing', async () => {
    let completed = 0
    mockJob(makeJob({ subStatus: 'WORKING', requestStatus: 'IN_PROGRESS', workerActions: ['complete'] }))
    server.use(
      http.post(apiUrl(`/jobs/${JOB_ID}/complete`), () => {
        completed += 1
        return HttpResponse.json(makeJob({ subStatus: 'DONE', requestStatus: 'PENDING_SIGN_OFF', workerActions: [] }))
      }),
    )
    renderApp({ path: jobPath, preloadedState: authedState(worker) })

    await userEvent.click(await screen.findByRole('button', { name: 'Mark complete' }))
    const dialog = await screen.findByRole('dialog')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Complete job' }))
    expect(await within(dialog).findByText('Add at least one photo of the finished work.')).toBeInTheDocument()
    expect(completed).toBe(0)

    const photo = new File(['img'], 'after.png', { type: 'image/png' })
    await userEvent.upload(within(dialog).getByLabelText('Add after photos'), photo)
    await userEvent.type(within(dialog).getByLabelText('Final amount (₹, optional)'), '5000')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Complete job' }))
    expect(await within(dialog).findByText(/cannot exceed the quote/)).toBeInTheDocument()
    expect(completed).toBe(0)

    await userEvent.clear(within(dialog).getByLabelText('Final amount (₹, optional)'))
    await userEvent.type(within(dialog).getByLabelText('Final amount (₹, optional)'), '1800')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Complete job' }))
    await screen.findByText('Done', { selector: '[data-slot="badge"]' })
    expect(completed).toBe(1)
  })
})
