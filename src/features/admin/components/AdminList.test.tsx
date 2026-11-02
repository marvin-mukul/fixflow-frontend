import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { PATHS } from '@/constants/paths'
import { apiUrl, makeUser } from '@/test/fixtures'
import { authedState, renderApp } from '@/test/renderApp'
import { server } from '@/test/server'

const superadmin = makeUser({ id: 'u_super', name: 'Sam Super', globalRole: 'SUPERADMIN' })
const admins = [
  { id: 'u_super', name: 'Sam Super', email: 'super@demo.fixflow', globalRole: 'SUPERADMIN', mustChangePassword: false, lastLoginAt: null, createdAt: '2026-10-01T00:00:00.000Z' },
  { id: 'u_admin', name: 'Asha Admin', email: 'admin@demo.fixflow', globalRole: 'ADMIN', mustChangePassword: true, lastLoginAt: null, createdAt: '2026-10-02T00:00:00.000Z' },
]

describe('admins (superadmin only)', () => {
  it('hides the Admins nav item and page from an admin', async () => {
    const { router } = renderApp({
      path: PATHS.ADMIN_HOME,
      preloadedState: authedState(makeUser({ globalRole: 'ADMIN' })),
    })
    expect(await screen.findByRole('link', { name: 'Workers' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Admins' })).not.toBeInTheDocument()

    await router.navigate(PATHS.ADMIN_ADMINS)
    expect(await screen.findByText('Access denied')).toBeInTheDocument()
  })

  it('lists admins for a superadmin and removes one (never self or a superadmin)', async () => {
    const deleted: string[] = []
    server.use(
      http.get(apiUrl('/admin/admins'), () => HttpResponse.json({ items: admins })),
      http.delete(apiUrl('/admin/admins/:id'), ({ params }) => {
        deleted.push(String(params.id))
        return new HttpResponse(null, { status: 204 })
      }),
    )
    renderApp({ path: PATHS.ADMIN_ADMINS, preloadedState: authedState(superadmin) })
    const user = userEvent.setup()

    expect(await screen.findByRole('link', { name: 'Admins' })).toBeInTheDocument()
    expect(await screen.findByText('Asha Admin')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Remove Sam Super' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Remove Asha Admin' }))
    const dialog = await screen.findByRole('alertdialog')
    await user.click(within(dialog).getByRole('button', { name: 'Remove' }))

    await waitFor(() => expect(screen.queryByText('Asha Admin')).not.toBeInTheDocument())
    expect(deleted).toEqual(['u_admin'])
  })
})
