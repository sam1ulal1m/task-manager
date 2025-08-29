import api from './api'

const cardService = {
  // Get cards for a board
  getBoardCards: async (boardId) => {
    return await api.get(`/cards/board/${boardId}`)
  },

  // Get cards for a list
  getCards: async (listId) => {
    return await api.get(`/cards/list/${listId}`)
  },

  // Get single card
  getCard: async (cardId) => {
    return await api.get(`/cards/${cardId}`)
  },

  // Create new card
  createCard: async (cardData) => {
    return await api.post('/cards', cardData)
  },

  // Update card
  updateCard: async (cardId, updates) => {
    return await api.put(`/cards/${cardId}`, updates)
  },

  // Delete card
  deleteCard: async (cardId) => {
    return await api.delete(`/cards/${cardId}`)
  },

  // Move card
  moveCard: async (cardId, destinationListId, newPosition) => {
    return await api.put(`/cards/${cardId}/move`, {
      destinationListId,
      newPosition
    })
  },

  // Assign member to card
  assignMember: async (cardId, userId) => {
    return await api.post(`/cards/${cardId}/assign`, { userId })
  },

  // Unassign member from card
  unassignMember: async (cardId, userId) => {
    return await api.delete(`/cards/${cardId}/assign/${userId}`)
  },

  // Add comment to card
  addComment: async (cardId, text) => {
    return await api.post(`/cards/${cardId}/comments`, { text })
  },
}

export default cardService
