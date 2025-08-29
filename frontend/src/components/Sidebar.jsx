import { useSelector, useDispatch } from 'react-redux'
import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Users, 
  User,
  Plus,
  ChevronRight,
  Star,
  Calendar,
  Globe
} from 'lucide-react'
import { openModal } from '../store/slices/uiSlice'

const Sidebar = () => {
  const dispatch = useDispatch()
  const location = useLocation()
  const { sidebarCollapsed } = useSelector(state => state.ui)
  const { boards } = useSelector(state => state.boards)

  const navigation = [
    {
      name: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard',
      active: location.pathname === '/dashboard'
    },
    {
      name: 'Teams',
      icon: Users,
      href: '/teams',
      active: location.pathname === '/teams'
    },
    {
      name: 'Public Boards',
      icon: Globe,
      href: '/public-boards',
      active: location.pathname === '/public-boards'
    },
    {
      name: 'Profile',
      icon: User,
      href: '/profile',
      active: location.pathname === '/profile'
    }
  ]

  const recentBoards = boards.slice(0, 5)
  const favoriteBoards = boards.filter(board => board.isFavorite?.length > 0)

  return (
    <aside 
      className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 z-40 ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                item.active
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              <item.icon size={20} className="mr-3" />
              {!sidebarCollapsed && <span>{item.name}</span>}
            </Link>
          ))}

          {/* Separator */}
          <hr className="my-4 border-gray-200 dark:border-gray-700" />

          {/* Quick Actions */}
          {!sidebarCollapsed && (
            <div className="space-y-2">
              <button
                onClick={() => dispatch(openModal({ modal: 'CreateBoard' }))}
                className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-md"
              >
                <Plus size={20} className="mr-3" />
                Create Board
              </button>
              
              <button
                onClick={() => dispatch(openModal({ modal: 'CreateTeam' }))}
                className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-md"
              >
                <Plus size={20} className="mr-3" />
                Create Team
              </button>
            </div>
          )}

          {/* Favorite Boards */}
          {!sidebarCollapsed && favoriteBoards.length > 0 && (
            <div className="mt-6">
              <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Favorites
              </h3>
              <div className="mt-2 space-y-1">
                {favoriteBoards.map((board) => (
                  <Link
                    key={board._id}
                    to={`/board/${board._id}`}
                    className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-md group"
                  >
                    <div 
                      className="w-4 h-4 rounded mr-3 flex-shrink-0"
                      style={{ backgroundColor: board.background }}
                    />
                    <span className="truncate flex-1">{board.title}</span>
                    <Star size={14} className="text-yellow-500" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Recent Boards */}
          {!sidebarCollapsed && recentBoards.length > 0 && (
            <div className="mt-6">
              <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Recent Boards
              </h3>
              <div className="mt-2 space-y-1">
                {recentBoards.map((board) => (
                  <Link
                    key={board._id}
                    to={`/board/${board._id}`}
                    className={`flex items-center px-3 py-2 text-sm rounded-md group transition-colors ${
                      location.pathname === `/board/${board._id}`
                        ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div 
                      className="w-4 h-4 rounded mr-3 flex-shrink-0"
                      style={{ backgroundColor: board.background }}
                    />
                    <span className="truncate flex-1">{board.title}</span>
                    <ChevronRight 
                      size={14} 
                      className="opacity-0 group-hover:opacity-100 transition-opacity" 
                    />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </nav>

        {/* Collapse toggle */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => dispatch({ type: 'ui/toggleSidebar' })}
            className="w-full flex items-center justify-center p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <ChevronRight 
              size={20} 
              className={`transform transition-transform ${
                sidebarCollapsed ? 'rotate-0' : 'rotate-180'
              }`} 
            />
          </button>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
