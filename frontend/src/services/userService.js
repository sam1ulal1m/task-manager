import api from './api'

const userService = {
  // Search users
  searchUsers: async (query, limit = 10) => {
    return await api.get(`/users/search/${encodeURIComponent(query)}?limit=${limit}`)
  },

  // Get user by ID
  getUser: async (userId) => {
    return await api.get(`/users/${userId}`)
  },

  // Get all users (Admin only)
  getUsers: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return await api.get(`/users?${queryString}`)
  },

  // Update user (Admin only)
  updateUser: async (userId, updates) => {
    return await api.put(`/users/${userId}`, updates)
  },

  // Delete user (Admin only)
  deleteUser: async (userId) => {
    return await api.delete(`/users/${userId}`)
  },
}

export default userService
