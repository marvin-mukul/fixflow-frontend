import { BellIcon, CheckCheckIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { EmptyState } from '@/components/common/EmptyState'
import { Loader } from '@/components/common/Loader'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  fetchNotifications,
  fetchUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
  selectNotifications,
  selectNotificationsCursor,
  selectNotificationsStatus,
  selectUnreadCount,
} from '@/features/notifications/store/notificationsSlice'
import type { AppNotification } from '@/features/notifications/types/notification.types'
import { cn } from '@/lib/utils'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { resolveAppLink } from '@/utils/appLinks'
import { formatDateTime } from '@/utils/format'

const UNREAD_POLL_MS = 30_000

/** Header bell: unread badge (polled every 30 s) and a sheet with the notification list. */
export function NotificationBell() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const unread = useAppSelector(selectUnreadCount)
  const items = useAppSelector(selectNotifications)
  const status = useAppSelector(selectNotificationsStatus)
  const cursor = useAppSelector(selectNotificationsCursor)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    void dispatch(fetchUnreadCount())
    const timer = window.setInterval(() => void dispatch(fetchUnreadCount()), UNREAD_POLL_MS)
    return () => window.clearInterval(timer)
  }, [dispatch])

  const onOpenChange = (next: boolean) => {
    setOpen(next)
    if (next) void dispatch(fetchNotifications(null))
  }

  const openItem = (item: AppNotification) => {
    if (!item.readAt) void dispatch(markNotificationRead(item.id))
    const to = resolveAppLink(item.link)
    if (to) {
      setOpen(false)
      navigate(to)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            aria-label={unread > 0 ? `Notifications (${unread} unread)` : 'Notifications'}
          />
        }
      >
        <BellIcon />
        {unread > 0 && (
          <span aria-hidden="true" className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-white tabular-nums">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </SheetTrigger>
      <SheetContent className="flex flex-col gap-0 sm:max-w-md">
        <SheetHeader className="border-b">
          <SheetTitle>Notifications</SheetTitle>
          <SheetDescription>{unread > 0 ? `${unread} unread` : 'You are all caught up'}</SheetDescription>
          <Button
            variant="outline"
            size="sm"
            className="self-start"
            disabled={unread === 0}
            onClick={() => void dispatch(markAllNotificationsRead())}
          >
            <CheckCheckIcon />
            Mark all read
          </Button>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto">
          {status === 'loading' && items.length === 0 ? (
            <Loader />
          ) : items.length === 0 ? (
            <EmptyState icon={<BellIcon />} title="No notifications" />
          ) : (
            <ul className="divide-y">
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => openItem(item)}
                    className={cn(
                      'flex w-full gap-3 px-4 py-3 text-left text-sm hover:bg-muted',
                      !item.readAt && 'bg-primary/5',
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn('mt-1.5 size-2 shrink-0 rounded-full', item.readAt ? 'bg-transparent' : 'bg-primary')}
                    />
                    <span className="flex flex-col gap-0.5">
                      <span className={cn(!item.readAt && 'font-medium')}>{item.title}</span>
                      <span className="text-muted-foreground">{item.body}</span>
                      <span className="text-xs text-muted-foreground">{formatDateTime(item.createdAt)}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {cursor && (
            <div className="flex justify-center p-3">
              <Button
                variant="ghost"
                size="sm"
                disabled={status === 'loading'}
                onClick={() => void dispatch(fetchNotifications(cursor))}
              >
                Load older
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
