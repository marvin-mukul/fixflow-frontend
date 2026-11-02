import path from 'node:path'

/** Backend / database settings for the E2E run. Override with env vars (see README). */
export const BACKEND_DIR = path.resolve(
  import.meta.dirname,
  '..',
  process.env.E2E_BACKEND_DIR ?? '../fixflow-backend',
)
export const DATABASE_URL =
  process.env.E2E_DATABASE_URL ?? 'postgresql://fixflow:fixflow@localhost:5432/fixflow'
export const API_PORT = Number(process.env.E2E_API_PORT ?? 4000)
export const WEB_PORT = Number(process.env.E2E_WEB_PORT ?? 5173)
export const API_ORIGIN = `http://localhost:${API_PORT}`
export const WEB_ORIGIN = `http://localhost:${WEB_PORT}`
