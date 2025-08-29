import api from './api'

const boardService = {
  // Get all boards for user
  getBoards: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return await api.get(`/boards?${queryString}`)
  },

  // Get single board
  getBoard: async (boardId) => {
    return await api.get(`/boards/${boardId}`)
  },

  // Create new board
  createBoard: async (boardData) => {
    return await api.post('/boards', boardData)
  },

  // Update board
  updateBoard: async (boardId, updates) => {
    return await api.put(`/boards/${boardId}`, updates)
  },

  // Delete board
  deleteBoard: async (boardId) => {
    return await api.delete(`/boards/${boardId}`)
  },

  // Add member to board
  addMember: async (boardId, userId, role = 'member') => {
    return await api.post(`/boards/${boardId}/members`, { userId, role })
  },

  // Remove member from board
  removeMember: async (boardId, userId) => {
    return await api.delete(`/boards/${boardId}/members/${userId}`)
  },

  // Toggle board favorite
  toggleFavorite: async (boardId) => {
    return await api.put(`/boards/${boardId}/favorite`)
  },
}

export default boardService
