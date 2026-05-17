// src/tests/ProviderGoogleLoginButton.test.jsx

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ProviderGoogleLoginButton from "../components/auth/ProviderGoogleLoginButton";

const mockNavigate = vi.fn();
const mockLogin = vi.fn();

const mockCheckProviderUser = vi.fn();
const mockSignInProvider = vi.fn();
const mockSignUpProvider = vi.fn();
let renderGoogleLogin = ({ onSuccess, onError }) => (
  <div>
    <button
      onClick={() =>
        onSuccess({
          credential: "provider-token",
        })
      }
    >
      Provider Success
    </button>

    <button onClick={onError}>
      Provider Error
    </button>
  </div>
);

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("../context/useAuth", () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}));

vi.mock("../services/authService", () => ({
  checkProviderUser: (...args) =>
    mockCheckProviderUser(...args),

  signInProvider: (...args) =>
    mockSignInProvider(...args),

  signUpProvider: (...args) =>
    mockSignUpProvider(...args),
}));

vi.mock("@react-oauth/google", () => ({
  GoogleLogin: (props) => renderGoogleLogin(props),
}));

describe("ProviderGoogleLoginButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    renderGoogleLogin = ({ onSuccess, onError }) => (
      <div>
        <button
          onClick={() =>
            onSuccess({
              credential: "provider-token",
            })
          }
        >
          Provider Success
        </button>

        <button onClick={onError}>
          Provider Error
        </button>
      </div>
    );
  });

  it("signs in existing provider successfully", async () => {
    const onLoadingChange = vi.fn();
    const onError = vi.fn();

    mockCheckProviderUser.mockResolvedValue({
      exists: true,
    });

    mockSignInProvider.mockResolvedValue({
      success: true,
      token: "provider-jwt",
      user: {
        id: 1,
        email: "provider@test.com",
      },
    });

    render(
      <ProviderGoogleLoginButton
        onLoadingChange={onLoadingChange}
        onError={onError}
        onVerificationRequired={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText("Provider Success"));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled();

      expect(localStorage.getItem("token")).toBe(
        "provider-jwt"
      );

      expect(mockNavigate).toHaveBeenCalledWith(
        "/pipeline"
      );
    });

    expect(onLoadingChange).toHaveBeenCalledWith(true);
    expect(onLoadingChange).toHaveBeenCalledWith(false);
  });

  it("starts signup flow for new provider", async () => {
    const onVerificationRequired = vi.fn();

    mockCheckProviderUser.mockResolvedValue({
      exists: false,
    });

    mockSignUpProvider.mockResolvedValue({
      success: true,
      pending: true,
      email: "provider@test.com",
    });

    render(
      <ProviderGoogleLoginButton
        onLoadingChange={vi.fn()}
        onError={vi.fn()}
        onVerificationRequired={onVerificationRequired}
      />
    );

    fireEvent.click(screen.getByText("Provider Success"));

    await waitFor(() => {
      expect(onVerificationRequired).toHaveBeenCalledWith(
        "provider@test.com"
      );
    });
  });

  it("handles missing credential error", async () => {
    const onError = vi.fn();

    renderGoogleLogin = ({ onSuccess }) => (
      <button onClick={() => onSuccess({})}>
        Missing Credential
      </button>
    );

    render(
      <ProviderGoogleLoginButton
        onLoadingChange={vi.fn()}
        onError={onError}
        onVerificationRequired={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText("Missing Credential"));

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(
        "Network error. Please try again."
      );
    });
  });

  it("handles google oauth error", () => {
    const onError = vi.fn();

    render(
      <ProviderGoogleLoginButton
        onLoadingChange={vi.fn()}
        onError={onError}
        onVerificationRequired={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText("Provider Error"));

    expect(onError).toHaveBeenCalledWith(
      "Google sign-in failed. Please try again."
    );
  });

  it("calls onError when signInProvider returns failure", async () => {
    const onError = vi.fn();

    mockCheckProviderUser.mockResolvedValue({ exists: true });
    mockSignInProvider.mockResolvedValue({ success: false, message: "Sign in failed" });

    render(
      <ProviderGoogleLoginButton
        onLoadingChange={vi.fn()}
        onError={onError}
        onVerificationRequired={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText("Provider Success"));

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith("Sign in failed");
    });
  });

  it("calls onError when signUpProvider returns failure", async () => {
    const onError = vi.fn();

    mockCheckProviderUser.mockResolvedValue({ exists: false });
    mockSignUpProvider.mockResolvedValue({ success: false, message: "Signup failed" });

    render(
      <ProviderGoogleLoginButton
        onLoadingChange={vi.fn()}
        onError={onError}
        onVerificationRequired={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText("Provider Success"));

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith("Signup failed");
    });
  });
});