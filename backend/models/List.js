const mongoose = require('mongoose');

const listSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'List title is required'],
    trim: true,
    maxlength: [100, 'List title cannot exceed 100 characters']
  },
  board: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    required: true
  },
  position: {
    type: Number,
    required: true,
    default: 0
  },
  cards: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Card'
  }],
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for better query performance
listSchema.index({ board: 1 });
listSchema.index({ board: 1, position: 1 });

module.exports = mongoose.model('List', listSchema);
