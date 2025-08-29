import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import cardService from '../../services/cardService'
import toast from 'react-hot-toast'

// Fetch cards for a board
export const fetchBoardCards = createAsyncThunk(
  'cards/fetchBoardCards',
  async (boardId, { rejectWithValue }) => {
    try {
      const response = await cardService.getBoardCards(boardId)
      return response.data.cards
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch cards')
    }
  }
)

// Fetch cards for a list
export const fetchCards = createAsyncThunk(
  'cards/fetchCards',
  async (listId, { rejectWithValue }) => {
    try {
      const response = await cardService.getCards(listId)
      return { listId, cards: response.data.cards }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch cards')
    }
  }
)

// Fetch single card
export const fetchCard = createAsyncThunk(
  'cards/fetchCard',
  async (cardId, { rejectWithValue }) => {
    try {
      const response = await cardService.getCard(cardId)
      return response.data.card
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch card')
    }
  }
)

// Create new card
export const createCard = createAsyncThunk(
  'cards/createCard',
  async (cardData, { rejectWithValue }) => {
    try {
      const response = await cardService.createCard(cardData)
      toast.success('Card created successfully!')
      return response.data.card
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create card'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

// Update card
export const updateCard = createAsyncThunk(
  'cards/updateCard',
  async ({ cardId, updates }, { rejectWithValue }) => {
    try {
      const response = await cardService.updateCard(cardId, updates)
      return response.data.card
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update card'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

// Delete card
export const deleteCard = createAsyncThunk(
  'cards/deleteCard',
  async (cardId, { rejectWithValue }) => {
    try {
      await cardService.deleteCard(cardId)
      toast.success('Card deleted successfully!')
      return cardId
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete card'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

// Move card
export const moveCard = createAsyncThunk(
  'cards/moveCard',
  async ({ cardId, destinationListId, newPosition }, { rejectWithValue }) => {
    try {
      const response = await cardService.moveCard(cardId, destinationListId, newPosition)
      return response.data.card
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to move card'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

// Update card position (for drag and drop)
export const updateCardPosition = createAsyncThunk(
  'cards/updateCardPosition',
  async ({ cardId, sourceListId, destinationListId, newPosition }, { rejectWithValue }) => {
    try {
      const response = await cardService.moveCard(cardId, destinationListId, newPosition)
      return response.data.card
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update card position'
      return rejectWithValue(message)
    }
  }
)

// Assign member to card
export const assignMember = createAsyncThunk(
  'cards/assignMember',
  async ({ cardId, userId }, { rejectWithValue }) => {
    try {
      const response = await cardService.assignMember(cardId, userId)
      toast.success('Member assigned successfully!')
      return response.data.card
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to assign member'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

// Unassign member from card
export const unassignMember = createAsyncThunk(
  'cards/unassignMember',
  async ({ cardId, userId }, { rejectWithValue }) => {
    try {
      await cardService.unassignMember(cardId, userId)
      toast.success('Member unassigned successfully!')
      return { cardId, userId }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to unassign member'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

// Add comment to card
export const addComment = createAsyncThunk(
  'cards/addComment',
  async ({ cardId, text }, { rejectWithValue }) => {
    try {
      const response = await cardService.addComment(cardId, text)
      toast.success('Comment added successfully!')
      return { cardId, comment: response.data.comment }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add comment'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

const initialState = {
  cards: {},
  currentCard: null,
  isLoading: false,
  error: null,
}

const cardsSlice = createSlice({
  name: 'cards',
  initialState,
  reducers: {
    clearCards: (state) => {
      state.cards = {}
    },
    clearCurrentCard: (state) => {
      state.currentCard = null
    },
    clearError: (state) => {
      state.error = null
    },
    // Optimistic updates for drag and drop
    optimisticMoveCard: (state, action) => {
      const { cardId, sourceListId, destinationListId, sourceIndex, destinationIndex } = action.payload
      
      // Find and remove card from source list
      let movedCard = null
      if (state.cards[sourceListId]) {
        const cardIndex = state.cards[sourceListId].findIndex(card => card._id === cardId)
        if (cardIndex !== -1) {
          movedCard = state.cards[sourceListId].splice(cardIndex, 1)[0]
        }
      }
      
      if (movedCard) {
        // Update card's list reference
        movedCard.list = destinationListId
        
        // Add card to destination list at correct position
        if (!state.cards[destinationListId]) {
          state.cards[destinationListId] = []
        }
        state.cards[destinationListId].splice(destinationIndex, 0, movedCard)
      }
    },
    revertOptimisticMove: (state, action) => {
      const { cardId, sourceListId, destinationListId, sourceIndex, destinationIndex } = action.payload
      
      // Find and remove card from destination list
      let movedCard = null
      if (state.cards[destinationListId]) {
        const cardIndex = state.cards[destinationListId].findIndex(card => card._id === cardId)
        if (cardIndex !== -1) {
          movedCard = state.cards[destinationListId].splice(cardIndex, 1)[0]
        }
      }
      
      if (movedCard) {
        // Revert card's list reference
        movedCard.list = sourceListId
        
        // Add card back to source list at original position
        if (!state.cards[sourceListId]) {
          state.cards[sourceListId] = []
        }
        state.cards[sourceListId].splice(sourceIndex, 0, movedCard)
      }
    },
    // Real-time updates
    cardCreated: (state, action) => {
      const card = action.payload
      const listId = card.list
      
      if (!state.cards[listId]) {
        state.cards[listId] = []
      }
      state.cards[listId].push(card)
    },
    cardUpdated: (state, action) => {
      const card = action.payload
      const listId = card.list
      
      if (state.cards[listId]) {
        const index = state.cards[listId].findIndex(c => c._id === card._id)
        if (index !== -1) {
          state.cards[listId][index] = card
        }
      }
      
      if (state.currentCard && state.currentCard._id === card._id) {
        state.currentCard = card
      }
    },
    cardDeleted: (state, action) => {
      const cardId = action.payload
      
      // Remove from all lists
      Object.keys(state.cards).forEach(listId => {
        state.cards[listId] = state.cards[listId].filter(card => card._id !== cardId)
      })
      
      if (state.currentCard && state.currentCard._id === cardId) {
        state.currentCard = null
      }
    },
    cardMoved: (state, action) => {
      const { cardId, sourceListId, destinationListId, oldPosition, newPosition } = action.payload
      
      // Find and remove card from source list
      let movedCard = null
      if (state.cards[sourceListId]) {
        const cardIndex = state.cards[sourceListId].findIndex(card => card._id === cardId)
        if (cardIndex !== -1) {
          movedCard = state.cards[sourceListId].splice(cardIndex, 1)[0]
          
          // Update positions in source list
          state.cards[sourceListId].forEach(card => {
            if (card.position > oldPosition) {
              card.position -= 1
            }
          })
        }
      }
      
      // Add card to destination list
      if (movedCard) {
        if (!state.cards[destinationListId]) {
          state.cards[destinationListId] = []
        }
        
        // Update positions in destination list
        state.cards[destinationListId].forEach(card => {
          if (card.position >= newPosition) {
            card.position += 1
          }
        })
        
        // Update moved card
        movedCard.list = destinationListId
        movedCard.position = newPosition
        
        // Insert card at correct position
        state.cards[destinationListId].splice(newPosition, 0, movedCard)
        
        // Sort both lists by position
        state.cards[sourceListId]?.sort((a, b) => a.position - b.position)
        state.cards[destinationListId]?.sort((a, b) => a.position - b.position)
      }
    },
    memberAssigned: (state, action) => {
      const { card } = action.payload
      const listId = card.list
      
      if (state.cards[listId]) {
        const index = state.cards[listId].findIndex(c => c._id === card._id)
        if (index !== -1) {
          state.cards[listId][index] = card
        }
      }
      
      if (state.currentCard && state.currentCard._id === card._id) {
        state.currentCard = card
      }
    },
    memberUnassigned: (state, action) => {
      const { cardId, userId } = action.payload
      
      Object.keys(state.cards).forEach(listId => {
        const cardIndex = state.cards[listId].findIndex(card => card._id === cardId)
        if (cardIndex !== -1) {
          state.cards[listId][cardIndex].assignedMembers = 
            state.cards[listId][cardIndex].assignedMembers.filter(member => member._id !== userId)
        }
      })
      
      if (state.currentCard && state.currentCard._id === cardId) {
        state.currentCard.assignedMembers = 
          state.currentCard.assignedMembers.filter(member => member._id !== userId)
      }
    },
    commentAdded: (state, action) => {
      const { cardId, comment } = action.payload
      
      Object.keys(state.cards).forEach(listId => {
        const cardIndex = state.cards[listId].findIndex(card => card._id === cardId)
        if (cardIndex !== -1) {
          if (!state.cards[listId][cardIndex].comments) {
            state.cards[listId][cardIndex].comments = []
          }
          state.cards[listId][cardIndex].comments.push(comment)
        }
      })
      
      if (state.currentCard && state.currentCard._id === cardId) {
        if (!state.currentCard.comments) {
          state.currentCard.comments = []
        }
        state.currentCard.comments.push(comment)
      }
    },
    // Local updates for drag and drop
    reorderCards: (state, action) => {
      const { listId, cards } = action.payload
      state.cards[listId] = cards
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Board Cards
      .addCase(fetchBoardCards.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchBoardCards.fulfilled, (state, action) => {
        state.isLoading = false
        // Group cards by list ID
        const cardsGrouped = {}
        action.payload.forEach(card => {
          if (!cardsGrouped[card.list]) {
            cardsGrouped[card.list] = []
          }
          cardsGrouped[card.list].push(card)
        })
        // Sort cards within each list by position
        Object.keys(cardsGrouped).forEach(listId => {
          cardsGrouped[listId].sort((a, b) => a.position - b.position)
        })
        state.cards = cardsGrouped
        state.error = null
      })
      .addCase(fetchBoardCards.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Fetch Cards
      .addCase(fetchCards.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchCards.fulfilled, (state, action) => {
        state.isLoading = false
        const { listId, cards } = action.payload
        state.cards[listId] = cards.sort((a, b) => a.position - b.position)
        state.error = null
      })
      .addCase(fetchCards.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Fetch Card
      .addCase(fetchCard.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchCard.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentCard = action.payload
        state.error = null
      })
      .addCase(fetchCard.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Create Card
      .addCase(createCard.pending, (state) => {
        state.isLoading = true
      })
      .addCase(createCard.fulfilled, (state, action) => {
        state.isLoading = false
        const card = action.payload
        const listId = card.list
        
        if (!state.cards[listId]) {
          state.cards[listId] = []
        }
        state.cards[listId].push(card)
        state.error = null
      })
      .addCase(createCard.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Update Card
      .addCase(updateCard.fulfilled, (state, action) => {
        const card = action.payload
        const listId = card.list
        
        if (state.cards[listId]) {
          const index = state.cards[listId].findIndex(c => c._id === card._id)
          if (index !== -1) {
            state.cards[listId][index] = card
          }
        }
        
        if (state.currentCard && state.currentCard._id === card._id) {
          state.currentCard = card
        }
      })
      .addCase(updateCard.rejected, (state, action) => {
        state.error = action.payload
      })
      
      // Delete Card
      .addCase(deleteCard.fulfilled, (state, action) => {
        const cardId = action.payload
        
        Object.keys(state.cards).forEach(listId => {
          state.cards[listId] = state.cards[listId].filter(card => card._id !== cardId)
        })
        
        if (state.currentCard && state.currentCard._id === cardId) {
          state.currentCard = null
        }
      })
      .addCase(deleteCard.rejected, (state, action) => {
        state.error = action.payload
      })
      
      // Move Card
      .addCase(moveCard.fulfilled, (state, action) => {
        const card = action.payload
        // Card position will be updated by real-time events
      })
      .addCase(moveCard.rejected, (state, action) => {
        state.error = action.payload
      })
      
      // Assign Member
      .addCase(assignMember.fulfilled, (state, action) => {
        const card = action.payload
        const listId = card.list
        
        if (state.cards[listId]) {
          const index = state.cards[listId].findIndex(c => c._id === card._id)
          if (index !== -1) {
            state.cards[listId][index] = card
          }
        }
        
        if (state.currentCard && state.currentCard._id === card._id) {
          state.currentCard = card
        }
      })
      .addCase(assignMember.rejected, (state, action) => {
        state.error = action.payload
      })
      
      // Unassign Member
      .addCase(unassignMember.fulfilled, (state, action) => {
        const { cardId, userId } = action.payload
        
        Object.keys(state.cards).forEach(listId => {
          const cardIndex = state.cards[listId].findIndex(card => card._id === cardId)
          if (cardIndex !== -1) {
            state.cards[listId][cardIndex].assignedMembers = 
              state.cards[listId][cardIndex].assignedMembers.filter(member => member._id !== userId)
          }
        })
        
        if (state.currentCard && state.currentCard._id === cardId) {
          state.currentCard.assignedMembers = 
            state.currentCard.assignedMembers.filter(member => member._id !== userId)
        }
      })
      .addCase(unassignMember.rejected, (state, action) => {
        state.error = action.payload
      })
      
      // Add Comment
      .addCase(addComment.fulfilled, (state, action) => {
        const { cardId, comment } = action.payload
        
        Object.keys(state.cards).forEach(listId => {
          const cardIndex = state.cards[listId].findIndex(card => card._id === cardId)
          if (cardIndex !== -1) {
            if (!state.cards[listId][cardIndex].comments) {
              state.cards[listId][cardIndex].comments = []
            }
            state.cards[listId][cardIndex].comments.push(comment)
          }
        })
        
        if (state.currentCard && state.currentCard._id === cardId) {
          if (!state.currentCard.comments) {
            state.currentCard.comments = []
          }
          state.currentCard.comments.push(comment)
        }
      })
      .addCase(addComment.rejected, (state, action) => {
        state.error = action.payload
      })
  },
})

export const {
  clearCards,
  clearCurrentCard,
  clearError,
  cardCreated,
  cardUpdated,
  cardDeleted,
  cardMoved,
  memberAssigned,
  memberUnassigned,
  commentAdded,
  reorderCards,
  optimisticMoveCard,
  revertOptimisticMove
} = cardsSlice.actions

export default cardsSlice.reducer
