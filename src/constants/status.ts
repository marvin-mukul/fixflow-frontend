/** Status / priority display config, aligned with the backend enums. */

export type BadgeTone = 'default' | 'secondary' | 'destructive' | 'outline'

export interface StatusConfig {
  label: string
  variant: BadgeTone
  /** Extra classes for a coloured dot / tint. */
  className?: string
}

export const REQUEST_STATUSES = [
  'AWAITING_OWNER_JOIN',
  'PENDING_APPROVAL',
  'OPEN_FOR_QUOTES',
  'SCHEDULED',
  'IN_PROGRESS',
  'PENDING_SIGN_OFF',
  'COMPLETED',
  'DISPUTED',
  'REJECTED',
  'EXPIRED',
  'CANCELLED',
] as const
export type RequestStatus = (typeof REQUEST_STATUSES)[number]

export const REQUEST_STATUS: Record<RequestStatus, StatusConfig> = {
  AWAITING_OWNER_JOIN: { label: 'Awaiting owner', variant: 'outline', className: 'text-amber-700 dark:text-amber-300' },
  PENDING_APPROVAL: { label: 'Pending approval', variant: 'outline', className: 'border-amber-300 text-amber-700 dark:text-amber-300' },
  OPEN_FOR_QUOTES: { label: 'Open for quotes', variant: 'secondary', className: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200' },
  SCHEDULED: { label: 'Scheduled', variant: 'secondary', className: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200' },
  IN_PROGRESS: { label: 'In progress', variant: 'secondary', className: 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200' },
  PENDING_SIGN_OFF: { label: 'Awaiting sign-off', variant: 'outline', className: 'border-violet-300 text-violet-700 dark:text-violet-300' },
  COMPLETED: { label: 'Completed', variant: 'default', className: 'bg-emerald-600 text-white' },
  DISPUTED: { label: 'Disputed', variant: 'destructive' },
  REJECTED: { label: 'Rejected', variant: 'destructive' },
  EXPIRED: { label: 'Expired', variant: 'outline', className: 'text-muted-foreground' },
  CANCELLED: { label: 'Cancelled', variant: 'outline', className: 'text-muted-foreground' },
}

/** Tabs on the requests screen. */
export const REQUEST_STATUS_GROUPS = {
  active: {
    label: 'Active',
    statuses: ['AWAITING_OWNER_JOIN', 'PENDING_APPROVAL', 'OPEN_FOR_QUOTES'] as RequestStatus[],
  },
  ongoing: {
    label: 'Scheduled & ongoing',
    statuses: ['SCHEDULED', 'IN_PROGRESS', 'PENDING_SIGN_OFF', 'DISPUTED'] as RequestStatus[],
  },
  closed: {
    label: 'Closed',
    statuses: ['COMPLETED', 'REJECTED', 'EXPIRED', 'CANCELLED'] as RequestStatus[],
  },
} as const
export type RequestStatusGroup = keyof typeof REQUEST_STATUS_GROUPS

export const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'EMERGENCY'] as const
export type Priority = (typeof PRIORITIES)[number]

export const PRIORITY: Record<Priority, StatusConfig & { description: string }> = {
  LOW: { label: 'Low', variant: 'outline', description: 'Whenever convenient' },
  MEDIUM: { label: 'Medium', variant: 'secondary', description: 'Within a few days' },
  HIGH: { label: 'High', variant: 'default', className: 'bg-orange-500 text-white', description: 'Within 24 hours' },
  EMERGENCY: { label: 'Emergency', variant: 'destructive', className: 'bg-destructive text-white', description: 'Right now (leak, no power…)' },
}

export const QUOTE_STATUSES = ['SUBMITTED', 'WITHDRAWN', 'ACCEPTED', 'REJECTED', 'EXPIRED'] as const
export type QuoteStatus = (typeof QUOTE_STATUSES)[number]

export const QUOTE_STATUS: Record<QuoteStatus, StatusConfig> = {
  SUBMITTED: { label: 'Submitted', variant: 'secondary' },
  WITHDRAWN: { label: 'Withdrawn', variant: 'outline', className: 'text-muted-foreground' },
  ACCEPTED: { label: 'Accepted', variant: 'default', className: 'bg-emerald-600 text-white' },
  REJECTED: { label: 'Not selected', variant: 'outline', className: 'text-muted-foreground' },
  EXPIRED: { label: 'Expired', variant: 'outline', className: 'text-muted-foreground' },
}

export const WORKER_VERIFICATION = {
  PENDING: { label: 'Verification pending', variant: 'outline' },
  VERIFIED: { label: 'Verified', variant: 'default', className: 'bg-emerald-600 text-white' },
  REJECTED: { label: 'Verification rejected', variant: 'destructive' },
  SUSPENDED: { label: 'Suspended', variant: 'destructive' },
} as const satisfies Record<string, StatusConfig>
export type WorkerVerificationStatus = keyof typeof WORKER_VERIFICATION

/** Request statuses in which the payer's quote list is relevant. */
export const QUOTES_VISIBLE_IN: readonly RequestStatus[] = [
  'OPEN_FOR_QUOTES',
  'SCHEDULED',
  'IN_PROGRESS',
  'PENDING_SIGN_OFF',
  'COMPLETED',
  'DISPUTED',
]

export const JOB_SUB_STATUS = {
  CONFIRMED: { label: 'Confirmed', variant: 'secondary' },
  EN_ROUTE: { label: 'On the way', variant: 'secondary', className: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200' },
  ARRIVED: { label: 'Arrived', variant: 'secondary', className: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200' },
  WORKING: { label: 'Working', variant: 'secondary', className: 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200' },
  DONE: { label: 'Done', variant: 'default', className: 'bg-emerald-600 text-white' },
} as const satisfies Record<string, StatusConfig>

export const INVOICE_STATUS = {
  ISSUED: { label: 'Awaiting payment', variant: 'outline', className: 'border-amber-300 text-amber-700 dark:text-amber-300' },
  PAID: { label: 'Paid', variant: 'default', className: 'bg-emerald-600 text-white' },
  PAID_OFFLINE: { label: 'Paid offline', variant: 'default', className: 'bg-emerald-600 text-white' },
  REFUNDED: { label: 'Refunded', variant: 'secondary' },
  PARTIALLY_REFUNDED: { label: 'Partly refunded', variant: 'secondary' },
} as const satisfies Record<string, StatusConfig>

export const DISPUTE_STATUS = {
  OPEN: { label: 'Open', variant: 'destructive' },
  RESOLVED: { label: 'Resolved', variant: 'default', className: 'bg-emerald-600 text-white' },
} as const satisfies Record<string, StatusConfig>

export const PAYMENT_STATUS = {
  CREATED: { label: 'Created', variant: 'outline' },
  PAID: { label: 'Paid', variant: 'default', className: 'bg-emerald-600 text-white' },
  FAILED: { label: 'Failed', variant: 'destructive' },
  REFUNDED: { label: 'Refunded', variant: 'secondary' },
  PARTIALLY_REFUNDED: { label: 'Partly refunded', variant: 'secondary' },
} as const satisfies Record<string, StatusConfig>

/** Short worker verification labels for admin tables and tabs. */
export const WORKER_STATUS_SHORT = {
  PENDING: { label: 'Pending', variant: 'outline', className: 'border-amber-300 text-amber-700 dark:text-amber-300' },
  VERIFIED: { label: 'Verified', variant: 'default', className: 'bg-emerald-600 text-white' },
  REJECTED: { label: 'Rejected', variant: 'destructive' },
  SUSPENDED: { label: 'Suspended', variant: 'destructive' },
} as const satisfies Record<WorkerVerificationStatus, StatusConfig>
