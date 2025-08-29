import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import teamService from '../../services/teamService'
import toast from 'react-hot-toast'

// Fetch user's teams
export const fetchTeams = createAsyncThunk(
  'teams/fetchTeams',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await teamService.getTeams(params)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch teams')
    }
  }
)

// Fetch single team
export const fetchTeam = createAsyncThunk(
  'teams/fetchTeam',
  async (teamId, { rejectWithValue }) => {
    try {
      const response = await teamService.getTeam(teamId)
      return response.data.team
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch team')
    }
  }
)

// Create new team
export const createTeam = createAsyncThunk(
  'teams/createTeam',
  async (teamData, { rejectWithValue }) => {
    try {
      const response = await teamService.createTeam(teamData)
      toast.success('Team created successfully!')
      return response.data.team
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create team'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

// Update team
export const updateTeam = createAsyncThunk(
  'teams/updateTeam',
  async ({ teamId, teamData }, { rejectWithValue }) => {
    try {
      const response = await teamService.updateTeam(teamId, teamData)
      return response.data.team
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update team'
      return rejectWithValue(message)
    }
  }
)

// Delete team
export const deleteTeam = createAsyncThunk(
  'teams/deleteTeam',
  async (teamId, { rejectWithValue }) => {
    try {
      await teamService.deleteTeam(teamId)
      toast.success('Team deleted successfully!')
      return teamId
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete team'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

// Add member to team
export const addTeamMember = createAsyncThunk(
  'teams/addMember',
  async ({ teamId, userId, role }, { rejectWithValue }) => {
    try {
      const response = await teamService.addMember(teamId, userId, role)
      toast.success('Member added successfully!')
      return response.data.team
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add member'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

// Remove member from team
export const removeTeamMember = createAsyncThunk(
  'teams/removeMember',
  async ({ teamId, memberId }, { rejectWithValue }) => {
    try {
      await teamService.removeMember(teamId, memberId)
      return { teamId, memberId }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to remove member'
      return rejectWithValue(message)
    }
  }
)

// Update member role
export const updateTeamMember = createAsyncThunk(
  'teams/updateMemberRole',
  async ({ teamId, memberId, role }, { rejectWithValue }) => {
    try {
      const response = await teamService.updateMemberRole(teamId, memberId, role)
      return response.data.team
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update member role'
      return rejectWithValue(message)
    }
  }
)

// Invite user to team
export const inviteToTeam = createAsyncThunk(
  'teams/inviteToTeam',
  async ({ teamId, email, role }, { rejectWithValue }) => {
    try {
      const response = await teamService.inviteToTeam(teamId, email, role)
      return response.data.invitation
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send invitation'
      return rejectWithValue(message)
    }
  }
)

// Fetch team invitations
export const fetchTeamInvitations = createAsyncThunk(
  'teams/fetchTeamInvitations',
  async (teamId, { rejectWithValue }) => {
    try {
      const response = await teamService.getTeamInvitations(teamId)
      return response.data.invitations
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch invitations'
      return rejectWithValue(message)
    }
  }
)

// Cancel invitation
export const cancelInvitation = createAsyncThunk(
  'teams/cancelInvitation',
  async (invitationId, { rejectWithValue }) => {
    try {
      await teamService.cancelInvitation(invitationId)
      return invitationId
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to cancel invitation'
      return rejectWithValue(message)
    }
  }
)

const initialState = {
  teams: [],
  currentTeam: null,
  invitations: [],
  isLoading: false,
  error: null,
  pagination: {
    current: 1,
    pages: 1,
    total: 0
  }
}

const teamsSlice = createSlice({
  name: 'teams',
  initialState,
  reducers: {
    clearCurrentTeam: (state) => {
      state.currentTeam = null
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Teams
      .addCase(fetchTeams.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchTeams.fulfilled, (state, action) => {
        state.isLoading = false
        state.teams = action.payload.teams
        state.pagination = action.payload.pagination
        state.error = null
      })
      .addCase(fetchTeams.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Fetch Team
      .addCase(fetchTeam.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchTeam.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentTeam = action.payload
        state.error = null
      })
      .addCase(fetchTeam.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Create Team
      .addCase(createTeam.pending, (state) => {
        state.isLoading = true
      })
      .addCase(createTeam.fulfilled, (state, action) => {
        state.isLoading = false
        state.teams.unshift(action.payload)
        state.error = null
      })
      .addCase(createTeam.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Update Team
      .addCase(updateTeam.pending, (state) => {
        state.isLoading = true
      })
      .addCase(updateTeam.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.teams.findIndex(team => team._id === action.payload._id)
        if (index !== -1) {
          state.teams[index] = action.payload
        }
        if (state.currentTeam && state.currentTeam._id === action.payload._id) {
          state.currentTeam = action.payload
        }
        state.error = null
      })
      .addCase(updateTeam.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Delete Team
      .addCase(deleteTeam.pending, (state) => {
        state.isLoading = true
      })
      .addCase(deleteTeam.fulfilled, (state, action) => {
        state.isLoading = false
        state.teams = state.teams.filter(team => team._id !== action.payload)
        if (state.currentTeam && state.currentTeam._id === action.payload) {
          state.currentTeam = null
        }
        state.error = null
      })
      .addCase(deleteTeam.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Add Member
      .addCase(addTeamMember.fulfilled, (state, action) => {
        const index = state.teams.findIndex(team => team._id === action.payload._id)
        if (index !== -1) {
          state.teams[index] = action.payload
        }
        if (state.currentTeam && state.currentTeam._id === action.payload._id) {
          state.currentTeam = action.payload
        }
      })
      
      // Remove Member
      .addCase(removeTeamMember.fulfilled, (state, action) => {
        const { teamId, memberId } = action.payload
        
        const teamIndex = state.teams.findIndex(team => team._id === teamId)
        if (teamIndex !== -1) {
          state.teams[teamIndex].members = state.teams[teamIndex].members.filter(
            member => member.user._id !== memberId
          )
        }
        
        if (state.currentTeam && state.currentTeam._id === teamId) {
          state.currentTeam.members = state.currentTeam.members.filter(
            member => member.user._id !== memberId
          )
        }
      })
      
      // Update Member Role
      .addCase(updateTeamMember.fulfilled, (state, action) => {
        const index = state.teams.findIndex(team => team._id === action.payload._id)
        if (index !== -1) {
          state.teams[index] = action.payload
        }
        if (state.currentTeam && state.currentTeam._id === action.payload._id) {
          state.currentTeam = action.payload
        }
      })

      // Fetch Team Invitations
      .addCase(fetchTeamInvitations.fulfilled, (state, action) => {
        state.invitations = action.payload
      })

      // Invite to Team
      .addCase(inviteToTeam.fulfilled, (state, action) => {
        state.invitations.push(action.payload)
      })

      // Cancel Invitation
      .addCase(cancelInvitation.fulfilled, (state, action) => {
        state.invitations = state.invitations.filter(
          invitation => invitation._id !== action.payload
        )
      })
  },
})

export const {
  clearCurrentTeam,
  clearError
} = teamsSlice.actions

export default teamsSlice.reducer
