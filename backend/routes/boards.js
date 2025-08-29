const express = require('express');
const { body, validationResult } = require('express-validator');
const Board = require('../models/Board');
const List = require('../models/List');
const Card = require('../models/Card');
const User = require('../models/User');
const { checkBoardAccess } = require('../middleware/auth');

const router = express.Router();

// @desc    Get public boards
// @route   GET /api/boards/public
// @access  Public
router.get('/public', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    
    let query = {
      visibility: 'public',
      isArchived: false
    };

    // Apply search
    if (search) {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      });
    }

    const boards = await Board.find(query)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .populate('team', 'name')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ updatedAt: -1 });

    const total = await Board.countDocuments(query);

    res.status(200).json({
      success: true,
      boards,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get public boards error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching public boards'
    });
  }
});

// @desc    Get all boards for user
// @route   GET /api/boards
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', filter = 'all' } = req.query;
    
    let query = {
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id }
      ],
      isArchived: false
    };

    // Apply filters
    if (filter === 'owned') {
      query = { owner: req.user._id, isArchived: false };
    } else if (filter === 'member') {
      query = { 
        'members.user': req.user._id, 
        owner: { $ne: req.user._id },
        isArchived: false 
      };
    } else if (filter === 'favorite') {
      query.isFavorite = req.user._id;
    }

    // Apply search
    if (search) {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      });
    }

    const boards = await Board.find(query)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .populate('team', 'name')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ updatedAt: -1 });

    const total = await Board.countDocuments(query);

    res.status(200).json({
      success: true,
      boards,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Get boards error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting boards'
    });
  }
});

// @desc    Get single board
// @route   GET /api/boards/:id
// @access  Private
router.get('/:boardId', checkBoardAccess, async (req, res) => {
  try {
    const board = await Board.findById(req.params.boardId)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .populate('team', 'name description')
      .populate({
        path: 'lists',
        populate: {
          path: 'cards',
          populate: {
            path: 'assignedMembers',
            select: 'name email avatar'
          }
        }
      });

    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found'
      });
    }

    res.status(200).json({
      success: true,
      board
    });

  } catch (error) {
    console.error('Get board error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting board'
    });
  }
});

// @desc    Create new board
// @route   POST /api/boards
// @access  Private
router.post('/', [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Board title is required and must not exceed 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('background')
    .optional()
    .isString()
    .withMessage('Background must be a string'),
  body('visibility')
    .optional()
    .isIn(['private', 'team', 'public'])
    .withMessage('Visibility must be private, team, or public')
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

    const { title, description, background, visibility, team } = req.body;

    const board = await Board.create({
      title,
      description,
      background: background || '#0079bf',
      visibility: visibility || 'private',
      owner: req.user._id,
      team,
      members: [{
        user: req.user._id,
        role: 'owner'
      }],
      activity: [{
        user: req.user._id,
        action: 'created the board',
        details: { boardTitle: title }
      }]
    });

    // Add board to user's boards array
    await User.findByIdAndUpdate(req.user._id, {
      $push: { boards: board._id }
    });

    const populatedBoard = await Board.findById(board._id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    // Emit real-time event
    req.io.emit('board-created', {
      board: populatedBoard,
      user: req.user
    });

    res.status(201).json({
      success: true,
      message: 'Board created successfully',
      board: populatedBoard
    });

  } catch (error) {
    console.error('Create board error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating board'
    });
  }
});

// @desc    Update board
// @route   PUT /api/boards/:id
// @access  Private
router.put('/:boardId', checkBoardAccess, [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Board title must not exceed 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('background')
    .optional()
    .isString()
    .withMessage('Background must be a string'),
  body('visibility')
    .optional()
    .isIn(['private', 'team', 'public'])
    .withMessage('Visibility must be private, team, or public')
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

    const board = req.board;
    
    // Check if user has permission to update
    const userMember = board.members.find(member => 
      member.user.toString() === req.user._id.toString()
    );
    
    if (!userMember || (userMember.role !== 'owner' && userMember.role !== 'admin')) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this board'
      });
    }

    const { title, description, background, visibility } = req.body;
    const updateFields = {};

    if (title) updateFields.title = title;
    if (description !== undefined) updateFields.description = description;
    if (background) updateFields.background = background;
    if (visibility) updateFields.visibility = visibility;

    const updatedBoard = await Board.findByIdAndUpdate(
      req.params.boardId,
      updateFields,
      { new: true, runValidators: true }
    )
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar');

    // Add activity
    if (Object.keys(updateFields).length > 0) {
      await Board.findByIdAndUpdate(req.params.boardId, {
        $push: {
          activity: {
            user: req.user._id,
            action: 'updated the board',
            details: updateFields
          }
        }
      });
    }

    // Emit real-time event
    req.io.to(`board-${req.params.boardId}`).emit('board-updated', {
      board: updatedBoard,
      user: req.user,
      changes: updateFields
    });

    res.status(200).json({
      success: true,
      message: 'Board updated successfully',
      board: updatedBoard
    });

  } catch (error) {
    console.error('Update board error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating board'
    });
  }
});

// @desc    Delete board
// @route   DELETE /api/boards/:id
// @access  Private
router.delete('/:boardId', checkBoardAccess, async (req, res) => {
  try {
    const board = req.board;
    
    // Only owner can delete the board
    if (board.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the board owner can delete this board'
      });
    }

    // Delete all cards in the board
    await Card.deleteMany({ board: req.params.boardId });
    
    // Delete all lists in the board
    await List.deleteMany({ board: req.params.boardId });
    
    // Remove board from users' boards arrays
    await User.updateMany(
      { boards: req.params.boardId },
      { $pull: { boards: req.params.boardId } }
    );

    // Delete the board
    await Board.findByIdAndDelete(req.params.boardId);

    // Emit real-time event
    req.io.emit('board-deleted', {
      boardId: req.params.boardId,
      user: req.user
    });

    res.status(200).json({
      success: true,
      message: 'Board deleted successfully'
    });

  } catch (error) {
    console.error('Delete board error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting board'
    });
  }
});

// @desc    Add member to board
// @route   POST /api/boards/:id/members
// @access  Private
router.post('/:boardId/members', checkBoardAccess, [
  body('userId')
    .isMongoId()
    .withMessage('Valid user ID is required'),
  body('role')
    .optional()
    .isIn(['admin', 'member', 'observer'])
    .withMessage('Role must be admin, member, or observer')
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

    const board = req.board;
    const { userId, role = 'member' } = req.body;

    // Check if user has permission to add members
    const userMember = board.members.find(member => 
      member.user.toString() === req.user._id.toString()
    );
    
    if (!userMember || (userMember.role !== 'owner' && userMember.role !== 'admin')) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to add members to this board'
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
    const existingMember = board.members.find(member => 
      member.user.toString() === userId
    );
    
    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member of this board'
      });
    }

    // Add member to board
    board.members.push({
      user: userId,
      role
    });

    // Add activity
    board.activity.push({
      user: req.user._id,
      action: 'added a member to the board',
      details: { 
        addedUser: userToAdd.name,
        role 
      }
    });

    await board.save();

    // Add board to user's boards array
    await User.findByIdAndUpdate(userId, {
      $addToSet: { boards: board._id }
    });

    const updatedBoard = await Board.findById(board._id)
      .populate('members.user', 'name email avatar');

    // Emit real-time event
    req.io.to(`board-${board._id}`).emit('member-added', {
      board: updatedBoard,
      newMember: userToAdd,
      addedBy: req.user
    });

    res.status(200).json({
      success: true,
      message: 'Member added successfully',
      board: updatedBoard
    });

  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding member'
    });
  }
});

// @desc    Remove member from board
// @route   DELETE /api/boards/:id/members/:userId
// @access  Private
router.delete('/:boardId/members/:userId', checkBoardAccess, async (req, res) => {
  try {
    const board = req.board;
    const { userId } = req.params;

    // Check if user has permission to remove members
    const userMember = board.members.find(member => 
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
    if (board.owner.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove the board owner'
      });
    }

    // Remove member from board
    board.members = board.members.filter(member => 
      member.user.toString() !== userId
    );

    // Add activity
    const removedUser = await User.findById(userId);
    board.activity.push({
      user: req.user._id,
      action: 'removed a member from the board',
      details: { 
        removedUser: removedUser.name 
      }
    });

    await board.save();

    // Remove board from user's boards array
    await User.findByIdAndUpdate(userId, {
      $pull: { boards: board._id }
    });

    // Emit real-time event
    req.io.to(`board-${board._id}`).emit('member-removed', {
      boardId: board._id,
      removedUserId: userId,
      removedBy: req.user
    });

    res.status(200).json({
      success: true,
      message: 'Member removed successfully'
    });

  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error removing member'
    });
  }
});

// @desc    Toggle board favorite
// @route   PUT /api/boards/:id/favorite
// @access  Private
router.put('/:boardId/favorite', checkBoardAccess, async (req, res) => {
  try {
    const board = req.board;
    const userId = req.user._id;

    const isFavorite = board.isFavorite.includes(userId);

    if (isFavorite) {
      // Remove from favorites
      board.isFavorite = board.isFavorite.filter(id => 
        id.toString() !== userId.toString()
      );
    } else {
      // Add to favorites
      board.isFavorite.push(userId);
    }

    await board.save();

    res.status(200).json({
      success: true,
      message: `Board ${isFavorite ? 'removed from' : 'added to'} favorites`,
      isFavorite: !isFavorite
    });

  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error toggling favorite'
    });
  }
});

module.exports = router;
