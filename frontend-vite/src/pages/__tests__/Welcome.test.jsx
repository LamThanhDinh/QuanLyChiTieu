// src/pages/__tests__/Welcome.test.jsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Welcome from "../Welcome";

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock CSS module
vi.mock("../../styles/Welcome.module.css", () => ({
  default: {
    "welcome-container": "welcome-container",
    "welcome-logo": "welcome-logo",
    "welcome-title": "welcome-title",
    "welcome-desc": "welcome-desc",
    "welcome-btn-group": "welcome-btn-group",
    "welcome-button-img": "welcome-button-img",
  },
}));

// Mock images
vi.mock("../../assets/login/logo.png", () => ({ default: "logo.png" }));
vi.mock("../../assets/login/btn_dangky.png", () => ({
  default: "btn_register.png",
}));
vi.mock("../../assets/login/btn_dangnhap.png", () => ({
  default: "btn_login.png",
}));

// Wrapper component with Router
const WelcomeWrapper = ({ children }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe("Welcome Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render welcome page correctly", () => {
    render(
      <WelcomeWrapper>
        <Welcome />
      </WelcomeWrapper>
    );

    // Check main elements are rendered
    expect(screen.getByText("Chào mừng đến với EMG")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Trải nghiệm ứng dụng quản lý chi tiêu thông minh và tiện lợi"
      )
    ).toBeInTheDocument();

    // Check images are rendered
    expect(screen.getByAltText("Logo EMG")).toBeInTheDocument();
    expect(screen.getByAltText("Đăng ký")).toBeInTheDocument();
    expect(screen.getByAltText("Đăng nhập")).toBeInTheDocument();
  });

  it("should have correct image sources", () => {
    render(
      <WelcomeWrapper>
        <Welcome />
      </WelcomeWrapper>
    );

    const logoImg = screen.getByAltText("Logo EMG");
    const registerImg = screen.getByAltText("Đăng ký");
    const loginImg = screen.getByAltText("Đăng nhập");

    expect(logoImg).toHaveAttribute("src", "logo.png");
    expect(registerImg).toHaveAttribute("src", "btn_register.png");
    expect(loginImg).toHaveAttribute("src", "btn_login.png");
  });

  it("should navigate to register page when register button is clicked", () => {
    render(
      <WelcomeWrapper>
        <Welcome />
      </WelcomeWrapper>
    );

    const registerButton = screen.getByAltText("Đăng ký");
    fireEvent.click(registerButton);

    expect(mockNavigate).toHaveBeenCalledWith("/register");
    expect(mockNavigate).toHaveBeenCalledTimes(1);
  });

  it("should navigate to login page when login button is clicked", () => {
    render(
      <WelcomeWrapper>
        <Welcome />
      </WelcomeWrapper>
    );

    const loginButton = screen.getByAltText("Đăng nhập");
    fireEvent.click(loginButton);

    expect(mockNavigate).toHaveBeenCalledWith("/login");
    expect(mockNavigate).toHaveBeenCalledTimes(1);
  });

  it("should apply correct CSS classes", () => {
    const { container } = render(
      <WelcomeWrapper>
        <Welcome />
      </WelcomeWrapper>
    );

    // Check if main container has correct class
    expect(container.querySelector(".welcome-container")).toBeInTheDocument();

    // Check if logo has correct class
    const logoImg = screen.getByAltText("Logo EMG");
    expect(logoImg).toHaveClass("welcome-logo");

    // Check if buttons have correct class
    const registerButton = screen.getByAltText("Đăng ký");
    const loginButton = screen.getByAltText("Đăng nhập");

    expect(registerButton).toHaveClass("welcome-button-img");
    expect(loginButton).toHaveClass("welcome-button-img");
  });

  it("should render title with correct heading level", () => {
    render(
      <WelcomeWrapper>
        <Welcome />
      </WelcomeWrapper>
    );

    const title = screen.getByRole("heading", { level: 1 });
    expect(title).toBeInTheDocument();
    expect(title).toHaveTextContent("Chào mừng đến với EMG");
  });

  it("should have accessibility attributes for interactive elements", () => {
    render(
      <WelcomeWrapper>
        <Welcome />
      </WelcomeWrapper>
    );

    const registerButton = screen.getByAltText("Đăng ký");
    const loginButton = screen.getByAltText("Đăng nhập");

    // Check alt attributes are present for screen readers
    expect(registerButton).toHaveAttribute("alt", "Đăng ký");
    expect(loginButton).toHaveAttribute("alt", "Đăng nhập");
  });

  it("should handle multiple clicks on same button", () => {
    render(
      <WelcomeWrapper>
        <Welcome />
      </WelcomeWrapper>
    );

    const registerButton = screen.getByAltText("Đăng ký");

    // Click multiple times
    fireEvent.click(registerButton);
    fireEvent.click(registerButton);
    fireEvent.click(registerButton);

    expect(mockNavigate).toHaveBeenCalledTimes(3);
    expect(mockNavigate).toHaveBeenCalledWith("/register");
  });

  it("should handle keyboard events on button images", () => {
    render(
      <WelcomeWrapper>
        <Welcome />
      </WelcomeWrapper>
    );

    const loginButton = screen.getByAltText("Đăng nhập");

    // Simulate keyboard events
    fireEvent.keyDown(loginButton, { key: "Enter", code: "Enter" });

    // Note: onClick handlers on img elements don't typically respond to keyboard events
    // This test documents current behavior, but ideally buttons should be proper button elements
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
