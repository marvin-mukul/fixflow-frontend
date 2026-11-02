import { env } from '@/config/env'

/**
 * Media URLs in API responses are absolute paths such as `/api/v1/requests/:id/media/:mid`.
 * Resolve them against the API origin so axios does not prepend its `/api/v1` base again.
 * `API_URL` may be relative (`/api/v1` behind the Vercel proxy), so anchor it to the page origin.
 */
export function apiAssetUrl(path: string): string {
  return new URL(path, new URL(env.API_URL, window.location.origin)).toString()
}
