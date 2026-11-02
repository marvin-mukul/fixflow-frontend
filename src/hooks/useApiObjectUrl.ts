import { useEffect, useState } from 'react'
import { apiAssetUrl } from '@/lib/apiAsset'
import { api } from '@/lib/axios'

export interface ApiObjectUrl {
  /** Object URL of the fetched blob, or null while loading / on failure. */
  url: string | null
  /** MIME type of the blob (e.g. `image/jpeg`, `application/pdf`). */
  type: string | null
  loading: boolean
  failed: boolean
}

type LoadState = { src: string; url: string | null; type: string | null; failed: boolean }

/**
 * Fetches protected media (an API path that needs the Bearer header) through the axios
 * instance and exposes it as an object URL, revoked on change/unmount.
 */
export function useApiObjectUrl(src: string | null): ApiObjectUrl {
  const [state, setState] = useState<LoadState | null>(null)

  useEffect(() => {
    if (!src) return
    let cancelled = false
    let objectUrl: string | null = null
    api
      .get<Blob>(apiAssetUrl(src), { responseType: 'blob' })
      .then(({ data }) => {
        if (cancelled) return
        objectUrl = URL.createObjectURL(data)
        setState({ src, url: objectUrl, type: data.type || null, failed: false })
      })
      .catch(() => {
        if (!cancelled) setState({ src, url: null, type: null, failed: true })
      })
    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [src])

  const current = src && state?.src === src ? state : null
  return {
    url: current?.url ?? null,
    type: current?.type ?? null,
    loading: !!src && !current,
    failed: current?.failed ?? false,
  }
}
