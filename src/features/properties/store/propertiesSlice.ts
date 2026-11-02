import { createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit'
import { propertiesApi } from '@/features/properties/api/properties.api'
import type {
  InvitationPreview,
  Property,
  PropertyDetail,
  PropertyPayload,
} from '@/features/properties/types/property.types'
import { toApiError } from '@/lib/apiError'
import { createApiThunk } from '@/lib/createApiThunk'
import type { ApiError, AsyncStatus } from '@/types/api'

const adapter = createEntityAdapter<Property>({
  sortComparer: (a, b) => a.label.localeCompare(b.label),
})

export interface PropertiesState extends ReturnType<typeof adapter.getInitialState> {
  status: AsyncStatus
  error: ApiError | null
  details: Record<string, PropertyDetail>
  detailStatus: AsyncStatus
  detailError: ApiError | null
  invitation: InvitationPreview | null
  invitationStatus: AsyncStatus
  invitationError: ApiError | null
}

const initialState: PropertiesState = adapter.getInitialState({
  status: 'idle',
  error: null,
  details: {},
  detailStatus: 'idle',
  detailError: null,
  invitation: null,
  invitationStatus: 'idle',
  invitationError: null,
})

export const fetchProperties = createApiThunk('properties/fetchAll', () => propertiesApi.list())
export const fetchProperty = createApiThunk('properties/fetchOne', (id: string) =>
  propertiesApi.get(id),
)
export const createProperty = createApiThunk('properties/create', (payload: PropertyPayload) =>
  propertiesApi.create(payload),
)
export const updateProperty = createApiThunk(
  'properties/update',
  ({ id, payload }: { id: string; payload: Partial<PropertyPayload> }) =>
    propertiesApi.update(id, payload),
)
export const deleteProperty = createApiThunk('properties/delete', async (id: string) => {
  await propertiesApi.remove(id)
  return id
})
export const inviteTenant = createApiThunk(
  'properties/invite',
  async ({ propertyId, email }: { propertyId: string; email: string }) => {
    const created = await propertiesApi.invite(propertyId, email)
    return { propertyId, created }
  },
)
export const endTenancy = createApiThunk(
  'properties/endTenancy',
  async ({ propertyId, tenancyId }: { propertyId: string; tenancyId: string }) => {
    await propertiesApi.endTenancy(propertyId, tenancyId)
    return propertiesApi.get(propertyId)
  },
)
export const fetchInvitation = createApiThunk('properties/fetchInvitation', (token: string) =>
  propertiesApi.previewInvitation(token),
)
export const acceptInvitation = createApiThunk('properties/acceptInvitation', (token: string) =>
  propertiesApi.acceptInvitation(token),
)

const propertiesSlice = createSlice({
  name: 'properties',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProperties.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchProperties.fulfilled, (state, action) => {
        state.status = 'succeeded'
        adapter.setAll(state, action.payload)
      })
      .addCase(fetchProperties.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload ?? toApiError(action.error)
      })
      .addCase(fetchProperty.pending, (state) => {
        state.detailStatus = 'loading'
        state.detailError = null
      })
      .addCase(fetchProperty.fulfilled, (state, action) => {
        state.detailStatus = 'succeeded'
        state.details[action.payload.id] = action.payload
        adapter.upsertOne(state, action.payload)
      })
      .addCase(fetchProperty.rejected, (state, action) => {
        state.detailStatus = 'failed'
        state.detailError = action.payload ?? toApiError(action.error)
      })
      .addCase(createProperty.fulfilled, (state, action) => {
        adapter.addOne(state, action.payload)
      })
      .addCase(updateProperty.fulfilled, (state, action) => {
        adapter.upsertOne(state, action.payload)
        const detail = state.details[action.payload.id]
        if (detail) state.details[action.payload.id] = { ...detail, ...action.payload }
      })
      .addCase(deleteProperty.fulfilled, (state, action) => {
        adapter.removeOne(state, action.payload)
        delete state.details[action.payload]
      })
      .addCase(inviteTenant.fulfilled, (state, action) => {
        const detail = state.details[action.payload.propertyId]
        if (detail) {
          detail.pendingInvitations = [
            ...detail.pendingInvitations.filter((i) => i.email !== action.payload.created.email),
            action.payload.created,
          ]
        }
      })
      .addCase(endTenancy.fulfilled, (state, action) => {
        state.details[action.payload.id] = action.payload
      })
      .addCase(fetchInvitation.pending, (state) => {
        state.invitationStatus = 'loading'
        state.invitationError = null
        state.invitation = null
      })
      .addCase(fetchInvitation.fulfilled, (state, action) => {
        state.invitationStatus = 'succeeded'
        state.invitation = action.payload
      })
      .addCase(fetchInvitation.rejected, (state, action) => {
        state.invitationStatus = 'failed'
        state.invitationError = action.payload ?? toApiError(action.error)
      })
  },
})

export const propertiesReducer = propertiesSlice.reducer

type WithProperties = { properties: PropertiesState }
const selectSlice = (state: WithProperties) => state.properties
const selectors = adapter.getSelectors(selectSlice)

export const selectAllProperties = selectors.selectAll
export const selectPropertyById = selectors.selectById
export const selectPropertiesStatus = (state: WithProperties) => state.properties.status
export const selectPropertiesError = (state: WithProperties) => state.properties.error
export const selectPropertyDetail = (state: WithProperties, id: string) =>
  state.properties.details[id] ?? null
export const selectInvitationState = createSelector([selectSlice], (s) => ({
  preview: s.invitation,
  status: s.invitationStatus,
  error: s.invitationError,
}))
export const selectOwnedProperties = createSelector([selectAllProperties], (items) =>
  items.filter((p) => p.relation === 'OWNER'),
)
