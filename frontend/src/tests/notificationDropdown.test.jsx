import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { NotificationDropdown } from "../components/notifications/notificationDropdown";

// --- Mocks ---

vi.mock("../context/useAuth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("react-router-dom", () => ({
  useNavigate: vi.fn(),
}));

import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";

const mockToken = "test-token";
const mockNavigate = vi.fn();

const mockNotifications = [
  {
    id: 1,
    title: "New message",
    message: "You have a new message from Alice.",
    is_read: false,
    created_at: new Date(Date.now() - 5 * 60000).toISOString(), // 5 mins ago
  },
  {
    id: 2,
    title: "Update available",
    message: "A new version has been released.",
    is_read: true,
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(), // 2 hours ago
  },
  {
    id: 3,
    title: "Reminder",
    message: "Your meeting starts in 10 minutes.",
    is_read: false,
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(), // 3 days ago
  },
];

// Helper to set up fetch mock
function mockFetch(notifications = mockNotifications) {
  global.fetch = vi.fn((url, options) => {
    if (url.includes("/api/notifications") && !url.match(/\/\d+$/)) {
      return Promise.resolve({
        json: () => Promise.resolve({ notifications }),
      });
    }
    if (url.match(/\/api\/notifications\/\d+/)) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    }
    return Promise.reject(new Error("Unknown URL"));
  });
}

beforeEach(() => {
  useAuth.mockReturnValue({ token: mockToken });
  useNavigate.mockReturnValue(mockNavigate);
  vi.stubEnv("VITE_API_URL", "http://localhost:3000");
  mockFetch();
});

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});

// --- Tests ---

describe("NotificationDropdown", () => {
  describe("Rendering", () => {
    it("renders the bell button", async () => {
      render(<NotificationDropdown />);
      expect(screen.getByRole("button", { name: /🔔/i })).toBeDefined();
    });

    it("shows unread badge count when there are unread notifications", async () => {
      render(<NotificationDropdown />);
      await waitFor(() => {
        // 2 unread (ids 1 and 3)
        expect(screen.getByText("2")).toBeDefined();
      });
    });

    it("does not show badge when all notifications are read", async () => {
      mockFetch(mockNotifications.map((n) => ({ ...n, is_read: true })));
      render(<NotificationDropdown />);
      await waitFor(() => {
        expect(screen.queryByText("2")).toBeNull();
        expect(screen.queryByText("1")).toBeNull();
      });
    });

    it("does not show dropdown initially", () => {
      render(<NotificationDropdown />);
      expect(screen.queryByText("Notifications")).toBeNull();
    });
  });

  describe("Dropdown open/close", () => {
    it("opens dropdown on bell click", async () => {
      render(<NotificationDropdown />);
      fireEvent.click(screen.getByRole("button", { name: /🔔/i }));
      expect(screen.getByText("Notifications")).toBeDefined();
    });

    it("closes dropdown on second bell click", async () => {
      render(<NotificationDropdown />);
      const bell = screen.getByRole("button", { name: /🔔/i });
      fireEvent.click(bell);
      fireEvent.click(bell);
      expect(screen.queryByText("Notifications")).toBeNull();
    });

    it("closes dropdown on outside click", async () => {
      render(
        <div>
          <NotificationDropdown />
          <div data-testid="outside">Outside</div>
        </div>
      );
      fireEvent.click(screen.getByRole("button", { name: /🔔/i }));
      expect(screen.getByText("Notifications")).toBeDefined();

      fireEvent.mouseDown(screen.getByTestId("outside"));
      expect(screen.queryByText("Notifications")).toBeNull();
    });
  });

  describe("Loading state", () => {
    it("shows loading indicator while fetching", () => {
      // Delay resolution so loading state is visible
      global.fetch = vi.fn(() => new Promise(() => {}));
      render(<NotificationDropdown />);
      fireEvent.click(screen.getByRole("button", { name: /🔔/i }));
      expect(screen.getByText("Loading...")).toBeDefined();
    });
  });

  describe("Empty state", () => {
    it("shows empty message when no notifications exist", async () => {
      mockFetch([]);
      render(<NotificationDropdown />);
      fireEvent.click(screen.getByRole("button", { name: /🔔/i }));
      await waitFor(() => {
        expect(screen.getByText("No notifications yet")).toBeDefined();
      });
    });
  });

  describe("Notification list", () => {
    it("renders notification titles after loading", async () => {
      render(<NotificationDropdown />);
      fireEvent.click(screen.getByRole("button", { name: /🔔/i }));
      await waitFor(() => {
        expect(screen.getByText("New message")).toBeDefined();
        expect(screen.getByText("Update available")).toBeDefined();
        expect(screen.getByText("Reminder")).toBeDefined();
      });
    });

    it("renders notification messages", async () => {
      render(<NotificationDropdown />);
      fireEvent.click(screen.getByRole("button", { name: /🔔/i }));
      await waitFor(() => {
        expect(
          screen.getByText("You have a new message from Alice.")
        ).toBeDefined();
      });
    });

    it("limits displayed notifications to 10", async () => {
      const manyNotifications = Array.from({ length: 15 }, (_, i) => ({
        id: i + 1,
        title: `Notification ${i + 1}`,
        message: `Message ${i + 1}`,
        is_read: false,
        created_at: new Date().toISOString(),
      }));
      mockFetch(manyNotifications);
      render(<NotificationDropdown />);
      fireEvent.click(screen.getByRole("button", { name: /🔔/i }));
      await waitFor(() => {
        expect(screen.getByText("Notification 10")).toBeDefined();
        expect(screen.queryByText("Notification 11")).toBeNull();
      });
    });

    it("shows 'Mark all as read' button when there are unread notifications", async () => {
      render(<NotificationDropdown />);
      fireEvent.click(screen.getByRole("button", { name: /🔔/i }));
      await waitFor(() => {
        expect(screen.getByText("Mark all as read")).toBeDefined();
      });
    });

    it("hides 'Mark all as read' when all notifications are read", async () => {
      mockFetch(mockNotifications.map((n) => ({ ...n, is_read: true })));
      render(<NotificationDropdown />);
      fireEvent.click(screen.getByRole("button", { name: /🔔/i }));
      await waitFor(() => {
        expect(screen.queryByText("Mark all as read")).toBeNull();
      });
    });
  });

  describe("formatTime", () => {
    it("displays minutes ago for recent notifications", async () => {
      render(<NotificationDropdown />);
      fireEvent.click(screen.getByRole("button", { name: /🔔/i }));
      await waitFor(() => {
        expect(screen.getByText("5 mins ago")).toBeDefined();
      });
    });

    it("displays hours ago for notifications a few hours old", async () => {
      render(<NotificationDropdown />);
      fireEvent.click(screen.getByRole("button", { name: /🔔/i }));
      await waitFor(() => {
        expect(screen.getByText("2 hours ago")).toBeDefined();
      });
    });

    it("displays days ago for older notifications", async () => {
      render(<NotificationDropdown />);
      fireEvent.click(screen.getByRole("button", { name: /🔔/i }));
      await waitFor(() => {
        expect(screen.getByText("3 days ago")).toBeDefined();
      });
    });

    it("uses singular 'min' for exactly 1 minute ago", async () => {
      mockFetch([
        {
          id: 99,
          title: "Test",
          message: "Test message",
          is_read: false,
          created_at: new Date(Date.now() - 60000).toISOString(),
        },
      ]);
      render(<NotificationDropdown />);
      fireEvent.click(screen.getByRole("button", { name: /🔔/i }));
      await waitFor(() => {
        expect(screen.getByText("1 min ago")).toBeDefined();
      });
    });
  });

  describe("markRead", () => {
    it("calls PATCH API when an unread notification is clicked", async () => {
      render(<NotificationDropdown />);
      fireEvent.click(screen.getByRole("button", { name: /🔔/i }));
      await waitFor(() => screen.getByText("New message"));

      fireEvent.click(screen.getByText("New message").closest("li"));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining("/api/notifications/1"),
          expect.objectContaining({ method: "PATCH" })
        );
      });
    });

    it("updates notification to read state in UI after clicking", async () => {
      render(<NotificationDropdown />);
      fireEvent.click(screen.getByRole("button", { name: /🔔/i }));
      await waitFor(() => screen.getByText("New message"));

      // Unread count should be 2 before
      expect(screen.getByText("2")).toBeDefined();

      fireEvent.click(screen.getByText("New message").closest("li"));

      await waitFor(() => {
        // Badge should drop to 1 after marking one as read
        expect(screen.getByText("1")).toBeDefined();
      });
    });

    it("does not call PATCH when a read notification is clicked", async () => {
      render(<NotificationDropdown />);
      fireEvent.click(screen.getByRole("button", { name: /🔔/i }));
      await waitFor(() => screen.getByText("Update available"));

      const initialFetchCount = global.fetch.mock.calls.length;
      fireEvent.click(screen.getByText("Update available").closest("li"));

      // No additional fetch calls
      expect(global.fetch.mock.calls.length).toBe(initialFetchCount);
    });
  });

  describe("markAllRead", () => {
    it("marks all unread notifications as read", async () => {
      render(<NotificationDropdown />);
      fireEvent.click(screen.getByRole("button", { name: /🔔/i }));
      await waitFor(() => screen.getByText("Mark all as read"));

      fireEvent.click(screen.getByText("Mark all as read"));

      await waitFor(() => {
        // Both unread notifications (ids 1 and 3) should be PATCHed
        const patchCalls = global.fetch.mock.calls.filter(
          ([, opts]) => opts?.method === "PATCH"
        );
        expect(patchCalls).toHaveLength(2);
      });
    });

    it("hides badge after marking all as read", async () => {
      render(<NotificationDropdown />);
      fireEvent.click(screen.getByRole("button", { name: /🔔/i }));
      await waitFor(() => screen.getByText("Mark all as read"));

      fireEvent.click(screen.getByText("Mark all as read"));

      await waitFor(() => {
        expect(screen.queryByText("2")).toBeNull();
      });
    });
  });

  describe("Navigation", () => {
    it("navigates to /notifications and closes dropdown on footer button click", async () => {
      render(<NotificationDropdown />);
      fireEvent.click(screen.getByRole("button", { name: /🔔/i }));
      await waitFor(() => screen.getByText("View all notifications"));

      fireEvent.click(screen.getByText("View all notifications"));

      expect(mockNavigate).toHaveBeenCalledWith("/notifications");
      expect(screen.queryByText("Notifications")).toBeNull();
    });
  });

  describe("No token", () => {
    it("does not fetch notifications when token is missing", () => {
      useAuth.mockReturnValue({ token: null });
      render(<NotificationDropdown />);
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe("Error handling", () => {
    it("handles fetch failure gracefully without crashing", async () => {
      global.fetch = vi.fn(() => Promise.reject(new Error("Network error")));
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      render(<NotificationDropdown />);
      fireEvent.click(screen.getByRole("button", { name: /🔔/i }));
      await waitFor(() => {
        expect(screen.getByText("No notifications yet")).toBeDefined();
      });
      consoleSpy.mockRestore();
    });
  });
});
