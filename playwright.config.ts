import { defineConfig, devices } from '@playwright/test'
import { API_ORIGIN, API_PORT, BACKEND_DIR, DATABASE_URL, WEB_ORIGIN, WEB_PORT } from './e2e/env.ts'

/**
 * E2E runs against the real backend (`../fixflow-backend`) and a real PostgreSQL + PostGIS database.
 * `e2e/global-setup.ts` truncates and re-seeds that database before every run.
 * Settings come from env vars with defaults; see `e2e/env.ts` and the README.
 */
export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/global-setup.ts',
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: 0,
  timeout: 120_000,
  expect: { timeout: 15_000 },
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: WEB_ORIGIN,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      name: 'api',
      command: 'npx tsx src/server.ts',
      cwd: BACKEND_DIR,
      url: `${API_ORIGIN}/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      stdout: 'ignore',
      stderr: 'pipe',
      env: {
        DATABASE_URL,
        DATABASE_URL_TEST: process.env.E2E_DATABASE_URL_TEST ?? `${DATABASE_URL}_test`,
        PORT: String(API_PORT),
        API_PUBLIC_URL: API_ORIGIN,
        APP_URL: WEB_ORIGIN,
        CORS_ORIGIN: WEB_ORIGIN,
        PAYMENT_PROVIDER: 'mock',
        LOG_LEVEL: 'warn',
      },
    },
    {
      name: 'web',
      // Production build + preview: no dev-server dependency optimizer, so no mid-test page
      // reloads on first visit to a lazy route (that made cold runs flaky).
      command: `npx vite build --logLevel warn && npx vite preview --port ${WEB_PORT} --strictPort`,
      url: WEB_ORIGIN,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        VITE_API_URL: `${API_ORIGIN}/api/v1`,
        VITE_PAYMENT_PROVIDER: 'mock',
        VITE_MAPBOX_TOKEN: '',
      },
    },
  ],
})
