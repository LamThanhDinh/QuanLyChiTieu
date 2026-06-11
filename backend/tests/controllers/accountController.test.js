const request = require("supertest");
const express = require("express");
const jwt = require("jsonwebtoken");
const Account = require("../../models/Account");
const Transaction = require("../../models/Transaction");
const {
  getAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
} = require("../../controllers/accountController");
const {
  createTestUser,
  createTestAccount,
  createTestCategory,
  createTestTransaction,
  connectTestDB,
  disconnectTestDB,
  clearTestDB,
} = require("../helpers/testHelpers");

// Create Express app for testing
const app = express();
app.use(express.json());

// Mock auth middleware
const mockAuth = (req, res, next) => {
  if (req.headers.authorization) {
    const token = req.headers.authorization.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
  } else {
    return res.status(401).json({ message: "No token provided" });
  }
};

app.use(mockAuth);
app.get("/accounts", getAccounts);
app.post("/accounts", createAccount);
app.put("/accounts/:id", updateAccount);
app.delete("/accounts/:id", deleteAccount);

describe("AccountController", () => {
  let testUser, authToken;

  beforeAll(async () => {
    await connectTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
    testUser = await createTestUser();
    authToken = jwt.sign(
      { id: testUser._id, username: testUser.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  describe("GET /accounts", () => {
    it("should return user's accounts", async () => {
      // Create test accounts
      await createTestAccount(testUser._id, {
        name: "Cash Account",
        type: "TIENMAT",
      });
      await createTestAccount(testUser._id, {
        name: "Bank Account",
        type: "THENGANHANG",
      });

      const response = await request(app)
        .get("/accounts")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty("name");
      expect(response.body[0]).toHaveProperty("type");
      expect(response.body[0]).toHaveProperty("id"); // Response uses id, not userId
    });

    it("should return empty array when user has no accounts", async () => {
      const response = await request(app)
        .get("/accounts")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(0);
    });

    it("should calculate account balances with transactions", async () => {
      const account = await createTestAccount(testUser._id, {
        name: "Test Account",
        initialBalance: 1000000,
      });
      const category = await createTestCategory(testUser._id);

      // Create income transaction
      await createTestTransaction(testUser._id, category._id, account._id, {
        name: "Income Transaction",
        type: "THUNHAP",
        amount: 500000,
        date: new Date("2024-01-15"),
      });

      // Create expense transaction
      await createTestTransaction(testUser._id, category._id, account._id, {
        name: "Expense Transaction",
        type: "CHITIEU",
        amount: 200000,
        date: new Date("2024-01-20"),
      });

      const response = await request(app)
        .get("/accounts")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toHaveProperty("name", "Test Account");
    });

    it("should filter by date range when provided", async () => {
      const account = await createTestAccount(testUser._id);
      const category = await createTestCategory(testUser._id);

      // Create transactions in different dates
      await createTestTransaction(testUser._id, category._id, account._id, {
        name: "Transaction 1",
        type: "CHITIEU",
        date: new Date("2024-01-10"),
        amount: 100000,
      });
      await createTestTransaction(testUser._id, category._id, account._id, {
        name: "Transaction 2",
        type: "CHITIEU",
        date: new Date("2024-02-10"),
        amount: 200000,
      });

      const response = await request(app)
        .get("/accounts?startDate=2024-01-01&endDate=2024-01-31")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveLength(1);
    });

    it("should fail without authentication", async () => {
      await request(app).get("/accounts").expect(401);
    });
  });

  describe("POST /accounts", () => {
    it("should create cash account successfully", async () => {
      const accountData = {
        name: "My Cash",
        type: "TIENMAT",
        initialBalance: 1000000,
      };

      const response = await request(app)
        .post("/accounts")
        .set("Authorization", `Bearer ${authToken}`)
        .send(accountData)
        .expect(201);

      expect(response.body).toHaveProperty("name", "My Cash");
      expect(response.body).toHaveProperty("type", "TIENMAT");
      expect(response.body).toHaveProperty("initialBalance", 1000000);
      expect(response.body).toHaveProperty("userId", testUser._id.toString());
      expect(response.body).toHaveProperty("bankName", "");
      expect(response.body).toHaveProperty("accountNumber", "");

      // Verify in database
      const savedAccount = await Account.findById(response.body._id);
      expect(savedAccount).toBeTruthy();
      expect(savedAccount.name).toBe("My Cash");
    });

    it("should create bank account successfully", async () => {
      const accountData = {
        name: "My Bank Account",
        type: "THENGANHANG",
        initialBalance: 5000000,
        bankName: "Vietcombank",
        accountNumber: "1234567890",
      };

      const response = await request(app)
        .post("/accounts")
        .set("Authorization", `Bearer ${authToken}`)
        .send(accountData)
        .expect(201);

      expect(response.body).toHaveProperty("name", "My Bank Account");
      expect(response.body).toHaveProperty("type", "THENGANHANG");
      expect(response.body).toHaveProperty("bankName", "Vietcombank");
      expect(response.body).toHaveProperty("accountNumber", "1234567890");
    });

    it("should create account without bank details for non-bank type", async () => {
      const accountData = {
        name: "Cash Account",
        type: "TIENMAT", // Valid type
        initialBalance: 0,
        bankName: "Should be ignored",
        accountNumber: "Should be ignored",
      };

      const response = await request(app)
        .post("/accounts")
        .set("Authorization", `Bearer ${authToken}`)
        .send(accountData)
        .expect(201);

      expect(response.body).toHaveProperty("bankName", "");
      expect(response.body).toHaveProperty("accountNumber", "");
    });

    it("should handle missing optional fields", async () => {
      const accountData = {
        name: "Simple Account",
        type: "TIENMAT",
      };

      const response = await request(app)
        .post("/accounts")
        .set("Authorization", `Bearer ${authToken}`)
        .send(accountData)
        .expect(201);

      expect(response.body).toHaveProperty("name", "Simple Account");
      expect(response.body).toHaveProperty("type", "TIENMAT");
    });

    it("should fail without authentication", async () => {
      const accountData = {
        name: "Test Account",
        type: "TIENMAT",
      };

      await request(app).post("/accounts").send(accountData).expect(401);
    });
  });

  describe("PUT /accounts/:id", () => {
    let testAccount;

    beforeEach(async () => {
      testAccount = await createTestAccount(testUser._id, {
        name: "Original Account",
        type: "THENGANHANG",
        bankName: "Original Bank",
        accountNumber: "1111111111",
      });
    });

    it("should update account successfully", async () => {
      const updateData = {
        name: "Updated Account",
        bankName: "Updated Bank",
        accountNumber: "2222222222",
      };

      const response = await request(app)
        .put(`/accounts/${testAccount._id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty("name", "Updated Account");
      expect(response.body).toHaveProperty("bankName", "Updated Bank");
      expect(response.body).toHaveProperty("accountNumber", "2222222222");

      // Verify in database
      const updatedAccount = await Account.findById(testAccount._id);
      expect(updatedAccount.name).toBe("Updated Account");
      expect(updatedAccount.bankName).toBe("Updated Bank");
      expect(updatedAccount.accountNumber).toBe("2222222222");
    });

    it("should update only provided fields", async () => {
      const updateData = {
        name: "Just Name Update",
      };

      const response = await request(app)
        .put(`/accounts/${testAccount._id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty("name", "Just Name Update");
      expect(response.body).toHaveProperty("bankName", "Original Bank"); // Unchanged
      expect(response.body).toHaveProperty("accountNumber", "1111111111"); // Unchanged
    });

    it("should fail when account not found", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const updateData = { name: "Updated" };

      const response = await request(app)
        .put(`/accounts/${fakeId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body).toHaveProperty(
        "message",
        "Không tìm thấy tài khoản."
      );
    });

    it("should fail when trying to update another user's account", async () => {
      const anotherUser = await createTestUser({
        username: "anotheruser",
        email: "another@example.com",
      });
      const anotherAccount = await createTestAccount(anotherUser._id);

      const updateData = { name: "Hacked Update" };

      const response = await request(app)
        .put(`/accounts/${anotherAccount._id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body).toHaveProperty(
        "message",
        "Không tìm thấy tài khoản."
      );
    });

    it("should fail without authentication", async () => {
      const updateData = { name: "Updated" };

      await request(app)
        .put(`/accounts/${testAccount._id}`)
        .send(updateData)
        .expect(401);
    });
  });

  describe("DELETE /accounts/:id", () => {
    let testAccount;

    beforeEach(async () => {
      testAccount = await createTestAccount(testUser._id, {
        name: "Account to Delete",
      });
    });

    it("should delete account successfully", async () => {
      const response = await request(app)
        .delete(`/accounts/${testAccount._id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty(
        "message",
        "Xóa tài khoản thành công"
      );

      // Verify account is deleted from database
      const deletedAccount = await Account.findById(testAccount._id);
      expect(deletedAccount).toBeNull();
    });

    it("should fail when account not found", async () => {
      const fakeId = "507f1f77bcf86cd799439011";

      const response = await request(app)
        .delete(`/accounts/${fakeId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty(
        "message",
        "Không tìm thấy tài khoản."
      );
    });

    it("should fail when trying to delete another user's account", async () => {
      const anotherUser = await createTestUser({
        username: "anotheruserdelete",
        email: "delete@example.com",
      });
      const anotherAccount = await createTestAccount(anotherUser._id);

      const response = await request(app)
        .delete(`/accounts/${anotherAccount._id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty(
        "message",
        "Không tìm thấy tài khoản."
      );
    });

    it("should fail without authentication", async () => {
      await request(app).delete(`/accounts/${testAccount._id}`).expect(401);
    });
  });
});
