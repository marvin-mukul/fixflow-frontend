import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { PATHS } from '@/constants/paths'
import { api } from '@/lib/axios'
import { setNavigator } from '@/lib/navigation'
import { connectApiToStore, makeStore } from '@/store/index'
import { apiUrl, errorBody, makeUser } from '@/test/fixtures'
import { server } from '@/test/server'
import type { ApiError } from '@/types/api'

function setup() {
  const store = makeStore({
    auth: {
      user: makeUser(),
      accessToken: 'expired',
      status: 'succeeded',
      error: null,
      initialized: true,
    },
  })
  connectApiToStore(store)
  const navigate = vi.fn()
  setNavigator(navigate)
  return { store, navigate }
}

describe('api interceptors', () => {
  it('on 401 refreshes once (single-flight) and retries the original requests', async () => {
    const { store } = setup()
    let refreshCalls = 0
    server.use(
      http.get(apiUrl('/auth/me'), ({ request }) =>
        request.headers.get('Authorization') === 'Bearer fresh'
          ? HttpResponse.json(makeUser({ name: 'Fresh' }))
          : HttpResponse.json(errorBody('UNAUTHORIZED', 'Token expired'), { status: 401 }),
      ),
      http.post(apiUrl('/auth/refresh'), () => {
        refreshCalls += 1
        return HttpResponse.json({ accessToken: 'fresh', user: makeUser() })
      }),
    )

    const [a, b] = await Promise.all([api.get('/auth/me'), api.get('/auth/me')])

    expect(a.data.name).toBe('Fresh')
    expect(b.data.name).toBe('Fresh')
    expect(refreshCalls).toBe(1)
    expect(store.getState().auth.accessToken).toBe('fresh')
  })

  it('clears the session and navigates to login when refresh fails', async () => {
    const { store, navigate } = setup()
    server.use(
      http.get(apiUrl('/auth/me'), () =>
        HttpResponse.json(errorBody('UNAUTHORIZED', 'Token expired'), { status: 401 }),
      ),
      http.post(apiUrl('/auth/refresh'), () =>
        HttpResponse.json(errorBody('UNAUTHORIZED', 'No session'), { status: 401 }),
      ),
    )

    await expect(api.get('/auth/me')).rejects.toMatchObject({ status: 401 })
    expect(store.getState().auth.user).toBeNull()
    expect(navigate).toHaveBeenCalledWith(PATHS.LOGIN, { replace: true })
  })

  it('routes 403 PASSWORD_CHANGE_REQUIRED to the change-password page', async () => {
    const { navigate } = setup()
    server.use(
      http.get(apiUrl('/properties'), () =>
        HttpResponse.json(errorBody('PASSWORD_CHANGE_REQUIRED', 'Change your password'), {
          status: 403,
        }),
      ),
    )
    await expect(api.get('/properties')).rejects.toMatchObject({
      code: 'PASSWORD_CHANGE_REQUIRED',
    })
    expect(navigate).toHaveBeenCalledWith(PATHS.CHANGE_PASSWORD, { replace: true })
  })

  it('normalises errors to ApiError', async () => {
    setup()
    server.use(
      http.get(apiUrl('/things'), () =>
        HttpResponse.json(
          errorBody('VALIDATION_ERROR', 'Invalid', [
            { path: 'body.x', message: 'Bad x', code: 'custom' },
          ]),
          { status: 422 },
        ),
      ),
    )
    const error = (await api.get('/things').catch((e: unknown) => e)) as ApiError
    expect(error).toEqual({
      status: 422,
      code: 'VALIDATION_ERROR',
      message: 'Invalid',
      details: [{ path: 'body.x', message: 'Bad x', code: 'custom' }],
      requestId: 'req_test',
    })
  })
})
