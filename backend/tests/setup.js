// Test setup file
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret';
process.env.MONGODB_TEST_URI = 'mongodb://localhost:27017/taskmanager_test';

// Increase timeout for async operations
jest.setTimeout(30000);
