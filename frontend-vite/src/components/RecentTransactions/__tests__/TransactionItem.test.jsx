// src/components/RecentTransactions/__tests__/TransactionItem.test.jsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import TransactionItem from "../TransactionItem";

// Mock the CSS module
vi.mock("../RecentTransactions.module.css", () => ({
  default: {
    transactionRow: "transactionRow",
    dateTimeContainer: "dateTimeContainer",
    datePart: "datePart",
    timePart: "timePart",
    categoryCell: "categoryCell",
    categoryIcon: "categoryIcon",
    pmCash: "pmCash",
    pmBank: "pmBank",
    pmOther: "pmOther",
  },
}));

// Mock FontAwesome components
vi.mock("@fortawesome/react-fontawesome", () => ({
  FontAwesomeIcon: ({ icon, className, onClick }) => (
    <i
      data-testid="font-awesome-icon"
      className={className}
      onClick={onClick}
      data-icon={icon?.iconName || "default"}
    />
  ),
}));

// Mock iconMap utility
vi.mock("../../utils/iconMap", () => ({
  getIconObject: vi.fn(() => ({ iconName: "utensils" })),
}));

// Wrapper component with Router
const TransactionItemWrapper = ({ children }) => (
  <BrowserRouter>
    <table>
      <tbody>{children}</tbody>
    </table>
  </BrowserRouter>
);

describe("TransactionItem", () => {
  const mockTransaction = {
    id: "1",
    date: "2024-01-15T10:00:00Z",
    createdAt: "2024-01-15T10:00:00Z",
    category: {
      id: "cat1",
      name: "Food",
      icon: "fa-utensils",
    },
    description: "Lunch at restaurant",
    paymentMethod: {
      type: "TIENMAT",
      name: "Cash",
    },
    amount: 150000,
    type: "expense",
  };

  const mockProps = {
    transaction: mockTransaction,
    onEditRequest: vi.fn(),
    onDeleteRequest: vi.fn(),
    onCategoryClick: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render transaction item correctly", () => {
    render(
      <TransactionItemWrapper>
        <TransactionItem {...mockProps} />
      </TransactionItemWrapper>
    );

    // Check if transaction description is rendered
    expect(screen.getByText("Lunch at restaurant")).toBeInTheDocument();

    // Check if amount is formatted correctly
    expect(screen.getByText("150.000 ₫")).toBeInTheDocument();
  });

  it("should return null when transaction is not provided", () => {
    const { container } = render(
      <TransactionItemWrapper>
        <TransactionItem {...mockProps} transaction={null} />
      </TransactionItemWrapper>
    );

    expect(container.querySelector("tr")).toBeNull();
  });

  it("should format date and time correctly", () => {
    render(
      <TransactionItemWrapper>
        <TransactionItem {...mockProps} />
      </TransactionItemWrapper>
    );

    // Check if date is formatted (should be in DD/MM/YYYY format)
    expect(screen.getByText(/15\/01\/2024/)).toBeInTheDocument();

    // Check if time is displayed
    expect(screen.getByText(/Tạo lúc:/)).toBeInTheDocument();
  });

  it("should handle edit button click", () => {
    render(
      <TransactionItemWrapper>
        <TransactionItem {...mockProps} />
      </TransactionItemWrapper>
    );

    const editButton = screen.getByTitle("Sửa");
    fireEvent.click(editButton);

    expect(mockProps.onEditRequest).toHaveBeenCalledWith(mockTransaction);
  });

  it("should handle delete button click", () => {
    render(
      <TransactionItemWrapper>
        <TransactionItem {...mockProps} />
      </TransactionItemWrapper>
    );

    const deleteButton = screen.getByTitle("Xóa");
    fireEvent.click(deleteButton);

    expect(mockProps.onDeleteRequest).toHaveBeenCalledWith(mockTransaction.id);
  });

  it("should handle category click with callback", () => {
    render(
      <TransactionItemWrapper>
        <TransactionItem {...mockProps} />
      </TransactionItemWrapper>
    );

    const categoryElement = screen.getByText("Food");
    fireEvent.click(categoryElement);

    expect(mockProps.onCategoryClick).toHaveBeenCalledWith("cat1", "Food");
  });

  it("should handle missing date gracefully", () => {
    const transactionWithoutDate = {
      ...mockTransaction,
      date: null,
      createdAt: null,
    };

    render(
      <TransactionItemWrapper>
        <TransactionItem {...mockProps} transaction={transactionWithoutDate} />
      </TransactionItemWrapper>
    );

    expect(screen.getByText("N/A")).toBeInTheDocument();
  });

  it("should format currency for non-number amounts", () => {
    const transactionWithInvalidAmount = {
      ...mockTransaction,
      amount: "invalid",
    };

    render(
      <TransactionItemWrapper>
        <TransactionItem
          {...mockProps}
          transaction={transactionWithInvalidAmount}
        />
      </TransactionItemWrapper>
    );

    expect(screen.getByText("0 ₫")).toBeInTheDocument();
  });

  it("should apply correct styles for different payment methods", () => {
    const { rerender, container } = render(
      <TransactionItemWrapper>
        <TransactionItem {...mockProps} />
      </TransactionItemWrapper>
    );

    // Test with cash payment method
    expect(container.querySelector(".pmCash")).toBeInTheDocument();

    // Test with bank payment method
    const bankTransaction = {
      ...mockTransaction,
      paymentMethod: { type: "THENGANHANG", name: "Bank Card" },
    };

    rerender(
      <TransactionItemWrapper>
        <TransactionItem {...mockProps} transaction={bankTransaction} />
      </TransactionItemWrapper>
    );

    expect(container.querySelector(".pmBank")).toBeInTheDocument();
  });

  it("should handle category without id gracefully", () => {
    const transactionWithoutCategoryId = {
      ...mockTransaction,
      category: {
        name: "Food",
        icon: "fa-utensils",
        // no id
      },
    };

    render(
      <TransactionItemWrapper>
        <TransactionItem
          {...mockProps}
          transaction={transactionWithoutCategoryId}
        />
      </TransactionItemWrapper>
    );

    const categoryElement = screen.getByText("Food");
    fireEvent.click(categoryElement);

    // Should not call onCategoryClick when no category id
    expect(mockProps.onCategoryClick).not.toHaveBeenCalled();
  });
});
