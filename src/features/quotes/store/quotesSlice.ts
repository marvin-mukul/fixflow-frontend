import { createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit'
import { quotesApi } from '@/features/quotes/api/quotes.api'
import type { MyQuoteItem, Quote, QuotePayload } from '@/features/quotes/types/quote.types'
import { toApiError } from '@/lib/apiError'
import { createApiThunk } from '@/lib/createApiThunk'
import type { ApiError, AsyncStatus } from '@/types/api'

const adapter = createEntityAdapter<Quote>()

interface RequestQuotesState {
  ids: string[]
  status: AsyncStatus
  error: ApiError | null
}

export interface QuotesState extends ReturnType<typeof adapter.getInitialState> {
  status: AsyncStatus
  error: ApiError | null
  byRequest: Record<string, RequestQuotesState>
  mine: MyQuoteItem[]
  mineStatus: AsyncStatus
  mineError: ApiError | null
}

const initialState: QuotesState = adapter.getInitialState({
  status: 'idle',
  error: null,
  byRequest: {},
  mine: [],
  mineStatus: 'idle',
  mineError: null,
})

export const fetchRequestQuotes = createApiThunk('quotes/fetchForRequest', async (requestId: string) => ({
  requestId,
  items: await quotesApi.listForRequest(requestId),
}))
export const acceptQuote = createApiThunk(
  'quotes/accept',
  ({ id, version, idempotencyKey }: { id: string; version: number; idempotencyKey: string }) =>
    quotesApi.accept(id, version, idempotencyKey),
)
export const submitQuote = createApiThunk(
  'quotes/submit',
  ({ requestId, payload }: { requestId: string; payload: QuotePayload }) =>
    quotesApi.create(requestId, payload),
)
export const reviseQuote = createApiThunk(
  'quotes/revise',
  ({ id, payload }: { id: string; payload: Partial<QuotePayload> }) => quotesApi.revise(id, payload),
)
export const withdrawQuote = createApiThunk('quotes/withdraw', (id: string) => quotesApi.withdraw(id))
export const fetchMyQuotes = createApiThunk('quotes/fetchMine', () => quotesApi.mine())

const quotesSlice = createSlice({
  name: 'quotes',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRequestQuotes.pending, (state, action) => {
        const existing = state.byRequest[action.meta.arg]
        state.byRequest[action.meta.arg] = { ids: existing?.ids ?? [], status: 'loading', error: null }
        state.status = 'loading'
      })
      .addCase(fetchRequestQuotes.fulfilled, (state, action) => {
        const { requestId, items } = action.payload
        adapter.upsertMany(state, items)
        state.byRequest[requestId] = { ids: items.map((q) => q.id), status: 'succeeded', error: null }
        state.status = 'succeeded'
      })
      .addCase(fetchRequestQuotes.rejected, (state, action) => {
        const error = action.payload ?? toApiError(action.error)
        state.byRequest[action.meta.arg] = { ids: [], status: 'failed', error }
        state.status = 'failed'
        state.error = error
      })
      .addCase(fetchMyQuotes.pending, (state) => {
        state.mineStatus = 'loading'
        state.mineError = null
      })
      .addCase(fetchMyQuotes.fulfilled, (state, action) => {
        state.mineStatus = 'succeeded'
        state.mine = action.payload
      })
      .addCase(fetchMyQuotes.rejected, (state, action) => {
        state.mineStatus = 'failed'
        state.mineError = action.payload ?? toApiError(action.error)
      })
      .addCase(submitQuote.fulfilled, (state, action) => {
        adapter.upsertOne(state, action.payload)
        state.mineStatus = 'idle'
      })
      .addCase(reviseQuote.fulfilled, (state, action) => {
        adapter.upsertOne(state, action.payload)
        state.mineStatus = 'idle'
      })
      .addCase(withdrawQuote.fulfilled, (state, action) => {
        adapter.upsertOne(state, action.payload)
        state.mineStatus = 'idle'
      })
  },
})

export const quotesReducer = quotesSlice.reducer

type WithQuotes = { quotes: QuotesState }
const selectors = adapter.getSelectors((state: WithQuotes) => state.quotes)

/** Best first: highest `rankScore`, then cheapest; quotes without a score go last. */
export function compareQuotes(a: Quote, b: Quote): number {
  const ra = a.rankScore ?? Number.NEGATIVE_INFINITY
  const rb = b.rankScore ?? Number.NEGATIVE_INFINITY
  if (ra !== rb) return rb - ra
  return a.totalPaise - b.totalPaise
}

export function makeSelectRankedQuotes(requestId: string) {
  return createSelector(
    [(state: WithQuotes) => state.quotes.byRequest[requestId], selectors.selectEntities],
    (entry, entities) => ({
      status: entry?.status ?? 'idle',
      error: entry?.error ?? null,
      items: (entry?.ids ?? [])
        .map((id) => entities[id])
        .filter((q): q is Quote => q !== undefined)
        .sort(compareQuotes),
    }),
  )
}

export const selectMyQuotes = (state: WithQuotes) => state.quotes.mine
export const selectMyQuotesStatus = (state: WithQuotes) => state.quotes.mineStatus
export const selectMyQuotesError = (state: WithQuotes) => state.quotes.mineError
