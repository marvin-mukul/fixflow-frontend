const DEFAULT_API_URL = 'http://localhost:4000/api/v1'

export const env = {
  API_URL: import.meta.env.VITE_API_URL || DEFAULT_API_URL,
  MAPBOX_TOKEN: import.meta.env.VITE_MAPBOX_TOKEN ?? '',
  PAYMENT_PROVIDER: import.meta.env.VITE_PAYMENT_PROVIDER || 'mock',
} as const
