import { CircleAlertIcon, RotateCcwIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Alert, AlertAction, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

interface ErrorAlertProps {
  title: string
  message?: string | null
  action?: ReactNode
  /** Renders a "Try again" button (ignored when `action` is given). */
  onRetry?: () => void
  className?: string
}

/** Destructive alert for form/request level errors. Renders nothing without a message. */
export function ErrorAlert({ title, message, action, onRetry, className }: ErrorAlertProps) {
  if (!message) return null
  const trailing =
    action ??
    (onRetry && (
      <Button size="sm" variant="outline" onClick={onRetry}>
        <RotateCcwIcon />
        Try again
      </Button>
    ))
  return (
    <Alert variant="destructive" className={className}>
      <CircleAlertIcon />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
      {trailing && <AlertAction>{trailing}</AlertAction>}
    </Alert>
  )
}
