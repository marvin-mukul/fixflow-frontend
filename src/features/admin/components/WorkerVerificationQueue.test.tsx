import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { PATHS } from '@/constants/paths'
import { apiUrl, makeAdminWorker, makeUser } from '@/test/fixtures'
import { authedState, renderApp } from '@/test/renderApp'
import { server } from '@/test/server'

const ravi = makeAdminWorker()
const meena = makeAdminWorker({ id: 'wp_2', userId: 'u_w2', name: 'Meena Electrician', email: 'meena@demo.fixflow' })

function mockQueue() {
  const calls: { url: string; body: unknown }[] = []
  let pending = [ravi, meena]
  server.use(
    http.get(apiUrl('/admin/workers'), ({ request }) => {
      const status = new URL(request.url).searchParams.get('status')
      return HttpResponse.json({ items: status === 'PENDING' ? pending : [] })
    }),
    http.post(apiUrl('/admin/workers/:id/:action'), async ({ request, params }) => {
      const text = await request.text()
      calls.push({ url: request.url, body: text ? JSON.parse(text) : null })
      const worker = pending.find((w) => w.id === params.id)!
      pending = pending.filter((w) => w.id !== params.id)
      const status = params.action === 'verify' ? 'VERIFIED' : 'REJECTED'
      return HttpResponse.json({ ...worker, verificationStatus: status })
    }),
  )
  return calls
}

const admin = () => authedState(makeUser({ id: 'u_admin', globalRole: 'ADMIN', email: 'admin@demo.fixflow' }))

describe('WorkerVerificationQueue', () => {
  it('verifies a worker and moves them out of the pending list', async () => {
    const calls = mockQueue()
    renderApp({ path: PATHS.ADMIN_WORKERS, preloadedState: admin() })
    const user = userEvent.setup()

    await user.click(await screen.findByRole('button', { name: `Review ${ravi.name}` }))
    const sheet = await screen.findByRole('dialog')
    expect(within(sheet).getByText(ravi.email)).toBeInTheDocument()
    await user.click(within(sheet).getByRole('button', { name: 'Verify' }))

    await waitFor(() => expect(screen.queryByRole('button', { name: `Review ${ravi.name}` })).not.toBeInTheDocument())
    expect(calls).toEqual([{ url: apiUrl(`/admin/workers/${ravi.id}/verify`), body: null }])
    expect(screen.getByRole('button', { name: `Review ${meena.name}` })).toBeInTheDocument()
  })

  it('requires a reason to reject', async () => {
    const calls = mockQueue()
    renderApp({ path: PATHS.ADMIN_WORKERS, preloadedState: admin() })
    const user = userEvent.setup()

    await user.click(await screen.findByRole('button', { name: `Review ${meena.name}` }))
    const sheet = await screen.findByRole('dialog')
    await user.click(within(sheet).getByRole('button', { name: 'Reject' }))
    const dialog = await screen.findByRole('dialog', { name: `Reject ${meena.name}?` })
    await user.click(within(dialog).getByRole('button', { name: 'Reject worker' }))
    expect(await within(dialog).findByText(/Please give a reason/)).toBeInTheDocument()
    expect(calls).toHaveLength(0)

    await user.type(within(dialog).getByLabelText('Reason'), 'ID document is blurry')
    await user.click(within(dialog).getByRole('button', { name: 'Reject worker' }))

    await waitFor(() => expect(screen.queryByRole('button', { name: `Review ${meena.name}` })).not.toBeInTheDocument())
    expect(calls).toEqual([
      { url: apiUrl(`/admin/workers/${meena.id}/reject`), body: { reason: 'ID document is blurry' } },
    ])
  })
})
