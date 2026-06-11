// src/api/__tests__/transactionsService.test.js
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getTransactions,
  deleteTransaction,
  addTransaction,
  updateTransaction,
} from "../transactionsService";
import axiosInstance from "../axiosConfig";

// Mock axiosInstance
vi.mock("../axiosConfig", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("transactionsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getTransactions", () => {
    it("should call axios get with default parameters", async () => {
      const mockResponse = {
        data: {
          transactions: [],
          totalPages: 1,
          currentPage: 1,
        },
      };

      axiosInstance.get.mockResolvedValue(mockResponse);

      const result = await getTransactions();

      expect(axiosInstance.get).toHaveBeenCalledWith("/transactions", {
        params: { page: 1, limit: 5 },
      });
      expect(result).toEqual(mockResponse);
    });

    it("should call axios get with custom parameters", async () => {
      const mockResponse = { data: { transactions: [] } };
      axiosInstance.get.mockResolvedValue(mockResponse);

      await getTransactions(2, 10, { categoryId: "cat123" });

      expect(axiosInstance.get).toHaveBeenCalledWith("/transactions", {
        params: { page: 2, limit: 10, categoryId: "cat123" },
      });
    });

    it("should handle multiple filters", async () => {
      const mockResponse = { data: { transactions: [] } };
      axiosInstance.get.mockResolvedValue(mockResponse);

      const filters = {
        categoryId: "cat123",
        startDate: "2024-01-01",
        endDate: "2024-01-31",
        type: "expense",
      };

      await getTransactions(1, 5, filters);

      expect(axiosInstance.get).toHaveBeenCalledWith("/transactions", {
        params: { page: 1, limit: 5, ...filters },
      });
    });

    it("should handle API errors", async () => {
      const mockError = new Error("Network error");
      axiosInstance.get.mockRejectedValue(mockError);

      await expect(getTransactions()).rejects.toThrow("Network error");
    });
  });

  describe("deleteTransaction", () => {
    it("should call axios delete with correct transaction ID", async () => {
      const mockResponse = { data: { success: true } };
      axiosInstance.delete.mockResolvedValue(mockResponse);

      const transactionId = "trans123";
      const result = await deleteTransaction(transactionId);

      expect(axiosInstance.delete).toHaveBeenCalledWith(
        `/transactions/${transactionId}`
      );
      expect(result).toEqual(mockResponse);
    });

    it("should handle delete errors", async () => {
      const mockError = new Error("Delete failed");
      axiosInstance.delete.mockRejectedValue(mockError);

      await expect(deleteTransaction("trans123")).rejects.toThrow(
        "Delete failed"
      );
    });
  });

  describe("addTransaction", () => {
    it("should call axios post with transaction data", async () => {
      const mockResponse = {
        data: {
          success: true,
          transaction: { id: "new123" },
        },
      };
      axiosInstance.post.mockResolvedValue(mockResponse);

      const transactionData = {
        amount: 50000,
        description: "Coffee",
        categoryId: "cat123",
        type: "expense",
        date: "2024-01-15",
      };

      const result = await addTransaction(transactionData);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        "/transactions",
        transactionData
      );
      expect(result).toEqual(mockResponse);
    });

    it("should handle add transaction errors", async () => {
      const mockError = new Error("Validation failed");
      axiosInstance.post.mockRejectedValue(mockError);

      const transactionData = { amount: "invalid" };

      await expect(addTransaction(transactionData)).rejects.toThrow(
        "Validation failed"
      );
    });

    it("should work with minimal transaction data", async () => {
      const mockResponse = { data: { success: true } };
      axiosInstance.post.mockResolvedValue(mockResponse);

      const minimalData = {
        amount: 10000,
        description: "Test",
      };

      await addTransaction(minimalData);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        "/transactions",
        minimalData
      );
    });
  });

  describe("updateTransaction", () => {
    it("should call axios put with transaction ID and data", async () => {
      const mockResponse = {
        data: {
          success: true,
          transaction: { id: "trans123" },
        },
      };
      axiosInstance.put.mockResolvedValue(mockResponse);

      const transactionId = "trans123";
      const updateData = {
        amount: 75000,
        description: "Updated description",
        categoryId: "cat456",
      };

      const result = await updateTransaction(transactionId, updateData);

      expect(axiosInstance.put).toHaveBeenCalledWith(
        `/transactions/${transactionId}`,
        updateData
      );
      expect(result).toEqual(mockResponse);
    });

    it("should handle update errors", async () => {
      const mockError = new Error("Update failed");
      axiosInstance.put.mockRejectedValue(mockError);

      await expect(
        updateTransaction("trans123", { amount: 50000 })
      ).rejects.toThrow("Update failed");
    });

    it("should work with partial updates", async () => {
      const mockResponse = { data: { success: true } };
      axiosInstance.put.mockResolvedValue(mockResponse);

      const transactionId = "trans123";
      const partialUpdate = { description: "New description only" };

      await updateTransaction(transactionId, partialUpdate);

      expect(axiosInstance.put).toHaveBeenCalledWith(
        `/transactions/${transactionId}`,
        partialUpdate
      );
    });
  });
});
