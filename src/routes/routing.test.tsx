import { screen } from '@testing-library/react'
import type { NonIndexRouteObject } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { PATHS } from '@/constants/paths'
import { appRoutes } from '@/routes/appRoutes'
import { makeUser } from '@/test/fixtures'
import { authedState, renderApp } from '@/test/renderApp'

describe('routing and guards', () => {
  it('RequireRole sends a worker visiting the customer area to the 403 page', async () => {
    const { router } = renderApp({
      path: PATHS.CUSTOMER_HOME,
      preloadedState: authedState(makeUser({ globalRole: 'WORKER' })),
    })
    expect(await screen.findByText('Access denied')).toBeInTheDocument()
    expect(router.state.location.pathname).toBe(PATHS.FORBIDDEN)
  })

  it('lets an admin into the admin shell', async () => {
    renderApp({
      path: PATHS.ADMIN_HOME,
      preloadedState: authedState(makeUser({ globalRole: 'ADMIN' })),
    })
    expect(await screen.findByRole('heading', { name: 'Admin dashboard' })).toBeInTheDocument()
  })

  it('RequireAuth redirects anonymous users to login', async () => {
    const { router } = renderApp({ path: PATHS.WORKER_HOME })
    expect(await screen.findByRole('button', { name: 'Log in' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe(PATHS.LOGIN)
  })

  it('forces the change-password page while mustChangePassword is set', async () => {
    const { router } = renderApp({
      path: PATHS.ADMIN_HOME,
      preloadedState: authedState(makeUser({ globalRole: 'SUPERADMIN', mustChangePassword: true })),
    })
    expect(await screen.findByText('Update password')).toBeInTheDocument()
    expect(router.state.location.pathname).toBe(PATHS.CHANGE_PASSWORD)
  })

  it('shows the 404 page for unknown routes', async () => {
    renderApp({ path: '/definitely/not/here' })
    expect(await screen.findByText('Page not found')).toBeInTheDocument()
  })

  it('shows the error boundary page when a route throws while rendering', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    function Boom(): never {
      throw new Error('kaboom')
    }
    const root = appRoutes[0] as NonIndexRouteObject
    renderApp({
      path: '/boom',
      routes: [{ ...root, children: [{ path: '/boom', Component: Boom }] }],
    })
    expect(await screen.findByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reload page' })).toBeInTheDocument()
  })
})
