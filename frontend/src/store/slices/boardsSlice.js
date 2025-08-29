import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import boardService from '../../services/boardService'
import toast from 'react-hot-toast'

// Fetch user's boards
export const fetchBoards = createAsyncThunk(
  'boards/fetchBoards',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await boardService.getBoards(params)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch boards')
    }
  }
)

// Fetch single board
export const fetchBoard = createAsyncThunk(
  'boards/fetchBoard',
  async (boardId, { rejectWithValue }) => {
    try {
      const response = await boardService.getBoard(boardId)
      return response.data.board
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch board')
    }
  }
)

// Create new board
export const createBoard = createAsyncThunk(
  'boards/createBoard',
  async (boardData, { rejectWithValue }) => {
    try {
      const response = await boardService.createBoard(boardData)
      toast.success('Board created successfully!')
      return response.data.board
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create board'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

// Update board
export const updateBoard = createAsyncThunk(
  'boards/updateBoard',
  async ({ boardId, updates }, { rejectWithValue }) => {
    try {
      const response = await boardService.updateBoard(boardId, updates)
      toast.success('Board updated successfully!')
      return response.data.board
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update board'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

// Delete board
export const deleteBoard = createAsyncThunk(
  'boards/deleteBoard',
  async (boardId, { rejectWithValue }) => {
    try {
      await boardService.deleteBoard(boardId)
      toast.success('Board deleted successfully!')
      return boardId
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete board'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

// Add member to board
export const addBoardMember = createAsyncThunk(
  'boards/addMember',
  async ({ boardId, userId, role }, { rejectWithValue }) => {
    try {
      const response = await boardService.addMember(boardId, userId, role)
      toast.success('Member added successfully!')
      return response.data.board
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add member'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

// Remove member from board
export const removeBoardMember = createAsyncThunk(
  'boards/removeMember',
  async ({ boardId, userId }, { rejectWithValue }) => {
    try {
      await boardService.removeMember(boardId, userId)
      toast.success('Member removed successfully!')
      return { boardId, userId }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to remove member'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

// Toggle board favorite
export const toggleBoardFavorite = createAsyncThunk(
  'boards/toggleFavorite',
  async (boardId, { rejectWithValue }) => {
    try {
      const response = await boardService.toggleFavorite(boardId)
      return { boardId, isFavorite: response.data.isFavorite }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to toggle favorite'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

const initialState = {
  boards: [],
  currentBoard: null,
  isLoading: false,
  error: null,
  pagination: {
    current: 1,
    pages: 1,
    total: 0
  }
}

const boardsSlice = createSlice({
  name: 'boards',
  initialState,
  reducers: {
    clearCurrentBoard: (state) => {
      state.currentBoard = null
    },
    clearError: (state) => {
      state.error = null
    },
    updateBoardInList: (state, action) => {
      const index = state.boards.findIndex(board => board._id === action.payload._id)
      if (index !== -1) {
        state.boards[index] = action.payload
      }
    },
    // Real-time updates
    boardCreated: (state, action) => {
      state.boards.unshift(action.payload)
    },
    boardUpdated: (state, action) => {
      const index = state.boards.findIndex(board => board._id === action.payload._id)
      if (index !== -1) {
        state.boards[index] = action.payload
      }
      if (state.currentBoard && state.currentBoard._id === action.payload._id) {
        state.currentBoard = action.payload
      }
    },
    boardDeleted: (state, action) => {
      state.boards = state.boards.filter(board => board._id !== action.payload)
      if (state.currentBoard && state.currentBoard._id === action.payload) {
        state.currentBoard = null
      }
    },
    memberAdded: (state, action) => {
      const { board } = action.payload
      const index = state.boards.findIndex(b => b._id === board._id)
      if (index !== -1) {
        state.boards[index] = board
      }
      if (state.currentBoard && state.currentBoard._id === board._id) {
        state.currentBoard = board
      }
    },
    memberRemoved: (state, action) => {
      const { boardId, userId } = action.payload
      
      // Update boards list
      const boardIndex = state.boards.findIndex(board => board._id === boardId)
      if (boardIndex !== -1) {
        state.boards[boardIndex].members = state.boards[boardIndex].members.filter(
          member => member.user._id !== userId
        )
      }
      
      // Update current board
      if (state.currentBoard && state.currentBoard._id === boardId) {
        state.currentBoard.members = state.currentBoard.members.filter(
          member => member.user._id !== userId
        )
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Boards
      .addCase(fetchBoards.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchBoards.fulfilled, (state, action) => {
        state.isLoading = false
        state.boards = action.payload.boards
        state.pagination = action.payload.pagination
        state.error = null
      })
      .addCase(fetchBoards.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Fetch Board
      .addCase(fetchBoard.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchBoard.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentBoard = action.payload
        state.error = null
      })
      .addCase(fetchBoard.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Create Board
      .addCase(createBoard.pending, (state) => {
        state.isLoading = true
      })
      .addCase(createBoard.fulfilled, (state, action) => {
        state.isLoading = false
        state.boards.unshift(action.payload)
        state.error = null
      })
      .addCase(createBoard.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Update Board
      .addCase(updateBoard.pending, (state) => {
        state.isLoading = true
      })
      .addCase(updateBoard.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.boards.findIndex(board => board._id === action.payload._id)
        if (index !== -1) {
          state.boards[index] = action.payload
        }
        if (state.currentBoard && state.currentBoard._id === action.payload._id) {
          state.currentBoard = action.payload
        }
        state.error = null
      })
      .addCase(updateBoard.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Delete Board
      .addCase(deleteBoard.pending, (state) => {
        state.isLoading = true
      })
      .addCase(deleteBoard.fulfilled, (state, action) => {
        state.isLoading = false
        state.boards = state.boards.filter(board => board._id !== action.payload)
        if (state.currentBoard && state.currentBoard._id === action.payload) {
          state.currentBoard = null
        }
        state.error = null
      })
      .addCase(deleteBoard.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Add Member
      .addCase(addBoardMember.fulfilled, (state, action) => {
        const index = state.boards.findIndex(board => board._id === action.payload._id)
        if (index !== -1) {
          state.boards[index] = action.payload
        }
        if (state.currentBoard && state.currentBoard._id === action.payload._id) {
          state.currentBoard = action.payload
        }
      })
      
      // Remove Member
      .addCase(removeBoardMember.fulfilled, (state, action) => {
        const { boardId, userId } = action.payload
        
        const boardIndex = state.boards.findIndex(board => board._id === boardId)
        if (boardIndex !== -1) {
          state.boards[boardIndex].members = state.boards[boardIndex].members.filter(
            member => member.user._id !== userId
          )
        }
        
        if (state.currentBoard && state.currentBoard._id === boardId) {
          state.currentBoard.members = state.currentBoard.members.filter(
            member => member.user._id !== userId
          )
        }
      })
      
      // Toggle Favorite
      .addCase(toggleBoardFavorite.fulfilled, (state, action) => {
        const { boardId, isFavorite } = action.payload
        
        const boardIndex = state.boards.findIndex(board => board._id === boardId)
        if (boardIndex !== -1) {
          if (isFavorite) {
            if (!state.boards[boardIndex].isFavorite) {
              state.boards[boardIndex].isFavorite = []
            }
            // Add current user to favorites (you'd need user ID here)
          } else {
            state.boards[boardIndex].isFavorite = []
          }
        }
      })
  },
})

export const {
  clearCurrentBoard,
  clearError,
  updateBoardInList,
  boardCreated,
  boardUpdated,
  boardDeleted,
  memberAdded,
  memberRemoved
} = boardsSlice.actions

export default boardsSlice.reducer
