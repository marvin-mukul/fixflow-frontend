import type {
  AcceptQuoteResult,
  MyQuoteItem,
  Quote,
  QuotePayload,
} from '@/features/quotes/types/quote.types'
import { api } from '@/lib/axios'

export const quotesApi = {
  async listForRequest(requestId: string) {
    const { data } = await api.get<{ items: Quote[] }>(`/requests/${requestId}/quotes`, {
      skipForbiddenRedirect: true,
    })
    return data.items
  },
  async create(requestId: string, payload: QuotePayload) {
    const { data } = await api.post<Quote>(`/requests/${requestId}/quotes`, payload)
    return data
  },
  async revise(id: string, payload: Partial<QuotePayload>) {
    const { data } = await api.patch<Quote>(`/quotes/${id}`, payload)
    return data
  },
  async withdraw(id: string) {
    const { data } = await api.post<Quote>(`/quotes/${id}/withdraw`)
    return data
  },
  /** `idempotencyKey` must be reused when retrying the same accept attempt. */
  async accept(id: string, version: number, idempotencyKey: string) {
    const { data } = await api.post<AcceptQuoteResult>(
      `/quotes/${id}/accept`,
      { version },
      { headers: { 'Idempotency-Key': idempotencyKey } },
    )
    return data
  },
  async mine() {
    const { data } = await api.get<{ items: MyQuoteItem[] }>('/worker/quotes')
    return data.items
  },
}
