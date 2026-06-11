// src/test/test-utils.jsx
import React from "react";
import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "../contexts/ThemeContext";

// Custom render function that includes common providers
export const renderWithProviders = (ui, options = {}) => {
  const {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
        mutations: {
          retry: false,
        },
      },
    }),
    ...renderOptions
  } = options;

  const Wrapper = ({ children }) => (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>{children}</ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient,
  };
};

// Mock data factories
export const createMockTransaction = (overrides = {}) => ({
  id: "trans-1",
  date: "2024-01-15T10:00:00Z",
  createdAt: "2024-01-15T10:00:00Z",
  category: {
    id: "cat-1",
    name: "Food",
    icon: "fa-utensils",
  },
  description: "Test transaction",
  paymentMethod: {
    type: "TIENMAT",
    name: "Cash",
  },
  amount: 50000,
  type: "expense",
  ...overrides,
});

export const createMockCategory = (overrides = {}) => ({
  id: "cat-1",
  name: "Food",
  icon: "fa-utensils",
  type: "expense",
  ...overrides,
});

export const createMockUser = (overrides = {}) => ({
  id: "user-1",
  username: "testuser",
  email: "test@example.com",
  fullName: "Test User",
  ...overrides,
});

export const createMockAccount = (overrides = {}) => ({
  id: "acc-1",
  name: "Cash",
  type: "TIENMAT",
  balance: 1000000,
  ...overrides,
});

export const createMockGoal = (overrides = {}) => ({
  id: "goal-1",
  name: "Vacation",
  targetAmount: 5000000,
  currentAmount: 1000000,
  targetDate: "2024-12-31",
  category: "travel",
  ...overrides,
});

// Custom matchers for testing
export const customMatchers = {
  toBeValidCurrency: (received) => {
    const currencyRegex = /^\d{1,3}(,\d{3})*(\.\d{2})?\s*₫$/;
    const pass = currencyRegex.test(received);

    return {
      message: () =>
        pass
          ? `Expected ${received} not to be a valid currency format`
          : `Expected ${received} to be a valid currency format`,
      pass,
    };
  },

  toBeValidDate: (received) => {
    const date = new Date(received);
    const pass = !isNaN(date.getTime());

    return {
      message: () =>
        pass
          ? `Expected ${received} not to be a valid date`
          : `Expected ${received} to be a valid date`,
      pass,
    };
  },
};

// Test data constants
export const TEST_CONSTANTS = {
  VALID_EMAIL: "test@example.com",
  VALID_PASSWORD: "password123",
  VALID_USERNAME: "testuser",
  SAMPLE_DATE: "2024-01-15T10:00:00Z",
  CURRENCY_AMOUNTS: [1000, 50000, 1000000],
  TRANSACTION_TYPES: ["income", "expense"],
  PAYMENT_METHODS: ["TIENMAT", "THENGANHANG"],
};
