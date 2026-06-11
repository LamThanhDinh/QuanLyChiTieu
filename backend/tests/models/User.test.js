// tests/models/User.test.js
const mongoose = require("mongoose");
const User = require("../../models/User");

describe("User Model", () => {
  beforeEach(async () => {
    // Clear all users before each test
    await User.deleteMany({});
  });

  describe("Validation", () => {
    it("should create a valid user", async () => {
      const userData = {
        username: "testuser",
        fullname: "Test User",
        password: "password123",
        email: "test@example.com",
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.username).toBe(userData.username);
      expect(savedUser.fullname).toBe(userData.fullname);
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.avatar).toBe("");
      expect(savedUser.createdAt).toBeDefined();
      expect(savedUser.updatedAt).toBeDefined();
    });

    it("should require username", async () => {
      const userData = {
        fullname: "Test User",
        password: "password123",
      };

      const user = new User(userData);

      await expect(user.save()).rejects.toThrow("username");
    });

    it("should require fullname", async () => {
      const userData = {
        username: "testuser",
        password: "password123",
      };

      const user = new User(userData);

      await expect(user.save()).rejects.toThrow("fullname");
    });

    it("should require password", async () => {
      const userData = {
        username: "testuser",
        fullname: "Test User",
      };

      const user = new User(userData);

      await expect(user.save()).rejects.toThrow("password");
    });

    it("should enforce unique username", async () => {
      const userData1 = {
        username: "testuser",
        fullname: "Test User 1",
        password: "password123",
      };

      const userData2 = {
        username: "testuser",
        fullname: "Test User 2",
        password: "password456",
      };

      const user1 = new User(userData1);
      await user1.save();

      const user2 = new User(userData2);
      await expect(user2.save()).rejects.toThrow();
    });

    it("should enforce unique email when provided", async () => {
      const userData1 = {
        username: "testuser1",
        fullname: "Test User 1",
        password: "password123",
        email: "test@example.com",
      };

      const userData2 = {
        username: "testuser2",
        fullname: "Test User 2",
        password: "password456",
        email: "test@example.com",
      };

      const user1 = new User(userData1);
      await user1.save();

      const user2 = new User(userData2);
      await expect(user2.save()).rejects.toThrow();
    });

    it("should allow multiple users without email", async () => {
      const userData1 = {
        username: "testuser1",
        fullname: "Test User 1",
        password: "password123",
      };

      const userData2 = {
        username: "testuser2",
        fullname: "Test User 2",
        password: "password456",
      };

      const user1 = new User(userData1);
      const user2 = new User(userData2);

      const savedUser1 = await user1.save();
      const savedUser2 = await user2.save();

      expect(savedUser1._id).toBeDefined();
      expect(savedUser2._id).toBeDefined();
    });

    it("should trim and lowercase email", async () => {
      const userData = {
        username: "testuser",
        fullname: "Test User",
        password: "password123",
        email: "  TEST@EXAMPLE.COM  ",
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.email).toBe("test@example.com");
    });

    it("should set default avatar to empty string", async () => {
      const userData = {
        username: "testuser",
        fullname: "Test User",
        password: "password123",
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.avatar).toBe("");
    });

    it("should allow custom avatar", async () => {
      const userData = {
        username: "testuser",
        fullname: "Test User",
        password: "password123",
        avatar: "path/to/avatar.jpg",
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.avatar).toBe("path/to/avatar.jpg");
    });
  });

  describe("Timestamps", () => {
    it("should automatically set createdAt and updatedAt", async () => {
      const userData = {
        username: "testuser",
        fullname: "Test User",
        password: "password123",
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.createdAt).toBeDefined();
      expect(savedUser.updatedAt).toBeDefined();
      expect(savedUser.createdAt).toEqual(savedUser.updatedAt);
    });

    it("should update updatedAt on modification", async () => {
      const userData = {
        username: "testuser",
        fullname: "Test User",
        password: "password123",
      };

      const user = new User(userData);
      const savedUser = await user.save();

      const originalUpdatedAt = savedUser.updatedAt;

      // Wait a bit to ensure different timestamp
      await new Promise((resolve) => setTimeout(resolve, 10));

      savedUser.fullname = "Updated Test User";
      const updatedUser = await savedUser.save();

      expect(updatedUser.updatedAt).not.toEqual(originalUpdatedAt);
    });
  });
});
