import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config.ts'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      // Same origin as the default API URL so jsdom's XHR skips CORS preflights.
      environmentOptions: { jsdom: { url: 'http://localhost:4000' } },
      env: { VITE_API_URL: 'http://localhost:4000/api/v1' },
      setupFiles: ['./src/test/setup.ts'],
      include: ['src/**/*.test.{ts,tsx}'],
      css: false,
      restoreMocks: true,
    },
  }),
)
