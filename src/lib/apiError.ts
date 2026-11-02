import { isAxiosError } from 'axios'
import type { ApiError, ApiErrorEnvelope } from '@/types/api'

export function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'status' in value &&
    'code' in value &&
    'message' in value &&
    'details' in value
  )
}

function isEnvelope(data: unknown): data is ApiErrorEnvelope {
  return (
    typeof data === 'object' &&
    data !== null &&
    'error' in data &&
    typeof (data as ApiErrorEnvelope).error?.code === 'string'
  )
}

/** Converts anything thrown by axios (or already normalised) into an `ApiError`. */
export function toApiError(error: unknown): ApiError {
  if (isApiError(error)) return error

  if (isAxiosError(error)) {
    const status = error.response?.status ?? 0
    const data: unknown = error.response?.data
    if (isEnvelope(data)) {
      return {
        status,
        code: data.error.code,
        message: data.error.message,
        details: data.error.details ?? [],
        requestId: data.error.requestId ?? null,
      }
    }
    if (!error.response) {
      return {
        status: 0,
        code: 'NETWORK_ERROR',
        message: 'Unable to reach the server. Check your connection.',
        details: [],
        requestId: null,
      }
    }
    return {
      status,
      code: status >= 500 ? 'SERVER_ERROR' : 'HTTP_ERROR',
      message: error.message || 'Request failed',
      details: [],
      requestId: null,
    }
  }

  return {
    status: 0,
    code: 'UNKNOWN_ERROR',
    message:
      typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string'
        ? error.message
        : 'Something went wrong',
    details: [],
    requestId: null,
  }
}
