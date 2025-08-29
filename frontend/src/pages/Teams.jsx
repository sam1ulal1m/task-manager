import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { 
  Plus, 
  Users, 
  Settings,
  Crown,
  Shield,
  Search,
  MoreVertical,
  UserPlus,
  Trash2,
  Edit3
} from 'lucide-react'
import { fetchTeams, createTeam, updateTeam, deleteTeam } from '../store/slices/teamsSlice'
import { openModal } from '../store/slices/uiSlice'
import LoadingSpinner from '../components/LoadingSpinner'

const Teams = () => {
  const dispatch = useDispatch()
  const { teams, isLoading } = useSelector(state => state.teams)
  const { user } = useSelector(state => state.auth)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeDropdown, setActiveDropdown] = useState(null)

  useEffect(() => {
    dispatch(fetchTeams())
  }, [dispatch])

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const ownedTeams = filteredTeams.filter(team => 
    team.members.some(member => member.user._id === user._id && member.role === 'owner')
  )

  const memberTeams = filteredTeams.filter(team =>
    team.members.some(member => member.user._id === user._id && member.role !== 'owner')
  )

  const handleCreateTeam = () => {
    dispatch(openModal({ modal: 'CreateTeam' }))
  }

  const handleEditTeam = (team) => {
    dispatch(openModal({ modal: 'EditTeam', data: team }))
    setActiveDropdown(null)
  }

  const handleDeleteTeam = (teamId) => {
    if (window.confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
      dispatch(deleteTeam(teamId))
    }
    setActiveDropdown(null)
  }

  const handleManageMembers = (team) => {
    dispatch(openModal({ modal: 'TeamMembers', data: team }))
    setActiveDropdown(null)
  }

  const getUserRole = (team) => {
    const member = team.members.find(member => member.user._id === user._id)
    return member?.role || 'member'
  }

  if (isLoading) {
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Teams</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Collaborate with your team members on shared boards and projects
            </p>
          </div>
          <button
            onClick={handleCreateTeam}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Create Team</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search teams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      {/* Teams you own */}
      {ownedTeams.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Crown className="w-5 h-5 text-yellow-500 mr-2" />
            Teams You Own ({ownedTeams.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ownedTeams.map((team) => (
              <TeamCard
                key={team._id}
                team={team}
                userRole={getUserRole(team)}
                onEdit={() => handleEditTeam(team)}
                onDelete={() => handleDeleteTeam(team._id)}
                onManageMembers={() => handleManageMembers(team)}
                activeDropdown={activeDropdown}
                setActiveDropdown={setActiveDropdown}
              />
            ))}
          </div>
        </div>
      )}

      {/* Teams you're a member of */}
      {memberTeams.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Users className="w-5 h-5 text-blue-500 mr-2" />
            Teams You're In ({memberTeams.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {memberTeams.map((team) => (
              <TeamCard
                key={team._id}
                team={team}
                userRole={getUserRole(team)}
                onEdit={() => handleEditTeam(team)}
                onDelete={() => handleDeleteTeam(team._id)}
                onManageMembers={() => handleManageMembers(team)}
                activeDropdown={activeDropdown}
                setActiveDropdown={setActiveDropdown}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {filteredTeams.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {searchQuery ? 'No teams found' : 'No teams yet'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {searchQuery 
              ? 'Try adjusting your search terms.'
              : 'Create a team to start collaborating with others.'
            }
          </p>
          {!searchQuery && (
            <button
              onClick={handleCreateTeam}
              className="btn-primary"
            >
              Create Your First Team
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// Team Card Component
const TeamCard = ({ 
  team, 
  userRole, 
  onEdit, 
  onDelete, 
  onManageMembers,
  activeDropdown,
  setActiveDropdown
}) => {
  const canManage = userRole === 'owner' || userRole === 'admin'

  return (
    <div className="card p-6 relative">
      {/* Dropdown menu */}
      {canManage && (
        <div className="absolute top-4 right-4">
          <button
            onClick={() => setActiveDropdown(activeDropdown === team._id ? null : team._id)}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
          >
            <MoreVertical size={16} />
          </button>

          {activeDropdown === team._id && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
              <div className="py-1">
                <button
                  onClick={onEdit}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <Edit3 size={16} className="mr-3" />
                  Edit Team
                </button>
                <button
                  onClick={onManageMembers}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <UserPlus size={16} className="mr-3" />
                  Manage Members
                </button>
                {userRole === 'owner' && (
                  <button
                    onClick={onDelete}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900"
                  >
                    <Trash2 size={16} className="mr-3" />
                    Delete Team
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Team Info */}
      <div className="mb-4">
        <div className="flex items-center mb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white pr-8">
            {team.name}
          </h3>
        </div>
        
        <div className="flex items-center mb-2">
          {userRole === 'owner' && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 mr-2">
              <Crown size={12} className="mr-1" />
              Owner
            </span>
          )}
          {userRole === 'admin' && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 mr-2">
              <Shield size={12} className="mr-1" />
              Admin
            </span>
          )}
          {userRole === 'member' && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 mr-2">
              <Users size={12} className="mr-1" />
              Member
            </span>
          )}
        </div>

        {team.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {team.description}
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
        <div className="flex items-center">
          <Users size={16} className="mr-1" />
          <span>{team.members.length} member{team.members.length !== 1 ? 's' : ''}</span>
        </div>
        <div>
          {team.boards?.length || 0} board{(team.boards?.length || 0) !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Members */}
      <div className="flex items-center justify-between">
        <div className="flex -space-x-2">
          {team.members.slice(0, 5).map((member) => (
            <div
              key={member.user._id}
              className="w-8 h-8 bg-gray-300 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs font-medium"
              title={`${member.user.name} (${member.role})`}
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
          {team.members.length > 5 && (
            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-400">
              +{team.members.length - 5}
            </div>
          )}
        </div>

        {canManage && (
          <button
            onClick={onManageMembers}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
          >
            Manage
          </button>
        )}
      </div>

      {/* Creation date */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Created {new Date(team.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  )
}

export default Teams
