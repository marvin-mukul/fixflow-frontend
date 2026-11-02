/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  readonly VITE_MAPBOX_TOKEN?: string
  readonly VITE_PAYMENT_PROVIDER?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
