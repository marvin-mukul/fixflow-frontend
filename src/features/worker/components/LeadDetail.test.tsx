import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { buildPath, PATHS } from '@/constants/paths'
import { apiUrl, IDS, makeLead, makeUser, makeWorkerProfile } from '@/test/fixtures'
import { authedState, renderApp } from '@/test/renderApp'
import { server } from '@/test/server'

const worker = makeUser({ id: 'u_w', email: 'ravi@demo.fixflow', name: 'Ravi Worker', globalRole: 'WORKER', hasWorkerProfile: true })
const leadPath = buildPath(PATHS.WORKER_LEAD_DETAIL, { requestId: IDS.request })

function mockWorker(lead: ReturnType<typeof makeLead>) {
  server.use(
    http.get(apiUrl('/worker/profile'), () => HttpResponse.json(makeWorkerProfile())),
    http.get(apiUrl(`/worker/leads/${IDS.request}`), () => HttpResponse.json(lead)),
    http.get(apiUrl('/worker/leads'), () => HttpResponse.json({ items: [lead], nextCursor: null })),
  )
}

describe('worker leads masking', () => {
  it('shows only the locality and distance while the lead is masked', async () => {
    mockWorker(makeLead())
    renderApp({ path: leadPath, preloadedState: authedState(worker) })

    expect(await screen.findByRole('heading', { name: 'Kitchen sink leaking' })).toBeInTheDocument()
    expect(screen.getByText('Dehradun 248001')).toBeInTheDocument()
    expect(screen.getByText('About 2.4 km from your base')).toBeInTheDocument()
    expect(screen.getByText('Exact address hidden')).toBeInTheDocument()
    expect(screen.queryByTestId('lead-address')).not.toBeInTheDocument()
    expect(screen.queryByText(/Rajpur Road/)).not.toBeInTheDocument()
    // Not quoted yet → the quote form is offered.
    expect(screen.getByRole('button', { name: 'Send quote' })).toBeInTheDocument()
  })

  it('reveals the address and contact once unmasked', async () => {
    mockWorker(
      makeLead({
        status: 'SCHEDULED',
        canQuote: false,
        unmasked: true,
        address: { addressLine1: '12 Rajpur Road', addressLine2: null, city: 'Dehradun', state: 'Uttarakhand', pincode: '248001' },
        contact: { name: 'Olivia Owner', phone: '+919800000000' },
        myQuote: { id: 'q_1', status: 'ACCEPTED', version: 1, labourPaise: 100000, materialsPaise: 0, totalPaise: 100000, etaHours: 2, proposedSlot: null, validUntil: '2026-11-05T12:00:00.000Z', notes: null },
      }),
    )
    renderApp({ path: leadPath, preloadedState: authedState(worker) })

    expect(await screen.findByTestId('lead-address')).toHaveTextContent('12 Rajpur Road')
    expect(screen.getByText('+919800000000')).toBeInTheDocument()
    expect(screen.queryByText('Exact address hidden')).not.toBeInTheDocument()
  })

  it('lists leads without any address, only area and approximate distance', async () => {
    mockWorker(makeLead())
    renderApp({ path: PATHS.WORKER_LEADS, preloadedState: authedState(worker) })

    expect(await screen.findByRole('table', { name: 'Leads' })).toBeInTheDocument()
    expect(await screen.findByText('Dehradun 248001')).toBeInTheDocument()
    expect(screen.getByText('~2.4 km')).toBeInTheDocument()
    expect(screen.queryByText(/Rajpur Road/)).not.toBeInTheDocument()
  })

  it('sends a worker without a profile to the onboarding wizard', async () => {
    server.use(
      http.get(apiUrl('/worker/profile'), () =>
        HttpResponse.json(
          { error: { code: 'WORKER_PROFILE_MISSING', message: 'Complete onboarding', details: [], requestId: 'r' } },
          { status: 404 },
        ),
      ),
    )
    const { router } = renderApp({ path: PATHS.WORKER_LEADS, preloadedState: authedState(worker) })

    expect(await screen.findByText('Step 1: Profile')).toBeInTheDocument()
    expect(router.state.location.pathname).toBe(PATHS.WORKER_ONBOARDING)
  })
})
