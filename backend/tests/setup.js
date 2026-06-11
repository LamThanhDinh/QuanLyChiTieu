// tests/setup.js
const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");

// Mock environment variables
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test_jwt_secret_key_for_testing";
process.env.MONGODB_URI = "mongodb://localhost:27017/expense_management_test";
process.env.GEMINI_API_KEY = "test_gemini_api_key";

// Mock console methods to reduce noise during testing
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

let mongoServer;

// Setup test database connection
beforeAll(async () => {
  try {
    // Close any existing connections
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    // Start in-memory MongoDB server
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    // Connect to the in-memory database
    await mongoose.connect(mongoUri);
  } catch (error) {
    console.error("Error setting up test database:", error);
    throw error;
  }
}, 60000);

afterAll(async () => {
  try {
    // Clean up database connections after all tests
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.dropDatabase();
      await mongoose.disconnect();
    }

    // Stop the in-memory MongoDB server
    if (mongoServer) {
      await mongoServer.stop();
    }
  } catch (error) {
    console.error("Error cleaning up test database:", error);
  }
}, 60000);

// Clean up after each test
afterEach(async () => {
  jest.clearAllMocks();

  // Clear all collections if connected to test database
  if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
      await collection.deleteMany({});
    }
  }
});
