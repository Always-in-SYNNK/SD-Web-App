// src/tests/AuthDenied.test.jsx

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import AuthDenied from "../pages/AuthDenied";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("../components/auth/useAuthFonts", () => ({
  default: vi.fn(),
}));

describe("AuthDenied", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders access denied content", () => {
    render(<AuthDenied />);

    expect(screen.getByText(/Access Denied/i)).toBeInTheDocument();

    expect(
      screen.getByText(
        /You do not have permission to view this page/i
      )
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /Return/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /Back to Home/i })
    ).toBeInTheDocument();
  });

  it("navigates back when browser history exists", () => {
    Object.defineProperty(window, "history", {
      value: {
        length: 2,
      },
      writable: true,
    });

    render(<AuthDenied />);

    fireEvent.click(
      screen.getByRole("button", { name: /Return/i })
    );

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it("navigates home when no browser history exists", () => {
    Object.defineProperty(window, "history", {
      value: {
        length: 1,
      },
      writable: true,
    });

    render(<AuthDenied />);

    fireEvent.click(
      screen.getByRole("button", { name: /Return/i })
    );

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("navigates home from top nav button", () => {
    render(<AuthDenied />);

    fireEvent.click(
      screen.getByRole("button", { name: /Back to Home/i })
    );

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});