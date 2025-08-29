import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { X, Users, Lock, Globe, Building } from 'lucide-react'
import { updateTeam } from '../../store/slices/teamsSlice'
import { closeModal } from '../../store/slices/uiSlice'
import toast from 'react-hot-toast'

const EditTeamModal = () => {
  const dispatch = useDispatch()
  const { modal, modalData } = useSelector(state => state.ui)
  const { isLoading } = useSelector(state => state.teams)
  
  const isOpen = modal === 'EditTeam'
  const team = modalData
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    visibility: 'private',
    website: ''
  })

  useEffect(() => {
    if (team) {
      setFormData({
        name: team.name || '',
        description: team.description || '',
        visibility: team.visibility || 'private',
        website: team.website || ''
      })
    }
  }, [team])

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
      const result = await dispatch(updateTeam({ 
        teamId: team._id, 
        teamData: formData 
      })).unwrap()
      toast.success('Team updated successfully!')
      dispatch(closeModal())
    } catch (error) {
      toast.error(error.message || 'Failed to update team')
    }
  }

  const handleClose = () => {
    dispatch(closeModal())
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Edit Team
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Team Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Team Name *
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter team name"
                  className="input pl-10"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your team's purpose..."
                rows={3}
                className="input resize-none"
              />
            </div>

            {/* Visibility */}
            <div>
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
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <div className="ml-3 flex items-center">
                    <Lock size={16} className="text-gray-400 mr-2" />
                    <div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Private</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Only members can see this team</p>
                    </div>
                  </div>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="visibility"
                    value="public"
                    checked={formData.visibility === 'public'}
                    onChange={handleInputChange}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <div className="ml-3 flex items-center">
                    <Globe size={16} className="text-gray-400 mr-2" />
                    <div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Public</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Anyone can discover this team</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Website (Optional)
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://yourcompany.com"
                  className="input pl-10"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary"
            >
              {isLoading ? 'Updating...' : 'Update Team'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditTeamModal
