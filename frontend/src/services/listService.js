import api from './api'

const listService = {
  // Get lists for a board
  getLists: async (boardId) => {
    return await api.get(`/lists/board/${boardId}`)
  },

  // Create new list
  createList: async (listData) => {
    return await api.post('/lists', listData)
  },

  // Update list
  updateList: async (listId, updates) => {
    return await api.put(`/lists/${listId}`, updates)
  },

  // Delete list
  deleteList: async (listId) => {
    return await api.delete(`/lists/${listId}`)
  },

  // Move list
  moveList: async (listId, newPosition) => {
    return await api.put(`/lists/${listId}/move`, { newPosition })
  },

  // Archive/Unarchive list
  archiveList: async (listId) => {
    return await api.put(`/lists/${listId}/archive`)
  },

  // Duplicate list
  duplicateList: async (listId) => {
    return await api.post(`/lists/${listId}/duplicate`)
  },
}

export default listService
