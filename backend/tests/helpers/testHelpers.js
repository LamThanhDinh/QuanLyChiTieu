// tests/helpers/testHelpers.js
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Test data factories
const createTestUser = async (overrides = {}) => {
  const User = require("../../models/User");
  const hashedPassword = await bcrypt.hash("password123", 10);

  const userData = {
    username: "testuser",
    fullname: "Test User",
    email: "test@example.com",
    password: hashedPassword,
    phone: "0123456789",
    address: "Test Address",
    avatar: null,
    ...overrides,
  };

  const user = new User(userData);
  await user.save();
  return user;
};

const createTestCategory = async (userId, overrides = {}) => {
  const Category = require("../../models/Category");

  const categoryData = {
    name: "Test Category",
    icon: "fa-test",
    color: "#FF0000",
    type: "CHITIEU",
    userId: userId,
    ...overrides,
  };

  const category = new Category(categoryData);
  await category.save();
  return category;
};

const createTestAccount = async (userId, overrides = {}) => {
  const Account = require("../../models/Account");

  const accountData = {
    name: "Test Account",
    type: "TIENMAT",
    balance: 1000000,
    currency: "VND",
    description: "Test account description",
    userId: userId,
    ...overrides,
  };

  const account = new Account(accountData);
  await account.save();
  return account;
};

const createTestTransaction = async (
  userId,
  categoryId,
  accountId,
  overrides = {}
) => {
  const Transaction = require("../../models/Transaction");

  const transactionData = {
    type: "expense",
    amount: 100000,
    description: "Test transaction",
    date: new Date(),
    categoryId: categoryId,
    accountId: accountId,
    userId: userId,
    location: "Test Location",
    tags: ["test"],
    ...overrides,
  };

  const transaction = new Transaction(transactionData);
  await transaction.save();
  return transaction;
};

const createTestGoal = async (userId, overrides = {}) => {
  const Goal = require("../../models/Goal");

  const goalData = {
    name: "Test Goal",
    targetAmount: 5000000,
    currentAmount: 1000000,
    targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
    description: "Test goal description",
    userId: userId,
    ...overrides,
  };

  const goal = new Goal(goalData);
  await goal.save();
  return goal;
};

// Generate JWT token for testing
const generateTestToken = (userId) => {
  return jwt.sign(
    { id: userId, username: "testuser" },
    process.env.JWT_SECRET,
    {
      expiresIn: "1h",
    }
  );
};

// Mock middleware
const mockAuthMiddleware = (req, res, next) => {
  req.user = { id: new mongoose.Types.ObjectId() };
  next();
};

// Database utilities
const connectTestDB = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI);
  }
};

const disconnectTestDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
};

const clearTestDB = async () => {
  if (mongoose.connection.readyState === 1) {
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
      await collection.deleteMany({});
    }
  }
};

// API response validators
const expectSuccessResponse = (response, statusCode = 200) => {
  expect(response.status).toBe(statusCode);
  expect(response.body).toHaveProperty("message");
};

const expectErrorResponse = (response, statusCode = 400) => {
  expect(response.status).toBe(statusCode);
  expect(response.body).toHaveProperty("message");
};

const expectValidationError = (response) => {
  expectErrorResponse(response, 400);
  expect(response.body.message).toContain("validation");
};

const expectAuthError = (response) => {
  expectErrorResponse(response, 401);
};

const expectNotFoundError = (response) => {
  expectErrorResponse(response, 404);
};

module.exports = {
  createTestUser,
  createTestCategory,
  createTestAccount,
  createTestTransaction,
  createTestGoal,
  generateTestToken,
  mockAuthMiddleware,
  connectTestDB,
  disconnectTestDB,
  clearTestDB,
  expectSuccessResponse,
  expectErrorResponse,
  expectValidationError,
  expectAuthError,
  expectNotFoundError,
};
