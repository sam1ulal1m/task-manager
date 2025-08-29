import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { Droppable, Draggable } from '@hello-pangea/dnd'
import { 
  Plus, 
  MoreHorizontal, 
  Edit3, 
  Archive,
  Trash2,
  Copy
} from 'lucide-react'
import { 
  updateList, 
  deleteList, 
  archiveList,
  duplicateList 
} from '../../store/slices/listsSlice'
import { openModal } from '../../store/slices/uiSlice'
import BoardCard from './BoardCard'

const BoardList = ({ list, cards, onCreateCard }) => {
  const dispatch = useDispatch()
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [title, setTitle] = useState(list.title)
  const [showMenu, setShowMenu] = useState(false)
  const [showAddCard, setShowAddCard] = useState(false)
  const [newCardTitle, setNewCardTitle] = useState('')

  const handleTitleSubmit = (e) => {
    e.preventDefault()
    if (title.trim() && title !== list.title) {
      dispatch(updateList({
        id: list._id,
        updates: { title: title.trim() }
      }))
    }
    setIsEditingTitle(false)
  }

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setTitle(list.title)
      setIsEditingTitle(false)
    }
  }

  const handleAddCard = (e) => {
    e.preventDefault()
    if (newCardTitle.trim()) {
      onCreateCard({ title: newCardTitle.trim() })
      setNewCardTitle('')
      setShowAddCard(false)
    }
  }

  const handleArchiveList = () => {
    dispatch(archiveList(list._id))
    setShowMenu(false)
  }

  const handleDeleteList = () => {
    if (window.confirm('Are you sure you want to delete this list? This action cannot be undone.')) {
      dispatch(deleteList(list._id))
    }
    setShowMenu(false)
  }

  const handleDuplicateList = () => {
    dispatch(duplicateList(list._id))
    setShowMenu(false)
  }

  const sortedCards = cards
    .filter(card => !card.archived)
    .sort((a, b) => a.position - b.position)

  return (
    <div className="w-80 bg-gray-100 dark:bg-gray-800 rounded-lg flex flex-col max-h-full">
      {/* List Header */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          {isEditingTitle ? (
            <form onSubmit={handleTitleSubmit} className="flex-1">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleSubmit}
                onKeyDown={handleTitleKeyDown}
                className="w-full font-semibold text-gray-900 dark:text-white bg-transparent border border-blue-500 rounded px-2 py-1 focus:outline-none"
                autoFocus
                maxLength={100}
              />
            </form>
          ) : (
            <h3
              onClick={() => setIsEditingTitle(true)}
              className="font-semibold text-gray-900 dark:text-white cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 px-2 py-1 rounded flex-1"
            >
              {list.title}
            </h3>
          )}

          <div className="flex items-center space-x-1">
            <span className="text-sm text-gray-500 dark:text-gray-400 px-2">
              {sortedCards.length}
            </span>
            
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
              >
                <MoreHorizontal size={16} />
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setIsEditingTitle(true)
                        setShowMenu(false)
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <Edit3 size={16} className="mr-3" />
                      Edit List
                    </button>

                    <button
                      onClick={handleDuplicateList}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <Copy size={16} className="mr-3" />
                      Duplicate List
                    </button>

                    <div className="border-t border-gray-100 dark:border-gray-600 my-1"></div>

                    <button
                      onClick={handleArchiveList}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <Archive size={16} className="mr-3" />
                      Archive List
                    </button>

                    <button
                      onClick={handleDeleteList}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900"
                    >
                      <Trash2 size={16} className="mr-3" />
                      Delete List
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cards */}
      <Droppable droppableId={list._id} type="card">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 p-2 space-y-2 overflow-y-auto ${
              snapshot.isDraggingOver ? 'bg-blue-50 dark:bg-blue-900' : ''
            }`}
          >
            {sortedCards.map((card, index) => (
              <Draggable key={card._id} draggableId={card._id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={snapshot.isDragging ? 'transform rotate-3' : ''}
                  >
                    <BoardCard card={card} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {/* Add Card */}
      <div className="p-2">
        {showAddCard ? (
          <form onSubmit={handleAddCard} className="space-y-2">
            <textarea
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              placeholder="Enter a title for this card..."
              className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
              autoFocus
            />
            <div className="flex items-center space-x-2">
              <button
                type="submit"
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
              >
                Add Card
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddCard(false)
                  setNewCardTitle('')
                }}
                className="px-3 py-1 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowAddCard(true)}
            className="w-full p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-sm transition-colors flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>Add a card</span>
          </button>
        )}
      </div>
    </div>
  )
}

export default BoardList
