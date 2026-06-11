// src/components/Common/__tests__/HeaderCard.test.jsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import HeaderCard from "../HeaderCard";

// Mock FontAwesome
vi.mock("@fortawesome/react-fontawesome", () => ({
  FontAwesomeIcon: ({ icon }) => (
    <i
      data-testid="font-awesome-icon"
      data-icon={icon?.iconName || "default"}
    />
  ),
}));

// Mock CSS module
vi.mock("../HeaderCard.module.css", () => ({
  default: {
    headerCard: "headerCard",
    gridLayout: "gridLayout",
    gridItem1_1: "gridItem1_1",
    gridItem1_2: "gridItem1_2",
    gridItem2_1: "gridItem2_1",
    gridItem2_2: "gridItem2_2",
    greetingIcon: "greetingIcon",
    greetingText: "greetingText",
    titleText: "titleText",
    subtitle: "subtitle",
  },
}));

describe("HeaderCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("should render with minimal props", () => {
      render(<HeaderCard gridTitle="Test Title" />);

      expect(screen.getByText("Test Title")).toBeInTheDocument();
      expect(screen.getByTestId("font-awesome-icon")).toBeInTheDocument();
    });

    it("should render with all props provided", () => {
      const mockIcon = <span data-testid="custom-icon">Custom Icon</span>;
      const mockStats = <div data-testid="stats">Stats Content</div>;
      const mockInfo = <div data-testid="info">Info Content</div>;
      const mockAction = <button data-testid="action">Action Button</button>;

      render(
        <HeaderCard
          gridIcon={mockIcon}
          gridTitle="Main Title"
          gridSubtitle="Subtitle Text"
          gridStats={mockStats}
          gridInfo={mockInfo}
          gridAction={mockAction}
          className="custom-class"
        />
      );

      expect(screen.getByText("Main Title")).toBeInTheDocument();
      expect(screen.getByText("Subtitle Text")).toBeInTheDocument();
      expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
      expect(screen.getByTestId("stats")).toBeInTheDocument();
      expect(screen.getByTestId("info")).toBeInTheDocument();
      expect(screen.getByTestId("action")).toBeInTheDocument();
    });
  });

  describe("Icon Handling", () => {
    it("should render default icon when no custom icon provided", () => {
      render(<HeaderCard gridTitle="Test" />);

      const icon = screen.getByTestId("font-awesome-icon");
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute("data-icon", "calendar-days");
    });

    it("should render custom icon when provided", () => {
      const customIcon = <span data-testid="custom-icon">🏠</span>;

      render(<HeaderCard gridTitle="Test" gridIcon={customIcon} />);

      expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
      expect(screen.queryByTestId("font-awesome-icon")).not.toBeInTheDocument();
    });

    it("should render FontAwesome icon object correctly", () => {
      const faIcon = <i className="fas fa-home" data-testid="fa-home" />;

      render(<HeaderCard gridTitle="Test" gridIcon={faIcon} />);

      expect(screen.getByTestId("fa-home")).toBeInTheDocument();
    });
  });

  describe("Text Content", () => {
    it("should render title correctly", () => {
      render(<HeaderCard gridTitle="Important Title" />);

      const title = screen.getByText("Important Title");
      expect(title).toBeInTheDocument();
      expect(title).toHaveClass("titleText");
    });

    it("should render subtitle when provided", () => {
      render(
        <HeaderCard gridTitle="Main Title" gridSubtitle="This is a subtitle" />
      );

      const subtitle = screen.getByText("This is a subtitle");
      expect(subtitle).toBeInTheDocument();
      expect(subtitle).toHaveClass("subtitle");
    });

    it("should not render subtitle element when not provided", () => {
      render(<HeaderCard gridTitle="Just Title" />);

      expect(screen.queryByText(/subtitle/i)).not.toBeInTheDocument();
    });

    it("should handle empty subtitle gracefully", () => {
      render(<HeaderCard gridTitle="Title" gridSubtitle="" />);

      // Empty subtitle should not be rendered
      const subtitleElements = document.querySelectorAll(".subtitle");
      expect(subtitleElements).toHaveLength(0);
    });
  });

  describe("Grid Layout", () => {
    it("should apply correct CSS classes for grid layout", () => {
      const { container } = render(<HeaderCard gridTitle="Test" />);

      const headerCard = container.querySelector(".headerCard");
      expect(headerCard).toHaveClass("gridLayout");
    });

    it("should render all grid items", () => {
      const { container } = render(
        <HeaderCard
          gridTitle="Test"
          gridStats={<div>Stats</div>}
          gridInfo={<div>Info</div>}
          gridAction={<div>Action</div>}
        />
      );

      expect(container.querySelector(".gridItem1_1")).toBeInTheDocument();
      expect(container.querySelector(".gridItem1_2")).toBeInTheDocument();
      expect(container.querySelector(".gridItem2_1")).toBeInTheDocument();
      expect(container.querySelector(".gridItem2_2")).toBeInTheDocument();
    });

    it("should handle missing grid content gracefully", () => {
      const { container } = render(<HeaderCard gridTitle="Test" />);

      // Grid items should exist even if content is not provided
      expect(container.querySelector(".gridItem1_1")).toBeInTheDocument();
      expect(container.querySelector(".gridItem1_2")).toBeInTheDocument();
      expect(container.querySelector(".gridItem2_1")).toBeInTheDocument();
      expect(container.querySelector(".gridItem2_2")).toBeInTheDocument();
    });
  });

  describe("Custom Styling", () => {
    it("should apply custom className", () => {
      const { container } = render(
        <HeaderCard gridTitle="Test" className="my-custom-class" />
      );

      const headerCard = container.querySelector(".headerCard");
      expect(headerCard).toHaveClass("my-custom-class");
    });

    it("should combine default and custom classes", () => {
      const { container } = render(
        <HeaderCard gridTitle="Test" className="custom-1 custom-2" />
      );

      const headerCard = container.querySelector(".headerCard");
      expect(headerCard).toHaveClass("headerCard");
      expect(headerCard).toHaveClass("gridLayout");
      expect(headerCard).toHaveClass("custom-1");
      expect(headerCard).toHaveClass("custom-2");
    });

    it("should handle empty className", () => {
      const { container } = render(
        <HeaderCard gridTitle="Test" className="" />
      );

      const headerCard = container.querySelector(".headerCard");
      expect(headerCard).toHaveClass("headerCard");
      expect(headerCard).toHaveClass("gridLayout");
    });
  });

  describe("Complex Content", () => {
    it("should render React components in grid slots", () => {
      const StatsComponent = () => (
        <div data-testid="stats-component">
          <h3>Revenue</h3>
          <p>$1,000</p>
        </div>
      );

      const ActionComponent = () => (
        <button data-testid="action-button">Click me</button>
      );

      render(
        <HeaderCard
          gridTitle="Dashboard"
          gridStats={<StatsComponent />}
          gridAction={<ActionComponent />}
        />
      );

      expect(screen.getByTestId("stats-component")).toBeInTheDocument();
      expect(screen.getByTestId("action-button")).toBeInTheDocument();
      expect(screen.getByText("Revenue")).toBeInTheDocument();
      expect(screen.getByText("$1,000")).toBeInTheDocument();
    });

    it("should handle null and undefined content", () => {
      render(
        <HeaderCard
          gridTitle="Test"
          gridStats={null}
          gridInfo={undefined}
          gridAction={false}
        />
      );

      // Should not crash and render title
      expect(screen.getByText("Test")).toBeInTheDocument();
    });

    it("should render nested components correctly", () => {
      const NestedComponent = () => (
        <div>
          <div data-testid="level-1">
            <div data-testid="level-2">
              <span data-testid="level-3">Nested Content</span>
            </div>
          </div>
        </div>
      );

      render(
        <HeaderCard gridTitle="Nested Test" gridInfo={<NestedComponent />} />
      );

      expect(screen.getByTestId("level-1")).toBeInTheDocument();
      expect(screen.getByTestId("level-2")).toBeInTheDocument();
      expect(screen.getByTestId("level-3")).toBeInTheDocument();
      expect(screen.getByText("Nested Content")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should maintain proper semantic structure", () => {
      render(
        <HeaderCard
          gridTitle="Accessible Title"
          gridSubtitle="Accessible Subtitle"
        />
      );

      const title = screen.getByText("Accessible Title");
      const subtitle = screen.getByText("Accessible Subtitle");

      // Check that elements are properly nested
      expect(title.parentElement).toContain(subtitle);
    });

    it("should preserve accessibility attributes in content", () => {
      const AccessibleContent = () => (
        <button aria-label="Accessible Action" data-testid="accessible-button">
          Action
        </button>
      );

      render(
        <HeaderCard gridTitle="Test" gridAction={<AccessibleContent />} />
      );

      const button = screen.getByTestId("accessible-button");
      expect(button).toHaveAttribute("aria-label", "Accessible Action");
    });
  });

  describe("Performance", () => {
    it("should render efficiently with many props", () => {
      const startTime = performance.now();

      render(
        <HeaderCard
          gridIcon={<span>Icon</span>}
          gridTitle="Performance Test Title"
          gridSubtitle="Performance Test Subtitle"
          gridStats={<div>Stats</div>}
          gridInfo={<div>Info</div>}
          gridAction={<button>Action</button>}
          className="performance-test"
        />
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render quickly (less than 100ms is reasonable for a simple component)
      expect(renderTime).toBeLessThan(100);
      expect(screen.getByText("Performance Test Title")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle very long title text", () => {
      const longTitle =
        "This is a very long title that might cause layout issues or overflow problems in the UI".repeat(
          3
        );

      render(<HeaderCard gridTitle={longTitle} />);

      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it("should handle special characters in title", () => {
      const specialTitle = "Title with émojis 🎉 & spëciâl châráctërs!";

      render(<HeaderCard gridTitle={specialTitle} />);

      expect(screen.getByText(specialTitle)).toBeInTheDocument();
    });

    it("should handle HTML entities correctly", () => {
      const titleWithEntities = "Revenue &amp; Profit Analysis";

      render(<HeaderCard gridTitle={titleWithEntities} />);

      expect(screen.getByText(titleWithEntities)).toBeInTheDocument();
    });
  });
});
