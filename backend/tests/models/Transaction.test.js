// tests/models/Transaction.test.js
const mongoose = require("mongoose");
const Transaction = require("../../models/Transaction");
const {
  createTestUser,
  createTestCategory,
  createTestAccount,
} = require("../helpers/testHelpers");

describe("Transaction Model", () => {
  let testUser, testCategory, testAccount;

  beforeEach(async () => {
    // Clear all collections before each test
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
      await collection.deleteMany({});
    }
    testUser = await createTestUser();
    testCategory = await createTestCategory(testUser._id, { type: "CHITIEU" });
    testAccount = await createTestAccount(testUser._id);
  });

  describe("Validation", () => {
    it("should create a valid expense transaction", async () => {
      const transactionData = {
        userId: testUser._id,
        accountId: testAccount._id,
        categoryId: testCategory._id,
        name: "Lunch at restaurant",
        amount: 150000,
        type: "CHITIEU",
        note: "Delicious Vietnamese food",
      };

      const transaction = new Transaction(transactionData);
      const savedTransaction = await transaction.save();

      expect(savedTransaction._id).toBeDefined();
      expect(savedTransaction.userId).toEqual(testUser._id);
      expect(savedTransaction.accountId).toEqual(testAccount._id);
      expect(savedTransaction.categoryId).toEqual(testCategory._id);
      expect(savedTransaction.name).toBe(transactionData.name);
      expect(savedTransaction.amount).toBe(transactionData.amount);
      expect(savedTransaction.type).toBe(transactionData.type);
      expect(savedTransaction.note).toBe(transactionData.note);
      expect(savedTransaction.date).toBeDefined();
      expect(savedTransaction.createdAt).toBeDefined();
      expect(savedTransaction.updatedAt).toBeDefined();
    });

    it("should create a valid income transaction", async () => {
      const incomeCategory = await createTestCategory(testUser._id, {
        name: "Salary",
        type: "THUNHAP",
      });

      const transactionData = {
        userId: testUser._id,
        accountId: testAccount._id,
        categoryId: incomeCategory._id,
        name: "Monthly salary",
        amount: 15000000,
        type: "THUNHAP",
      };

      const transaction = new Transaction(transactionData);
      const savedTransaction = await transaction.save();

      expect(savedTransaction.type).toBe("THUNHAP");
      expect(savedTransaction.amount).toBe(15000000);
    });

    it("should require userId", async () => {
      const transactionData = {
        accountId: testAccount._id,
        categoryId: testCategory._id,
        name: "Test transaction",
        amount: 100000,
        type: "CHITIEU",
      };

      const transaction = new Transaction(transactionData);

      await expect(transaction.save()).rejects.toThrow("userId");
    });

    it("should require accountId", async () => {
      const transactionData = {
        userId: testUser._id,
        categoryId: testCategory._id,
        name: "Test transaction",
        amount: 100000,
        type: "CHITIEU",
      };

      const transaction = new Transaction(transactionData);

      await expect(transaction.save()).rejects.toThrow("accountId");
    });

    it("should require categoryId", async () => {
      const transactionData = {
        userId: testUser._id,
        accountId: testAccount._id,
        name: "Test transaction",
        amount: 100000,
        type: "CHITIEU",
      };

      const transaction = new Transaction(transactionData);

      await expect(transaction.save()).rejects.toThrow("categoryId");
    });

    it("should require name", async () => {
      const transactionData = {
        userId: testUser._id,
        accountId: testAccount._id,
        categoryId: testCategory._id,
        amount: 100000,
        type: "CHITIEU",
      };

      const transaction = new Transaction(transactionData);

      await expect(transaction.save()).rejects.toThrow("name");
    });

    it("should require amount", async () => {
      const transactionData = {
        userId: testUser._id,
        accountId: testAccount._id,
        categoryId: testCategory._id,
        name: "Test transaction",
        type: "CHITIEU",
      };

      const transaction = new Transaction(transactionData);

      await expect(transaction.save()).rejects.toThrow("amount");
    });

    it("should require type", async () => {
      const transactionData = {
        userId: testUser._id,
        accountId: testAccount._id,
        categoryId: testCategory._id,
        name: "Test transaction",
        amount: 100000,
      };

      const transaction = new Transaction(transactionData);

      await expect(transaction.save()).rejects.toThrow("type");
    });

    it("should only allow valid types", async () => {
      const transactionData = {
        userId: testUser._id,
        accountId: testAccount._id,
        categoryId: testCategory._id,
        name: "Test transaction",
        amount: 100000,
        type: "INVALID_TYPE",
      };

      const transaction = new Transaction(transactionData);

      await expect(transaction.save()).rejects.toThrow();
    });

    it("should accept THUNHAP type", async () => {
      const incomeCategory = await createTestCategory(testUser._id, {
        type: "THUNHAP",
      });

      const transactionData = {
        userId: testUser._id,
        accountId: testAccount._id,
        categoryId: incomeCategory._id,
        name: "Income transaction",
        amount: 100000,
        type: "THUNHAP",
      };

      const transaction = new Transaction(transactionData);
      const savedTransaction = await transaction.save();

      expect(savedTransaction.type).toBe("THUNHAP");
    });

    it("should accept CHITIEU type", async () => {
      const transactionData = {
        userId: testUser._id,
        accountId: testAccount._id,
        categoryId: testCategory._id,
        name: "Expense transaction",
        amount: 100000,
        type: "CHITIEU",
      };

      const transaction = new Transaction(transactionData);
      const savedTransaction = await transaction.save();

      expect(savedTransaction.type).toBe("CHITIEU");
    });

    it("should allow positive amounts", async () => {
      const transactionData = {
        userId: testUser._id,
        accountId: testAccount._id,
        categoryId: testCategory._id,
        name: "Test transaction",
        amount: 100000,
        type: "CHITIEU",
      };

      const transaction = new Transaction(transactionData);
      const savedTransaction = await transaction.save();

      expect(savedTransaction.amount).toBe(100000);
    });

    it("should allow zero amounts", async () => {
      const transactionData = {
        userId: testUser._id,
        accountId: testAccount._id,
        categoryId: testCategory._id,
        name: "Zero transaction",
        amount: 0,
        type: "CHITIEU",
      };

      const transaction = new Transaction(transactionData);
      const savedTransaction = await transaction.save();

      expect(savedTransaction.amount).toBe(0);
    });

    it("should validate ObjectId references", async () => {
      const transactionData = {
        userId: "invalid_object_id",
        accountId: testAccount._id,
        categoryId: testCategory._id,
        name: "Test transaction",
        amount: 100000,
        type: "CHITIEU",
      };

      const transaction = new Transaction(transactionData);

      await expect(transaction.save()).rejects.toThrow();
    });
  });

  describe("Optional Fields", () => {
    it("should allow empty note", async () => {
      const transactionData = {
        userId: testUser._id,
        accountId: testAccount._id,
        categoryId: testCategory._id,
        name: "Test transaction",
        amount: 100000,
        type: "CHITIEU",
      };

      const transaction = new Transaction(transactionData);
      const savedTransaction = await transaction.save();

      expect(savedTransaction.note).toBeUndefined();
    });

    it("should store note when provided", async () => {
      const transactionData = {
        userId: testUser._id,
        accountId: testAccount._id,
        categoryId: testCategory._id,
        name: "Test transaction",
        amount: 100000,
        type: "CHITIEU",
        note: "This is a test note",
      };

      const transaction = new Transaction(transactionData);
      const savedTransaction = await transaction.save();

      expect(savedTransaction.note).toBe("This is a test note");
    });

    it("should store icon when provided", async () => {
      const transactionData = {
        userId: testUser._id,
        accountId: testAccount._id,
        categoryId: testCategory._id,
        name: "Test transaction",
        amount: 100000,
        type: "CHITIEU",
        icon: "fa-utensils",
      };

      const transaction = new Transaction(transactionData);
      const savedTransaction = await transaction.save();

      expect(savedTransaction.icon).toBe("fa-utensils");
    });

    it("should allow goalId reference", async () => {
      const goalId = new mongoose.Types.ObjectId();
      const transactionData = {
        userId: testUser._id,
        accountId: testAccount._id,
        categoryId: testCategory._id,
        name: "Goal transaction",
        amount: 100000,
        type: "CHITIEU",
        goalId: goalId,
      };

      const transaction = new Transaction(transactionData);
      const savedTransaction = await transaction.save();

      expect(savedTransaction.goalId).toEqual(goalId);
    });
  });

  describe("Associations", () => {
    it("should properly reference user, account, and category", async () => {
      const transactionData = {
        userId: testUser._id,
        accountId: testAccount._id,
        categoryId: testCategory._id,
        name: "Test transaction",
        amount: 100000,
        type: "CHITIEU",
      };

      const transaction = new Transaction(transactionData);
      const savedTransaction = await transaction.save();

      const populatedTransaction = await Transaction.findById(
        savedTransaction._id
      )
        .populate("userId")
        .populate("accountId")
        .populate("categoryId");

      expect(populatedTransaction.userId._id).toEqual(testUser._id);
      expect(populatedTransaction.accountId._id).toEqual(testAccount._id);
      expect(populatedTransaction.categoryId._id).toEqual(testCategory._id);
    });
  });

  describe("Date Handling", () => {
    it("should set default date to current time", async () => {
      const beforeCreate = new Date();

      const transactionData = {
        userId: testUser._id,
        accountId: testAccount._id,
        categoryId: testCategory._id,
        name: "Test transaction",
        amount: 100000,
        type: "CHITIEU",
      };

      const transaction = new Transaction(transactionData);
      const savedTransaction = await transaction.save();

      const afterCreate = new Date();

      expect(savedTransaction.date).toBeInstanceOf(Date);
      expect(savedTransaction.date.getTime()).toBeGreaterThanOrEqual(
        beforeCreate.getTime()
      );
      expect(savedTransaction.date.getTime()).toBeLessThanOrEqual(
        afterCreate.getTime()
      );
    });

    it("should allow custom date", async () => {
      const customDate = new Date("2023-06-15T10:30:00Z");

      const transactionData = {
        userId: testUser._id,
        accountId: testAccount._id,
        categoryId: testCategory._id,
        name: "Test transaction",
        amount: 100000,
        type: "CHITIEU",
        date: customDate,
      };

      const transaction = new Transaction(transactionData);
      const savedTransaction = await transaction.save();

      expect(savedTransaction.date).toEqual(customDate);
    });
  });

  describe("Timestamps", () => {
    it("should automatically set createdAt and updatedAt", async () => {
      const transactionData = {
        userId: testUser._id,
        accountId: testAccount._id,
        categoryId: testCategory._id,
        name: "Test transaction",
        amount: 100000,
        type: "CHITIEU",
      };

      const transaction = new Transaction(transactionData);
      const savedTransaction = await transaction.save();

      expect(savedTransaction.createdAt).toBeDefined();
      expect(savedTransaction.updatedAt).toBeDefined();
      expect(savedTransaction.createdAt).toEqual(savedTransaction.updatedAt);
    });

    it("should update updatedAt on modification", async () => {
      const transactionData = {
        userId: testUser._id,
        accountId: testAccount._id,
        categoryId: testCategory._id,
        name: "Test transaction",
        amount: 100000,
        type: "CHITIEU",
      };

      const transaction = new Transaction(transactionData);
      const savedTransaction = await transaction.save();

      const originalUpdatedAt = savedTransaction.updatedAt;

      // Wait a bit to ensure different timestamp
      await new Promise((resolve) => setTimeout(resolve, 10));

      savedTransaction.amount = 200000;
      const updatedTransaction = await savedTransaction.save();

      expect(updatedTransaction.updatedAt).not.toEqual(originalUpdatedAt);
    });
  });
});
