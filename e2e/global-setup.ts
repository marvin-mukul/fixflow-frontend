import { execSync } from 'node:child_process'
import { BACKEND_DIR, DATABASE_URL } from './env.ts'

/** Truncates and re-seeds the E2E database through the backend's `db:e2e-reset` script. */
export default function globalSetup() {
  execSync('npm run db:e2e-reset', {
    cwd: BACKEND_DIR,
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL },
  })
}
