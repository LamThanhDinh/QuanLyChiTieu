const request = require("supertest");
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const LoginHistory = require("../../models/LoginHistory");
const { register, login, me } = require("../../controllers/authController");
const {
  createTestUser,
  connectTestDB,
  disconnectTestDB,
  clearTestDB,
} = require("../helpers/testHelpers");

// Create Express app for testing
const app = express();
app.use(express.json());
app.post("/register", register);
app.post("/login", login);
app.get("/me", me);

describe("AuthController", () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  describe("POST /register", () => {
    it("should register a new user successfully", async () => {
      const userData = {
        username: "testuser",
        fullname: "Test User",
        password: "password123",
        email: "test@example.com",
      };

      const response = await request(app)
        .post("/register")
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty("message", "Đăng ký thành công");
      expect(response.body).toHaveProperty("user");
      expect(response.body.user).toHaveProperty("id");
      expect(response.body.user).toHaveProperty("username", "testuser");
      expect(response.body.user).toHaveProperty("fullname", "Test User");
      expect(response.body.user).toHaveProperty("email", "test@example.com");
      expect(response.body.user).not.toHaveProperty("password");
    });

    it("should register user without email", async () => {
      const userData = {
        username: "testuser",
        fullname: "Test User",
        password: "password123",
      };

      const response = await request(app)
        .post("/register")
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty("message", "Đăng ký thành công");
      expect(response.body.user.email).toBeNull();
    });

    it("should fail if username is missing", async () => {
      const userData = {
        fullname: "Test User",
        password: "password123",
      };

      const response = await request(app)
        .post("/register")
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty(
        "message",
        "Vui lòng điền đầy đủ thông tin bắt buộc."
      );
    });

    it("should fail if fullname is missing", async () => {
      const userData = {
        username: "testuser",
        password: "password123",
      };

      const response = await request(app)
        .post("/register")
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty(
        "message",
        "Vui lòng điền đầy đủ thông tin bắt buộc."
      );
    });

    it("should fail if password is missing", async () => {
      const userData = {
        username: "testuser",
        fullname: "Test User",
      };

      const response = await request(app)
        .post("/register")
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty(
        "message",
        "Vui lòng điền đầy đủ thông tin bắt buộc."
      );
    });

    it("should fail if username is too short", async () => {
      const userData = {
        username: "ab",
        fullname: "Test User",
        password: "password123",
      };

      const response = await request(app)
        .post("/register")
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty(
        "message",
        "Tên tài khoản phải có ít nhất 3 ký tự."
      );
    });

    it("should fail if password is too short", async () => {
      const userData = {
        username: "testuser",
        fullname: "Test User",
        password: "12345",
      };

      const response = await request(app)
        .post("/register")
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty(
        "message",
        "Mật khẩu phải có ít nhất 6 ký tự."
      );
    });

    it("should fail if username already exists", async () => {
      // Create a user first
      await createTestUser({ username: "existinguser" });

      const userData = {
        username: "existinguser",
        fullname: "Test User",
        password: "password123",
      };

      const response = await request(app)
        .post("/register")
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty(
        "message",
        "Tên tài khoản đã tồn tại. Vui lòng chọn tên khác."
      );
    });

    it("should fail if email already exists", async () => {
      // Create a user with email first
      await createTestUser({ email: "existing@example.com" });

      const userData = {
        username: "newuser",
        fullname: "Test User",
        password: "password123",
        email: "existing@example.com",
      };

      const response = await request(app)
        .post("/register")
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty(
        "message",
        "Email đã được sử dụng. Vui lòng chọn email khác."
      );
    });

    it("should handle empty email string", async () => {
      const userData = {
        username: "testuser",
        fullname: "Test User",
        password: "password123",
        email: "",
      };

      const response = await request(app)
        .post("/register")
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty("message", "Đăng ký thành công");
      expect(response.body.user.email).toBeNull();
    });
  });

  describe("POST /login", () => {
    beforeEach(async () => {
      // Create a test user for login tests
      await createTestUser({
        username: "loginuser",
        password: await bcrypt.hash("password123", 10),
      });
    });

    it("should login successfully with correct credentials", async () => {
      const loginData = {
        username: "loginuser",
        password: "password123",
      };

      const response = await request(app)
        .post("/login")
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty("message", "Đăng nhập thành công");
      expect(response.body).toHaveProperty("token");
      expect(response.body).toHaveProperty("account");
      expect(response.body.account).toHaveProperty("id");
      expect(response.body.account).toHaveProperty("username", "loginuser");
      expect(response.body.account).toHaveProperty("fullname");
      expect(response.body.account).toHaveProperty("avatar");

      // Verify JWT token structure
      const decoded = jwt.verify(response.body.token, process.env.JWT_SECRET);
      expect(decoded).toHaveProperty("id");
      expect(decoded).toHaveProperty("username", "loginuser");
    });

    it("should create login history record", async () => {
      const loginData = {
        username: "loginuser",
        password: "password123",
      };

      await request(app).post("/login").send(loginData).expect(200);

      // Check if login history was created
      const loginHistory = await LoginHistory.findOne({});
      expect(loginHistory).toBeTruthy();
      expect(loginHistory.userId).toBeDefined();
    });

    it("should fail with non-existent username", async () => {
      const loginData = {
        username: "nonexistent",
        password: "password123",
      };

      const response = await request(app)
        .post("/login")
        .send(loginData)
        .expect(400);

      expect(response.body).toHaveProperty(
        "message",
        "Tài khoản không tồn tại"
      );
    });

    it("should fail with incorrect password", async () => {
      const loginData = {
        username: "loginuser",
        password: "wrongpassword",
      };

      const response = await request(app)
        .post("/login")
        .send(loginData)
        .expect(400);

      expect(response.body).toHaveProperty("message", "Sai mật khẩu");
    });
  });

  describe("GET /me", () => {
    let testUser, token;

    beforeEach(async () => {
      testUser = await createTestUser({ username: "meuser" });
      token = jwt.sign(
        { id: testUser._id, username: testUser.username },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
    });

    it("should return user info with valid token", async () => {
      const response = await request(app)
        .get("/me")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty("message", "Đã xác thực");
      expect(response.body).toHaveProperty("user");
      expect(response.body.user).toHaveProperty("fullname");
      expect(response.body.user).toHaveProperty("username", "meuser");
      expect(response.body.user).toHaveProperty("avatar");
    });

    it("should fail without token", async () => {
      const response = await request(app).get("/me").expect(401);

      expect(response.body).toHaveProperty("message", "Thiếu token");
    });

    it("should fail with invalid token", async () => {
      const response = await request(app)
        .get("/me")
        .set("Authorization", "Bearer invalidtoken")
        .expect(401);

      expect(response.body).toHaveProperty("message", "Token không hợp lệ");
    });

    it("should fail with malformed authorization header", async () => {
      const response = await request(app)
        .get("/me")
        .set("Authorization", "invalidformat")
        .expect(401);

      expect(response.body).toHaveProperty("message", "Thiếu token");
    });

    it("should fail if user not found", async () => {
      // Create token for non-existent user
      const fakeToken = jwt.sign(
        { id: "507f1f77bcf86cd799439011", username: "fakeuser" },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      const response = await request(app)
        .get("/me")
        .set("Authorization", `Bearer ${fakeToken}`)
        .expect(404);

      expect(response.body).toHaveProperty(
        "message",
        "Không tìm thấy người dùng"
      );
    });
  });
});
