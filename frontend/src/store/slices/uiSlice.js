import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  // Modal system
  modal: null,
  modalData: null,
  
  // Legacy modal flags (for backward compatibility)
  showCreateBoardModal: false,
  showCreateTeamModal: false,
  showCardModal: false,
  showInviteMemberModal: false,
  showDeleteConfirmModal: false,
  
  // Current selections
  selectedCard: null,
  selectedBoard: null,
  selectedTeam: null,
  
  // Sidebar
  sidebarCollapsed: false,
  
  // Theme
  theme: localStorage.getItem('theme') || 'light',
  
  // Notifications
  notifications: [],
  notificationSettings: JSON.parse(localStorage.getItem('notificationSettings') || '{}'),
  
  // Search
  searchQuery: '',
  searchResults: [],
  isSearching: false,
  
  // Filters
  boardFilter: 'all', // all, owned, member, favorite
  cardFilter: {
    assignedToMe: false,
    dueDate: null,
    labels: [],
    completed: null
  },
  
  // Drag and drop
  isDragging: false,
  dragData: null,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Modal actions
    openModal: (state, action) => {
      const { modal, data } = action.payload
      state.modal = modal
      state.modalData = data || null
      
      // Legacy support
      if (modal === 'CreateBoard') {
        state.showCreateBoardModal = true
      } else if (modal === 'CreateTeam') {
        state.showCreateTeamModal = true
      } else if (modal === 'EditCard') {
        state.showCardModal = true
        state.selectedCard = data
      }
    },
    closeModal: (state) => {
      state.modal = null
      state.modalData = null
      
      // Legacy support - close all modals
      state.showCreateBoardModal = false
      state.showCreateTeamModal = false
      state.showCardModal = false
      state.showInviteMemberModal = false
      state.showDeleteConfirmModal = false
      state.selectedCard = null
    },
    closeAllModals: (state) => {
      state.showCreateBoardModal = false
      state.showCreateTeamModal = false
      state.showCardModal = false
      state.showInviteMemberModal = false
      state.showDeleteConfirmModal = false
      state.selectedCard = null
    },
    
    // Selection actions
    setSelectedCard: (state, action) => {
      state.selectedCard = action.payload
    },
    setSelectedBoard: (state, action) => {
      state.selectedBoard = action.payload
    },
    setSelectedTeam: (state, action) => {
      state.selectedTeam = action.payload
    },
    
    // Sidebar actions
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed
    },
    setSidebarCollapsed: (state, action) => {
      state.sidebarCollapsed = action.payload
    },
    
    // Theme actions
    setTheme: (state, action) => {
      state.theme = action.payload
      localStorage.setItem('theme', action.payload)
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light'
      localStorage.setItem('theme', state.theme)
    },
    
    // Notification settings actions
    updateNotificationSettings: (state, action) => {
      state.notificationSettings = { ...state.notificationSettings, ...action.payload }
      localStorage.setItem('notificationSettings', JSON.stringify(state.notificationSettings))
    },
    
    // Notification actions
    addNotification: (state, action) => {
      const notification = {
        id: Date.now(),
        type: action.payload.type || 'info',
        message: action.payload.message,
        timestamp: new Date().toISOString(),
        read: false
      }
      state.notifications.unshift(notification)
      
      // Keep only last 50 notifications
      if (state.notifications.length > 50) {
        state.notifications = state.notifications.slice(0, 50)
      }
    },
    markNotificationAsRead: (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload)
      if (notification) {
        notification.read = true
      }
    },
    markAllNotificationsAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.read = true
      })
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload)
    },
    clearNotifications: (state) => {
      state.notifications = []
    },
    
    // Search actions
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload
    },
    setSearchResults: (state, action) => {
      state.searchResults = action.payload
    },
    setIsSearching: (state, action) => {
      state.isSearching = action.payload
    },
    clearSearch: (state) => {
      state.searchQuery = ''
      state.searchResults = []
      state.isSearching = false
    },
    
    // Filter actions
    setBoardFilter: (state, action) => {
      state.boardFilter = action.payload
    },
    setCardFilter: (state, action) => {
      state.cardFilter = { ...state.cardFilter, ...action.payload }
    },
    clearCardFilter: (state) => {
      state.cardFilter = {
        assignedToMe: false,
        dueDate: null,
        labels: [],
        completed: null
      }
    },
    
    // Drag and drop actions
    setIsDragging: (state, action) => {
      state.isDragging = action.payload
    },
    setDragData: (state, action) => {
      state.dragData = action.payload
    },
    clearDragData: (state) => {
      state.isDragging = false
      state.dragData = null
    },
  },
})

export const {
  // Modal actions
  openModal,
  closeModal,
  closeAllModals,
  
  // Selection actions
  setSelectedCard,
  setSelectedBoard,
  setSelectedTeam,
  
  // Sidebar actions
  toggleSidebar,
  setSidebarCollapsed,
  
  // Theme actions
  setTheme,
  toggleTheme,
  
  // Notification settings
  updateNotificationSettings,
  
  // Notification actions
  addNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  removeNotification,
  clearNotifications,
  
  // Search actions
  setSearchQuery,
  setSearchResults,
  setIsSearching,
  clearSearch,
  
  // Filter actions
  setBoardFilter,
  setCardFilter,
  clearCardFilter,
  
  // Drag and drop actions
  setIsDragging,
  setDragData,
  clearDragData,
} = uiSlice.actions

export default uiSlice.reducer
