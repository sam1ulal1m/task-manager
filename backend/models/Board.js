const mongoose = require('mongoose');

const boardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Board title is required'],
    trim: true,
    maxlength: [100, 'Board title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  background: {
    type: String,
    default: '#0079bf' // Default Trello blue
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    default: null
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'member', 'observer'],
      default: 'member'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  lists: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'List'
  }],
  labels: [{
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: [50, 'Label name cannot exceed 50 characters']
    },
    color: {
      type: String,
      required: true,
      default: '#61bd4f'
    }
  }],
  visibility: {
    type: String,
    enum: ['private', 'team', 'public'],
    default: 'private'
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  isFavorite: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  activity: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    action: {
      type: String,
      required: true
    },
    details: {
      type: mongoose.Schema.Types.Mixed
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for better query performance
boardSchema.index({ owner: 1 });
boardSchema.index({ team: 1 });
boardSchema.index({ 'members.user': 1 });
boardSchema.index({ visibility: 1 });

module.exports = mongoose.model('Board', boardSchema);
