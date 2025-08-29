const express = require('express');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const Team = require('../models/Team');
const User = require('../models/User');
const Board = require('../models/Board');
const Invitation = require('../models/Invitation');

const router = express.Router();

// @desc    Get all teams for user
// @route   GET /api/teams
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    
    const query = {
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id }
      ],
      isActive: true
    };

    // Apply search
    if (search) {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      });
    }

    const teams = await Team.find(query)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .populate('boards', 'title description background')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ updatedAt: -1 });

    const total = await Team.countDocuments(query);

    res.status(200).json({
      success: true,
      teams,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Get teams error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting teams'
    });
  }
});

// @desc    Get single team
// @route   GET /api/teams/:id
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .populate('boards', 'title description background visibility');

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Check if user is member of the team
    const isOwner = team.owner._id.toString() === req.user._id.toString();
    const isMember = team.members.some(member => 
      member.user._id.toString() === req.user._id.toString()
    );

    if (!isOwner && !isMember) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not a member of this team.'
      });
    }

    res.status(200).json({
      success: true,
      team
    });

  } catch (error) {
    console.error('Get team error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting team'
    });
  }
});

// @desc    Create new team
// @route   POST /api/teams
// @access  Private
router.post('/', [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Team name is required and must not exceed 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, description } = req.body;

    const team = await Team.create({
      name,
      description,
      owner: req.user._id,
      members: [{
        user: req.user._id,
        role: 'owner'
      }]
    });

    // Add team to user's teams array
    await User.findByIdAndUpdate(req.user._id, {
      $push: { teams: team._id }
    });

    const populatedTeam = await Team.findById(team._id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    res.status(201).json({
      success: true,
      message: 'Team created successfully',
      team: populatedTeam
    });

  } catch (error) {
    console.error('Create team error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating team'
    });
  }
});

// @desc    Update team
// @route   PUT /api/teams/:id
// @access  Private
router.put('/:id', [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Team name must not exceed 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Check if user has permission to update
    const userMember = team.members.find(member => 
      member.user.toString() === req.user._id.toString()
    );
    
    if (!userMember || (userMember.role !== 'owner' && userMember.role !== 'admin')) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this team'
      });
    }

    const { name, description } = req.body;
    const updateFields = {};

    if (name) updateFields.name = name;
    if (description !== undefined) updateFields.description = description;

    const updatedTeam = await Team.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    )
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar');

    res.status(200).json({
      success: true,
      message: 'Team updated successfully',
      team: updatedTeam
    });

  } catch (error) {
    console.error('Update team error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating team'
    });
  }
});

// @desc    Delete team
// @route   DELETE /api/teams/:id
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Only owner can delete the team
    if (team.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the team owner can delete this team'
      });
    }

    // Update all team boards to remove team reference
    await Board.updateMany(
      { team: req.params.id },
      { $unset: { team: 1 } }
    );

    // Remove team from users' teams arrays
    await User.updateMany(
      { teams: req.params.id },
      { $pull: { teams: req.params.id } }
    );

    // Delete the team
    await Team.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Team deleted successfully'
    });

  } catch (error) {
    console.error('Delete team error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting team'
    });
  }
});

// @desc    Add member to team
// @route   POST /api/teams/:id/members
// @access  Private
router.post('/:id/members', [
  body('userId')
    .isMongoId()
    .withMessage('Valid user ID is required'),
  body('role')
    .optional()
    .isIn(['admin', 'member'])
    .withMessage('Role must be admin or member')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    const { userId, role = 'member' } = req.body;

    // Check if user has permission to add members
    const userMember = team.members.find(member => 
      member.user.toString() === req.user._id.toString()
    );
    
    if (!userMember || (userMember.role !== 'owner' && userMember.role !== 'admin')) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to add members to this team'
      });
    }

    // Check if user exists
    const userToAdd = await User.findById(userId);
    if (!userToAdd) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is already a member
    const existingMember = team.members.find(member => 
      member.user.toString() === userId
    );
    
    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member of this team'
      });
    }

    // Add member to team
    team.members.push({
      user: userId,
      role
    });

    await team.save();

    // Add team to user's teams array
    await User.findByIdAndUpdate(userId, {
      $addToSet: { teams: team._id }
    });

    const updatedTeam = await Team.findById(team._id)
      .populate('members.user', 'name email avatar');

    res.status(200).json({
      success: true,
      message: 'Member added successfully',
      team: updatedTeam
    });

  } catch (error) {
    console.error('Add team member error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding team member'
    });
  }
});

// @desc    Remove member from team
// @route   DELETE /api/teams/:id/members/:userId
// @access  Private
router.delete('/:id/members/:userId', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    const { userId } = req.params;

    // Check if user has permission to remove members
    const userMember = team.members.find(member => 
      member.user.toString() === req.user._id.toString()
    );
    
    // Users can remove themselves, or owners/admins can remove others
    const canRemove = userId === req.user._id.toString() || 
                     (userMember && (userMember.role === 'owner' || userMember.role === 'admin'));
    
    if (!canRemove) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to remove this member'
      });
    }

    // Cannot remove the owner
    if (team.owner.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove the team owner'
      });
    }

    // Remove member from team
    team.members = team.members.filter(member => 
      member.user.toString() !== userId
    );

    await team.save();

    // Remove team from user's teams array
    await User.findByIdAndUpdate(userId, {
      $pull: { teams: team._id }
    });

    res.status(200).json({
      success: true,
      message: 'Member removed successfully'
    });

  } catch (error) {
    console.error('Remove team member error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error removing team member'
    });
  }
});

// @desc    Update member role
// @route   PUT /api/teams/:id/members/:userId/role
// @access  Private
router.put('/:id/members/:userId/role', [
  body('role')
    .isIn(['admin', 'member'])
    .withMessage('Role must be admin or member')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    const { userId } = req.params;
    const { role } = req.body;

    // Check if user has permission (only owner can change roles)
    if (team.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the team owner can change member roles'
      });
    }

    // Cannot change owner's role
    if (team.owner.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot change the team owner\'s role'
      });
    }

    // Find and update member role
    const memberIndex = team.members.findIndex(member => 
      member.user.toString() === userId
    );

    if (memberIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Member not found in team'
      });
    }

    team.members[memberIndex].role = role;
    await team.save();

    const updatedTeam = await Team.findById(team._id)
      .populate('members.user', 'name email avatar');

    res.status(200).json({
      success: true,
      message: 'Member role updated successfully',
      team: updatedTeam
    });

  } catch (error) {
    console.error('Update member role error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating member role'
    });
  }
});

// @desc    Invite user to team
// @route   POST /api/teams/:id/invite
// @access  Private
router.post('/:id/invite', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('role')
    .optional()
    .isIn(['admin', 'member'])
    .withMessage('Role must be admin or member'),
  body('message')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Message must not exceed 500 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    const { email, role = 'member', message } = req.body;

    // Check if user has permission to invite
    const userMember = team.members.find(member => 
      member.user.toString() === req.user._id.toString()
    );
    
    if (!userMember || (userMember.role !== 'owner' && userMember.role !== 'admin')) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to invite members to this team'
      });
    }

    // Check if user already exists and is a member
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const existingMember = team.members.find(member => 
        member.user.toString() === existingUser._id.toString()
      );
      
      if (existingMember) {
        return res.status(400).json({
          success: false,
          message: 'User is already a member of this team'
        });
      }
    }

    // Check if there's already a pending invitation
    const existingInvitation = await Invitation.findOne({
      email,
      team: team._id,
      status: 'pending'
    });

    if (existingInvitation) {
      return res.status(400).json({
        success: false,
        message: 'An invitation has already been sent to this email'
      });
    }

    // Generate invitation token
    const token = crypto.randomBytes(32).toString('hex');

    // Create invitation
    const invitation = await Invitation.create({
      email,
      team: team._id,
      inviter: req.user._id,
      role,
      token,
      message
    });

    // TODO: Send email notification here
    console.log(`Team invitation sent to ${email} for team "${team.name}"`);
    console.log(`Invitation URL: ${process.env.CLIENT_URL}/invite/${token}`);

    res.status(200).json({
      success: true,
      message: 'Invitation sent successfully',
      invitation: {
        id: invitation._id,
        email: invitation.email,
        role: invitation.role,
        status: invitation.status,
        expiresAt: invitation.expiresAt
      }
    });

  } catch (error) {
    console.error('Send team invitation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error sending invitation'
    });
  }
});

// @desc    Get team invitations
// @route   GET /api/teams/:id/invitations
// @access  Private
router.get('/:id/invitations', async (req, res) => {
  try {
    const teamId = req.params.id;

    // Find team and check permissions
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Check if user has permission to view invitations
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

// @desc    Accept team invitation
// @route   POST /api/teams/invite/:token/accept
// @access  Public
router.post('/invite/:token/accept', async (req, res) => {
  try {
    const { token } = req.params;

    // Find the invitation
    const invitation = await Invitation.findOne({
      token,
      status: 'pending',
      expiresAt: { $gt: new Date() }
    }).populate('team');

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired invitation'
      });
    }

    const team = invitation.team;

    // Check if user exists
    let user = await User.findOne({ email: invitation.email });
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Please create an account first to accept this invitation',
        email: invitation.email
      });
    }

    // Check if user is already a member
    const existingMember = team.members.find(member => 
      member.user.toString() === user._id.toString()
    );
    
    if (existingMember) {
      // Mark invitation as accepted even if already a member
      invitation.status = 'accepted';
      await invitation.save();
      
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this team'
      });
    }

    // Add user to team
    team.members.push({
      user: user._id,
      role: invitation.role
    });

    await team.save();

    // Add team to user's teams array
    await User.findByIdAndUpdate(user._id, {
      $addToSet: { teams: team._id }
    });

    // Update invitation status
    invitation.status = 'accepted';
    await invitation.save();

    res.status(200).json({
      success: true,
      message: 'Invitation accepted successfully',
      team: {
        id: team._id,
        name: team.name,
        description: team.description
      }
    });

  } catch (error) {
    console.error('Accept team invitation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error accepting invitation'
    });
  }
});

// @desc    Decline team invitation
// @route   POST /api/teams/invite/:token/decline
// @access  Public
router.post('/invite/:token/decline', async (req, res) => {
  try {
    const { token } = req.params;

    // Find the invitation
    const invitation = await Invitation.findOne({
      token,
      status: 'pending'
    });

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invalid invitation'
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
    console.error('Decline team invitation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error declining invitation'
    });
  }
});

// @desc    Get team invitations
// @route   GET /api/teams/:id/invitations
// @access  Private
router.get('/:id/invitations', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Check if user has permission to view invitations
    const userMember = team.members.find(member => 
      member.user.toString() === req.user._id.toString()
    );
    
    if (!userMember || (userMember.role !== 'owner' && userMember.role !== 'admin')) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view team invitations'
      });
    }

    const invitations = await Invitation.find({
      team: req.params.id
    })
    .populate('inviter', 'name email avatar')
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      invitations
    });

  } catch (error) {
    console.error('Get team invitations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching invitations'
    });
  }
});

module.exports = router;
