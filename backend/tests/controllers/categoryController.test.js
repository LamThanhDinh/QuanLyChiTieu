const request = require("supertest");
const express = require("express");
const jwt = require("jsonwebtoken");
const Category = require("../../models/Category");
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../../controllers/categoryController");
const {
  createTestUser,
  createTestCategory,
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
app.get("/categories", getCategories);
app.post("/categories", createCategory);
app.put("/categories/:id", updateCategory);
app.delete("/categories/:id", deleteCategory);

describe("CategoryController", () => {
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

  describe("GET /categories", () => {
    it("should return user's categories", async () => {
      // Create test categories
      await createTestCategory(testUser._id, { name: "Food", type: "CHITIEU" });
      await createTestCategory(testUser._id, {
        name: "Transport",
        type: "CHITIEU",
      });

      const response = await request(app)
        .get("/categories")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty("name");
      expect(response.body[0]).toHaveProperty("type");
      expect(response.body[0]).toHaveProperty("userId");
    });

    it("should return empty array when user has no categories", async () => {
      const response = await request(app)
        .get("/categories")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(0);
    });

    it("should fail without authentication", async () => {
      await request(app).get("/categories").expect(401);
    });
  });

  describe("POST /categories", () => {
    it("should create new category successfully", async () => {
      const categoryData = {
        name: "Test Category",
        type: "CHITIEU",
        icon: "fa-test",
      };

      const response = await request(app)
        .post("/categories")
        .set("Authorization", `Bearer ${authToken}`)
        .send(categoryData)
        .expect(201);

      expect(response.body).toHaveProperty("name", "Test Category");
      expect(response.body).toHaveProperty("type", "CHITIEU");
      expect(response.body).toHaveProperty("icon", "fa-test");
      expect(response.body).toHaveProperty("userId", testUser._id.toString());

      // Verify in database
      const savedCategory = await Category.findById(response.body._id);
      expect(savedCategory).toBeTruthy();
      expect(savedCategory.name).toBe("Test Category");
    });

    it("should create category with default icon when not provided", async () => {
      const categoryData = {
        name: "Test Category",
        type: "CHITIEU",
      };

      const response = await request(app)
        .post("/categories")
        .set("Authorization", `Bearer ${authToken}`)
        .send(categoryData)
        .expect(201);

      expect(response.body).toHaveProperty("icon", "fa-question-circle");
    });

    it("should fail when name is missing", async () => {
      const categoryData = {
        type: "CHITIEU",
      };

      const response = await request(app)
        .post("/categories")
        .set("Authorization", `Bearer ${authToken}`)
        .send(categoryData)
        .expect(400);

      expect(response.body).toHaveProperty(
        "message",
        "Thiếu tên hoặc loại danh mục"
      );
    });

    it("should fail when type is missing", async () => {
      const categoryData = {
        name: "Test Category",
      };

      const response = await request(app)
        .post("/categories")
        .set("Authorization", `Bearer ${authToken}`)
        .send(categoryData)
        .expect(400);

      expect(response.body).toHaveProperty(
        "message",
        "Thiếu tên hoặc loại danh mục"
      );
    });

    it("should fail without authentication", async () => {
      const categoryData = {
        name: "Test Category",
        type: "CHITIEU",
      };

      await request(app).post("/categories").send(categoryData).expect(401);
    });
  });
});
