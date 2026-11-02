import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { PATHS } from '@/constants/paths'
import { apiUrl, errorBody, makeSettings, makeUser } from '@/test/fixtures'
import { authedState, renderApp } from '@/test/renderApp'
import { server } from '@/test/server'

function mockSettings() {
  const puts: unknown[] = []
  server.use(
    http.get(apiUrl('/admin/settings'), () => HttpResponse.json(makeSettings())),
    http.put(apiUrl('/admin/settings'), async ({ request }) => {
      puts.push(await request.json())
      return HttpResponse.json(
        errorBody('VALIDATION_ERROR', 'Invalid settings', [
          { path: 'body.commissionPercent', message: 'Commission above the allowed cap', code: 'too_big' },
        ]),
        { status: 422 },
      )
    }),
  )
  return puts
}

describe('SettingsForm', () => {
  it('is read-only for an admin', async () => {
    mockSettings()
    renderApp({ path: PATHS.ADMIN_SETTINGS, preloadedState: authedState(makeUser({ globalRole: 'ADMIN' })) })

    const commission = await screen.findByLabelText('Commission (%)')
    expect(commission).toHaveValue(10)
    expect(commission).toBeDisabled()
    expect(screen.getByLabelText('Match radius (km)')).toBeDisabled()
    expect(screen.getByText('Read-only')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Save settings' })).not.toBeInTheDocument()
  })

  it('lets a superadmin edit and maps a 422 onto the field', async () => {
    const puts = mockSettings()
    renderApp({ path: PATHS.ADMIN_SETTINGS, preloadedState: authedState(makeUser({ globalRole: 'SUPERADMIN' })) })
    const user = userEvent.setup()

    const commission = await screen.findByLabelText('Commission (%)')
    expect(commission).toBeEnabled()
    expect(screen.getByText(/Changes only affect new invoices/)).toBeInTheDocument()
    await user.clear(commission)
    await user.type(commission, '12')
    await user.click(screen.getByRole('button', { name: 'Save settings' }))

    expect(await screen.findByText('Commission above the allowed cap')).toBeInTheDocument()
    await waitFor(() => expect(commission).toHaveAttribute('aria-invalid', 'true'))
    expect(puts).toEqual([{ commissionPercent: 12 }])
  })
})
