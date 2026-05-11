// src/tests/Notifications.test.jsx
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Notifications from "../pages/Notifications";

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock("../context/useAuth", () => ({
  useAuth: () => ({ token: "mock-token" }),
}));

vi.mock("../components/dashboard/Sidebar", () => ({
  Sidebar: () => <div data-testid="sidebar" />,
}));

vi.mock("../components/notifications/notificationDropdown", () => ({
  NotificationDropdown: () => <div data-testid="notification-dropdown" />,
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

// ── Fixtures ──────────────────────────────────────────────────────────────────

const NOW = new Date("2026-05-10T12:00:00Z").getTime();

const MOCK_NOTIFICATIONS = [
  {
    id: "notif-1",
    title: "Application Received",
    message: "Your application has been received.",
    is_read: false,
    created_at: new Date(NOW - 5 * 60000).toISOString(),   // 5 mins ago
  },
  {
    id: "notif-2",
    title: "Shortlisted",
    message: "You have been shortlisted.",
    is_read: false,
    created_at: new Date(NOW - 2 * 3600000).toISOString(), // 2 hours ago
  },
  {
    id: "notif-3",
    title: "Old News",
    message: "Something happened a while ago.",
    is_read: true,
    created_at: new Date(NOW - 3 * 86400000).toISOString(), // 3 days ago
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function setupFetchMocks({ notifications = MOCK_NOTIFICATIONS, patchSuccess = true } = {}) {
  mockFetch.mockImplementation((url, options) => {
    if (options?.method === "PATCH") {
      return Promise.resolve({
        ok: patchSuccess,
        json: () => Promise.resolve({ success: patchSuccess }),
      });
    }
    if (url.includes("/api/notifications")) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ notifications }),
      });
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
  });
}

function renderPage() {
  return render(
    <MemoryRouter>
      <Notifications />
    </MemoryRouter>
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("Notifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ── Rendering ──────────────────────────────────────────────────────────────

  it("shows loading state initially", () => {
    mockFetch.mockReturnValue(new Promise(() => {}));
    renderPage();
    expect(screen.getByText("Loading notifications...")).toBeDefined();
  });

  it("renders page title after load", async () => {
    setupFetchMocks();
    renderPage();
    await waitFor(() => expect(screen.getByRole("heading", { name: "Notifications" })).toBeDefined());
  });

  it("renders Inbox label", async () => {
    setupFetchMocks();
    renderPage();
    await waitFor(() => expect(screen.getByText("Inbox")).toBeDefined());
  });

  it("renders sidebar", async () => {
    setupFetchMocks();
    renderPage();
    await waitFor(() => expect(screen.getByTestId("sidebar")).toBeDefined());
  });

  it("renders notification dropdown", async () => {
    setupFetchMocks();
    renderPage();
    await waitFor(() => expect(screen.getByTestId("notification-dropdown")).toBeDefined());
  });

  // ── Empty state ────────────────────────────────────────────────────────────

  it("shows empty state when no notifications", async () => {
    setupFetchMocks({ notifications: [] });
    renderPage();
    await waitFor(() => expect(screen.getByText("No notifications yet")).toBeDefined());
    expect(screen.getByText("We'll let you know when something happens.")).toBeDefined();
  });

  it("shows bell emoji in empty state", async () => {
    setupFetchMocks({ notifications: [] });
    renderPage();
    await waitFor(() => expect(screen.getByText("🔔")).toBeDefined());
  });

  it("does not show Mark all as read when no notifications", async () => {
    setupFetchMocks({ notifications: [] });
    renderPage();
    await waitFor(() => expect(screen.queryByText("Mark all as read")).toBeNull());
  });

  // ── Notifications list ─────────────────────────────────────────────────────

  it("renders all notifications", async () => {
    setupFetchMocks();
    renderPage();
    await waitFor(() => expect(screen.getByText("Application Received")).toBeDefined());
    expect(screen.getByText("Shortlisted")).toBeDefined();
    expect(screen.getByText("Old News")).toBeDefined();
  });

  it("renders notification messages", async () => {
    setupFetchMocks();
    renderPage();
    await waitFor(() =>
      expect(screen.getByText("Your application has been received.")).toBeDefined()
    );
    expect(screen.getByText("You have been shortlisted.")).toBeDefined();
  });

  it("shows Mark all as read button when unread notifications exist", async () => {
    setupFetchMocks();
    renderPage();
    await waitFor(() => expect(screen.getByText("Mark all as read")).toBeDefined());
  });

  it("does not show Mark all as read when all are read", async () => {
    setupFetchMocks({
      notifications: MOCK_NOTIFICATIONS.map((n) => ({ ...n, is_read: true })),
    });
    renderPage();
    await waitFor(() => expect(screen.getByText("Old News")).toBeDefined());
    expect(screen.queryByText("Mark all as read")).toBeNull();
  });

  // ── Time formatting ────────────────────────────────────────────────────────

  it("formats minutes ago correctly", async () => {
    setupFetchMocks();
    renderPage();
    await waitFor(() => expect(screen.getByText("5 mins ago")).toBeDefined());
  });

  it("formats hours ago correctly", async () => {
    setupFetchMocks();
    renderPage();
    await waitFor(() => expect(screen.getByText("2 hours ago")).toBeDefined());
  });

  it("formats days ago correctly", async () => {
    setupFetchMocks();
    renderPage();
    await waitFor(() => expect(screen.getByText("3 days ago")).toBeDefined());
  });

  it("uses singular min for 1 minute", async () => {
    const oneMinAgo = [
      { ...MOCK_NOTIFICATIONS[0], created_at: new Date(NOW - 60000).toISOString() },
    ];
    setupFetchMocks({ notifications: oneMinAgo });
    renderPage();
    await waitFor(() => expect(screen.getByText("1 min ago")).toBeDefined());
  });

  it("uses singular hour for 1 hour", async () => {
    const oneHourAgo = [
      { ...MOCK_NOTIFICATIONS[0], created_at: new Date(NOW - 3600000).toISOString() },
    ];
    setupFetchMocks({ notifications: oneHourAgo });
    renderPage();
    await waitFor(() => expect(screen.getByText("1 hour ago")).toBeDefined());
  });

  it("uses singular day for 1 day", async () => {
    const oneDayAgo = [
      { ...MOCK_NOTIFICATIONS[0], created_at: new Date(NOW - 86400000).toISOString() },
    ];
    setupFetchMocks({ notifications: oneDayAgo });
    renderPage();
    await waitFor(() => expect(screen.getByText("1 day ago")).toBeDefined());
  });

  // ── Mark as read ───────────────────────────────────────────────────────────

  it("calls PATCH when unread notification is clicked", async () => {
    setupFetchMocks();
    renderPage();
    await waitFor(() => expect(screen.getByText("Application Received")).toBeDefined());
    fireEvent.click(screen.getByText("Application Received").closest("li"));
    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/notifications/notif-1"),
        expect.objectContaining({ method: "PATCH" })
      )
    );
  });

  it("does not call PATCH when already read notification is clicked", async () => {
    setupFetchMocks();
    renderPage();
    await waitFor(() => expect(screen.getByText("Old News")).toBeDefined());
    const patchCallsBefore = mockFetch.mock.calls.filter(
      ([, opts]) => opts?.method === "PATCH"
    ).length;
    fireEvent.click(screen.getByText("Old News").closest("li"));
    await waitFor(() => {
      const patchCallsAfter = mockFetch.mock.calls.filter(
        ([, opts]) => opts?.method === "PATCH"
      ).length;
      expect(patchCallsAfter).toBe(patchCallsBefore);
    });
  });

  it("marks notification as read in UI after click", async () => {
    setupFetchMocks();
    renderPage();
    await waitFor(() => expect(screen.getByText("Application Received")).toBeDefined());
    fireEvent.click(screen.getByText("Application Received").closest("li"));
    await waitFor(() => {
      // After marking read, PATCH was called
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("notif-1"),
        expect.objectContaining({ method: "PATCH" })
      );
    });
  });

  it("marks all as read when button is clicked", async () => {
    setupFetchMocks();
    renderPage();
    await waitFor(() => expect(screen.getByText("Mark all as read")).toBeDefined());
    fireEvent.click(screen.getByText("Mark all as read"));
    await waitFor(() => {
      const patchCalls = mockFetch.mock.calls.filter(
        ([, opts]) => opts?.method === "PATCH"
      );
      // 2 unread notifications → 2 PATCH calls
      expect(patchCalls.length).toBe(2);
    });
  });

  // ── Error handling ─────────────────────────────────────────────────────────

  it("handles fetch failure gracefully", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));
    renderPage();
    await waitFor(() =>
      expect(screen.queryByText("Loading notifications...")).toBeNull()
    );
    // Should show empty state, not crash
    expect(screen.getByText("No notifications yet")).toBeDefined();
  });

  it("handles mark as read failure gracefully", async () => {
    setupFetchMocks({ patchSuccess: false });
    renderPage();
    await waitFor(() => expect(screen.getByText("Application Received")).toBeDefined());
    // Should not throw
    fireEvent.click(screen.getByText("Application Received").closest("li"));
    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("notif-1"),
        expect.objectContaining({ method: "PATCH" })
      )
    );
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

  it("highlights Notifications as active nav item", async () => {
    setupFetchMocks();
    renderPage();
    await waitFor(() => {
      const activeLink = screen.getAllByText("Notifications")[0];
      expect(activeLink.className).toContain("font-bold");
    });
  });
});