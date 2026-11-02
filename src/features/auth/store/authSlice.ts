import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { authApi } from '@/features/auth/api/auth.api'
import type {
  AuthResponse,
  ChangePasswordPayload,
  LoginPayload,
  RegisterPayload,
  User,
} from '@/features/auth/types/auth.types'
import { toApiError } from '@/lib/apiError'
import type { ApiError } from '@/types/api'

export type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

export interface AuthState {
  user: User | null
  /** Access token lives in memory only; the refresh token is an httpOnly cookie. */
  accessToken: string | null
  status: AsyncStatus
  error: ApiError | null
  /** True once the boot-time `refreshSession()` has settled. */
  initialized: boolean
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  status: 'idle',
  error: null,
  initialized: false,
}

type RejectConfig = { rejectValue: ApiError }

export const login = createAsyncThunk<AuthResponse, LoginPayload, RejectConfig>(
  'auth/login',
  async (payload, { rejectWithValue }) => {
    try {
      return await authApi.login(payload)
    } catch (error) {
      return rejectWithValue(toApiError(error))
    }
  },
)

export const register = createAsyncThunk<AuthResponse, RegisterPayload, RejectConfig>(
  'auth/register',
  async (payload, { rejectWithValue }) => {
    try {
      return await authApi.register(payload)
    } catch (error) {
      return rejectWithValue(toApiError(error))
    }
  },
)

export const refreshSession = createAsyncThunk<AuthResponse, void, RejectConfig>(
  'auth/refreshSession',
  async (_, { rejectWithValue }) => {
    try {
      return await authApi.refresh()
    } catch (error) {
      return rejectWithValue(toApiError(error))
    }
  },
)

export const logout = createAsyncThunk<void, void, RejectConfig>(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authApi.logout()
    } catch (error) {
      return rejectWithValue(toApiError(error))
    }
  },
)

export const changePassword = createAsyncThunk<
  AuthResponse,
  ChangePasswordPayload,
  RejectConfig
>('auth/changePassword', async (payload, { rejectWithValue }) => {
  try {
    return await authApi.changePassword(payload)
  } catch (error) {
    return rejectWithValue(toApiError(error))
  }
})

function setSession(state: AuthState, { accessToken, user }: AuthResponse) {
  state.accessToken = accessToken
  state.user = user
  state.status = 'succeeded'
  state.error = null
}

function clear(state: AuthState) {
  state.user = null
  state.accessToken = null
  state.status = 'idle'
  state.error = null
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /** Local-only session wipe (e.g. refresh token expired). */
    sessionCleared: clear,
    authErrorCleared(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    for (const thunk of [login, register, changePassword]) {
      builder
        .addCase(thunk.pending, (state) => {
          state.status = 'loading'
          state.error = null
        })
        .addCase(thunk.fulfilled, (state, action) => setSession(state, action.payload))
        .addCase(thunk.rejected, (state, action) => {
          state.status = 'failed'
          state.error = action.payload ?? toApiError(action.error)
        })
    }
    builder
      .addCase(refreshSession.fulfilled, (state, action) => {
        setSession(state, action.payload)
        state.initialized = true
      })
      .addCase(refreshSession.rejected, (state) => {
        clear(state)
        state.initialized = true
      })
      // Logout clears locally even if the API call fails.
      .addCase(logout.fulfilled, clear)
      .addCase(logout.rejected, clear)
  },
})

export const { sessionCleared, authErrorCleared } = authSlice.actions
export const authReducer = authSlice.reducer

type WithAuth = { auth: AuthState }
export const selectAuth = (state: WithAuth) => state.auth
export const selectCurrentUser = (state: WithAuth) => state.auth.user
export const selectAccessToken = (state: WithAuth) => state.auth.accessToken
export const selectIsAuthenticated = (state: WithAuth) => state.auth.user !== null
