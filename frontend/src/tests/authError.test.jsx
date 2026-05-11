// src/tests/AuthError.test.jsx

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import AuthErrorPage from "../pages/AuthError";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({
    state: {
      loginPage: "prov-login",
      message: "Custom authentication error",
    },
  }),
}));

vi.mock("../components/auth/useAuthFonts", () => ({
  default: vi.fn(),
}));

describe("AuthErrorPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders authentication error content", () => {
    render(<AuthErrorPage />);

    expect(
      screen.getByText(/Authentication Failed/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Custom authentication error/i)
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /Retry Login/i })
    ).toBeInTheDocument();
  });

  it("navigates to retry login page when button clicked", () => {
    render(<AuthErrorPage />);

    fireEvent.click(
      screen.getByRole("button", { name: /Retry Login/i })
    );

    expect(mockNavigate).toHaveBeenCalledWith("/prov-login");
  });
});