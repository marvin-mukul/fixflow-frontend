import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { env } from '@/config/env'

const url = (path: string) => `${env.API_URL}${path}`

/**
 * Baseline handlers for endpoints the shells and dashboards call on every
 * render (empty data). Tests override them with `server.use(...)`.
 */
export const defaultHandlers = [
  http.get(url('/notifications/unread-count'), () => HttpResponse.json({ count: 0 })),
  http.get(url('/notifications'), () => HttpResponse.json({ items: [], nextCursor: null })),
  http.get(url('/properties'), () => HttpResponse.json({ items: [] })),
  http.get(url('/requests'), () => HttpResponse.json({ items: [], nextCursor: null })),
  http.get(url('/categories'), () => HttpResponse.json({ items: [] })),
  http.get(url('/admin/stats'), () =>
    HttpResponse.json({
      users: {},
      workers: {},
      requests: {},
      jobs: { total: 0, completed: 0 },
      money: { gmvPaise: 0, commissionPaise: 0, commissionGstPaise: 0, paidInvoices: 0 },
      rates: { acceptance: 0, completion: 0, dispute: 0 },
    }),
  ),
]

/** Shared MSW server. Tests add handlers with `server.use(...)`. */
export const server = setupServer(...defaultHandlers)
