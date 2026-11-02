import { ImageOffIcon } from 'lucide-react'
import type { ImgHTMLAttributes } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { useApiObjectUrl } from '@/hooks/useApiObjectUrl'
import { cn } from '@/lib/utils'

interface AuthImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  /** API media path (needs the Bearer header), e.g. `/api/v1/requests/:id/media/:mid`. */
  src: string
}

/** Fetches protected media through the axios instance and shows it via an object URL. */
export function AuthImage({ src, alt = '', className, ...props }: AuthImageProps) {
  const { url, failed } = useApiObjectUrl(src)
  if (failed) {
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
  if (!url) return <Skeleton className={className} />
  return <img src={url} alt={alt} className={className} {...props} />
}
