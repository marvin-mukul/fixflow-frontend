import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { toast } from 'sonner'
import { env } from '@/config/env'
import { PATHS } from '@/constants/paths'
import { toApiError } from '@/lib/apiError'
import { navigateTo } from '@/lib/navigation'

/**
 * Auth hooks injected by the store at startup. `lib` never imports the store
 * directly, which keeps the dependency graph acyclic.
 */
export interface AuthHandlers {
  getAccessToken: () => string | null
  /** Refreshes the session and resolves with the new access token. */
  refreshSession: () => Promise<string>
  /** Called when the refresh fails: clear local session state. */
  onSessionExpired: () => void
}

declare module 'axios' {
  interface AxiosRequestConfig {
    /**
     * Let a 403 reach the caller instead of redirecting to the 403 page. Use it for
     * business-rule 403s the screen explains itself (e.g. INVITATION_EMAIL_MISMATCH).
     */
    skipForbiddenRedirect?: boolean
  }
}

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean }

/** Endpoints whose 401/403 must reach the caller untouched (forms show them). */
const AUTH_ENDPOINTS = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout']

let handlers: AuthHandlers | null = null
let refreshPromise: Promise<string> | null = null

export function setAuthHandlers(next: AuthHandlers | null) {
  handlers = next
}

export const api = axios.create({
  baseURL: env.API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

function isAuthEndpoint(url: string | undefined) {
  return !!url && AUTH_ENDPOINTS.some((path) => url.startsWith(path))
}

/** Single-flight: concurrent 401s share one refresh request. */
function refreshOnce(): Promise<string> {
  if (!handlers) return Promise.reject(new Error('Auth handlers not registered'))
  if (!refreshPromise) {
    refreshPromise = handlers.refreshSession().finally(() => {
      refreshPromise = null
    })
  }
  return refreshPromise
}

api.interceptors.request.use((config) => {
  const token = handlers?.getAccessToken()
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const apiError = toApiError(error)
    const config = error.config as RetriableConfig | undefined
    const authEndpoint = isAuthEndpoint(config?.url)

    if (apiError.status === 401 && config && !authEndpoint && !config._retry) {
      config._retry = true
      try {
        const token = await refreshOnce()
        config.headers.Authorization = `Bearer ${token}`
        return api.request(config)
      } catch {
        handlers?.onSessionExpired()
        navigateTo(PATHS.LOGIN, { replace: true })
        throw apiError
      }
    }

    if (apiError.status === 403 && !authEndpoint && !config?.skipForbiddenRedirect) {
      if (apiError.code === 'PASSWORD_CHANGE_REQUIRED') {
        navigateTo(PATHS.CHANGE_PASSWORD, { replace: true })
      } else {
        navigateTo(PATHS.FORBIDDEN)
      }
    } else if (apiError.status === 0 || apiError.status >= 500) {
      toast.error(apiError.message, {
        description: apiError.requestId ? `Request ID: ${apiError.requestId}` : undefined,
      })
    }

    throw apiError
  },
)
