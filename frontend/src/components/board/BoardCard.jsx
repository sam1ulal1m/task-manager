import { useState } from 'react'
import { 
  Calendar, 
  User, 
  MessageCircle, 
  Paperclip, 
  CheckSquare,
  AlertCircle,
  Clock
} from 'lucide-react'
import { useDispatch } from 'react-redux'
import { openModal } from '../../store/slices/uiSlice'

const BoardCard = ({ card }) => {
  const dispatch = useDispatch()
  const [isHovered, setIsHovered] = useState(false)

  const handleCardClick = () => {
    dispatch(openModal({ modal: 'EditCard', data: card }))
  }

  const getDueDateStatus = () => {
    if (!card.dueDate) return null
    
    const dueDate = new Date(card.dueDate)
    const now = new Date()
    const diffTime = dueDate - now
    const diffDays = diffTime / (1000 * 60 * 60 * 24)

    if (diffDays < 0) {
      return { status: 'overdue', color: 'bg-red-500', text: 'Overdue' }
    } else if (diffDays <= 1) {
      return { status: 'due-soon', color: 'bg-yellow-500', text: 'Due Soon' }
    } else if (diffDays <= 7) {
      return { status: 'upcoming', color: 'bg-blue-500', text: 'Upcoming' }
    }
    return { status: 'future', color: 'bg-gray-500', text: 'Scheduled' }
  }

  const dueDateStatus = getDueDateStatus()
  const completedTasks = card.checklist?.filter(item => item.completed).length || 0
  const totalTasks = card.checklist?.length || 0

  return (
    <div
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-600 cursor-pointer transition-all duration-200 ${
        isHovered ? 'shadow-md transform scale-105' : ''
      }`}
    >
      {/* Labels */}
      {card.labels && card.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {card.labels.slice(0, 4).map((label) => (
            <span
              key={label._id}
              className="px-2 py-1 rounded text-xs font-medium text-white"
              style={{ backgroundColor: label.color }}
            >
              {label.name}
            </span>
          ))}
          {card.labels.length > 4 && (
            <span className="px-2 py-1 rounded text-xs font-medium bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
              +{card.labels.length - 4}
            </span>
          )}
        </div>
      )}

      {/* Cover Image */}
      {card.cover && (
        <div className="mb-2 -mx-3 -mt-3">
          <img
            src={card.cover}
            alt={card.title}
            className="w-full h-24 object-cover rounded-t-lg"
          />
        </div>
      )}

      {/* Title */}
      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 line-clamp-2">
        {card.title}
      </h4>

      {/* Description Preview */}
      {card.description && (
        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
          {card.description}
        </p>
      )}

      {/* Card Metadata */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center space-x-2">
          {/* Due Date */}
          {card.dueDate && (
            <div className={`flex items-center space-x-1 px-2 py-1 rounded ${dueDateStatus.color} text-white`}>
              <Calendar size={12} />
              <span>{new Date(card.dueDate).toLocaleDateString()}</span>
            </div>
          )}

          {/* Priority */}
          {card.priority && card.priority !== 'none' && (
            <div className={`flex items-center space-x-1 px-2 py-1 rounded ${
              card.priority === 'high' ? 'bg-red-100 text-red-700' :
              card.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
              'bg-green-100 text-green-700'
            }`}>
              <AlertCircle size={12} />
              <span className="capitalize">{card.priority}</span>
            </div>
          )}
        </div>

        {/* Card Stats */}
        <div className="flex items-center space-x-3">
          {/* Comments */}
          {card.comments && card.comments.length > 0 && (
            <div className="flex items-center space-x-1">
              <MessageCircle size={12} />
              <span>{card.comments.length}</span>
            </div>
          )}

          {/* Attachments */}
          {card.attachments && card.attachments.length > 0 && (
            <div className="flex items-center space-x-1">
              <Paperclip size={12} />
              <span>{card.attachments.length}</span>
            </div>
          )}

          {/* Checklist */}
          {totalTasks > 0 && (
            <div className={`flex items-center space-x-1 ${
              completedTasks === totalTasks ? 'text-green-600' : ''
            }`}>
              <CheckSquare size={12} />
              <span>{completedTasks}/{totalTasks}</span>
            </div>
          )}

          {/* Time Tracking */}
          {card.timeSpent && (
            <div className="flex items-center space-x-1">
              <Clock size={12} />
              <span>{Math.round(card.timeSpent / 60)}h</span>
            </div>
          )}
        </div>
      </div>

      {/* Assigned Members */}
      {card.assignedTo && card.assignedTo.length > 0 && (
        <div className="flex items-center justify-between mt-2">
          <div className="flex -space-x-1">
            {card.assignedTo.slice(0, 3).map((member) => (
              <div
                key={member._id}
                className="w-6 h-6 bg-gray-300 rounded-full border-2 border-white dark:border-gray-700 flex items-center justify-center text-xs font-medium"
                title={member.name}
              >
                {member.avatar ? (
                  <img 
                    src={member.avatar} 
                    alt={member.name}
                    className="w-full h-full rounded-full"
                  />
                ) : (
                  member.name.charAt(0).toUpperCase()
                )}
              </div>
            ))}
            {card.assignedTo.length > 3 && (
              <div className="w-6 h-6 bg-gray-100 dark:bg-gray-600 rounded-full border-2 border-white dark:border-gray-700 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-400">
                +{card.assignedTo.length - 3}
              </div>
            )}
          </div>

          {/* Card ID for quick reference */}
          <span className="text-xs text-gray-400">
            #{card._id.slice(-6)}
          </span>
        </div>
      )}

      {/* Status Indicator */}
      {card.status && card.status !== 'todo' && (
        <div className="mt-2">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            card.status === 'completed' ? 'bg-green-100 text-green-800' :
            card.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {card.status === 'completed' ? '✓ Completed' :
             card.status === 'in-progress' ? '⟳ In Progress' :
             card.status}
          </span>
        </div>
      )}
    </div>
  )
}

export default BoardCard
