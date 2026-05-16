// src/tests/GoogleLoginButton.test.jsx

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import GoogleLoginButton from "../components/auth/GoogleLoginButton";

const mockNavigate = vi.fn();
const mockLogin = vi.fn();
const mockLoginWithGoogle = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("../context/useAuth", () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}));

vi.mock("../services/authService", () => ({
  loginWithGoogle: (...args) => mockLoginWithGoogle(...args),
}));

vi.mock("@react-oauth/google", () => ({
  GoogleLogin: ({ onSuccess, onError }) => (
    <div>
      <button
        onClick={() =>
          onSuccess({
            credential: "google-token",
          })
        }
      >
        Google Success
      </button>

      <button onClick={onError}>
        Google Error
      </button>
    </div>
  ),
}));

describe("GoogleLoginButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("logs in successfully for matching role", async () => {
    const onLoadingChange = vi.fn();
    const onSuccess = vi.fn();

    mockLoginWithGoogle.mockResolvedValue({
      user: { id: 1, role: "applicant" },
      token: "jwt-token",
      isNewUser: false,
    });

    render(
      <GoogleLoginButton
        selectedRole="applicant"
        onLoadingChange={onLoadingChange}
        onSuccess={onSuccess}
      />
    );

    fireEvent.click(screen.getByText("Google Success"));

    await waitFor(() => {
      expect(mockLoginWithGoogle).toHaveBeenCalledWith(
        "google-token",
        "applicant"
      );

      expect(mockLogin).toHaveBeenCalledWith(
        { id: 1, role: "applicant" },
        "jwt-token",
        false
      );

      expect(onSuccess).toHaveBeenCalled();
    });

    expect(onLoadingChange).toHaveBeenCalledWith(true);
    expect(onLoadingChange).toHaveBeenCalledWith(false);
  });

  it("redirects when role mismatch occurs", async () => {
    mockLoginWithGoogle.mockResolvedValue({
      user: { id: 1, role: "provider" },
      token: "jwt-token",
    });

    render(
      <GoogleLoginButton selectedRole="applicant" />
    );

    fireEvent.click(screen.getByText("Google Success"));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        "/auth-error",
        expect.objectContaining({
          state: expect.objectContaining({
            loginPage: "prov-login",
          }),
        })
      );
    });
  });

  it("handles login failure", async () => {
    mockLoginWithGoogle.mockRejectedValue(
      new Error("Authentication failed")
    );

    render(
      <GoogleLoginButton selectedRole="applicant" />
    );

    fireEvent.click(screen.getByText("Google Success"));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        "/auth-error",
        expect.objectContaining({
          state: expect.objectContaining({
            message: "Authentication failed",
          }),
        })
      );
    });
  });

  it("handles google oauth error", async () => {
    render(
      <GoogleLoginButton selectedRole="applicant" />
    );

    fireEvent.click(screen.getByText("Google Error"));

    expect(mockNavigate).toHaveBeenCalledWith(
      "/auth-error",
      expect.objectContaining({
        state: expect.objectContaining({
          message:
            "Google sign-in was cancelled or failed. Please try again.",
        }),
      })
    );
  });

  it("handles login failure when selectedRole is provider", async () => {
    mockLoginWithGoogle.mockRejectedValue(new Error("Provider auth failed"));

    render(
      <GoogleLoginButton selectedRole="provider" />
    );

    fireEvent.click(screen.getByText("Google Success"));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        "/auth-error",
        expect.objectContaining({
          state: expect.objectContaining({
            loginPage: "prov-login",
            message: "Provider auth failed",
          }),
        })
      );
    });
  });
});