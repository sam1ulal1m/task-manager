import api from './api'

const teamService = {
  // Get all teams for user
  getTeams: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return await api.get(`/teams?${queryString}`)
  },

  // Get single team
  getTeam: async (teamId) => {
    return await api.get(`/teams/${teamId}`)
  },

  // Create new team
  createTeam: async (teamData) => {
    return await api.post('/teams', teamData)
  },

  // Update team
  updateTeam: async (teamId, updates) => {
    return await api.put(`/teams/${teamId}`, updates)
  },

  // Delete team
  deleteTeam: async (teamId) => {
    return await api.delete(`/teams/${teamId}`)
  },

  // Add member to team
  addMember: async (teamId, userId, role = 'member') => {
    return await api.post(`/teams/${teamId}/members`, { userId, role })
  },

  // Remove member from team
  removeMember: async (teamId, userId) => {
    return await api.delete(`/teams/${teamId}/members/${userId}`)
  },

  // Update member role
  updateMemberRole: async (teamId, userId, role) => {
    return await api.put(`/teams/${teamId}/members/${userId}/role`, { role })
  },
}

export default teamService
