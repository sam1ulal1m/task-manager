import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { 
  X, 
  Users, 
  UserPlus, 
  Crown, 
  Shield, 
  Trash2, 
  Mail,
  Copy,
  Check
} from 'lucide-react'
import { 
  updateTeamMember, 
  removeTeamMember, 
  inviteToTeam,
  fetchTeamInvitations,
  cancelInvitation
} from '../../store/slices/teamsSlice'
import { closeModal } from '../../store/slices/uiSlice'
import toast from 'react-hot-toast'

const TeamMembersModal = () => {
  const dispatch = useDispatch()
  const { modal, modalData } = useSelector(state => state.ui)
  const { isLoading, invitations } = useSelector(state => state.teams)
  const { user } = useSelector(state => state.auth)
  
  const isOpen = modal === 'TeamMembers'
  const team = modalData
  
  const [inviteEmail, setInviteEmail] = useState('')
  const [selectedRole, setSelectedRole] = useState('member')
  const [copiedLink, setCopiedLink] = useState(false)

  useEffect(() => {
    if (team && isOpen) {
      dispatch(fetchTeamInvitations(team._id))
    }
  }, [team, isOpen, dispatch])

  const getUserRole = () => {
    if (!team || !user) return 'member'
    const member = team.members.find(member => member.user._id === user._id)
    return member?.role || 'member'
  }

  const canManageMembers = () => {
    const userRole = getUserRole()
    return userRole === 'owner' || userRole === 'admin'
  }

  const canChangeRole = (memberRole) => {
    const userRole = getUserRole()
    if (userRole === 'owner') return true
    if (userRole === 'admin' && memberRole !== 'owner') return true
    return false
  }

  const handleInvite = async (e) => {
    e.preventDefault()
    
    if (!inviteEmail.trim()) {
      toast.error('Email is required')
      return
    }

    try {
      await dispatch(inviteToTeam({
        teamId: team._id,
        email: inviteEmail,
        role: selectedRole
      })).unwrap()
      
      toast.success('Invitation sent successfully!')
      setInviteEmail('')
      setSelectedRole('member')
      dispatch(fetchTeamInvitations(team._id))
    } catch (error) {
      toast.error(error.message || 'Failed to send invitation')
    }
  }

  const handleRoleChange = async (memberId, newRole) => {
    try {
      await dispatch(updateTeamMember({
        teamId: team._id,
        memberId,
        role: newRole
      })).unwrap()
      
      toast.success('Member role updated successfully!')
    } catch (error) {
      toast.error(error.message || 'Failed to update member role')
    }
  }

  const handleRemoveMember = async (memberId) => {
    if (window.confirm('Are you sure you want to remove this member from the team?')) {
      try {
        await dispatch(removeTeamMember({
          teamId: team._id,
          memberId
        })).unwrap()
        
        toast.success('Member removed successfully!')
      } catch (error) {
        toast.error(error.message || 'Failed to remove member')
      }
    }
  }

  const handleCancelInvitation = async (invitationId) => {
    try {
      await dispatch(cancelInvitation(invitationId)).unwrap()
      toast.success('Invitation cancelled')
      dispatch(fetchTeamInvitations(team._id))
    } catch (error) {
      toast.error(error.message || 'Failed to cancel invitation')
    }
  }

  const handleCopyInviteLink = async () => {
    const inviteLink = `${window.location.origin}/invite/${team._id}`
    try {
      await navigator.clipboard.writeText(inviteLink)
      setCopiedLink(true)
      toast.success('Invite link copied to clipboard!')
      setTimeout(() => setCopiedLink(false), 2000)
    } catch (error) {
      toast.error('Failed to copy invite link')
    }
  }

  const handleClose = () => {
    dispatch(closeModal())
  }

  if (!isOpen || !team) return null

  const teamInvitations = invitations?.filter(inv => inv.team === team._id) || []

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Team Members
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {team.name} • {team.members.length} member{team.members.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={24} />
          </button>
        </div>

        <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 120px)' }}>
          {/* Invite Section */}
          {canManageMembers() && (
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Invite New Members
              </h3>
              
              {/* Invite by Email */}
              <form onSubmit={handleInvite} className="mb-4">
                <div className="flex space-x-3">
                  <div className="flex-1">
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="Enter email address"
                      className="input"
                    />
                  </div>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="input min-w-[120px]"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary whitespace-nowrap"
                  >
                    <Mail size={16} className="mr-2" />
                    Invite
                  </button>
                </div>
              </form>

              {/* Invite Link */}
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  value={`${window.location.origin}/invite/${team._id}`}
                  readOnly
                  className="input flex-1 bg-gray-50 dark:bg-gray-700"
                />
                <button
                  onClick={handleCopyInviteLink}
                  className="btn-secondary whitespace-nowrap"
                >
                  {copiedLink ? (
                    <>
                      <Check size={16} className="mr-2 text-green-500" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy size={16} className="mr-2" />
                      Copy Link
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Pending Invitations */}
          {canManageMembers() && teamInvitations.length > 0 && (
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Pending Invitations ({teamInvitations.length})
              </h3>
              <div className="space-y-3">
                {teamInvitations.map((invitation) => (
                  <div
                    key={invitation._id}
                    className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {invitation.email}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Invited as {invitation.role} • {new Date(invitation.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleCancelInvitation(invitation._id)}
                      className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      title="Cancel invitation"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Current Members */}
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Current Members ({team.members.length})
            </h3>
            <div className="space-y-3">
              {team.members.map((member) => (
                <div
                  key={member.user._id}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      {member.user.avatar ? (
                        <img 
                          src={member.user.avatar} 
                          alt={member.user.name}
                          className="w-full h-full rounded-full"
                        />
                      ) : (
                        <span className="text-sm font-medium">
                          {member.user.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {member.user.name}
                        {member.user._id === user._id && (
                          <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                            (You)
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {member.user.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {/* Role Badge */}
                    <div className="flex items-center">
                      {member.role === 'owner' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                          <Crown size={12} className="mr-1" />
                          Owner
                        </span>
                      )}
                      {member.role === 'admin' && canChangeRole(member.role) && (
                        <select
                          value={member.role}
                          onChange={(e) => handleRoleChange(member.user._id, e.target.value)}
                          className="text-xs border-0 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded-full px-2 py-1"
                        >
                          <option value="admin">Admin</option>
                          <option value="member">Member</option>
                        </select>
                      )}
                      {member.role === 'admin' && !canChangeRole(member.role) && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                          <Shield size={12} className="mr-1" />
                          Admin
                        </span>
                      )}
                      {member.role === 'member' && canChangeRole(member.role) && (
                        <select
                          value={member.role}
                          onChange={(e) => handleRoleChange(member.user._id, e.target.value)}
                          className="text-xs border-0 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 rounded-full px-2 py-1"
                        >
                          <option value="member">Member</option>
                          <option value="admin">Admin</option>
                        </select>
                      )}
                      {member.role === 'member' && !canChangeRole(member.role) && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                          <Users size={12} className="mr-1" />
                          Member
                        </span>
                      )}
                    </div>

                    {/* Remove Button */}
                    {canManageMembers() && 
                     member.role !== 'owner' && 
                     member.user._id !== user._id && (
                      <button
                        onClick={() => handleRemoveMember(member.user._id)}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        title="Remove member"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleClose}
            className="btn-secondary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default TeamMembersModal
