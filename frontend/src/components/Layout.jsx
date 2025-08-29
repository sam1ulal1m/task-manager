import { Outlet } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useEffect } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import { addNotification } from '../store/slices/uiSlice'

const Layout = () => {
  const dispatch = useDispatch()
  const { sidebarCollapsed, theme } = useSelector(state => state.ui)

  useEffect(() => {
    // Apply theme to document
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="flex">
        <Sidebar />
        <main 
          className={`flex-1 transition-all duration-300 ${
            sidebarCollapsed ? 'ml-16' : 'ml-64'
          }`}
        >
          <div className="p-6 pt-20">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout
