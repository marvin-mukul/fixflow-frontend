export interface ApiErrorDetail {
  path: string
  message: string
  code: string
}

/** Normalised error shape every API call rejects with. */
export interface ApiError {
  /** HTTP status, or 0 for network errors / no response. */
  status: number
  code: string
  message: string
  details: ApiErrorDetail[]
  requestId: string | null
}

/** Backend error envelope for every non-2xx response. */
export interface ApiErrorEnvelope {
  error: {
    code: string
    message: string
    details?: ApiErrorDetail[]
    requestId?: string
  }
}

export type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

/** Cursor-paginated list envelope used by list endpoints. */
export interface CursorPage<T> {
  items: T[]
  nextCursor: string | null
}
