const express = require('express');
const { body, validationResult } = require('express-validator');
const Card = require('../models/Card');
const List = require('../models/List');
const Board = require('../models/Board');
const User = require('../models/User');

const router = express.Router();

// @desc    Get all cards for a board
// @route   GET /api/cards/board/:boardId
// @access  Private
router.get('/board/:boardId', async (req, res) => {
  try {
    const board = await Board.findById(req.params.boardId);
    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found'
      });
    }

    // Check board access
    const isOwner = board.owner.toString() === req.user._id.toString();
    const isMember = board.members.some(member => 
      member.user.toString() === req.user._id.toString()
    );

    if (!isOwner && !isMember && board.visibility === 'private') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const cards = await Card.find({ 
      board: req.params.boardId,
      isArchived: false 
    })
    .populate('assignedMembers', 'name email avatar')
    .populate('comments.user', 'name email avatar')
    .sort({ position: 1 });

    res.status(200).json({
      success: true,
      cards
    });

  } catch (error) {
    console.error('Get board cards error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting cards'
    });
  }
});

// @desc    Get all cards for a list
// @route   GET /api/cards/list/:listId
// @access  Private
router.get('/list/:listId', async (req, res) => {
  try {
    const list = await List.findById(req.params.listId);
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

    if (!isOwner && !isMember && board.visibility === 'private') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const cards = await Card.find({ 
      list: req.params.listId,
      isArchived: false 
    })
    .populate('assignedMembers', 'name email avatar')
    .populate('comments.user', 'name email avatar')
    .sort({ position: 1 });

    res.status(200).json({
      success: true,
      cards
    });

  } catch (error) {
    console.error('Get cards error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting cards'
    });
  }
});

// @desc    Get single card
// @route   GET /api/cards/:id
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const card = await Card.findById(req.params.id)
      .populate('assignedMembers', 'name email avatar')
      .populate('comments.user', 'name email avatar')
      .populate('list', 'title')
      .populate('board', 'title');

    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Card not found'
      });
    }

    // Check board access
    const board = await Board.findById(card.board);
    const isOwner = board.owner.toString() === req.user._id.toString();
    const isMember = board.members.some(member => 
      member.user.toString() === req.user._id.toString()
    );

    if (!isOwner && !isMember && board.visibility === 'private') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      card
    });

  } catch (error) {
    console.error('Get card error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting card'
    });
  }
});

// @desc    Create new card
// @route   POST /api/cards
// @access  Private
router.post('/', [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Card title is required and must not exceed 200 characters'),
  body('listId')
    .isMongoId()
    .withMessage('Valid list ID is required')
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

    const { title, description, listId } = req.body;

    const list = await List.findById(listId);
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

    // Get the position for the new card
    const lastCard = await Card.findOne({ list: listId })
      .sort({ position: -1 });
    
    const position = lastCard ? lastCard.position + 1 : 0;

    const card = await Card.create({
      title,
      description,
      list: listId,
      board: list.board,
      position,
      activity: [{
        user: req.user._id,
        action: 'created this card',
        details: { cardTitle: title }
      }]
    });

    // Add card to list's cards array
    await List.findByIdAndUpdate(listId, {
      $push: { cards: card._id }
    });

    // Add activity to board
    await Board.findByIdAndUpdate(list.board, {
      $push: {
        activity: {
          user: req.user._id,
          action: 'added a card to the board',
          details: { 
            cardTitle: title,
            listTitle: list.title
          }
        }
      }
    });

    const populatedCard = await Card.findById(card._id)
      .populate('assignedMembers', 'name email avatar');

    // Emit real-time event
    req.io.to(`board-${list.board}`).emit('card-created', {
      card: populatedCard,
      user: req.user
    });

    res.status(201).json({
      success: true,
      message: 'Card created successfully',
      card: populatedCard
    });

  } catch (error) {
    console.error('Create card error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating card'
    });
  }
});

// @desc    Update card
// @route   PUT /api/cards/:id
// @access  Private
router.put('/:id', [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Card title must not exceed 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must not exceed 2000 characters')
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

    const card = await Card.findById(req.params.id);
    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Card not found'
      });
    }

    // Check board access
    const board = await Board.findById(card.board);
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

    const { 
      title, 
      description, 
      dueDate, 
      isCompleted, 
      priority, 
      labels 
    } = req.body;

    const updateFields = {};
    const changes = {};

    if (title) {
      updateFields.title = title;
      changes.title = { old: card.title, new: title };
    }
    if (description !== undefined) {
      updateFields.description = description;
      changes.description = { old: card.description, new: description };
    }
    if (dueDate !== undefined) {
      updateFields.dueDate = dueDate;
      changes.dueDate = { old: card.dueDate, new: dueDate };
    }
    if (typeof isCompleted === 'boolean') {
      updateFields.isCompleted = isCompleted;
      changes.isCompleted = { old: card.isCompleted, new: isCompleted };
    }
    if (priority) {
      updateFields.priority = priority;
      changes.priority = { old: card.priority, new: priority };
    }
    if (labels) {
      updateFields.labels = labels;
      changes.labels = { old: card.labels, new: labels };
    }

    const updatedCard = await Card.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    ).populate('assignedMembers', 'name email avatar');

    // Add activity to card
    if (Object.keys(changes).length > 0) {
      await Card.findByIdAndUpdate(req.params.id, {
        $push: {
          activity: {
            user: req.user._id,
            action: 'updated the card',
            details: changes
          }
        }
      });
    }

    // Emit real-time event
    req.io.to(`board-${card.board}`).emit('card-updated', {
      card: updatedCard,
      user: req.user,
      changes
    });

    res.status(200).json({
      success: true,
      message: 'Card updated successfully',
      card: updatedCard
    });

  } catch (error) {
    console.error('Update card error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating card'
    });
  }
});

// @desc    Delete card
// @route   DELETE /api/cards/:id
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);
    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Card not found'
      });
    }

    // Check board access
    const board = await Board.findById(card.board);
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

    // Remove card from list's cards array
    await List.findByIdAndUpdate(card.list, {
      $pull: { cards: req.params.id }
    });

    // Add activity to board
    await Board.findByIdAndUpdate(card.board, {
      $push: {
        activity: {
          user: req.user._id,
          action: 'deleted a card',
          details: { cardTitle: card.title }
        }
      }
    });

    await Card.findByIdAndDelete(req.params.id);

    // Emit real-time event
    req.io.to(`board-${card.board}`).emit('card-deleted', {
      cardId: req.params.id,
      user: req.user
    });

    res.status(200).json({
      success: true,
      message: 'Card deleted successfully'
    });

  } catch (error) {
    console.error('Delete card error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting card'
    });
  }
});

// @desc    Move card to different list/position
// @route   PUT /api/cards/:id/move
// @access  Private
router.put('/:id/move', [
  body('destinationListId')
    .isMongoId()
    .withMessage('Valid destination list ID is required'),
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

    const { destinationListId, newPosition } = req.body;
    
    const card = await Card.findById(req.params.id);
    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Card not found'
      });
    }

    const destinationList = await List.findById(destinationListId);
    if (!destinationList) {
      return res.status(404).json({
        success: false,
        message: 'Destination list not found'
      });
    }

    // Check board access
    const board = await Board.findById(card.board);
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

    const sourceListId = card.list.toString();
    const oldPosition = card.position;

    // If moving within the same list
    if (sourceListId === destinationListId) {
      if (newPosition > oldPosition) {
        // Moving down - decrease position of cards in between
        await Card.updateMany(
          {
            list: sourceListId,
            position: { $gt: oldPosition, $lte: newPosition }
          },
          { $inc: { position: -1 } }
        );
      } else if (newPosition < oldPosition) {
        // Moving up - increase position of cards in between
        await Card.updateMany(
          {
            list: sourceListId,
            position: { $gte: newPosition, $lt: oldPosition }
          },
          { $inc: { position: 1 } }
        );
      }
    } else {
      // Moving to different list
      
      // Decrease position of cards after the source position in source list
      await Card.updateMany(
        {
          list: sourceListId,
          position: { $gt: oldPosition }
        },
        { $inc: { position: -1 } }
      );

      // Increase position of cards at and after the destination position in destination list
      await Card.updateMany(
        {
          list: destinationListId,
          position: { $gte: newPosition }
        },
        { $inc: { position: 1 } }
      );

      // Remove card from source list
      await List.findByIdAndUpdate(sourceListId, {
        $pull: { cards: card._id }
      });

      // Add card to destination list
      await List.findByIdAndUpdate(destinationListId, {
        $push: { cards: card._id }
      });

      // Update card's list reference
      card.list = destinationListId;
    }

    // Update the card's position
    card.position = newPosition;
    await card.save();

    // Add activity to card
    await Card.findByIdAndUpdate(req.params.id, {
      $push: {
        activity: {
          user: req.user._id,
          action: sourceListId === destinationListId ? 'moved this card' : 'moved this card to another list',
          details: {
            sourceListId,
            destinationListId,
            oldPosition,
            newPosition
          }
        }
      }
    });

    // Emit real-time event
    req.io.to(`board-${card.board}`).emit('card-moved', {
      cardId: req.params.id,
      sourceListId,
      destinationListId,
      oldPosition,
      newPosition,
      user: req.user
    });

    res.status(200).json({
      success: true,
      message: 'Card moved successfully',
      card
    });

  } catch (error) {
    console.error('Move card error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error moving card'
    });
  }
});

// @desc    Assign member to card
// @route   POST /api/cards/:id/assign
// @access  Private
router.post('/:id/assign', [
  body('userId')
    .isMongoId()
    .withMessage('Valid user ID is required')
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

    const { userId } = req.body;
    
    const card = await Card.findById(req.params.id);
    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Card not found'
      });
    }

    // Check if user exists
    const userToAssign = await User.findById(userId);
    if (!userToAssign) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check board access
    const board = await Board.findById(card.board);
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

    // Check if user is already assigned
    if (card.assignedMembers.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'User is already assigned to this card'
      });
    }

    // Add user to assigned members
    card.assignedMembers.push(userId);

    // Add activity
    card.activity.push({
      user: req.user._id,
      action: 'assigned a member to this card',
      details: { assignedUser: userToAssign.name }
    });

    await card.save();

    const updatedCard = await Card.findById(card._id)
      .populate('assignedMembers', 'name email avatar');

    // Emit real-time event
    req.io.to(`board-${card.board}`).emit('card-member-assigned', {
      card: updatedCard,
      assignedUser: userToAssign,
      assignedBy: req.user
    });

    res.status(200).json({
      success: true,
      message: 'Member assigned successfully',
      card: updatedCard
    });

  } catch (error) {
    console.error('Assign member error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error assigning member'
    });
  }
});

// @desc    Unassign member from card
// @route   DELETE /api/cards/:id/assign/:userId
// @access  Private
router.delete('/:id/assign/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const card = await Card.findById(req.params.id);
    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Card not found'
      });
    }

    // Check board access
    const board = await Board.findById(card.board);
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

    // Remove user from assigned members
    card.assignedMembers = card.assignedMembers.filter(
      memberId => memberId.toString() !== userId
    );

    // Add activity
    const unassignedUser = await User.findById(userId);
    card.activity.push({
      user: req.user._id,
      action: 'unassigned a member from this card',
      details: { unassignedUser: unassignedUser?.name || 'Unknown User' }
    });

    await card.save();

    // Emit real-time event
    req.io.to(`board-${card.board}`).emit('card-member-unassigned', {
      cardId: card._id,
      unassignedUserId: userId,
      unassignedBy: req.user
    });

    res.status(200).json({
      success: true,
      message: 'Member unassigned successfully'
    });

  } catch (error) {
    console.error('Unassign member error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error unassigning member'
    });
  }
});

// @desc    Add comment to card
// @route   POST /api/cards/:id/comments
// @access  Private
router.post('/:id/comments', [
  body('text')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment text is required and must not exceed 1000 characters')
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

    const { text } = req.body;
    
    const card = await Card.findById(req.params.id);
    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Card not found'
      });
    }

    // Check board access
    const board = await Board.findById(card.board);
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

    // Add comment
    const comment = {
      user: req.user._id,
      text
    };

    card.comments.push(comment);

    // Add activity
    card.activity.push({
      user: req.user._id,
      action: 'commented on this card',
      details: { comment: text }
    });

    await card.save();

    const updatedCard = await Card.findById(card._id)
      .populate('comments.user', 'name email avatar');

    // Emit real-time event
    req.io.to(`board-${card.board}`).emit('card-comment-added', {
      cardId: card._id,
      comment: updatedCard.comments[updatedCard.comments.length - 1],
      user: req.user
    });

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      comment: updatedCard.comments[updatedCard.comments.length - 1]
    });

  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding comment'
    });
  }
});

module.exports = router;
