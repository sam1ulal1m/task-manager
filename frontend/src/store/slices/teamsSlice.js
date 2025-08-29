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
  async ({ teamId, updates }, { rejectWithValue }) => {
    try {
      const response = await teamService.updateTeam(teamId, updates)
      toast.success('Team updated successfully!')
      return response.data.team
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update team'
      toast.error(message)
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
  async ({ teamId, userId }, { rejectWithValue }) => {
    try {
      await teamService.removeMember(teamId, userId)
      toast.success('Member removed successfully!')
      return { teamId, userId }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to remove member'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

// Update member role
export const updateMemberRole = createAsyncThunk(
  'teams/updateMemberRole',
  async ({ teamId, userId, role }, { rejectWithValue }) => {
    try {
      const response = await teamService.updateMemberRole(teamId, userId, role)
      toast.success('Member role updated successfully!')
      return response.data.team
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update member role'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

const initialState = {
  teams: [],
  currentTeam: null,
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
        const { teamId, userId } = action.payload
        
        const teamIndex = state.teams.findIndex(team => team._id === teamId)
        if (teamIndex !== -1) {
          state.teams[teamIndex].members = state.teams[teamIndex].members.filter(
            member => member.user._id !== userId
          )
        }
        
        if (state.currentTeam && state.currentTeam._id === teamId) {
          state.currentTeam.members = state.currentTeam.members.filter(
            member => member.user._id !== userId
          )
        }
      })
      
      // Update Member Role
      .addCase(updateMemberRole.fulfilled, (state, action) => {
        const index = state.teams.findIndex(team => team._id === action.payload._id)
        if (index !== -1) {
          state.teams[index] = action.payload
        }
        if (state.currentTeam && state.currentTeam._id === action.payload._id) {
          state.currentTeam = action.payload
        }
      })
  },
})

export const {
  clearCurrentTeam,
  clearError
} = teamsSlice.actions

export default teamsSlice.reducer
