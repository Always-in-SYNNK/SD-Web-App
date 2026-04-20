import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { NotificationDropdown } from "./NotificationDropdown";

vi.mock("../../context/useAuth", () => ({
  useAuth: () => ({ token: "mock-token" }),
}));

global.fetch = vi.fn();

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    title: "Application update",
    message: "Your application has been received.",
    is_read: false,
    created_at: new Date(Date.now() - 60000).toISOString(),
  },
  {
    id: 2,
    title: "New opportunity match",
    message: "A new learnership matches your profile.",
    is_read: true,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
];

describe("NotificationDropdown", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ notifications: MOCK_NOTIFICATIONS }),
    });
  });

  const renderDropdown = () => render(<NotificationDropdown />);

  test("renders bell button", async () => {
    renderDropdown();
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  test("dropdown is closed by default", async () => {
    renderDropdown();
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(screen.queryByText("Notifications")).not.toBeInTheDocument();
  });

  test("opens dropdown when bell is clicked", async () => {
    renderDropdown();
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    fireEvent.click(screen.getByRole("button"));
    expect(await screen.findByText("Notifications")).toBeInTheDocument();
  });

  test("shows unread count badge when there are unread notifications", async () => {
    renderDropdown();
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    // 1 unread notification
    expect(await screen.findByText("1")).toBeInTheDocument();
  });

  test("does not show badge when all notifications are read", async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        notifications: MOCK_NOTIFICATIONS.map((n) => ({ ...n, is_read: true })),
      }),
    });
    renderDropdown();
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  test("shows notification titles in dropdown", async () => {
    renderDropdown();
    fireEvent.click(screen.getByRole("button"));
    expect(await screen.findByText("Application update")).toBeInTheDocument();
    expect(await screen.findByText("New opportunity match")).toBeInTheDocument();
  });

  test("shows empty state when no notifications", async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ notifications: [] }),
    });
    renderDropdown();
    fireEvent.click(screen.getByRole("button"));
    expect(await screen.findByText("No notifications yet")).toBeInTheDocument();
  });

  test("shows Mark all as read button when there are unread notifications", async () => {
    renderDropdown();
    fireEvent.click(screen.getByRole("button"));
    expect(await screen.findByText("Mark all as read")).toBeInTheDocument();
  });

  test("does not show Mark all as read when all are read", async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        notifications: MOCK_NOTIFICATIONS.map((n) => ({ ...n, is_read: true })),
      }),
    });
    renderDropdown();
    fireEvent.click(screen.getByRole("button"));
    await screen.findByText("Notifications");
    expect(screen.queryByText("Mark all as read")).not.toBeInTheDocument();
  });

  test("clicking unread notification calls PATCH endpoint", async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ notifications: MOCK_NOTIFICATIONS }),
      })
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) });

    renderDropdown();
    fireEvent.click(screen.getByRole("button"));
    const unreadItem = await screen.findByText("Application update");
    fireEvent.click(unreadItem);

    await waitFor(() => {
      const patchCall = fetch.mock.calls.find((call) => call[1]?.method === "PATCH");
      expect(patchCall).toBeDefined();
      expect(patchCall[0]).toContain("/api/notifications/1");
    });
  });

  test("shows View all notifications button in footer", async () => {
    renderDropdown();
    fireEvent.click(screen.getByRole("button"));
    expect(await screen.findByText("View all notifications")).toBeInTheDocument();
  });

  test("closes dropdown when clicking outside", async () => {
    renderDropdown();
    fireEvent.click(screen.getByRole("button"));
    await screen.findByText("Notifications");
    fireEvent.mouseDown(document.body);
    await waitFor(() => {
      expect(screen.queryByText("Notifications")).not.toBeInTheDocument();
    });
  });
});