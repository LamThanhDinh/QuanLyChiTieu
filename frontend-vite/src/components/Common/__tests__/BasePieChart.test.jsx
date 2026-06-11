// src/components/Common/__tests__/BasePieChart.test.jsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import BasePieChart from "../BasePieChart";

// Mock recharts
vi.mock("recharts", () => ({
  PieChart: ({ children, onClick }) => (
    <div data-testid="pie-chart" onClick={onClick}>
      {children}
    </div>
  ),
  Pie: ({ data, onClick, activeIndex, children }) => (
    <div data-testid="pie" onClick={() => onClick && onClick(data[0], 0)}>
      {data?.map((item, index) => (
        <div
          key={index}
          data-testid={`pie-slice-${index}`}
          data-active={index === activeIndex}
        >
          {item.name}: {item.value}
        </div>
      ))}
      {children}
    </div>
  ),
  Cell: ({ fill }) => <div data-testid="pie-cell" style={{ fill }} />,
  ResponsiveContainer: ({ children }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  Tooltip: ({ content }) => (
    <div data-testid="tooltip">
      {content &&
        content({
          active: true,
          payload: [{ payload: { name: "Test", value: 100 } }],
        })}
    </div>
  ),
  Sector: (props) => <div data-testid="sector" {...props} />,
}));

// Mock FontAwesome
vi.mock("@fortawesome/react-fontawesome", () => ({
  FontAwesomeIcon: ({ icon }) => (
    <i
      data-testid="font-awesome-icon"
      data-icon={icon?.iconName || "default"}
    />
  ),
}));

// Mock iconMap
vi.mock("../../../utils/iconMap", () => ({
  getIconObject: vi.fn(() => ({ iconName: "utensils" })),
}));

// Mock CSS module
vi.mock("../BasePieChart.module.css", () => ({
  default: {
    chartCard: "chartCard",
    chartTitle: "chartTitle",
    chartContainer: "chartContainer",
    centerLabel: "centerLabel",
    centerLabelActive: "centerLabelActive",
    categoryName: "categoryName",
    categoryAmount: "categoryAmount",
    customTooltip: "customTooltip",
    detailsLink: "detailsLink",
    detailsLinkButton: "detailsLinkButton",
    detailsLinkArrow: "detailsLinkArrow",
    loadingText: "loadingText",
    errorText: "errorText",
    noDataText: "noDataText",
  },
}));

// Wrapper component with Router
const BasePieChartWrapper = ({ children }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe("BasePieChart", () => {
  const mockData = [
    {
      id: "1",
      name: "Food",
      value: 500000,
      icon: "fa-utensils",
      color: "#0088FE",
    },
    {
      id: "2",
      name: "Transport",
      value: 200000,
      icon: "fa-car",
      color: "#00C49F",
    },
    {
      id: "3",
      name: "Shopping",
      value: 300000,
      icon: "fa-shopping-cart",
      color: "#FFBB28",
    },
  ];

  const defaultProps = {
    data: mockData,
    total: 1000000,
    loading: false,
    error: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render chart with data correctly", () => {
      render(
        <BasePieChartWrapper>
          <BasePieChart {...defaultProps} />
        </BasePieChartWrapper>
      );

      expect(screen.getByTestId("pie-chart")).toBeInTheDocument();
      expect(screen.getByTestId("pie")).toBeInTheDocument();
      expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
    });

    it("should render title when provided", () => {
      render(
        <BasePieChartWrapper>
          <BasePieChart {...defaultProps} title="Test Chart" />
        </BasePieChartWrapper>
      );

      expect(screen.getByText("Test Chart")).toBeInTheDocument();
    });

    it("should render center label with total when no slice is active", () => {
      render(
        <BasePieChartWrapper>
          <BasePieChart {...defaultProps} />
        </BasePieChartWrapper>
      );

      expect(screen.getByText("Tổng cộng")).toBeInTheDocument();
      expect(screen.getByText("1.000.000 ₫")).toBeInTheDocument();
    });

    it("should render active category label when slice is selected", () => {
      render(
        <BasePieChartWrapper>
          <BasePieChart
            {...defaultProps}
            activeCategoryId="1"
            activeCategoryName="Food"
          />
        </BasePieChartWrapper>
      );

      expect(screen.getByText("Food")).toBeInTheDocument();
      expect(screen.getByText("500.000 ₫")).toBeInTheDocument();
    });

    it("should render details link when provided", () => {
      const detailsLink = {
        url: "/details",
        text: "View Details",
        title: "Click to view details",
      };

      render(
        <BasePieChartWrapper>
          <BasePieChart {...defaultProps} detailsLink={detailsLink} />
        </BasePieChartWrapper>
      );

      const link = screen.getByText("View Details");
      expect(link).toBeInTheDocument();
      expect(link.closest("a")).toHaveAttribute("href", "/details");
      expect(link.closest("a")).toHaveAttribute(
        "title",
        "Click to view details"
      );
    });
  });

  describe("States", () => {
    it("should render loading state", () => {
      render(
        <BasePieChartWrapper>
          <BasePieChart {...defaultProps} loading={true} />
        </BasePieChartWrapper>
      );

      expect(screen.getByText("Đang tải...")).toBeInTheDocument();
      expect(screen.queryByTestId("pie-chart")).not.toBeInTheDocument();
    });

    it("should render error state", () => {
      render(
        <BasePieChartWrapper>
          <BasePieChart {...defaultProps} error="Network error" />
        </BasePieChartWrapper>
      );

      expect(screen.getByText("Network error")).toBeInTheDocument();
      expect(screen.queryByTestId("pie-chart")).not.toBeInTheDocument();
    });

    it("should render no data state", () => {
      render(
        <BasePieChartWrapper>
          <BasePieChart {...defaultProps} data={[]} />
        </BasePieChartWrapper>
      );

      expect(
        screen.getByText("Không có dữ liệu cho khoảng thời gian này.")
      ).toBeInTheDocument();
      expect(screen.queryByTestId("pie-chart")).not.toBeInTheDocument();
    });

    it("should render no data state when data is null", () => {
      render(
        <BasePieChartWrapper>
          <BasePieChart {...defaultProps} data={null} />
        </BasePieChartWrapper>
      );

      expect(
        screen.getByText("Không có dữ liệu cho khoảng thời gian này.")
      ).toBeInTheDocument();
    });
  });

  describe("Interactions", () => {
    it("should call onSliceClick when pie slice is clicked", () => {
      const mockOnSliceClick = vi.fn();

      render(
        <BasePieChartWrapper>
          <BasePieChart {...defaultProps} onSliceClick={mockOnSliceClick} />
        </BasePieChartWrapper>
      );

      const pie = screen.getByTestId("pie");
      fireEvent.click(pie);

      expect(mockOnSliceClick).toHaveBeenCalledWith(mockData[0], 0);
    });

    it("should handle center label click to reset selection", () => {
      const mockOnSliceClick = vi.fn();

      render(
        <BasePieChartWrapper>
          <BasePieChart
            {...defaultProps}
            onSliceClick={mockOnSliceClick}
            activeCategoryId="1"
          />
        </BasePieChartWrapper>
      );

      const centerLabel = screen
        .getByText("Food")
        .closest(".centerLabelActive");
      fireEvent.click(centerLabel);

      expect(mockOnSliceClick).toHaveBeenCalledWith(null, -1);
    });
  });

  describe("Configuration", () => {
    it("should apply custom chart configuration", () => {
      const chartConfig = {
        innerRadius: 60,
        outerRadius: 100,
        paddingAngle: 5,
        height: 300,
      };

      const { container } = render(
        <BasePieChartWrapper>
          <BasePieChart {...defaultProps} chartConfig={chartConfig} />
        </BasePieChartWrapper>
      );

      // Chart should render with custom height
      const chartContainer = container.querySelector(
        '[style*="height: 300px"]'
      );
      expect(chartContainer).toBeInTheDocument();
    });

    it("should use custom colors when provided", () => {
      const customColors = ["#FF0000", "#00FF00", "#0000FF"];

      render(
        <BasePieChartWrapper>
          <BasePieChart {...defaultProps} colors={customColors} />
        </BasePieChartWrapper>
      );

      // Should render pie cells (colors are applied internally)
      expect(screen.getAllByTestId("pie-cell")).toHaveLength(mockData.length);
    });

    it("should hide center label when showCenterLabel is false", () => {
      render(
        <BasePieChartWrapper>
          <BasePieChart {...defaultProps} showCenterLabel={false} />
        </BasePieChartWrapper>
      );

      expect(screen.queryByText("Tổng cộng")).not.toBeInTheDocument();
    });

    it("should hide tooltip when showTooltip is false", () => {
      render(
        <BasePieChartWrapper>
          <BasePieChart {...defaultProps} showTooltip={false} />
        </BasePieChartWrapper>
      );

      expect(screen.queryByTestId("tooltip")).not.toBeInTheDocument();
    });
  });

  describe("Data Processing", () => {
    it("should handle data without colors and assign default colors", () => {
      const dataWithoutColors = [
        { id: "1", name: "Food", value: 500000 },
        { id: "2", name: "Transport", value: 200000 },
      ];

      render(
        <BasePieChartWrapper>
          <BasePieChart {...defaultProps} data={dataWithoutColors} />
        </BasePieChartWrapper>
      );

      expect(screen.getByTestId("pie")).toBeInTheDocument();
    });

    it("should handle data without ids and generate them", () => {
      const dataWithoutIds = [
        { name: "Food", value: 500000 },
        { name: "Transport", value: 200000 },
      ];

      render(
        <BasePieChartWrapper>
          <BasePieChart {...defaultProps} data={dataWithoutIds} />
        </BasePieChartWrapper>
      );

      expect(screen.getByTestId("pie")).toBeInTheDocument();
    });

    it("should find active index correctly with _id field", () => {
      const dataWithUnderscoreId = [
        { _id: "1", name: "Food", value: 500000 },
        { _id: "2", name: "Transport", value: 200000 },
      ];

      render(
        <BasePieChartWrapper>
          <BasePieChart
            {...defaultProps}
            data={dataWithUnderscoreId}
            activeCategoryId="2"
          />
        </BasePieChartWrapper>
      );

      // Should find and activate the correct slice
      expect(screen.getByTestId("pie-slice-1")).toHaveAttribute(
        "data-active",
        "true"
      );
    });
  });

  describe("Text Truncation", () => {
    it("should truncate long category names in center label", () => {
      const dataWithLongName = [
        {
          id: "1",
          name: "This is a very long category name that should be truncated",
          value: 500000,
        },
      ];

      render(
        <BasePieChartWrapper>
          <BasePieChart
            {...defaultProps}
            data={dataWithLongName}
            activeCategoryId="1"
          />
        </BasePieChartWrapper>
      );

      // Should show truncated name with ellipsis in the center label specifically
      const nameElement = screen.getByText(
        "This is a very long category name..."
      );
      expect(nameElement).toBeInTheDocument();
      expect(nameElement.textContent).toContain("...");
    });
  });

  describe("Currency Formatting", () => {
    it("should format currency correctly in Vietnamese format", () => {
      render(
        <BasePieChartWrapper>
          <BasePieChart {...defaultProps} />
        </BasePieChartWrapper>
      );

      // Should show formatted currency
      expect(screen.getByText("1.000.000 ₫")).toBeInTheDocument();
    });

    it("should handle zero values correctly", () => {
      const zeroData = [{ id: "1", name: "Empty", value: 0 }];

      render(
        <BasePieChartWrapper>
          <BasePieChart {...defaultProps} data={zeroData} total={0} />
        </BasePieChartWrapper>
      );

      expect(screen.getByText("0 ₫")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper title attributes for interactive elements", () => {
      const detailsLink = {
        url: "/details",
        text: "View Details",
        title: "Click to view detailed analytics",
      };

      render(
        <BasePieChartWrapper>
          <BasePieChart
            {...defaultProps}
            detailsLink={detailsLink}
            activeCategoryId="1"
          />
        </BasePieChartWrapper>
      );

      const link = screen.getByTitle("Click to view detailed analytics");
      expect(link).toBeInTheDocument();

      const centerLabel = screen.getByTitle("Click để xem tổng quan");
      expect(centerLabel).toBeInTheDocument();
    });
  });
});
