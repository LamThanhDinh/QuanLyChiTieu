// src/utils/__tests__/timeHelpers.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getGreeting, getFullDate } from "../timeHelpers";

describe("timeHelpers", () => {
  beforeEach(() => {
    // Mock Date để có kết quả test nhất quán
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("getGreeting", () => {
    it("should return early morning greeting for hours 4-5", () => {
      // Set time to 5:00 AM
      vi.setSystemTime(new Date("2024-01-01T05:00:00"));

      const greeting = getGreeting();
      expect(["Chào buổi sáng sớm!", "Một ngày mới bắt đầu!"]).toContain(
        greeting
      );
    });

    it("should return morning greeting for hours 6-10", () => {
      // Set time to 9:00 AM
      vi.setSystemTime(new Date("2024-01-01T09:00:00"));

      const greeting = getGreeting();
      expect(["Chào buổi sáng!", "Chúc bạn một ngày tốt lành!"]).toContain(
        greeting
      );
    });

    it("should return noon greeting for hours 11-12", () => {
      // Set time to 12:00 PM
      vi.setSystemTime(new Date("2024-01-01T12:00:00"));

      const greeting = getGreeting();
      expect(["Chào buổi trưa!", "Nghỉ ngơi và nạp năng lượng nhé!"]).toContain(
        greeting
      );
    });

    it("should return afternoon greeting for hours 13-17", () => {
      // Set time to 3:00 PM
      vi.setSystemTime(new Date("2024-01-01T15:00:00"));

      const greeting = getGreeting();
      expect(["Chào buổi chiều!", "Buổi chiều năng suất nhé!"]).toContain(
        greeting
      );
    });

    it("should return evening greeting for hours 18-21", () => {
      // Set time to 8:00 PM
      vi.setSystemTime(new Date("2024-01-01T20:00:00"));

      const greeting = getGreeting();
      expect(["Chào buổi tối!", "Một buổi tối thư giãn nhé!"]).toContain(
        greeting
      );
    });

    it("should return night greeting for hours 22-3", () => {
      // Set time to 11:00 PM
      vi.setSystemTime(new Date("2024-01-01T23:00:00"));

      const greeting = getGreeting();
      expect(["Khuya rồi, nghỉ ngơi thôi!", "Chúc bạn ngủ ngon!"]).toContain(
        greeting
      );
    });
  });

  describe("getFullDate", () => {
    it("should return formatted date string in Vietnamese", () => {
      // Set specific date
      vi.setSystemTime(new Date("2024-01-15T10:00:00"));

      const formattedDate = getFullDate();

      // Kiểm tra xem kết quả có chứa các phần tử cần thiết
      expect(formattedDate).toMatch(/Thứ|Chủ Nhật/); // Thứ trong tuần
      expect(formattedDate).toContain("2024"); // Năm
      expect(formattedDate).toMatch(/tháng|Tháng/); // Tháng
    });

    it("should return consistent format", () => {
      vi.setSystemTime(new Date("2024-12-25T15:30:00"));

      const formattedDate = getFullDate();

      // Kiểm tra format cơ bản
      expect(typeof formattedDate).toBe("string");
      expect(formattedDate.length).toBeGreaterThan(0);
    });
  });
});
