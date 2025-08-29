import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { 
  Plus, 
  Search, 
  Filter, 
  Star,
  Users,
  Calendar,
  Grid,
  List
} from 'lucide-react'
import { fetchBoards } from '../store/slices/boardsSlice'
import { setBoardFilter, openModal } from '../store/slices/uiSlice'
import LoadingSpinner from '../components/LoadingSpinner'

const Dashboard = () => {
  const dispatch = useDispatch()
  const { user } = useSelector(state => state.auth)
  const { boards, isLoading, pagination } = useSelector(state => state.boards)
  const { boardFilter } = useSelector(state => state.ui)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState('grid')

  useEffect(() => {
    dispatch(fetchBoards({ 
      filter: boardFilter,
      search: searchQuery,
      limit: 12 
    }))
  }, [dispatch, boardFilter, searchQuery])

  const handleFilterChange = (filter) => {
    dispatch(setBoardFilter(filter))
  }

  const filteredBoards = boards.filter(board =>
    board.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    board.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const recentBoards = boards.slice(0, 6)
  const favoriteBoards = boards.filter(board => board.isFavorite?.length > 0)

  if (isLoading && boards.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome back, {user?.name}!
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage your boards and collaborate with your team
            </p>
          </div>
          <button
            onClick={() => dispatch(openModal({ modal: 'CreateBoard' }))}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Create Board</span>
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <Grid className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Boards</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{boards.length}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Favorites</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{favoriteBoards.length}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Team Boards</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {boards.filter(board => board.team).length}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Recent Activity</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {boards.filter(board => {
                  const lastUpdate = new Date(board.updatedAt)
                  const today = new Date()
                  const diffTime = Math.abs(today - lastUpdate)
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                  return diffDays <= 7
                }).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search boards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Filter buttons */}
          <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            {[
              { key: 'all', label: 'All' },
              { key: 'owned', label: 'Owned' },
              { key: 'member', label: 'Member' },
              { key: 'favorite', label: 'Favorites' }
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => handleFilterChange(filter.key)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  boardFilter === filter.key
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* View mode toggle */}
          <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Favorite Boards */}
      {favoriteBoards.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Star className="w-5 h-5 text-yellow-500 mr-2" />
            Favorite Boards
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favoriteBoards.slice(0, 4).map((board) => (
              <BoardCard key={board._id} board={board} />
            ))}
          </div>
        </div>
      )}

      {/* Recent Boards */}
      {recentBoards.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Recent Boards
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recentBoards.map((board) => (
              <BoardCard key={board._id} board={board} />
            ))}
          </div>
        </div>
      )}

      {/* All Boards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {boardFilter === 'all' ? 'All Boards' : 
             boardFilter === 'owned' ? 'Your Boards' :
             boardFilter === 'member' ? 'Boards You\'re In' :
             'Favorite Boards'}
          </h2>
          {pagination.total > 0 && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {filteredBoards.length} of {pagination.total} boards
            </span>
          )}
        </div>

        {filteredBoards.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Grid className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No boards found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {searchQuery 
                ? 'Try adjusting your search terms.'
                : 'Get started by creating your first board.'
              }
            </p>
            {!searchQuery && (
              <button
                onClick={() => dispatch(openModal({ modal: 'CreateBoard' }))}
                className="btn-primary"
              >
                Create Your First Board
              </button>
            )}
          </div>
        ) : (
          <div className={`${
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          }`}>
            {filteredBoards.map((board) => (
              viewMode === 'grid' ? (
                <BoardCard key={board._id} board={board} />
              ) : (
                <BoardListItem key={board._id} board={board} />
              )
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Board Card Component
const BoardCard = ({ board }) => {
  const dispatch = useDispatch()
  
  return (
    <Link to={`/board/${board._id}`} className="group">
      <div 
        className="card h-32 p-4 relative overflow-hidden cursor-pointer transform transition-transform group-hover:scale-105"
        style={{ 
          background: board.background.startsWith('#') 
            ? board.background 
            : `linear-gradient(135deg, ${board.background})`
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-all"></div>
        <div className="relative z-10 text-white">
          <h3 className="font-semibold text-lg mb-2 truncate">{board.title}</h3>
          {board.description && (
            <p className="text-sm opacity-90 line-clamp-2">{board.description}</p>
          )}
        </div>
        
        <div className="absolute bottom-4 right-4 z-10 flex items-center space-x-2">
          {board.team && (
            <div className="bg-white bg-opacity-20 rounded-full p-1">
              <Users size={14} className="text-white" />
            </div>
          )}
          {board.isFavorite?.length > 0 && (
            <Star size={14} className="text-yellow-300 fill-current" />
          )}
        </div>
      </div>
    </Link>
  )
}

// Board List Item Component
const BoardListItem = ({ board }) => {
  return (
    <Link to={`/board/${board._id}`} className="group">
      <div className="card p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center space-x-4">
          <div 
            className="w-12 h-12 rounded-lg flex-shrink-0"
            style={{ backgroundColor: board.background }}
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
              {board.title}
            </h3>
            {board.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {board.description}
              </p>
            )}
            <div className="flex items-center mt-2 space-x-4 text-xs text-gray-500 dark:text-gray-400">
              <span>Updated {new Date(board.updatedAt).toLocaleDateString()}</span>
              {board.team && (
                <span className="flex items-center">
                  <Users size={12} className="mr-1" />
                  {board.team.name}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {board.members && (
              <div className="flex -space-x-2">
                {board.members.slice(0, 3).map((member, index) => (
                  <div
                    key={member.user._id}
                    className="w-8 h-8 bg-gray-300 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium"
                    title={member.user.name}
                  >
                    {member.user.avatar ? (
                      <img 
                        src={member.user.avatar} 
                        alt={member.user.name}
                        className="w-full h-full rounded-full"
                      />
                    ) : (
                      member.user.name.charAt(0).toUpperCase()
                    )}
                  </div>
                ))}
                {board.members.length > 3 && (
                  <div className="w-8 h-8 bg-gray-100 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600">
                    +{board.members.length - 3}
                  </div>
                )}
              </div>
            )}
            {board.isFavorite?.length > 0 && (
              <Star size={16} className="text-yellow-500 fill-current" />
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

export default Dashboard
