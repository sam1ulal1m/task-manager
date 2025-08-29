const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const boardRoutes = require('./routes/boards');
const listRoutes = require('./routes/lists');
const cardRoutes = require('./routes/cards');
const teamRoutes = require('./routes/teams');

// Import middleware
const { protect } = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Socket.IO middleware and events
io.use((socket, next) => {
  // Add socket authentication if needed
  next();
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join board room
  socket.on('join-board', (boardId) => {
    socket.join(`board-${boardId}`);
    console.log(`User ${socket.id} joined board ${boardId}`);
  });

  // Leave board room
  socket.on('leave-board', (boardId) => {
    socket.leave(`board-${boardId}`);
    console.log(`User ${socket.id} left board ${boardId}`);
  });

  // Handle real-time card updates
  socket.on('card-update', (data) => {
    socket.to(`board-${data.boardId}`).emit('card-updated', data);
  });

  // Handle real-time list updates
  socket.on('list-update', (data) => {
    socket.to(`board-${data.boardId}`).emit('list-updated', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io accessible in routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', protect, userRoutes);
app.use('/api/boards', protect, boardRoutes);
app.use('/api/lists', protect, listRoutes);
app.use('/api/cards', protect, cardRoutes);
app.use('/api/teams', protect, teamRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Task Manager API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/taskmanager', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
  process.exit(1);
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});
