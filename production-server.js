const express = require('express');
const path = require('path');
const cors = require('cors');

// Import backend routes and middleware
const authRoutes = require('./backend/routes/auth');
const userRoutes = require('./backend/routes/users');
const boardRoutes = require('./backend/routes/boards');
const listRoutes = require('./backend/routes/lists');
const cardRoutes = require('./backend/routes/cards');
const teamRoutes = require('./backend/routes/teams');
const invitationRoutes = require('./backend/routes/invitations');
const { protect } = require('./backend/middleware/auth');
const errorHandler = require('./backend/middleware/errorHandler');

// Database connection
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', protect, userRoutes);
app.use('/api/boards', protect, boardRoutes);
app.use('/api/lists', protect, listRoutes);
app.use('/api/cards', protect, cardRoutes);
app.use('/api/teams', protect, teamRoutes);
app.use('/api/invitations', protect, invitationRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Task Manager API is running',
    timestamp: new Date().toISOString()
  });
});

// Serve static files from frontend build
app.use(express.static(path.join(__dirname, 'frontend/dist')));

// Handle client-side routing - serve index.html for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/dist/index.html'));
});

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
