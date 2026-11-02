import { env } from '@/config/env'

/**
 * Media URLs in API responses are absolute paths such as `/api/v1/requests/:id/media/:mid`.
 * Resolve them against the API origin so axios does not prepend its `/api/v1` base again.
 */
export function apiAssetUrl(path: string): string {
  return new URL(path, env.API_URL).toString()
}
