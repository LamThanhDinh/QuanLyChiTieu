// tests/models/Goal.test.js
const mongoose = require("mongoose");
const Goal = require("../../models/Goal");
const { createTestUser } = require("../helpers/testHelpers");

describe("Goal Model", () => {
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
    it("should create a valid goal", async () => {
      const goalData = {
        user: testUser._id,
        name: "Buy a new laptop",
        targetAmount: 30000000,
        currentAmount: 5000000,
        deadline: new Date("2024-12-31"),
        icon: "💻",
      };

      const goal = new Goal(goalData);
      const savedGoal = await goal.save();

      expect(savedGoal._id).toBeDefined();
      expect(savedGoal.user).toEqual(testUser._id);
      expect(savedGoal.name).toBe(goalData.name);
      expect(savedGoal.targetAmount).toBe(goalData.targetAmount);
      expect(savedGoal.currentAmount).toBe(goalData.currentAmount);
      expect(savedGoal.deadline).toEqual(goalData.deadline);
      expect(savedGoal.icon).toBe(goalData.icon);
      expect(savedGoal.status).toBe("in-progress");
      expect(savedGoal.archived).toBe(false);
      expect(savedGoal.isPinned).toBe(false);
      expect(savedGoal.createdAt).toBeDefined();
      expect(savedGoal.updatedAt).toBeDefined();
    });

    it("should require user field", async () => {
      const goalData = {
        name: "Buy a new laptop",
        targetAmount: 30000000,
      };

      const goal = new Goal(goalData);

      await expect(goal.save()).rejects.toThrow("user");
    });

    it("should require name field", async () => {
      const goalData = {
        user: testUser._id,
        targetAmount: 30000000,
      };

      const goal = new Goal(goalData);

      await expect(goal.save()).rejects.toThrow("Vui lòng nhập tên mục tiêu");
    });

    it("should require targetAmount field", async () => {
      const goalData = {
        user: testUser._id,
        name: "Buy a new laptop",
      };

      const goal = new Goal(goalData);

      await expect(goal.save()).rejects.toThrow(
        "Vui lòng nhập số tiền mục tiêu"
      );
    });

    it("should trim name field", async () => {
      const goalData = {
        user: testUser._id,
        name: "  Buy a new laptop  ",
        targetAmount: 30000000,
      };

      const goal = new Goal(goalData);
      const savedGoal = await goal.save();

      expect(savedGoal.name).toBe("Buy a new laptop");
    });

    it("should set default currentAmount to 0", async () => {
      const goalData = {
        user: testUser._id,
        name: "Buy a new laptop",
        targetAmount: 30000000,
      };

      const goal = new Goal(goalData);
      const savedGoal = await goal.save();

      expect(savedGoal.currentAmount).toBe(0);
    });

    it("should set default status to in-progress", async () => {
      const goalData = {
        user: testUser._id,
        name: "Buy a new laptop",
        targetAmount: 30000000,
      };

      const goal = new Goal(goalData);
      const savedGoal = await goal.save();

      expect(savedGoal.status).toBe("in-progress");
    });

    it("should set default icon to 🎯", async () => {
      const goalData = {
        user: testUser._id,
        name: "Buy a new laptop",
        targetAmount: 30000000,
      };

      const goal = new Goal(goalData);
      const savedGoal = await goal.save();

      expect(savedGoal.icon).toBe("🎯");
    });

    it("should set default archived to false", async () => {
      const goalData = {
        user: testUser._id,
        name: "Buy a new laptop",
        targetAmount: 30000000,
      };

      const goal = new Goal(goalData);
      const savedGoal = await goal.save();

      expect(savedGoal.archived).toBe(false);
    });

    it("should set default isPinned to false", async () => {
      const goalData = {
        user: testUser._id,
        name: "Buy a new laptop",
        targetAmount: 30000000,
      };

      const goal = new Goal(goalData);
      const savedGoal = await goal.save();

      expect(savedGoal.isPinned).toBe(false);
    });

    it("should only allow valid status values", async () => {
      const goalData = {
        user: testUser._id,
        name: "Buy a new laptop",
        targetAmount: 30000000,
        status: "invalid-status",
      };

      const goal = new Goal(goalData);

      await expect(goal.save()).rejects.toThrow();
    });

    it("should accept in-progress status", async () => {
      const goalData = {
        user: testUser._id,
        name: "Buy a new laptop",
        targetAmount: 30000000,
        status: "in-progress",
      };

      const goal = new Goal(goalData);
      const savedGoal = await goal.save();

      expect(savedGoal.status).toBe("in-progress");
    });

    it("should accept completed status", async () => {
      const goalData = {
        user: testUser._id,
        name: "Buy a new laptop",
        targetAmount: 30000000,
        status: "completed",
      };

      const goal = new Goal(goalData);
      const savedGoal = await goal.save();

      expect(savedGoal.status).toBe("completed");
    });

    it("should validate user as ObjectId", async () => {
      const goalData = {
        user: "invalid_object_id",
        name: "Buy a new laptop",
        targetAmount: 30000000,
      };

      const goal = new Goal(goalData);

      await expect(goal.save()).rejects.toThrow();
    });

    it("should allow positive targetAmount", async () => {
      const goalData = {
        user: testUser._id,
        name: "Buy a new laptop",
        targetAmount: 30000000,
      };

      const goal = new Goal(goalData);
      const savedGoal = await goal.save();

      expect(savedGoal.targetAmount).toBe(30000000);
    });

    it("should allow zero currentAmount", async () => {
      const goalData = {
        user: testUser._id,
        name: "Buy a new laptop",
        targetAmount: 30000000,
        currentAmount: 0,
      };

      const goal = new Goal(goalData);
      const savedGoal = await goal.save();

      expect(savedGoal.currentAmount).toBe(0);
    });

    it("should allow currentAmount equal to targetAmount", async () => {
      const goalData = {
        user: testUser._id,
        name: "Buy a new laptop",
        targetAmount: 30000000,
        currentAmount: 30000000,
      };

      const goal = new Goal(goalData);
      const savedGoal = await goal.save();

      expect(savedGoal.currentAmount).toBe(30000000);
    });

    it("should allow currentAmount greater than targetAmount", async () => {
      const goalData = {
        user: testUser._id,
        name: "Buy a new laptop",
        targetAmount: 30000000,
        currentAmount: 35000000,
      };

      const goal = new Goal(goalData);
      const savedGoal = await goal.save();

      expect(savedGoal.currentAmount).toBe(35000000);
    });
  });

  describe("Optional Fields", () => {
    it("should allow goal without deadline", async () => {
      const goalData = {
        user: testUser._id,
        name: "Emergency fund",
        targetAmount: 50000000,
      };

      const goal = new Goal(goalData);
      const savedGoal = await goal.save();

      expect(savedGoal.deadline).toBeUndefined();
    });

    it("should store deadline when provided", async () => {
      const deadline = new Date("2024-12-31");
      const goalData = {
        user: testUser._id,
        name: "Buy a new laptop",
        targetAmount: 30000000,
        deadline: deadline,
      };

      const goal = new Goal(goalData);
      const savedGoal = await goal.save();

      expect(savedGoal.deadline).toEqual(deadline);
    });

    it("should allow custom icon", async () => {
      const goalData = {
        user: testUser._id,
        name: "Buy a car",
        targetAmount: 500000000,
        icon: "🚗",
      };

      const goal = new Goal(goalData);
      const savedGoal = await goal.save();

      expect(savedGoal.icon).toBe("🚗");
    });

    it("should allow setting archived to true", async () => {
      const goalData = {
        user: testUser._id,
        name: "Old goal",
        targetAmount: 10000000,
        archived: true,
      };

      const goal = new Goal(goalData);
      const savedGoal = await goal.save();

      expect(savedGoal.archived).toBe(true);
    });

    it("should allow setting isPinned to true", async () => {
      const goalData = {
        user: testUser._id,
        name: "Important goal",
        targetAmount: 20000000,
        isPinned: true,
      };

      const goal = new Goal(goalData);
      const savedGoal = await goal.save();

      expect(savedGoal.isPinned).toBe(true);
    });
  });

  describe("User Association", () => {
    it("should properly reference user", async () => {
      const goalData = {
        user: testUser._id,
        name: "Buy a new laptop",
        targetAmount: 30000000,
      };

      const goal = new Goal(goalData);
      const savedGoal = await goal.save();

      const populatedGoal = await Goal.findById(savedGoal._id).populate("user");

      expect(populatedGoal.user._id).toEqual(testUser._id);
      expect(populatedGoal.user.username).toBe(testUser.username);
    });
  });

  describe("Timestamps", () => {
    it("should automatically set createdAt and updatedAt", async () => {
      const goalData = {
        user: testUser._id,
        name: "Buy a new laptop",
        targetAmount: 30000000,
      };

      const goal = new Goal(goalData);
      const savedGoal = await goal.save();

      expect(savedGoal.createdAt).toBeDefined();
      expect(savedGoal.updatedAt).toBeDefined();
      expect(savedGoal.createdAt).toEqual(savedGoal.updatedAt);
    });

    it("should update updatedAt on modification", async () => {
      const goalData = {
        user: testUser._id,
        name: "Buy a new laptop",
        targetAmount: 30000000,
      };

      const goal = new Goal(goalData);
      const savedGoal = await goal.save();

      const originalUpdatedAt = savedGoal.updatedAt;

      // Wait a bit to ensure different timestamp
      await new Promise((resolve) => setTimeout(resolve, 10));

      savedGoal.currentAmount = 5000000;
      const updatedGoal = await savedGoal.save();

      expect(updatedGoal.updatedAt).not.toEqual(originalUpdatedAt);
    });
  });

  describe("Goal Progress Logic", () => {
    it("should calculate progress correctly", async () => {
      const goalData = {
        user: testUser._id,
        name: "Buy a new laptop",
        targetAmount: 30000000,
        currentAmount: 15000000,
      };

      const goal = new Goal(goalData);
      const savedGoal = await goal.save();

      // Calculate progress percentage
      const progressPercentage =
        (savedGoal.currentAmount / savedGoal.targetAmount) * 100;

      expect(progressPercentage).toBe(50);
    });

    it("should handle 100% completion", async () => {
      const goalData = {
        user: testUser._id,
        name: "Buy a new laptop",
        targetAmount: 30000000,
        currentAmount: 30000000,
        status: "completed",
      };

      const goal = new Goal(goalData);
      const savedGoal = await goal.save();

      const progressPercentage =
        (savedGoal.currentAmount / savedGoal.targetAmount) * 100;

      expect(progressPercentage).toBe(100);
      expect(savedGoal.status).toBe("completed");
    });

    it("should handle over 100% completion", async () => {
      const goalData = {
        user: testUser._id,
        name: "Buy a new laptop",
        targetAmount: 30000000,
        currentAmount: 35000000,
      };

      const goal = new Goal(goalData);
      const savedGoal = await goal.save();

      const progressPercentage =
        (savedGoal.currentAmount / savedGoal.targetAmount) * 100;

      expect(progressPercentage).toBeGreaterThan(100);
    });
  });
});
