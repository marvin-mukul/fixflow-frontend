import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config.ts'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      // Same origin as the default API URL so jsdom's XHR skips CORS preflights.
      environmentOptions: { jsdom: { url: 'http://localhost:4000' } },
      // Pin env so a developer's .env (e.g. a real Mapbox token) cannot change test behaviour.
      env: { VITE_API_URL: 'http://localhost:4000/api/v1', VITE_MAPBOX_TOKEN: '', VITE_PAYMENT_PROVIDER: 'mock' },
      setupFiles: ['./src/test/setup.ts'],
      include: ['src/**/*.test.{ts,tsx}'],
      css: false,
      restoreMocks: true,
    },
  }),
)
