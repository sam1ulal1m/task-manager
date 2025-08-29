import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { X, Image, Users, Lock, Globe, Eye } from 'lucide-react'
import { createBoard } from '../../store/slices/boardsSlice'
import { closeModal } from '../../store/slices/uiSlice'
import toast from 'react-hot-toast'

const CreateBoardModal = () => {
  const dispatch = useDispatch()
  const { showCreateBoardModal } = useSelector(state => state.ui)
  const { isLoading } = useSelector(state => state.boards)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    background: '#0079bf',
    visibility: 'private',
    team: null
  })

  const backgroundColors = [
    '#0079bf', '#d29034', '#519839', '#b04632',
    '#89609e', '#cd5a91', '#4bbf6b', '#00aecc',
    '#838c91', '#172b4d'
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      toast.error('Board title is required')
      return
    }

    try {
      const result = await dispatch(createBoard(formData)).unwrap()
      toast.success('Board created successfully!')
      dispatch(closeModal('CreateBoard'))
      setFormData({
        title: '',
        description: '',
        background: '#0079bf',
        visibility: 'private',
        team: null
      })
    } catch (error) {
      toast.error(error.message || 'Failed to create board')
    }
  }

  const handleClose = () => {
    dispatch(closeModal('CreateBoard'))
    setFormData({
      title: '',
      description: '',
      background: '#0079bf',
      visibility: 'private',
      team: null
    })
  }

  if (!showCreateBoardModal) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Create Board
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Board Preview */}
          <div className="mb-6">
            <div 
              className="w-full h-32 rounded-lg flex items-center justify-center text-white font-semibold text-lg shadow-md"
              style={{ backgroundColor: formData.background }}
            >
              {formData.title || 'Board Title'}
            </div>
          </div>

          {/* Title */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Board Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter board title..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="What's this board about?"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Background Color */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Background Color
            </label>
            <div className="flex flex-wrap gap-2">
              {backgroundColors.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, background: color }))}
                  className={`w-10 h-10 rounded-md border-2 ${
                    formData.background === color 
                      ? 'border-gray-900 dark:border-white' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Visibility */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Visibility
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="visibility"
                  value="private"
                  checked={formData.visibility === 'private'}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <Lock size={16} className="mr-2 text-gray-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Private - Only board members can see this board
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="visibility"
                  value="team"
                  checked={formData.visibility === 'team'}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <Users size={16} className="mr-2 text-gray-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Team - All team members can see this board
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="visibility"
                  value="public"
                  checked={formData.visibility === 'public'}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <Globe size={16} className="mr-2 text-gray-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Public - Anyone can see this board
                </span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-500 dark:hover:text-gray-400"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.title.trim()}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating...' : 'Create Board'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateBoardModal
