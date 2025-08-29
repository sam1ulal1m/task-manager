import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { 
  Star, 
  Users, 
  Settings, 
  MoreHorizontal, 
  Eye,
  EyeOff,
  Link as LinkIcon,
  Share
} from 'lucide-react'
import { toggleBoardFavorite, updateBoard } from '../../store/slices/boardsSlice'

const BoardHeader = ({ 
  board, 
  onUpdateBoard, 
  onToggleFavorite, 
  onOpenSettings, 
  onOpenMembers 
}) => {
  const dispatch = useDispatch()
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [title, setTitle] = useState(board.title)
  const [showMenu, setShowMenu] = useState(false)

  const handleTitleSubmit = (e) => {
    e.preventDefault()
    if (title.trim() && title !== board.title) {
      onUpdateBoard({ title: title.trim() })
    }
    setIsEditingTitle(false)
  }

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setTitle(board.title)
      setIsEditingTitle(false)
    }
  }

  const handleToggleVisibility = () => {
    onUpdateBoard({ 
      visibility: board.visibility === 'private' ? 'public' : 'private' 
    })
  }

  const copyBoardLink = () => {
    const url = `${window.location.origin}/board/${board._id}`
    navigator.clipboard.writeText(url)
    // Show toast notification
    setShowMenu(false)
  }

  return (
    <div className="bg-black bg-opacity-30 text-white px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Board Title */}
          {isEditingTitle ? (
            <form onSubmit={handleTitleSubmit} className="flex items-center">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleSubmit}
                onKeyDown={handleTitleKeyDown}
                className="text-xl font-bold bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-70 border border-white border-opacity-30 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                autoFocus
                maxLength={100}
              />
            </form>
          ) : (
            <h1
              onClick={() => setIsEditingTitle(true)}
              className="text-xl font-bold cursor-pointer hover:bg-white hover:bg-opacity-20 px-3 py-1 rounded transition-colors"
            >
              {board.title}
            </h1>
          )}

          {/* Favorite Button */}
          <button
            onClick={onToggleFavorite}
            className={`p-2 rounded hover:bg-white hover:bg-opacity-20 transition-colors ${
              board.isFavorite?.length > 0 ? 'text-yellow-300' : 'text-white text-opacity-70'
            }`}
            title={board.isFavorite?.length > 0 ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star size={20} className={board.isFavorite?.length > 0 ? 'fill-current' : ''} />
          </button>

          {/* Visibility Indicator */}
          <div className="flex items-center space-x-2 bg-white bg-opacity-20 px-3 py-1 rounded text-sm">
            {board.visibility === 'private' ? (
              <EyeOff size={16} />
            ) : (
              <Eye size={16} />
            )}
            <span className="capitalize">{board.visibility}</span>
          </div>

          {/* Team Badge */}
          {board.team && (
            <div className="flex items-center space-x-2 bg-white bg-opacity-20 px-3 py-1 rounded text-sm">
              <Users size={16} />
              <span>{board.team.name}</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Board Members */}
          <div className="flex items-center space-x-2">
            <div className="flex -space-x-2">
              {board.members?.slice(0, 5).map((member) => (
                <div
                  key={member.user._id}
                  className="w-8 h-8 bg-white bg-opacity-20 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium"
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
              {board.members?.length > 5 && (
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium">
                  +{board.members.length - 5}
                </div>
              )}
            </div>

            <button
              onClick={onOpenMembers}
              className="px-3 py-1 bg-white bg-opacity-20 hover:bg-opacity-30 rounded text-sm transition-colors"
            >
              Invite
            </button>
          </div>

          {/* More Options */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
            >
              <MoreHorizontal size={20} />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <div className="py-1">
                  <button
                    onClick={() => {
                      onOpenSettings()
                      setShowMenu(false)
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Settings size={16} className="mr-3" />
                    Board Settings
                  </button>
                  
                  <button
                    onClick={handleToggleVisibility}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    {board.visibility === 'private' ? (
                      <Eye size={16} className="mr-3" />
                    ) : (
                      <EyeOff size={16} className="mr-3" />
                    )}
                    Make {board.visibility === 'private' ? 'Public' : 'Private'}
                  </button>

                  <button
                    onClick={copyBoardLink}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <LinkIcon size={16} className="mr-3" />
                    Copy Board Link
                  </button>

                  <button
                    onClick={() => {
                      // Handle sharing
                      setShowMenu(false)
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Share size={16} className="mr-3" />
                    Share Board
                  </button>

                  <div className="border-t border-gray-100 my-1"></div>
                  
                  <button
                    onClick={() => {
                      onOpenMembers()
                      setShowMenu(false)
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Users size={16} className="mr-3" />
                    Manage Members
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Board Description */}
      {board.description && (
        <div className="mt-2">
          <p className="text-white text-opacity-90 text-sm">{board.description}</p>
        </div>
      )}
    </div>
  )
}

export default BoardHeader
