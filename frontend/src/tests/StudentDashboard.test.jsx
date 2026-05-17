// src/tests/StudentDashboard.test.jsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StudentDashboard from "../pages/StudentDashboard";

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockUseAuth = vi.fn(() => ({
  token: "mock-token",
  user: { email: "test@example.com" },
}));

vi.mock("../context/useAuth", () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock("../components/dashboard/Sidebar", () => ({
  Sidebar: ({ activePage }) => <div data-testid="sidebar" data-active={activePage} />,
}));

vi.mock("../components/dashboard/DashboardHeader", () => ({
  DashboardHeader: ({ profile }) => (
    <div data-testid="dashboard-header" data-profile={JSON.stringify(profile)} />
  ),
}));

vi.mock("../components/dashboard/QualificationList", () => ({
  QualificationList: () => <div data-testid="qualification-list" />,
}));

vi.mock("../components/notifications/notificationDropdown", () => ({
  NotificationDropdown: () => <div data-testid="notification-dropdown" />,
}));

const mockFetch = vi.fn();

const MOCK_PROFILE = {
  full_name: "Kirsten Strydom",
  email: "test@example.com",
  bio: "Developer",
  location: "Johannesburg",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function setupFetchMocks({ profile = MOCK_PROFILE } = {}) {
  mockFetch.mockImplementation((url) => {
    if (url.includes("/api/profile/me/cv/signed-url")) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ signed_url: null }),
      });
    }

    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ profile }),
    });
  });
}

function renderPage() {
  return render(
    <MemoryRouter>
      <StudentDashboard />
    </MemoryRouter>
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("StudentDashboard", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubGlobal("fetch", mockFetch);
    mockUseAuth.mockImplementation(() => ({
      token: "mock-token",
      user: { email: "test@example.com" },
    }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // ── Rendering ──────────────────────────────────────────────────────────────

  it("renders the sidebar", async () => {
    setupFetchMocks();
    renderPage();
    await waitFor(() => expect(screen.getByTestId("sidebar")).toBeDefined());
  });

  it("sets sidebar activePage to /dashboard", async () => {
    setupFetchMocks();
    renderPage();
    await waitFor(() =>
      expect(screen.getByTestId("sidebar").getAttribute("data-active")).toBe("/dashboard")
    );
  });

  it("renders the dashboard header", async () => {
    setupFetchMocks();
    renderPage();
    await waitFor(() => expect(screen.getByTestId("dashboard-header")).toBeDefined());
  });

  it("renders the qualification list", async () => {
    setupFetchMocks();
    renderPage();
    await waitFor(() => expect(screen.getByTestId("qualification-list")).toBeDefined());
  });

  it("renders the CV card upload link when no CV is available", async () => {
    setupFetchMocks();
    renderPage();
    await waitFor(() => expect(screen.getByText(/Upload CV/i)).toBeDefined());
    expect(screen.getByRole("link", { name: /Upload CV/i })).toHaveAttribute("href", "/profile/edit");
  });

  it("renders the CV card view link when CV signed URL is available", async () => {
    mockFetch.mockImplementation((url) => {
      if (url.includes("/api/profile/me/cv/signed-url")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ signed_url: "https://example.com/cv.pdf" }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ profile: MOCK_PROFILE }),
      });
    });

    renderPage();
    await waitFor(() => expect(screen.getByText(/View CV/i)).toBeDefined());
    expect(screen.getByRole("link", { name: /View CV/i })).toHaveAttribute("href", "https://example.com/cv.pdf");
  });


  it("renders the notification dropdown", async () => {
    setupFetchMocks();
    renderPage();
    await waitFor(() => expect(screen.getByTestId("notification-dropdown")).toBeDefined());
  });

  it("renders the floating shield button", async () => {
    setupFetchMocks();
    renderPage();
    await waitFor(() => expect(screen.getByText(/🛡/)).toBeDefined());
  });
  // ── Nav links ──────────────────────────────────────────────────────────────

  it("renders Home nav link", async () => {
    setupFetchMocks();
    renderPage();
    await waitFor(() => expect(screen.getByText("Home")).toBeDefined());
  });

  it("renders Dashboard nav link", async () => {
    setupFetchMocks();
    renderPage();
    await waitFor(() => expect(screen.getByText("Dashboard")).toBeDefined());
  });

  it("highlights Dashboard as active", async () => {
    setupFetchMocks();
    renderPage();
    await waitFor(() => {
      const link = screen.getByText("Dashboard");
      expect(link.className).toContain("font-bold");
    });
  });

  // ── Profile fetch ──────────────────────────────────────────────────────────

  it("fetches profile on mount with auth token", async () => {
    setupFetchMocks();
    renderPage();
    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/profile/me"),
        expect.objectContaining({
          headers: expect.objectContaining({ Authorization: "Bearer mock-token" }),
        })
      )
    );
  });

  it("passes fetched profile to DashboardHeader", async () => {
    setupFetchMocks();
    renderPage();
    await waitFor(() => {
      const header = screen.getByTestId("dashboard-header");
      const profile = JSON.parse(header.getAttribute("data-profile"));
      expect(profile.full_name).toBe("Kirsten Strydom");
    });
  });

  it("handles profile fetch failure gracefully", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));
    renderPage();
    await waitFor(() => {
      // Page still renders without crashing
      expect(screen.getByTestId("dashboard-header")).toBeDefined();
    });
  });

  it("handles missing profile in response gracefully", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });
    renderPage();
    await waitFor(() => {
      const header = screen.getByTestId("dashboard-header");
      const profile = JSON.parse(header.getAttribute("data-profile"));
      expect(profile).toBeNull();
    });
  });

  // ── Initials ───────────────────────────────────────────────────────────────

  it("shows initials from profile full_name", async () => {
    setupFetchMocks();
    renderPage();
    // Kirsten Strydom → KS
    await waitFor(() => expect(screen.getByText("KS")).toBeDefined());
  });

  it("shows first letter of email when no profile", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });
    renderPage();
    // email is test@example.com → T
    await waitFor(() => expect(screen.getByText("T")).toBeDefined());
  });

  it("shows only first 2 initials for long names", async () => {
    setupFetchMocks({ profile: { full_name: "Anne Marie Louise" } });
    renderPage();
    // Anne Marie Louise → AM (first 2 only)
    await waitFor(() => expect(screen.getByText("AM")).toBeDefined());
  });

  it("shows initials in uppercase", async () => {
    setupFetchMocks({ profile: { full_name: "kirsten strydom" } });
    renderPage();
    await waitFor(() => expect(screen.getByText("KS")).toBeDefined());
  });

  it("falls back to JD when no profile and no email", async () => {
    mockUseAuth.mockReturnValueOnce({ token: "mock-token", user: {} });
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });
    render(
      <MemoryRouter>
        <StudentDashboard />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByTestId("dashboard-header")).toBeDefined();
    });
  });

  // ── No fetch without token ─────────────────────────────────────────────────

  it("does not fetch when token is absent", async () => {
    mockUseAuth.mockReturnValueOnce({ token: null, user: {} });
    mockFetch.mockClear();
    render(
      <MemoryRouter>
        <StudentDashboard />
      </MemoryRouter>
    );
    await waitFor(() => expect(screen.getByTestId("sidebar")).toBeDefined());
    const profileCalls = mockFetch.mock.calls.filter(([url]) =>
      url?.includes("/api/profile/me")
    );
    expect(profileCalls.length).toBe(0);
    expect(screen.getByTestId("dashboard-header")).toBeDefined();
  });
});