import api from './api'

const authService = {
  // Register new user
  register: async (userData) => {
    return await api.post('/auth/register', userData)
  },

  // Login user
  login: async (credentials) => {
    return await api.post('/auth/login', credentials)
  },

  // Get current user
  getCurrentUser: async () => {
    return await api.get('/auth/me')
  },

  // Update user profile
  updateProfile: async (profileData) => {
    return await api.put('/auth/profile', profileData)
  },

  // Change password
  changePassword: async (passwordData) => {
    return await api.put('/auth/change-password', passwordData)
  },

  // Delete account
  deleteAccount: async () => {
    return await api.delete('/auth/account')
  },

  // Logout user (client-side only)
  logout: () => {
    localStorage.removeItem('token')
    return Promise.resolve()
  },
}

export default authService
