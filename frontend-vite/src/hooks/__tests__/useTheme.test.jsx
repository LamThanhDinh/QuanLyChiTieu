// src/hooks/__tests__/useTheme.test.jsx
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTheme } from "../useTheme";
import { ThemeProvider } from "../../contexts/ThemeContext";

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
globalThis.localStorage = localStorageMock;

describe("useTheme", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const wrapper = ({ children }) => <ThemeProvider>{children}</ThemeProvider>;

  it("should throw error when used outside ThemeProvider", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    expect(() => {
      renderHook(() => useTheme());
    }).toThrow("useTheme must be used within a ThemeProvider");

    consoleError.mockRestore();
  });

  it("should return theme context when used within ThemeProvider", () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current).toHaveProperty("isDarkMode");
    expect(result.current).toHaveProperty("toggleTheme");
    expect(result.current).toHaveProperty("theme");
    expect(typeof result.current.toggleTheme).toBe("function");
  });

  it("should initialize with light mode by default", () => {
    localStorageMock.getItem.mockReturnValue(null);

    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.isDarkMode).toBe(false);
    expect(result.current.theme).toBe("light");
  });

  it("should initialize from localStorage if available", () => {
    localStorageMock.getItem.mockReturnValue("true");

    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.isDarkMode).toBe(true);
    expect(result.current.theme).toBe("dark");
  });

  it("should toggle theme correctly", () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    // Initially light mode
    expect(result.current.isDarkMode).toBe(false);
    expect(result.current.theme).toBe("light");

    // Toggle to dark mode
    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.isDarkMode).toBe(true);
    expect(result.current.theme).toBe("dark");

    // Toggle back to light mode
    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.isDarkMode).toBe(false);
    expect(result.current.theme).toBe("light");
  });

  it("should save theme preference to localStorage when toggled", () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      result.current.toggleTheme();
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith("darkMode", "true");

    act(() => {
      result.current.toggleTheme();
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith("darkMode", "false");
  });

  it("should work with null localStorage value", () => {
    localStorageMock.getItem.mockReturnValue(null);

    // Should default to false when localStorage is null
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.isDarkMode).toBe(false);
  });
});
