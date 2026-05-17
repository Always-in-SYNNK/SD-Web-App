// frontend/src/tests/protectedRoute.test.jsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";
import ProtectedRoute from "../routes/protectedRoute";

// ── Mock Auth ────────────────────────────────────────────────────────────────

const mockUseAuth = vi.fn();

vi.mock("../context/useAuth", () => ({
  useAuth: () => mockUseAuth(),
}));

// ── Helpers ──────────────────────────────────────────────────────────────────

function LocationDisplay() {
  const location = useLocation();

  return (
    <div>
      <p data-testid="pathname">{location.pathname}</p>
      <p data-testid="state">
        {JSON.stringify(location.state || {})}
      </p>
    </div>
  );
}

function SecretPage() {
  return <div>Protected Content</div>;
}

function renderRoute(requiredRole) {
  return render(
    <MemoryRouter initialEntries={["/dashboard"]}>
      <Routes>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requiredRole={requiredRole}>
              <SecretPage />
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<LocationDisplay />} />
        <Route path="/auth-error" element={<LocationDisplay />} />
        <Route path="/unauthorized" element={<LocationDisplay />} />
      </Routes>
    </MemoryRouter>
  );
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe("ProtectedRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  // ── Logout redirect ───────────────────────────────────────────────────────

  it("redirects to home when logout redirect flag exists", () => {
    localStorage.setItem("__logout_redirect", "true");

    mockUseAuth.mockReturnValue({
      token: null,
      role: null,
      user: null,
    });

    renderRoute("applicant");

    expect(screen.getByTestId("pathname").textContent).toBe("/");
    expect(localStorage.getItem("__logout_redirect")).toBeNull();
  });

  // ── Applicant routes ──────────────────────────────────────────────────────

  it("allows applicant access to applicant routes", () => {
    mockUseAuth.mockReturnValue({
      token: "token",
      role: "applicant",
      user: { isAdmin: false },
    });

    renderRoute("applicant");

    expect(screen.getByText("Protected Content")).toBeDefined();
  });

  it("redirects provider away from applicant routes", () => {
    mockUseAuth.mockReturnValue({
      token: "token",
      role: "provider",
      user: { isAdmin: false },
    });

    renderRoute("applicant");

    expect(screen.getByTestId("pathname").textContent).toBe("/unauthorized");

    expect(screen.getByTestId("state").textContent).toContain(
      "You are not authorized to access this page."
    );
  });

  it("redirects unauthenticated user from applicant route to auth-error", () => {
    mockUseAuth.mockReturnValue({
      token: null,
      role: null,
      user: null,
    });

    renderRoute("applicant");

    expect(screen.getByTestId("pathname").textContent).toBe("/auth-error");

    expect(screen.getByTestId("state").textContent).toContain("app-login");
  });

  // ── Provider routes ───────────────────────────────────────────────────────

  it("allows provider access to provider routes", () => {
    mockUseAuth.mockReturnValue({
      token: "token",
      role: "provider",
      user: { isAdmin: false },
    });

    renderRoute("provider");

    expect(screen.getByText("Protected Content")).toBeDefined();
  });

  it("redirects applicant away from provider routes", () => {
    mockUseAuth.mockReturnValue({
      token: "token",
      role: "applicant",
      user: { isAdmin: false },
    });

    renderRoute("provider");

    expect(screen.getByTestId("pathname").textContent).toBe("/unauthorized");
  });

  it("redirects unauthenticated user from provider route with prov-login", () => {
    mockUseAuth.mockReturnValue({
      token: null,
      role: null,
      user: null,
    });

    renderRoute("provider");

    expect(screen.getByTestId("pathname").textContent).toBe("/auth-error");

    expect(screen.getByTestId("state").textContent).toContain("prov-login");
  });

  // ── Admin routes ──────────────────────────────────────────────────────────

  it("allows applicant admin access to admin routes", () => {
    mockUseAuth.mockReturnValue({
      token: "token",
      role: "applicant",
      user: { isAdmin: true },
    });

    renderRoute("admin");

    expect(screen.getByText("Protected Content")).toBeDefined();
  });

  it("allows provider admin access to admin routes", () => {
    mockUseAuth.mockReturnValue({
      token: "token",
      role: "provider",
      user: { isAdmin: true },
    });

    renderRoute("admin");

    expect(screen.getByText("Protected Content")).toBeDefined();
  });

  it("redirects non-admin applicant away from admin routes", () => {
    mockUseAuth.mockReturnValue({
      token: "token",
      role: "applicant",
      user: { isAdmin: false },
    });

    renderRoute("admin");

    expect(screen.getByTestId("pathname").textContent).toBe("/unauthorized");
  });

  it("redirects unauthenticated user away from admin routes", () => {
    mockUseAuth.mockReturnValue({
      token: null,
      role: null,
      user: null,
    });

    renderRoute("admin");

    expect(screen.getByTestId("pathname").textContent).toBe("/auth-error");
  });

  // ── Generic fallback logic ────────────────────────────────────────────────

  it("allows access when no requiredRole is provided and user has session", () => {
    mockUseAuth.mockReturnValue({
      token: "token",
      role: "applicant",
      user: { isAdmin: false },
    });

    renderRoute(undefined);

    expect(screen.getByText("Protected Content")).toBeDefined();
  });

  it("redirects to unauthorized when role does not match generic requiredRole", () => {
    mockUseAuth.mockReturnValue({
      token: "token",
      role: "provider",
      user: { isAdmin: false },
    });

    renderRoute("different-role");

    expect(screen.getByTestId("pathname").textContent).toBe("/unauthorized");
  });

  it("redirects unauthenticated generic route access to auth-error", () => {
    mockUseAuth.mockReturnValue({
      token: null,
      role: null,
      user: null,
    });

    renderRoute(undefined);

    expect(screen.getByTestId("pathname").textContent).toBe("/auth-error");
  });
});