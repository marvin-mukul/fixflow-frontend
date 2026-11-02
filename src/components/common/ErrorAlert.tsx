import { CircleAlertIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Alert, AlertAction, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface ErrorAlertProps {
  title: string
  message?: string | null
  action?: ReactNode
  className?: string
}

/** Destructive alert for form/request level errors. Renders nothing without a message. */
export function ErrorAlert({ title, message, action, className }: ErrorAlertProps) {
  if (!message) return null
  return (
    <Alert variant="destructive" className={className}>
      <CircleAlertIcon />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
      {action && <AlertAction>{action}</AlertAction>}
    </Alert>
  )
}
