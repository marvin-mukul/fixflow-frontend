import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { PATHS } from '@/constants/paths'
import { apiUrl, errorBody, makeUser } from '@/test/fixtures'
import { renderApp } from '@/test/renderApp'
import { server } from '@/test/server'

async function fillAndSubmit(email: string, password: string) {
  const user = userEvent.setup()
  await user.type(await screen.findByLabelText('Email'), email)
  await user.type(screen.getByLabelText('Password'), password)
  await user.click(screen.getByRole('button', { name: 'Log in' }))
}

describe('LoginForm', () => {
  it('logs in and redirects a customer to their dashboard', async () => {
    server.use(
      http.post(apiUrl('/auth/login'), () =>
        HttpResponse.json({ accessToken: 'tok', user: makeUser() }),
      ),
    )
    const { router, store } = renderApp({ path: PATHS.LOGIN })

    await fillAndSubmit('owner@demo.fixflow', 'Demo@123')

    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe(PATHS.CUSTOMER_HOME)
    expect(store.getState().auth.accessToken).toBe('tok')
  })

  it('sends a superadmin who must change password to the change-password page', async () => {
    server.use(
      http.post(apiUrl('/auth/login'), () =>
        HttpResponse.json({
          accessToken: 'tok',
          user: makeUser({ globalRole: 'SUPERADMIN', mustChangePassword: true }),
        }),
      ),
    )
    const { router } = renderApp({ path: PATHS.LOGIN })

    await fillAndSubmit('marvin.mukul@rubicotech.in', 'Rubi@123')

    expect(await screen.findByText('Update password')).toBeInTheDocument()
    expect(router.state.location.pathname).toBe(PATHS.CHANGE_PASSWORD)
  })

  it('maps 422 validation details onto form fields', async () => {
    server.use(
      http.post(apiUrl('/auth/login'), () =>
        HttpResponse.json(
          errorBody('VALIDATION_ERROR', 'Invalid request', [
            { path: 'body.email', message: 'Email is not allowed here', code: 'custom' },
          ]),
          { status: 422 },
        ),
      ),
    )
    renderApp({ path: PATHS.LOGIN })

    await fillAndSubmit('owner@demo.fixflow', 'Demo@123')

    expect(await screen.findByText('Email is not allowed here')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true')
  })

  it('shows the server message on 401 invalid credentials', async () => {
    server.use(
      http.post(apiUrl('/auth/login'), () =>
        HttpResponse.json(errorBody('INVALID_CREDENTIALS', 'Invalid email or password'), {
          status: 401,
        }),
      ),
    )
    const { router } = renderApp({ path: PATHS.LOGIN })

    await fillAndSubmit('owner@demo.fixflow', 'Wrong@123')

    expect(await screen.findByText('Invalid email or password')).toBeInTheDocument()
    expect(router.state.location.pathname).toBe(PATHS.LOGIN)
  })

  it('validates input on the client before calling the API', async () => {
    renderApp({ path: PATHS.LOGIN })
    const user = userEvent.setup()
    await user.click(await screen.findByRole('button', { name: 'Log in' }))
    expect(await screen.findByText('Email is required')).toBeInTheDocument()
    expect(screen.getByText('Password is required')).toBeInTheDocument()
  })
})
