import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import listService from '../../services/listService'
import toast from 'react-hot-toast'

// Fetch lists for a board
export const fetchLists = createAsyncThunk(
  'lists/fetchLists',
  async (boardId, { rejectWithValue }) => {
    try {
      const response = await listService.getLists(boardId)
      return response.data.lists
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch lists')
    }
  }
)

// Create new list
export const createList = createAsyncThunk(
  'lists/createList',
  async (listData, { rejectWithValue }) => {
    try {
      const response = await listService.createList(listData)
      toast.success('List created successfully!')
      return response.data.list
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create list'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

// Update list
export const updateList = createAsyncThunk(
  'lists/updateList',
  async ({ listId, updates }, { rejectWithValue }) => {
    try {
      const response = await listService.updateList(listId, updates)
      return response.data.list
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update list'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

// Delete list
export const deleteList = createAsyncThunk(
  'lists/deleteList',
  async (listId, { rejectWithValue }) => {
    try {
      await listService.deleteList(listId)
      toast.success('List deleted successfully!')
      return listId
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete list'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

// Update list position (for drag and drop)
export const updateListPosition = createAsyncThunk(
  'lists/updateListPosition',
  async ({ listId, position }, { rejectWithValue }) => {
    try {
      const response = await listService.updateList(listId, { position })
      return response.data.list
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update list position'
      return rejectWithValue(message)
    }
  }
)

// Duplicate list
export const duplicateList = createAsyncThunk(
  'lists/duplicateList',
  async (listId, { rejectWithValue }) => {
    try {
      const response = await listService.duplicateList(listId)
      toast.success('List duplicated successfully!')
      return response.data.list
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to duplicate list'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

// Move list
export const moveList = createAsyncThunk(
  'lists/moveList',
  async ({ listId, newPosition }, { rejectWithValue }) => {
    try {
      const response = await listService.moveList(listId, newPosition)
      return response.data.list
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to move list'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

// Archive/Unarchive list
export const archiveList = createAsyncThunk(
  'lists/archiveList',
  async (listId, { rejectWithValue }) => {
    try {
      const response = await listService.archiveList(listId)
      toast.success(`List ${response.data.list.isArchived ? 'archived' : 'unarchived'} successfully!`)
      return response.data.list
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to archive list'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

const initialState = {
  lists: [],
  isLoading: false,
  error: null,
}

const listsSlice = createSlice({
  name: 'lists',
  initialState,
  reducers: {
    clearLists: (state) => {
      state.lists = []
    },
    clearError: (state) => {
      state.error = null
    },
    // Real-time updates
    listCreated: (state, action) => {
      state.lists.push(action.payload)
    },
    listUpdated: (state, action) => {
      const index = state.lists.findIndex(list => list._id === action.payload._id)
      if (index !== -1) {
        state.lists[index] = action.payload
      }
    },
    listDeleted: (state, action) => {
      state.lists = state.lists.filter(list => list._id !== action.payload)
    },
    listMoved: (state, action) => {
      const { listId, oldPosition, newPosition } = action.payload
      const listIndex = state.lists.findIndex(list => list._id === listId)
      
      if (listIndex !== -1) {
        state.lists[listIndex].position = newPosition
        
        // Reorder other lists
        state.lists.forEach(list => {
          if (list._id !== listId) {
            if (newPosition > oldPosition) {
              if (list.position > oldPosition && list.position <= newPosition) {
                list.position -= 1
              }
            } else {
              if (list.position >= newPosition && list.position < oldPosition) {
                list.position += 1
              }
            }
          }
        })
        
        // Sort lists by position
        state.lists.sort((a, b) => a.position - b.position)
      }
    },
    listArchived: (state, action) => {
      const { listId, isArchived } = action.payload
      const index = state.lists.findIndex(list => list._id === listId)
      if (index !== -1) {
        state.lists[index].isArchived = isArchived
      }
    },
    // Local updates for drag and drop
    reorderLists: (state, action) => {
      state.lists = action.payload
    },
    addCardToList: (state, action) => {
      const { listId, card } = action.payload
      const listIndex = state.lists.findIndex(list => list._id === listId)
      if (listIndex !== -1) {
        if (!state.lists[listIndex].cards) {
          state.lists[listIndex].cards = []
        }
        state.lists[listIndex].cards.push(card)
      }
    },
    removeCardFromList: (state, action) => {
      const { listId, cardId } = action.payload
      const listIndex = state.lists.findIndex(list => list._id === listId)
      if (listIndex !== -1 && state.lists[listIndex].cards) {
        state.lists[listIndex].cards = state.lists[listIndex].cards.filter(
          card => card._id !== cardId
        )
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Lists
      .addCase(fetchLists.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchLists.fulfilled, (state, action) => {
        state.isLoading = false
        state.lists = action.payload.sort((a, b) => a.position - b.position)
        state.error = null
      })
      .addCase(fetchLists.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Create List
      .addCase(createList.pending, (state) => {
        state.isLoading = true
      })
      .addCase(createList.fulfilled, (state, action) => {
        state.isLoading = false
        state.lists.push(action.payload)
        state.error = null
      })
      .addCase(createList.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Update List
      .addCase(updateList.fulfilled, (state, action) => {
        const index = state.lists.findIndex(list => list._id === action.payload._id)
        if (index !== -1) {
          state.lists[index] = { ...state.lists[index], ...action.payload }
        }
      })
      .addCase(updateList.rejected, (state, action) => {
        state.error = action.payload
      })
      
      // Delete List
      .addCase(deleteList.fulfilled, (state, action) => {
        state.lists = state.lists.filter(list => list._id !== action.payload)
      })
      .addCase(deleteList.rejected, (state, action) => {
        state.error = action.payload
      })
      
      // Move List
      .addCase(moveList.fulfilled, (state, action) => {
        const index = state.lists.findIndex(list => list._id === action.payload._id)
        if (index !== -1) {
          state.lists[index] = action.payload
          state.lists.sort((a, b) => a.position - b.position)
        }
      })
      .addCase(moveList.rejected, (state, action) => {
        state.error = action.payload
      })
      
      // Archive List
      .addCase(archiveList.fulfilled, (state, action) => {
        const index = state.lists.findIndex(list => list._id === action.payload._id)
        if (index !== -1) {
          state.lists[index] = action.payload
        }
      })
      .addCase(archiveList.rejected, (state, action) => {
        state.error = action.payload
      })
  },
})

export const {
  clearLists,
  clearError,
  listCreated,
  listUpdated,
  listDeleted,
  listMoved,
  listArchived,
  reorderLists,
  addCardToList,
  removeCardFromList
} = listsSlice.actions

export default listsSlice.reducer
