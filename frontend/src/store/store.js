import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import boardsReducer from './slices/boardsSlice'
import listsReducer from './slices/listsSlice'
import cardsReducer from './slices/cardsSlice'
import teamsReducer from './slices/teamsSlice'
import uiReducer from './slices/uiSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    boards: boardsReducer,
    lists: listsReducer,
    cards: cardsReducer,
    teams: teamsReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})
