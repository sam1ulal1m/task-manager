import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Toaster } from 'react-hot-toast'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

// Pages
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Board from './pages/Board'
import Teams from './pages/Teams'
import Profile from './pages/Profile'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import PublicBoards from './pages/PublicBoards'

// Components
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import LoadingSpinner from './components/LoadingSpinner'
import CreateBoardModal from './components/modals/CreateBoardModal'
import CreateTeamModal from './components/modals/CreateTeamModal'
import EditTeamModal from './components/modals/EditTeamModal'
import TeamMembersModal from './components/modals/TeamMembersModal'
import EditCardModal from './components/modals/EditCardModal'

// Store
import { checkAuth } from './store/slices/authSlice'

function App() {
  const dispatch = useDispatch()
  const { isAuthenticated, isLoading } = useSelector(state => state.auth)

  useEffect(() => {
    dispatch(checkAuth())
  }, [dispatch])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="App">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            className: 'text-sm',
          }}
        />
        
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/login" 
            element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/register" 
            element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/forgot-password" 
            element={!isAuthenticated ? <ForgotPassword /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/reset-password/:token" 
            element={!isAuthenticated ? <ResetPassword /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/public-boards" 
            element={<PublicBoards />} 
          />
          
          {/* Protected Routes */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="board/:boardId" element={<Board />} />
            <Route path="teams" element={<Teams />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>

        {/* Global Modals */}
        <CreateBoardModal />
        <CreateTeamModal />
        <EditTeamModal />
        <TeamMembersModal />
        <EditCardModal />
      </div>
    </DndProvider>
  )
}

export default App
