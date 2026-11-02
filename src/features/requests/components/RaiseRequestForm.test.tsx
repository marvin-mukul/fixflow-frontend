import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { PATHS } from '@/constants/paths'
import { apiUrl, errorBody, makeCategory, makeProperty, makeUser } from '@/test/fixtures'
import { authedState, renderApp } from '@/test/renderApp'
import { server } from '@/test/server'

describe('RaiseRequestForm', () => {
  it('maps 422 validation details onto the form fields', async () => {
    let body: unknown = null
    server.use(
      http.get(apiUrl('/properties'), () => HttpResponse.json({ items: [makeProperty()] })),
      http.get(apiUrl('/categories'), () => HttpResponse.json({ items: [makeCategory()] })),
      http.post(apiUrl('/requests'), async ({ request }) => {
        body = await request.json()
        return HttpResponse.json(
          errorBody('VALIDATION_ERROR', 'Invalid request', [
            { path: 'body.title', message: 'Title must describe the problem', code: 'custom' },
            { path: 'body.categoryId', message: 'Category is not active', code: 'custom' },
          ]),
          { status: 422 },
        )
      }),
    )
    const { router } = renderApp({ path: PATHS.CUSTOMER_REQUEST_NEW, preloadedState: authedState(makeUser()) })
    const user = userEvent.setup()

    // Single property is preselected; pick the category from the shadcn select.
    await user.click(await screen.findByRole('combobox', { name: 'Category' }))
    await user.click(await screen.findByRole('option', { name: 'Plumbing' }))
    await user.type(screen.getByLabelText('Title'), 'Sink leaking badly')
    await user.type(screen.getByLabelText('Description'), 'Water everywhere under the kitchen sink.')
    await user.click(screen.getByRole('button', { name: 'Raise request' }))

    expect(await screen.findByText('Title must describe the problem')).toBeInTheDocument()
    expect(screen.getByText('Category is not active')).toBeInTheDocument()
    expect(screen.getByLabelText('Title')).toHaveAttribute('aria-invalid', 'true')
    expect(body).toMatchObject({
      propertyId: makeProperty().id,
      categoryId: makeCategory().id,
      title: 'Sink leaking badly',
      priority: 'MEDIUM',
      preferredSlots: [],
    })
    await waitFor(() => expect(router.state.location.pathname).toBe(PATHS.CUSTOMER_REQUEST_NEW))
  })
})
