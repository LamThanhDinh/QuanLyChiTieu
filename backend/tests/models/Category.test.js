// tests/models/Category.test.js
const mongoose = require("mongoose");
const Category = require("../../models/Category");
const { createTestUser } = require("../helpers/testHelpers");

describe("Category Model", () => {
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
    it("should create a valid category", async () => {
      const categoryData = {
        userId: testUser._id,
        name: "Food & Dining",
        type: "CHITIEU",
        icon: "fa-utensils",
      };

      const category = new Category(categoryData);
      const savedCategory = await category.save();

      expect(savedCategory._id).toBeDefined();
      expect(savedCategory.userId).toEqual(testUser._id);
      expect(savedCategory.name).toBe(categoryData.name);
      expect(savedCategory.type).toBe(categoryData.type);
      expect(savedCategory.icon).toBe(categoryData.icon);
      expect(savedCategory.isGoalCategory).toBe(false);
      expect(savedCategory.goalId).toBeUndefined();
      expect(savedCategory.createdAt).toBeDefined();
      expect(savedCategory.updatedAt).toBeDefined();
    });

    it("should require userId", async () => {
      const categoryData = {
        name: "Food & Dining",
        type: "CHITIEU",
      };

      const category = new Category(categoryData);

      await expect(category.save()).rejects.toThrow("userId");
    });

    it("should require name", async () => {
      const categoryData = {
        userId: testUser._id,
        type: "CHITIEU",
      };

      const category = new Category(categoryData);

      await expect(category.save()).rejects.toThrow("name");
    });

    it("should require type", async () => {
      const categoryData = {
        userId: testUser._id,
        name: "Food & Dining",
      };

      const category = new Category(categoryData);

      await expect(category.save()).rejects.toThrow("type");
    });

    it("should only allow valid types", async () => {
      const categoryData = {
        userId: testUser._id,
        name: "Food & Dining",
        type: "INVALID_TYPE",
      };

      const category = new Category(categoryData);

      await expect(category.save()).rejects.toThrow();
    });

    it("should accept THUNHAP type", async () => {
      const categoryData = {
        userId: testUser._id,
        name: "Salary",
        type: "THUNHAP",
      };

      const category = new Category(categoryData);
      const savedCategory = await category.save();

      expect(savedCategory.type).toBe("THUNHAP");
    });

    it("should accept CHITIEU type", async () => {
      const categoryData = {
        userId: testUser._id,
        name: "Food",
        type: "CHITIEU",
      };

      const category = new Category(categoryData);
      const savedCategory = await category.save();

      expect(savedCategory.type).toBe("CHITIEU");
    });

    it("should set default icon", async () => {
      const categoryData = {
        userId: testUser._id,
        name: "Food & Dining",
        type: "CHITIEU",
      };

      const category = new Category(categoryData);
      const savedCategory = await category.save();

      expect(savedCategory.icon).toBe("fa-question-circle");
    });

    it("should allow custom icon", async () => {
      const categoryData = {
        userId: testUser._id,
        name: "Food & Dining",
        type: "CHITIEU",
        icon: "fa-utensils",
      };

      const category = new Category(categoryData);
      const savedCategory = await category.save();

      expect(savedCategory.icon).toBe("fa-utensils");
    });

    it("should set default isGoalCategory to false", async () => {
      const categoryData = {
        userId: testUser._id,
        name: "Food & Dining",
        type: "CHITIEU",
      };

      const category = new Category(categoryData);
      const savedCategory = await category.save();

      expect(savedCategory.isGoalCategory).toBe(false);
    });

    it("should allow setting isGoalCategory to true", async () => {
      const categoryData = {
        userId: testUser._id,
        name: "Vacation Fund",
        type: "THUNHAP",
        isGoalCategory: true,
      };

      const category = new Category(categoryData);
      const savedCategory = await category.save();

      expect(savedCategory.isGoalCategory).toBe(true);
    });

    it("should allow goalId reference", async () => {
      const goalId = new mongoose.Types.ObjectId();
      const categoryData = {
        userId: testUser._id,
        name: "Vacation Fund",
        type: "THUNHAP",
        isGoalCategory: true,
        goalId: goalId,
      };

      const category = new Category(categoryData);
      const savedCategory = await category.save();

      expect(savedCategory.goalId).toEqual(goalId);
    });

    it("should validate userId as ObjectId", async () => {
      const categoryData = {
        userId: "invalid_object_id",
        name: "Food & Dining",
        type: "CHITIEU",
      };

      const category = new Category(categoryData);

      await expect(category.save()).rejects.toThrow();
    });

    it("should validate goalId as ObjectId when provided", async () => {
      const categoryData = {
        userId: testUser._id,
        name: "Vacation Fund",
        type: "THUNHAP",
        goalId: "invalid_object_id",
      };

      const category = new Category(categoryData);

      await expect(category.save()).rejects.toThrow();
    });
  });

  describe("User Association", () => {
    it("should properly reference user", async () => {
      const categoryData = {
        userId: testUser._id,
        name: "Food & Dining",
        type: "CHITIEU",
      };

      const category = new Category(categoryData);
      const savedCategory = await category.save();

      const populatedCategory = await Category.findById(
        savedCategory._id
      ).populate("userId");

      expect(populatedCategory.userId._id).toEqual(testUser._id);
      expect(populatedCategory.userId.username).toBe(testUser.username);
    });
  });

  describe("Timestamps", () => {
    it("should automatically set createdAt and updatedAt", async () => {
      const categoryData = {
        userId: testUser._id,
        name: "Food & Dining",
        type: "CHITIEU",
      };

      const category = new Category(categoryData);
      const savedCategory = await category.save();

      expect(savedCategory.createdAt).toBeDefined();
      expect(savedCategory.updatedAt).toBeDefined();
      expect(savedCategory.createdAt).toEqual(savedCategory.updatedAt);
    });

    it("should update updatedAt on modification", async () => {
      const categoryData = {
        userId: testUser._id,
        name: "Food & Dining",
        type: "CHITIEU",
      };

      const category = new Category(categoryData);
      const savedCategory = await category.save();

      const originalUpdatedAt = savedCategory.updatedAt;

      // Wait a bit to ensure different timestamp
      await new Promise((resolve) => setTimeout(resolve, 10));

      savedCategory.name = "Updated Food & Dining";
      const updatedCategory = await savedCategory.save();

      expect(updatedCategory.updatedAt).not.toEqual(originalUpdatedAt);
    });
  });
});
