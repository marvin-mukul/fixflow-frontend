import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { formatDateTime } from '@/utils/format'

export interface TimelineItem {
  id: string
  title: ReactNode
  description?: ReactNode
  /** ISO timestamp, shown in IST. */
  timestamp: string
  meta?: ReactNode
}

/** Vertical activity list, newest last. */
export function Timeline({ items, className }: { items: TimelineItem[]; className?: string }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">No activity yet.</p>
  }
  return (
    <ol className={cn('relative flex flex-col gap-5 border-l pl-5', className)}>
      {items.map((item) => (
        <li key={item.id} className="relative">
          <span className="absolute top-1.5 -left-[25px] size-2.5 rounded-full border-2 border-background bg-primary ring-1 ring-border" />
          <div className="flex flex-col gap-0.5 text-sm">
            <div className="flex flex-wrap items-center gap-2 font-medium">{item.title}</div>
            {item.description && <div className="text-muted-foreground">{item.description}</div>}
            <time dateTime={item.timestamp} className="text-xs text-muted-foreground">
              {formatDateTime(item.timestamp)}
              {item.meta && <> · {item.meta}</>}
            </time>
          </div>
        </li>
      ))}
    </ol>
  )
}
