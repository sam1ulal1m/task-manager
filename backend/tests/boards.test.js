const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');
const Board = require('../models/Board');

describe('Board Endpoints', () => {
  let authToken;
  let userId;

  beforeAll(async () => {
    // Connect to test database
    const mongoUri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/taskmanager_test';
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    // Clean up and close connection
    await User.deleteMany({});
    await Board.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear data before each test
    await User.deleteMany({});
    await Board.deleteMany({});

    // Create and authenticate test user
    const user = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });
    await user.save();
    userId = user._id;

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    authToken = loginResponse.body.token;
  });

  describe('POST /api/boards', () => {
    it('should create a new board', async () => {
      const boardData = {
        title: 'Test Board',
        description: 'This is a test board'
      };

      const response = await request(app)
        .post('/api/boards')
        .set('Authorization', `Bearer ${authToken}`)
        .send(boardData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.board.title).toBe(boardData.title);
      expect(response.body.board.owner.toString()).toBe(userId.toString());
    });

    it('should not create board without authentication', async () => {
      const boardData = {
        title: 'Test Board',
        description: 'This is a test board'
      };

      const response = await request(app)
        .post('/api/boards')
        .send(boardData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/boards', () => {
    beforeEach(async () => {
      // Create test boards
      const board1 = new Board({
        title: 'Board 1',
        description: 'First board',
        owner: userId
      });
      const board2 = new Board({
        title: 'Board 2',
        description: 'Second board',
        owner: userId
      });
      await Board.insertMany([board1, board2]);
    });

    it('should get user boards', async () => {
      const response = await request(app)
        .get('/api/boards')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.boards).toHaveLength(2);
    });

    it('should not get boards without authentication', async () => {
      const response = await request(app)
        .get('/api/boards')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});
