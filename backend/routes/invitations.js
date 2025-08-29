const express = require('express');
const Invitation = require('../models/Invitation');
const Team = require('../models/Team');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Get team invitations
// @route   GET /api/teams/:teamId/invitations
// @access  Private
router.get('/:teamId/invitations', protect, async (req, res) => {
  try {
    const { teamId } = req.params;

    // Check if user has permission to view invitations
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Check if user is owner or admin
    const userMember = team.members.find(member => 
      member.user.toString() === req.user._id.toString()
    );

    if (!userMember || (userMember.role !== 'owner' && userMember.role !== 'admin')) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view invitations for this team'
      });
    }

    const invitations = await Invitation.find({
      team: teamId,
      status: 'pending'
    })
    .populate('inviter', 'name email')
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      invitations
    });
  } catch (error) {
    console.error('Get team invitations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Cancel invitation
// @route   DELETE /api/invitations/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const invitation = await Invitation.findById(req.params.id)
      .populate('team');

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invitation not found'
      });
    }

    // Check if user has permission to cancel invitation
    const team = invitation.team;
    const userMember = team.members.find(member => 
      member.user.toString() === req.user._id.toString()
    );

    if (!userMember || (userMember.role !== 'owner' && userMember.role !== 'admin')) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to cancel this invitation'
      });
    }

    await Invitation.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Invitation cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel invitation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Accept invitation
// @route   POST /api/invitations/:id/accept
// @access  Private
router.post('/:id/accept', protect, async (req, res) => {
  try {
    const invitation = await Invitation.findById(req.params.id)
      .populate('team');

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invitation not found'
      });
    }

    if (invitation.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Invitation is no longer valid'
      });
    }

    // Check if invitation is for the current user
    if (invitation.email !== req.user.email) {
      return res.status(403).json({
        success: false,
        message: 'This invitation is not for you'
      });
    }

    const team = invitation.team;

    // Check if user is already a member
    const existingMember = team.members.find(member => 
      member.user.toString() === req.user._id.toString()
    );

    if (existingMember) {
      // Update invitation status
      invitation.status = 'accepted';
      await invitation.save();

      return res.status(400).json({
        success: false,
        message: 'You are already a member of this team'
      });
    }

    // Add user to team
    team.members.push({
      user: req.user._id,
      role: invitation.role,
      joinedAt: new Date()
    });

    await team.save();

    // Update invitation status
    invitation.status = 'accepted';
    await invitation.save();

    const updatedTeam = await Team.findById(team._id)
      .populate('members.user', 'name email avatar')
      .populate('boards', 'title description');

    res.status(200).json({
      success: true,
      message: 'Invitation accepted successfully',
      team: updatedTeam
    });
  } catch (error) {
    console.error('Accept invitation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Decline invitation
// @route   POST /api/invitations/:id/decline
// @access  Private
router.post('/:id/decline', protect, async (req, res) => {
  try {
    const invitation = await Invitation.findById(req.params.id);

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invitation not found'
      });
    }

    if (invitation.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Invitation is no longer valid'
      });
    }

    // Check if invitation is for the current user
    if (invitation.email !== req.user.email) {
      return res.status(403).json({
        success: false,
        message: 'This invitation is not for you'
      });
    }

    // Update invitation status
    invitation.status = 'declined';
    await invitation.save();

    res.status(200).json({
      success: true,
      message: 'Invitation declined'
    });
  } catch (error) {
    console.error('Decline invitation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
