const DEFAULT_API_URL = 'http://localhost:4000/api/v1'

export type PaymentProviderName = 'mock' | 'cashfree'

export const env = {
  API_URL: import.meta.env.VITE_API_URL || DEFAULT_API_URL,
  MAPBOX_TOKEN: import.meta.env.VITE_MAPBOX_TOKEN ?? '',
  /** `cashfree` enables loading the Cashfree JS SDK for `sdk` checkouts. */
  PAYMENT_PROVIDER: (import.meta.env.VITE_PAYMENT_PROVIDER === 'cashfree' ? 'cashfree' : 'mock') as PaymentProviderName,
} as const
