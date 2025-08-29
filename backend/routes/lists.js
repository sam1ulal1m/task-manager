const express = require('express');
const { body, validationResult } = require('express-validator');
const List = require('../models/List');
const Board = require('../models/Board');
const Card = require('../models/Card');
const { checkBoardAccess } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all lists for a board
// @route   GET /api/lists/board/:boardId
// @access  Private
router.get('/board/:boardId', checkBoardAccess, async (req, res) => {
  try {
    const lists = await List.find({ 
      board: req.params.boardId,
      isArchived: false 
    })
    .populate({
      path: 'cards',
      match: { isArchived: false },
      populate: {
        path: 'assignedMembers',
        select: 'name email avatar'
      }
    })
    .sort({ position: 1 });

    res.status(200).json({
      success: true,
      lists
    });

  } catch (error) {
    console.error('Get lists error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting lists'
    });
  }
});

// @desc    Create new list
// @route   POST /api/lists
// @access  Private
router.post('/', [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('List title is required and must not exceed 100 characters'),
  body('boardId')
    .isMongoId()
    .withMessage('Valid board ID is required')
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

    const { title, boardId } = req.body;

    // Check if board exists and user has access
    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found'
      });
    }

    // Check if user has access to the board
    const isOwner = board.owner.toString() === req.user._id.toString();
    const isMember = board.members.some(member => 
      member.user.toString() === req.user._id.toString()
    );

    if (!isOwner && !isMember && board.visibility === 'private') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to access this board.'
      });
    }

    // Get the position for the new list
    const lastList = await List.findOne({ board: boardId })
      .sort({ position: -1 });
    
    const position = lastList ? lastList.position + 1 : 0;

    const list = await List.create({
      title,
      board: boardId,
      position
    });

    // Add list to board's lists array
    await Board.findByIdAndUpdate(boardId, {
      $push: { lists: list._id }
    });

    // Add activity to board
    await Board.findByIdAndUpdate(boardId, {
      $push: {
        activity: {
          user: req.user._id,
          action: 'added a list to the board',
          details: { listTitle: title }
        }
      }
    });

    const populatedList = await List.findById(list._id)
      .populate('cards');

    // Emit real-time event
    req.io.to(`board-${boardId}`).emit('list-created', {
      list: populatedList,
      user: req.user
    });

    res.status(201).json({
      success: true,
      message: 'List created successfully',
      list: populatedList
    });

  } catch (error) {
    console.error('Create list error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating list'
    });
  }
});

// @desc    Update list
// @route   PUT /api/lists/:id
// @access  Private
router.put('/:id', [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('List title must not exceed 100 characters'),
  body('position')
    .optional()
    .isNumeric()
    .withMessage('Position must be a number')
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

    const list = await List.findById(req.params.id);
    if (!list) {
      return res.status(404).json({
        success: false,
        message: 'List not found'
      });
    }

    // Check board access
    const board = await Board.findById(list.board);
    const isOwner = board.owner.toString() === req.user._id.toString();
    const isMember = board.members.some(member => 
      member.user.toString() === req.user._id.toString()
    );

    if (!isOwner && !isMember) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const { title, position } = req.body;
    const updateFields = {};

    if (title) updateFields.title = title;
    if (typeof position === 'number') updateFields.position = position;

    const updatedList = await List.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    ).populate('cards');

    // Add activity to board if title changed
    if (title) {
      await Board.findByIdAndUpdate(list.board, {
        $push: {
          activity: {
            user: req.user._id,
            action: 'updated list title',
            details: { 
              listId: list._id,
              oldTitle: list.title,
              newTitle: title 
            }
          }
        }
      });
    }

    // Emit real-time event
    req.io.to(`board-${list.board}`).emit('list-updated', {
      list: updatedList,
      user: req.user,
      changes: updateFields
    });

    res.status(200).json({
      success: true,
      message: 'List updated successfully',
      list: updatedList
    });

  } catch (error) {
    console.error('Update list error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating list'
    });
  }
});

// @desc    Delete list
// @route   DELETE /api/lists/:id
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const list = await List.findById(req.params.id);
    if (!list) {
      return res.status(404).json({
        success: false,
        message: 'List not found'
      });
    }

    // Check board access
    const board = await Board.findById(list.board);
    const isOwner = board.owner.toString() === req.user._id.toString();
    const userMember = board.members.find(member => 
      member.user.toString() === req.user._id.toString()
    );

    if (!isOwner && (!userMember || userMember.role === 'observer')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Delete all cards in the list
    await Card.deleteMany({ list: req.params.id });

    // Remove list from board's lists array
    await Board.findByIdAndUpdate(list.board, {
      $pull: { lists: req.params.id }
    });

    // Add activity to board
    await Board.findByIdAndUpdate(list.board, {
      $push: {
        activity: {
          user: req.user._id,
          action: 'deleted a list',
          details: { listTitle: list.title }
        }
      }
    });

    await List.findByIdAndDelete(req.params.id);

    // Emit real-time event
    req.io.to(`board-${list.board}`).emit('list-deleted', {
      listId: req.params.id,
      user: req.user
    });

    res.status(200).json({
      success: true,
      message: 'List deleted successfully'
    });

  } catch (error) {
    console.error('Delete list error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting list'
    });
  }
});

// @desc    Archive/Unarchive list
// @route   PUT /api/lists/:id/archive
// @access  Private
router.put('/:id/archive', async (req, res) => {
  try {
    const list = await List.findById(req.params.id);
    if (!list) {
      return res.status(404).json({
        success: false,
        message: 'List not found'
      });
    }

    // Check board access
    const board = await Board.findById(list.board);
    const isOwner = board.owner.toString() === req.user._id.toString();
    const userMember = board.members.find(member => 
      member.user.toString() === req.user._id.toString()
    );

    if (!isOwner && (!userMember || userMember.role === 'observer')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    list.isArchived = !list.isArchived;
    await list.save();

    // Add activity to board
    await Board.findByIdAndUpdate(list.board, {
      $push: {
        activity: {
          user: req.user._id,
          action: list.isArchived ? 'archived a list' : 'unarchived a list',
          details: { listTitle: list.title }
        }
      }
    });

    // Emit real-time event
    req.io.to(`board-${list.board}`).emit('list-archived', {
      listId: req.params.id,
      isArchived: list.isArchived,
      user: req.user
    });

    res.status(200).json({
      success: true,
      message: `List ${list.isArchived ? 'archived' : 'unarchived'} successfully`,
      list
    });

  } catch (error) {
    console.error('Archive list error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error archiving list'
    });
  }
});

// @desc    Move list to different position
// @route   PUT /api/lists/:id/move
// @access  Private
router.put('/:id/move', [
  body('newPosition')
    .isNumeric()
    .withMessage('New position is required and must be a number')
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

    const { newPosition } = req.body;
    
    const list = await List.findById(req.params.id);
    if (!list) {
      return res.status(404).json({
        success: false,
        message: 'List not found'
      });
    }

    // Check board access
    const board = await Board.findById(list.board);
    const isOwner = board.owner.toString() === req.user._id.toString();
    const isMember = board.members.some(member => 
      member.user.toString() === req.user._id.toString()
    );

    if (!isOwner && !isMember) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const oldPosition = list.position;

    if (newPosition > oldPosition) {
      // Moving right - decrease position of lists in between
      await List.updateMany(
        {
          board: list.board,
          position: { $gt: oldPosition, $lte: newPosition }
        },
        { $inc: { position: -1 } }
      );
    } else if (newPosition < oldPosition) {
      // Moving left - increase position of lists in between
      await List.updateMany(
        {
          board: list.board,
          position: { $gte: newPosition, $lt: oldPosition }
        },
        { $inc: { position: 1 } }
      );
    }

    // Update the list's position
    list.position = newPosition;
    await list.save();

    // Emit real-time event
    req.io.to(`board-${list.board}`).emit('list-moved', {
      listId: req.params.id,
      oldPosition,
      newPosition,
      user: req.user
    });

    res.status(200).json({
      success: true,
      message: 'List moved successfully',
      list
    });

  } catch (error) {
    console.error('Move list error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error moving list'
    });
  }
});

module.exports = router;
