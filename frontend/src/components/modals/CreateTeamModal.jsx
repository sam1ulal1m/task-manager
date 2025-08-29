import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { X, Users, Lock, Globe, Building } from 'lucide-react'
import { createTeam } from '../../store/slices/teamsSlice'
import { closeModal } from '../../store/slices/uiSlice'
import toast from 'react-hot-toast'

const CreateTeamModal = () => {
  const dispatch = useDispatch()
  const { modal } = useSelector(state => state.ui)
  const { isLoading } = useSelector(state => state.teams)
  
  const isOpen = modal === 'CreateTeam'
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    visibility: 'private',
    website: ''
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('Team name is required')
      return
    }

    try {
      const result = await dispatch(createTeam(formData)).unwrap()
      toast.success('Team created successfully!')
      dispatch(closeModal())
      setFormData({
        name: '',
        description: '',
        visibility: 'private',
        website: ''
      })
    } catch (error) {
      toast.error(error.message || 'Failed to create team')
    }
  }

  const handleClose = () => {
    dispatch(closeModal())
    setFormData({
      name: '',
      description: '',
      visibility: 'private',
      website: ''
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Create Team
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Team Preview */}
          <div className="mb-6">
            <div className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Building className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {formData.name || 'Team Name'}
                </h3>
                {formData.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {formData.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Team Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Team Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter team name..."
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
              placeholder="What's this team about?"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Website */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Website (Optional)
            </label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              placeholder="https://example.com"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Visibility */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Team Visibility
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
                  Private - Only invited members can see this team
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
                  Public - Anyone can request to join this team
                </span>
              </label>
            </div>
          </div>

          {/* Info Note */}
          <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
            <div className="flex">
              <Users className="flex-shrink-0 h-5 w-5 text-blue-400" />
              <div className="ml-2">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  You'll be able to add members and create boards for this team after it's created.
                </p>
              </div>
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
              disabled={isLoading || !formData.name.trim()}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating...' : 'Create Team'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateTeamModal
