// tests/models/Account.test.js
const mongoose = require("mongoose");
const Account = require("../../models/Account");
const { createTestUser } = require("../helpers/testHelpers");

describe("Account Model", () => {
  let testUser;

  beforeEach(async () => {
    // Clear all collections before each test
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
      await collection.deleteMany({});
    }
    testUser = await createTestUser();
  });

  describe("Validation", () => {
    it("should create a valid cash account", async () => {
      const accountData = {
        userId: testUser._id,
        name: "Ví tiền mặt",
        type: "TIENMAT",
        initialBalance: 1000000,
      };

      const account = new Account(accountData);
      const savedAccount = await account.save();

      expect(savedAccount._id).toBeDefined();
      expect(savedAccount.userId).toEqual(testUser._id);
      expect(savedAccount.name).toBe(accountData.name);
      expect(savedAccount.type).toBe(accountData.type);
      expect(savedAccount.initialBalance).toBe(accountData.initialBalance);
      expect(savedAccount.bankName).toBe("");
      expect(savedAccount.accountNumber).toBe("");
      expect(savedAccount.createdAt).toBeDefined();
    });

    it("should create a valid bank account", async () => {
      const accountData = {
        userId: testUser._id,
        name: "Thẻ Techcombank",
        type: "THENGANHANG",
        initialBalance: 5000000,
        bankName: "Techcombank",
        accountNumber: "19123456789",
      };

      const account = new Account(accountData);
      const savedAccount = await account.save();

      expect(savedAccount._id).toBeDefined();
      expect(savedAccount.userId).toEqual(testUser._id);
      expect(savedAccount.name).toBe(accountData.name);
      expect(savedAccount.type).toBe(accountData.type);
      expect(savedAccount.initialBalance).toBe(accountData.initialBalance);
      expect(savedAccount.bankName).toBe(accountData.bankName);
      expect(savedAccount.accountNumber).toBe(accountData.accountNumber);
    });

    it("should require userId", async () => {
      const accountData = {
        name: "Ví tiền mặt",
        type: "TIENMAT",
      };

      const account = new Account(accountData);

      await expect(account.save()).rejects.toThrow("userId");
    });

    it("should require name", async () => {
      const accountData = {
        userId: testUser._id,
        type: "TIENMAT",
      };

      const account = new Account(accountData);

      await expect(account.save()).rejects.toThrow("name");
    });

    it("should require type", async () => {
      const accountData = {
        userId: testUser._id,
        name: "Ví tiền mặt",
      };

      const account = new Account(accountData);

      await expect(account.save()).rejects.toThrow("type");
    });

    it("should only allow valid types", async () => {
      const accountData = {
        userId: testUser._id,
        name: "Test Account",
        type: "INVALID_TYPE",
      };

      const account = new Account(accountData);

      await expect(account.save()).rejects.toThrow();
    });

    it("should accept TIENMAT type", async () => {
      const accountData = {
        userId: testUser._id,
        name: "Ví tiền mặt",
        type: "TIENMAT",
      };

      const account = new Account(accountData);
      const savedAccount = await account.save();

      expect(savedAccount.type).toBe("TIENMAT");
    });

    it("should accept THENGANHANG type", async () => {
      const accountData = {
        userId: testUser._id,
        name: "Thẻ ngân hàng",
        type: "THENGANHANG",
      };

      const account = new Account(accountData);
      const savedAccount = await account.save();

      expect(savedAccount.type).toBe("THENGANHANG");
    });

    it("should set default initialBalance to 0", async () => {
      const accountData = {
        userId: testUser._id,
        name: "Test Account",
        type: "TIENMAT",
      };

      const account = new Account(accountData);
      const savedAccount = await account.save();

      expect(savedAccount.initialBalance).toBe(0);
    });

    it("should set default bankName to empty string", async () => {
      const accountData = {
        userId: testUser._id,
        name: "Test Account",
        type: "TIENMAT",
      };

      const account = new Account(accountData);
      const savedAccount = await account.save();

      expect(savedAccount.bankName).toBe("");
    });

    it("should set default accountNumber to empty string", async () => {
      const accountData = {
        userId: testUser._id,
        name: "Test Account",
        type: "TIENMAT",
      };

      const account = new Account(accountData);
      const savedAccount = await account.save();

      expect(savedAccount.accountNumber).toBe("");
    });

    it("should validate userId as ObjectId", async () => {
      const accountData = {
        userId: "invalid_object_id",
        name: "Test Account",
        type: "TIENMAT",
      };

      const account = new Account(accountData);

      await expect(account.save()).rejects.toThrow();
    });

    it("should allow negative initialBalance", async () => {
      const accountData = {
        userId: testUser._id,
        name: "Credit Card",
        type: "THENGANHANG",
        initialBalance: -500000,
      };

      const account = new Account(accountData);
      const savedAccount = await account.save();

      expect(savedAccount.initialBalance).toBe(-500000);
    });

    it("should allow zero initialBalance", async () => {
      const accountData = {
        userId: testUser._id,
        name: "New Account",
        type: "TIENMAT",
        initialBalance: 0,
      };

      const account = new Account(accountData);
      const savedAccount = await account.save();

      expect(savedAccount.initialBalance).toBe(0);
    });
  });

  describe("User Association", () => {
    it("should properly reference user", async () => {
      const accountData = {
        userId: testUser._id,
        name: "Test Account",
        type: "TIENMAT",
      };

      const account = new Account(accountData);
      const savedAccount = await account.save();

      const populatedAccount = await Account.findById(
        savedAccount._id
      ).populate("userId");

      expect(populatedAccount.userId._id).toEqual(testUser._id);
      expect(populatedAccount.userId.username).toBe(testUser.username);
    });
  });

  describe("Bank Account Fields", () => {
    it("should store bank details for bank accounts", async () => {
      const accountData = {
        userId: testUser._id,
        name: "VCB Account",
        type: "THENGANHANG",
        bankName: "Vietcombank",
        accountNumber: "0123456789",
      };

      const account = new Account(accountData);
      const savedAccount = await account.save();

      expect(savedAccount.bankName).toBe("Vietcombank");
      expect(savedAccount.accountNumber).toBe("0123456789");
    });

    it("should allow empty bank details for cash accounts", async () => {
      const accountData = {
        userId: testUser._id,
        name: "Cash Wallet",
        type: "TIENMAT",
      };

      const account = new Account(accountData);
      const savedAccount = await account.save();

      expect(savedAccount.bankName).toBe("");
      expect(savedAccount.accountNumber).toBe("");
    });
  });

  describe("Creation Date", () => {
    it("should automatically set createdAt", async () => {
      const accountData = {
        userId: testUser._id,
        name: "Test Account",
        type: "TIENMAT",
      };

      const account = new Account(accountData);
      const savedAccount = await account.save();

      expect(savedAccount.createdAt).toBeDefined();
      expect(savedAccount.createdAt).toBeInstanceOf(Date);
    });

    it("should allow custom createdAt", async () => {
      const customDate = new Date("2023-01-01");
      const accountData = {
        userId: testUser._id,
        name: "Test Account",
        type: "TIENMAT",
        createdAt: customDate,
      };

      const account = new Account(accountData);
      const savedAccount = await account.save();

      expect(savedAccount.createdAt).toEqual(customDate);
    });
  });
});
