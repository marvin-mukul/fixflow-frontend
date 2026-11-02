import { ImageOffIcon } from 'lucide-react'
import { useEffect, useState, type ImgHTMLAttributes } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { apiAssetUrl } from '@/lib/apiAsset'
import { api } from '@/lib/axios'
import { cn } from '@/lib/utils'

interface AuthImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  /** API media path (needs the Bearer header), e.g. `/api/v1/requests/:id/media/:mid`. */
  src: string
}

type LoadState = { src: string; url: string | null; failed: boolean }

/** Fetches protected media through the axios instance and shows it via an object URL. */
export function AuthImage({ src, alt = '', className, ...props }: AuthImageProps) {
  const [state, setState] = useState<LoadState | null>(null)

  useEffect(() => {
    let cancelled = false
    let objectUrl: string | null = null
    api
      .get<Blob>(apiAssetUrl(src), { responseType: 'blob' })
      .then(({ data }) => {
        if (cancelled) return
        objectUrl = URL.createObjectURL(data)
        setState({ src, url: objectUrl, failed: false })
      })
      .catch(() => {
        if (!cancelled) setState({ src, url: null, failed: true })
      })
    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [src])

  const current = state?.src === src ? state : null
  if (current?.failed) {
    return (
      <div
        role="img"
        aria-label={alt || 'Image unavailable'}
        className={cn('flex items-center justify-center bg-muted text-muted-foreground', className)}
      >
        <ImageOffIcon className="size-5" />
      </div>
    )
  }
  if (!current?.url) return <Skeleton className={className} />
  return <img src={current.url} alt={alt} className={className} {...props} />
}
