// src/api/__tests__/authService.test.js
import { describe, it, expect, vi, beforeEach } from "vitest";
import { login, register } from "../authService";
import axiosInstance from "../axiosConfig";

// Mock axiosInstance
vi.mock("../axiosConfig", () => ({
  default: {
    post: vi.fn(),
  },
}));

describe("authService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("login", () => {
    it("should call axios post with correct parameters for login", async () => {
      const mockResponse = {
        data: {
          token: "mock-token",
          user: { id: 1, username: "testuser" },
        },
      };

      axiosInstance.post.mockResolvedValue(mockResponse);

      const credentials = { username: "testuser", password: "password123" };
      const result = await login(credentials);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        "/auth/login",
        credentials
      );
      expect(axiosInstance.post).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResponse);
    });

    it("should handle login errors", async () => {
      const mockError = new Error("Login failed");
      axiosInstance.post.mockRejectedValue(mockError);

      const credentials = { username: "testuser", password: "wrongpassword" };

      await expect(login(credentials)).rejects.toThrow("Login failed");
      expect(axiosInstance.post).toHaveBeenCalledWith(
        "/auth/login",
        credentials
      );
    });

    it("should work with different credential formats", async () => {
      const mockResponse = { data: { success: true } };
      axiosInstance.post.mockResolvedValue(mockResponse);

      const credentials = { username: "user@email.com", password: "pass" };
      await login(credentials);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        "/auth/login",
        credentials
      );
    });
  });

  describe("register", () => {
    it("should call axios post with correct parameters for registration", async () => {
      const mockResponse = {
        data: {
          success: true,
          user: { id: 1, username: "newuser" },
        },
      };

      axiosInstance.post.mockResolvedValue(mockResponse);

      const userData = {
        username: "newuser",
        password: "password123",
        email: "newuser@email.com",
        fullName: "New User",
      };

      const result = await register(userData);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        "/auth/register",
        userData
      );
      expect(axiosInstance.post).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResponse);
    });

    it("should handle registration errors", async () => {
      const mockError = new Error("Registration failed");
      axiosInstance.post.mockRejectedValue(mockError);

      const userData = {
        username: "existinguser",
        password: "password123",
        email: "existing@email.com",
      };

      await expect(register(userData)).rejects.toThrow("Registration failed");
      expect(axiosInstance.post).toHaveBeenCalledWith(
        "/auth/register",
        userData
      );
    });

    it("should work with minimal user data", async () => {
      const mockResponse = { data: { success: true } };
      axiosInstance.post.mockResolvedValue(mockResponse);

      const userData = {
        username: "minimaluser",
        password: "password123",
      };

      await register(userData);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        "/auth/register",
        userData
      );
    });
  });
});
