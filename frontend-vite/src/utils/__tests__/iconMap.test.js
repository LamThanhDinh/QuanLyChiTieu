// src/utils/__tests__/iconMap.test.js
import { describe, it, expect } from "vitest";
import { getIconObject, isEmoji, renderIcon } from "../iconMap";
import { faBullseye } from "@fortawesome/free-solid-svg-icons";

describe("iconMap", () => {
  describe("getIconObject", () => {
    it("should return correct icon for valid icon name", () => {
      const icon = getIconObject("fa-utensils");
      expect(icon).toBeDefined();
      expect(typeof icon).toBe("object");
    });

    it("should return default icon for invalid icon name", () => {
      const icon = getIconObject("fa-invalid-icon");
      expect(icon).toBe(faBullseye); // Default icon is faBullseye
    });

    it("should return default icon for undefined input", () => {
      const icon = getIconObject(undefined);
      expect(icon).toBe(faBullseye);
    });

    it("should return default icon for null input", () => {
      const icon = getIconObject(null);
      expect(icon).toBe(faBullseye);
    });

    it("should return default icon for empty string", () => {
      const icon = getIconObject("");
      expect(icon).toBe(faBullseye);
    });
  });

  describe("isEmoji", () => {
    it("should return true for emoji characters", () => {
      expect(isEmoji("😀")).toBe(true);
      expect(isEmoji("🎯")).toBe(true);
      expect(isEmoji("🚗")).toBe(true);
      expect(isEmoji("🏠")).toBe(true);
      expect(isEmoji("💰")).toBe(true);
    });

    it("should return false for non-emoji characters", () => {
      expect(isEmoji("a")).toBe(false);
      expect(isEmoji("123")).toBe(false);
      expect(isEmoji("fa-utensils")).toBe(false);
      expect(isEmoji("text")).toBe(false);
    });

    it("should return false for empty string", () => {
      expect(isEmoji("")).toBe(false);
    });

    it("should return false for undefined/null", () => {
      expect(isEmoji(undefined)).toBe(false);
      expect(isEmoji(null)).toBe(false);
    });
  });

  describe("renderIcon", () => {
    it("should return default emoji for undefined input", () => {
      const result = renderIcon(undefined);
      expect(result).toEqual({
        type: "emoji",
        content: "🎯",
      });
    });

    it("should return default emoji for null input", () => {
      const result = renderIcon(null);
      expect(result).toEqual({
        type: "emoji",
        content: "🎯",
      });
    });

    it("should return emoji type for emoji input", () => {
      const result = renderIcon("😀");
      expect(result).toEqual({
        type: "emoji",
        content: "😀",
      });
    });

    it("should return fontawesome type for fa- prefix input", () => {
      const result = renderIcon("fa-utensils");
      expect(result.type).toBe("fontawesome");
      expect(result.content).toBeDefined();
      expect(typeof result.content).toBe("object");
    });

    it("should return default emoji for non-emoji, non-fa text", () => {
      const result = renderIcon("some-random-text");
      expect(result).toEqual({
        type: "emoji",
        content: "🎯",
      });
    });

    it("should return default emoji for empty string", () => {
      const result = renderIcon("");
      expect(result).toEqual({
        type: "emoji",
        content: "🎯",
      });
    });
  });
});
