// tests/models/LoginHistory.test.js
const mongoose = require("mongoose");
const LoginHistory = require("../../models/LoginHistory");
const { createTestUser } = require("../helpers/testHelpers");

describe("LoginHistory Model", () => {
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
    it("should create a valid login history record", async () => {
      const loginHistoryData = {
        userId: testUser._id,
        ipAddress: "192.168.1.100",
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      };

      const loginHistory = new LoginHistory(loginHistoryData);
      const savedLoginHistory = await loginHistory.save();

      expect(savedLoginHistory._id).toBeDefined();
      expect(savedLoginHistory.userId).toEqual(testUser._id);
      expect(savedLoginHistory.ipAddress).toBe(loginHistoryData.ipAddress);
      expect(savedLoginHistory.userAgent).toBe(loginHistoryData.userAgent);
      expect(savedLoginHistory.timestamp).toBeDefined();
    });

    it("should require userId field", async () => {
      const loginHistoryData = {
        ipAddress: "192.168.1.100",
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      };

      const loginHistory = new LoginHistory(loginHistoryData);

      await expect(loginHistory.save()).rejects.toThrow("userId");
    });

    it("should validate userId as ObjectId", async () => {
      const loginHistoryData = {
        userId: "invalid_object_id",
        ipAddress: "192.168.1.100",
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      };

      const loginHistory = new LoginHistory(loginHistoryData);

      await expect(loginHistory.save()).rejects.toThrow();
    });

    it("should set default timestamp when not provided", async () => {
      const beforeSave = new Date();

      const loginHistoryData = {
        userId: testUser._id,
        ipAddress: "192.168.1.100",
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      };

      const loginHistory = new LoginHistory(loginHistoryData);
      const savedLoginHistory = await loginHistory.save();

      const afterSave = new Date();

      expect(savedLoginHistory.timestamp).toBeDefined();
      expect(savedLoginHistory.timestamp.getTime()).toBeGreaterThanOrEqual(
        beforeSave.getTime()
      );
      expect(savedLoginHistory.timestamp.getTime()).toBeLessThanOrEqual(
        afterSave.getTime()
      );
    });

    it("should allow custom timestamp", async () => {
      const customTimestamp = new Date("2024-01-01T10:00:00Z");

      const loginHistoryData = {
        userId: testUser._id,
        ipAddress: "192.168.1.100",
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        timestamp: customTimestamp,
      };

      const loginHistory = new LoginHistory(loginHistoryData);
      const savedLoginHistory = await loginHistory.save();

      expect(savedLoginHistory.timestamp).toEqual(customTimestamp);
    });
  });

  describe("Optional Fields", () => {
    it("should allow creation without ipAddress", async () => {
      const loginHistoryData = {
        userId: testUser._id,
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      };

      const loginHistory = new LoginHistory(loginHistoryData);
      const savedLoginHistory = await loginHistory.save();

      expect(savedLoginHistory.ipAddress).toBeUndefined();
      expect(savedLoginHistory.userAgent).toBe(loginHistoryData.userAgent);
    });

    it("should allow creation without userAgent", async () => {
      const loginHistoryData = {
        userId: testUser._id,
        ipAddress: "192.168.1.100",
      };

      const loginHistory = new LoginHistory(loginHistoryData);
      const savedLoginHistory = await loginHistory.save();

      expect(savedLoginHistory.ipAddress).toBe(loginHistoryData.ipAddress);
      expect(savedLoginHistory.userAgent).toBeUndefined();
    });

    it("should allow creation with only userId", async () => {
      const loginHistoryData = {
        userId: testUser._id,
      };

      const loginHistory = new LoginHistory(loginHistoryData);
      const savedLoginHistory = await loginHistory.save();

      expect(savedLoginHistory.userId).toEqual(testUser._id);
      expect(savedLoginHistory.ipAddress).toBeUndefined();
      expect(savedLoginHistory.userAgent).toBeUndefined();
      expect(savedLoginHistory.timestamp).toBeDefined();
    });
  });

  describe("User Association", () => {
    it("should properly reference user", async () => {
      const loginHistoryData = {
        userId: testUser._id,
        ipAddress: "192.168.1.100",
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      };

      const loginHistory = new LoginHistory(loginHistoryData);
      const savedLoginHistory = await loginHistory.save();

      const populatedLoginHistory = await LoginHistory.findById(
        savedLoginHistory._id
      ).populate("userId");

      expect(populatedLoginHistory.userId._id).toEqual(testUser._id);
      expect(populatedLoginHistory.userId.username).toBe(testUser.username);
    });
  });

  describe("IP Address Validation", () => {
    it("should store IPv4 addresses", async () => {
      const ipAddresses = ["192.168.1.1", "10.0.0.1", "172.16.0.1", "8.8.8.8"];

      for (const ip of ipAddresses) {
        const loginHistoryData = {
          userId: testUser._id,
          ipAddress: ip,
        };

        const loginHistory = new LoginHistory(loginHistoryData);
        const savedLoginHistory = await loginHistory.save();

        expect(savedLoginHistory.ipAddress).toBe(ip);
      }
    });

    it("should store IPv6 addresses", async () => {
      const ipv6Address = "2001:0db8:85a3:0000:0000:8a2e:0370:7334";

      const loginHistoryData = {
        userId: testUser._id,
        ipAddress: ipv6Address,
      };

      const loginHistory = new LoginHistory(loginHistoryData);
      const savedLoginHistory = await loginHistory.save();

      expect(savedLoginHistory.ipAddress).toBe(ipv6Address);
    });

    it("should store localhost addresses", async () => {
      const localhostAddresses = ["127.0.0.1", "::1", "localhost"];

      for (const ip of localhostAddresses) {
        const loginHistoryData = {
          userId: testUser._id,
          ipAddress: ip,
        };

        const loginHistory = new LoginHistory(loginHistoryData);
        const savedLoginHistory = await loginHistory.save();

        expect(savedLoginHistory.ipAddress).toBe(ip);
      }
    });
  });

  describe("User Agent Validation", () => {
    it("should store various browser user agents", async () => {
      const userAgents = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15",
      ];

      for (const userAgent of userAgents) {
        const loginHistoryData = {
          userId: testUser._id,
          userAgent: userAgent,
        };

        const loginHistory = new LoginHistory(loginHistoryData);
        const savedLoginHistory = await loginHistory.save();

        expect(savedLoginHistory.userAgent).toBe(userAgent);
      }
    });

    it("should store mobile user agents", async () => {
      const mobileUserAgents = [
        "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1",
        "Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36",
      ];

      for (const userAgent of mobileUserAgents) {
        const loginHistoryData = {
          userId: testUser._id,
          userAgent: userAgent,
        };

        const loginHistory = new LoginHistory(loginHistoryData);
        const savedLoginHistory = await loginHistory.save();

        expect(savedLoginHistory.userAgent).toBe(userAgent);
      }
    });
  });

  describe("Multiple Login Records", () => {
    it("should allow multiple login records for same user", async () => {
      const loginRecords = [
        {
          userId: testUser._id,
          ipAddress: "192.168.1.100",
          userAgent: "Chrome/91.0",
          timestamp: new Date("2024-01-01T10:00:00Z"),
        },
        {
          userId: testUser._id,
          ipAddress: "192.168.1.101",
          userAgent: "Firefox/89.0",
          timestamp: new Date("2024-01-01T11:00:00Z"),
        },
        {
          userId: testUser._id,
          ipAddress: "192.168.1.102",
          userAgent: "Safari/14.1",
          timestamp: new Date("2024-01-01T12:00:00Z"),
        },
      ];

      const savedRecords = [];
      for (const recordData of loginRecords) {
        const loginHistory = new LoginHistory(recordData);
        const savedRecord = await loginHistory.save();
        savedRecords.push(savedRecord);
      }

      expect(savedRecords).toHaveLength(3);

      // Verify all records belong to the same user
      savedRecords.forEach((record) => {
        expect(record.userId).toEqual(testUser._id);
      });

      // Verify different IPs and timestamps
      const ips = savedRecords.map((record) => record.ipAddress);
      const timestamps = savedRecords.map((record) =>
        record.timestamp.getTime()
      );

      expect(new Set(ips).size).toBe(3); // All unique IPs
      expect(new Set(timestamps).size).toBe(3); // All unique timestamps
    });

    it("should find login history by user", async () => {
      // Create multiple users
      const user2 = await createTestUser({
        username: "testuser2",
        email: "test2@example.com",
      });

      // Create login records for both users
      await new LoginHistory({
        userId: testUser._id,
        ipAddress: "192.168.1.100",
      }).save();

      await new LoginHistory({
        userId: testUser._id,
        ipAddress: "192.168.1.101",
      }).save();

      await new LoginHistory({
        userId: user2._id,
        ipAddress: "192.168.1.102",
      }).save();

      // Find login history for testUser
      const userLoginHistory = await LoginHistory.find({
        userId: testUser._id,
      });

      expect(userLoginHistory).toHaveLength(2);
      userLoginHistory.forEach((record) => {
        expect(record.userId).toEqual(testUser._id);
      });
    });
  });
});
