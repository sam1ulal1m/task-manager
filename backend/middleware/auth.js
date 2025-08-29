const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from database
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Token is valid but user not found'
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'User account is deactivated'
        });
      }

      // Add user to request object
      req.user = user;
      next();

    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error in auth middleware'
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`
      });
    }
    next();
  };
};

const checkBoardAccess = async (req, res, next) => {
  try {
    const { boardId } = req.params;
    const Board = require('../models/Board');
    
    const board = await Board.findById(boardId);
    
    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found'
      });
    }

    // Check if user is owner or member of the board
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

    req.board = board;
    next();

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error in board access middleware'
    });
  }
};

module.exports = {
  protect,
  authorize,
  checkBoardAccess
};
