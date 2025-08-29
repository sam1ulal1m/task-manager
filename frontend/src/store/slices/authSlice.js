import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import authService from '../../services/authService'
import toast from 'react-hot-toast'

// Check if user is authenticated
export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        return rejectWithValue('No token found')
      }
      
      const response = await authService.getCurrentUser()
      return response.data.user
    } catch (error) {
      localStorage.removeItem('token')
      return rejectWithValue(error.response?.data?.message || 'Authentication failed')
    }
  }
)

// Login user
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials)
      localStorage.setItem('token', response.data.token)
      toast.success('Welcome back!')
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

// Register user
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData)
      localStorage.setItem('token', response.data.token)
      toast.success('Account created successfully!')
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

// Update profile
export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await authService.updateProfile(profileData)
      toast.success('Profile updated successfully!')
      return response.data.user
    } catch (error) {
      const message = error.response?.data?.message || 'Update failed'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

// Change password
export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (passwordData, { rejectWithValue }) => {
    try {
      await authService.changePassword(passwordData)
      toast.success('Password changed successfully!')
      return true
    } catch (error) {
      const message = error.response?.data?.message || 'Password change failed'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

// Delete account
export const deleteAccount = createAsyncThunk(
  'auth/deleteAccount',
  async (_, { rejectWithValue }) => {
    try {
      await authService.deleteAccount()
      localStorage.removeItem('token')
      toast.success('Account deleted successfully')
      return true
    } catch (error) {
      const message = error.response?.data?.message || 'Account deletion failed'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

// Logout
export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    localStorage.removeItem('token')
    toast.success('Logged out successfully')
  }
)

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  isLoading: true,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setUser: (state, action) => {
      state.user = action.payload
      state.isAuthenticated = true
    },
  },
  extraReducers: (builder) => {
    builder
      // Check Auth
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.isLoading = false
        state.user = null
        state.isAuthenticated = false
        state.token = null
        state.error = action.payload
      })
      
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false
        state.user = null
        state.token = null
        state.isAuthenticated = false
        state.error = action.payload
      })
      
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false
        state.user = null
        state.token = null
        state.isAuthenticated = false
        state.error = action.payload
      })
      
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload
        state.error = null
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Change Password
      .addCase(changePassword.pending, (state) => {
        state.isLoading = true
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.isLoading = false
        state.error = null
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Delete Account
      .addCase(deleteAccount.pending, (state) => {
        state.isLoading = true
      })
      .addCase(deleteAccount.fulfilled, (state) => {
        state.user = null
        state.token = null
        state.isAuthenticated = false
        state.isLoading = false
        state.error = null
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null
        state.token = null
        state.isAuthenticated = false
        state.isLoading = false
        state.error = null
      })
  },
})

export const { clearError, setUser } = authSlice.actions
export default authSlice.reducer
