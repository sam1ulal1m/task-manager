import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import {
  Plus,
  Settings,
  Users,
  Star,
  MoreHorizontal,
  Filter,
  Search,
  X,
  ArrowLeft
} from 'lucide-react'
import { 
  fetchBoard, 
  updateBoard,
  toggleBoardFavorite
} from '../store/slices/boardsSlice'
import {
  fetchLists,
  createList,
  updateListPosition
} from '../store/slices/listsSlice'
import { 
  fetchCards,
  fetchBoardCards,
  createCard,
  updateCard,
  moveCard,
  optimisticMoveCard,
  revertOptimisticMove
} from '../store/slices/cardsSlice'
import { openModal, setCardFilter } from '../store/slices/uiSlice'
import LoadingSpinner from '../components/LoadingSpinner'
import BoardHeader from '../components/board/BoardHeader'
import BoardList from '../components/board/BoardList'
import CreateListForm from '../components/board/CreateListForm'

const Board = () => {
  const { boardId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { currentBoard, isLoading } = useSelector(state => state.boards)
  const { lists } = useSelector(state => state.lists)
  const { cards: cardsByList } = useSelector(state => state.cards)
  const { cardFilter } = useSelector(state => state.ui)
  const { user } = useSelector(state => state.auth)
  
  // Flatten cards from all lists
  const cards = Object.values(cardsByList).flat()
  
  const [showCreateList, setShowCreateList] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    if (boardId) {
      dispatch(fetchBoard(boardId))
      dispatch(fetchLists(boardId))
      dispatch(fetchBoardCards(boardId))
    }
  }, [dispatch, boardId])

  const handleDragEnd = async (result) => {
    const { destination, source, type, draggableId } = result

    if (!destination) return

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return
    }

    if (type === 'list') {
      // Handle list reordering
      const newPosition = destination.index
      dispatch(updateListPosition({
        listId: draggableId,
        position: newPosition
      }))
    } else if (type === 'card') {
      // Handle card movement with optimistic update
      const sourceListId = source.droppableId
      const destinationListId = destination.droppableId
      const cardId = draggableId
      
      try {
        // Perform optimistic update first
        dispatch(optimisticMoveCard({
          cardId,
          sourceListId,
          destinationListId,
          sourceIndex: source.index,
          destinationIndex: destination.index
        }))
        
        // Then make API call
        await dispatch(moveCard({
          cardId,
          destinationListId,
          newPosition: destination.index
        })).unwrap()
      } catch (error) {
        // Revert optimistic update on failure
        dispatch(revertOptimisticMove({
          cardId,
          sourceListId,
          destinationListId,
          sourceIndex: source.index,
          destinationIndex: destination.index
        }))
      }
    }
  }

  const handleCreateList = (listData) => {
    dispatch(createList({
      boardId: currentBoard._id,
      ...listData
    }))
    setShowCreateList(false)
  }

  const handleCreateCard = (listId, cardData) => {
    dispatch(createCard({
      listId,
      boardId: currentBoard._id,
      ...cardData
    }))
  }

  const filteredCards = cards.filter(card => {
    const matchesSearch = searchQuery === '' || 
      card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.description?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesFilter = (() => {
      switch (cardFilter) {
        case 'assigned':
          return card.assignedTo?.some(member => member._id === user._id)
        case 'due-soon':
          if (!card.dueDate) return false
          const dueDate = new Date(card.dueDate)
          const now = new Date()
          const diffTime = dueDate - now
          const diffDays = diffTime / (1000 * 60 * 60 * 24)
          return diffDays <= 7 && diffDays >= 0
        case 'overdue':
          if (!card.dueDate) return false
          return new Date(card.dueDate) < new Date()
        case 'completed':
          return card.status === 'completed'
        default:
          return true
      }
    })()

    return matchesSearch && matchesFilter
  })

  if (isLoading || !currentBoard) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Board Header */}
      <BoardHeader 
        board={currentBoard}
        onUpdateBoard={(updates) => dispatch(updateBoard({ boardId: currentBoard._id, updates }))}
        onToggleFavorite={() => dispatch(toggleBoardFavorite(currentBoard._id))}
        onOpenSettings={() => dispatch(openModal({ modal: 'BoardSettings', data: currentBoard }))}
        onOpenMembers={() => dispatch(openModal({ modal: 'BoardMembers', data: currentBoard }))}
      />

      {/* Search and Filters */}
      <div className="px-6 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back to Dashboard
            </button>
          </div>

          <div className="flex items-center space-x-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search cards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="relative">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-3 py-2 text-sm border rounded-lg transition-colors ${
                  cardFilter !== 'all' || showFilters
                    ? 'bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300'
                    : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                <Filter size={16} />
                <span>Filter</span>
              </button>

              {showFilters && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                  <div className="p-2">
                    {[
                      { key: 'all', label: 'All Cards' },
                      { key: 'assigned', label: 'Assigned to Me' },
                      { key: 'due-soon', label: 'Due Soon' },
                      { key: 'overdue', label: 'Overdue' },
                      { key: 'completed', label: 'Completed' }
                    ].map((filter) => (
                      <button
                        key={filter.key}
                        onClick={() => {
                          dispatch(setCardFilter(filter.key))
                          setShowFilters(false)
                        }}
                        className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                          cardFilter === filter.key
                            ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Board Content */}
      <div className="flex-1 overflow-hidden">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="board" direction="horizontal" type="list">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="h-full flex p-6 space-x-6 overflow-x-auto"
                style={{
                  background: currentBoard.background.startsWith('#')
                    ? currentBoard.background
                    : `linear-gradient(135deg, ${currentBoard.background})`
                }}
              >
                {/* Render Lists */}
                {[...lists]
                  .sort((a, b) => a.position - b.position)
                  .map((list, index) => (
                    <Draggable key={list._id} draggableId={list._id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <BoardList
                            list={list}
                            cards={filteredCards.filter(card => card.list === list._id)}
                            onCreateCard={(cardData) => handleCreateCard(list._id, cardData)}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}

                {provided.placeholder}

                {/* Create List */}
                <div className="flex-shrink-0">
                  {showCreateList ? (
                    <CreateListForm
                      onSubmit={handleCreateList}
                      onCancel={() => setShowCreateList(false)}
                    />
                  ) : (
                    <button
                      onClick={() => setShowCreateList(true)}
                      className="w-80 p-4 bg-white bg-opacity-20 rounded-lg border-2 border-dashed border-white border-opacity-50 text-white hover:bg-opacity-30 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Plus size={20} />
                      <span>Add a list</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  )
}

export default Board
