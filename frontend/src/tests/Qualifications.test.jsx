// Qualifications.test.jsx

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Qualifications from "../pages/Qualifications";

// ── Router mock ───────────────────────────────────────────────────────────────
const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// ── Auth mock ─────────────────────────────────────────────────────────────────
let mockAuthUser = { email: "test@example.com" };
let mockToken = "mock-token";

vi.mock("../context/useAuth", () => ({
  useAuth: () => ({
    user: mockAuthUser,
    token: mockToken,
  }),
}));

// ── Supabase mock ─────────────────────────────────────────────────────────────
const mockRpc = vi.fn();

vi.mock("../lib/supabaseClient", () => ({
  supabase: {
    rpc: (...args) => mockRpc(...args),
  },
}));

// ── Child component mocks ─────────────────────────────────────────────────────
vi.mock("../components/dashboard/Sidebar", () => ({
  Sidebar: ({ activePage }) => (
    <div data-testid="sidebar" data-active={activePage} />
  ),
}));

vi.mock("../components/qualifications/QualificationCard", () => ({
  QualificationCard: ({ title }) => (
    <div data-testid="qual-card">{title}</div>
  ),
}));

vi.mock("../components/qualifications/QualificationFilters", () => ({
  QualificationFilters: ({ onReset }) => (
    <div data-testid="qualification-filters">
      <button onClick={onReset}>Reset</button>
    </div>
  ),
}));

vi.mock("../components/notifications/notificationDropdown", () => ({
  NotificationDropdown: () => (
    <div data-testid="notification-dropdown" />
  ),
}));

// ── fetch mock ────────────────────────────────────────────────────────────────
const mockFetch = vi.fn();

// ── Render helper ─────────────────────────────────────────────────────────────
const renderQualifications = () =>
  render(
    <MemoryRouter>
      <Qualifications />
    </MemoryRouter>
  );

// ═══════════════════════════════════════════════════════════════════════════════
describe("Qualifications page", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    globalThis.fetch = mockFetch;

    mockAuthUser = { email: "test@example.com" };
    mockToken = "mock-token";

    mockFetch.mockResolvedValue({
      json: async () => ({
        profile: { full_name: "Jane Doe" },
      }),
    });

    mockRpc.mockResolvedValue({
      data: [],
      error: null,
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  // ── Structure ─────────────────────────────────────────────────────────────
  describe("structure", () => {
    it("renders the page heading", async () => {
      renderQualifications();

      await waitFor(() =>
        expect(
          screen.getByText("Accredited Qualifications")
        ).toBeInTheDocument()
      );
    });

    it("renders Browse Credentials label", async () => {
      renderQualifications();

      await waitFor(() =>
        expect(
          screen.getByText("Browse Credentials")
        ).toBeInTheDocument()
      );
    });

    it("renders Sidebar with activePage", async () => {
      renderQualifications();

      await waitFor(() =>
        expect(
          screen.getByTestId("sidebar").dataset.active
        ).toBe("/qualifications")
      );
    });

    it("renders QualificationFilters", async () => {
      renderQualifications();

      await waitFor(() =>
        expect(
          screen.getByTestId("qualification-filters")
        ).toBeInTheDocument()
      );
    });

    it("renders NotificationDropdown", async () => {
      renderQualifications();

      await waitFor(() =>
        expect(
          screen.getByTestId("notification-dropdown")
        ).toBeInTheDocument()
      );
    });
  });

  // ── Navigation ────────────────────────────────────────────────────────────
  describe("navigation", () => {
    it("renders Home link", async () => {
      renderQualifications();

      await waitFor(() =>
        expect(
          screen.getByRole("link", { name: "Home" })
        ).toBeInTheDocument()
      );
    });

    it("renders Dashboard link", async () => {
      renderQualifications();

      await waitFor(() =>
        expect(
          screen.getByRole("link", { name: "Dashboard" })
        ).toBeInTheDocument()
      );
    });

    it("renders Qualifications link", async () => {
      renderQualifications();

      await waitFor(() =>
        expect(
          screen.getByRole("link", { name: "Qualifications" })
        ).toBeInTheDocument()
      );
    });
  });

  // ── Loading / data states ────────────────────────────────────────────────
  describe("data states", () => {
    it("shows loading state", () => {
      mockRpc.mockReturnValue(new Promise(() => {}));

      renderQualifications();

      expect(
        screen.getByText("Loading qualifications...")
      ).toBeInTheDocument();
    });

    it("shows empty state", async () => {
      renderQualifications();

      await waitFor(() =>
        expect(
          screen.getByText("No qualifications found.")
        ).toBeInTheDocument()
      );
    });

    it("shows rpc error", async () => {
      mockRpc.mockResolvedValue({
        data: null,
        error: { message: "DB error" },
      });

      renderQualifications();

      await waitFor(() =>
        expect(screen.getByText("DB error")).toBeInTheDocument()
      );
    });

    it("renders qualification cards", async () => {
      mockRpc.mockResolvedValue({
        data: [
          {
            qual_id: 1,
            title: "BSc Architecture",
          },
          {
            qual_id: 2,
            title: "Diploma Design",
          },
        ],
        error: null,
      });

      renderQualifications();

      await waitFor(() =>
        expect(
          screen.getAllByTestId("qual-card")
        ).toHaveLength(2)
      );
    });
  });

  // ── RPC ──────────────────────────────────────────────────────────────────
  describe("rpc calls", () => {
    it("calls get_all_qualifications initially", async () => {
      renderQualifications();

      await waitFor(() =>
        expect(mockRpc).toHaveBeenCalledWith(
          "get_all_qualifications",
          undefined
        )
      );
    });

    it("calls search_qualifications on Enter", async () => {
      renderQualifications();

      const input = await screen.findByPlaceholderText(
        "Search and press Enter..."
      );

      fireEvent.change(input, {
        target: { value: "architecture" },
      });

      fireEvent.keyDown(input, {
        key: "Enter",
      });

      await waitFor(() =>
        expect(mockRpc).toHaveBeenCalledWith(
          "search_qualifications",
          {
            search_term: "architecture",
          }
        )
      );
    });

    it("does not trigger search on non-enter key", async () => {
      renderQualifications();

      const input = await screen.findByPlaceholderText(
        "Search and press Enter..."
      );

      mockRpc.mockClear();

      fireEvent.keyDown(input, {
        key: "a",
      });

      expect(mockRpc).not.toHaveBeenCalled();
    });
  });

  // ── Search ───────────────────────────────────────────────────────────────
  describe("search input", () => {
    it("renders input", async () => {
      renderQualifications();

      await waitFor(() =>
        expect(
          screen.getByPlaceholderText(
            "Search and press Enter..."
          )
        ).toBeInTheDocument()
      );
    });

    it("updates value", async () => {
      renderQualifications();

      const input = await screen.findByPlaceholderText(
        "Search and press Enter..."
      );

      fireEvent.change(input, {
        target: { value: "civil" },
      });

      expect(input.value).toBe("civil");
    });
  });

  // ── Filters ──────────────────────────────────────────────────────────────
  describe("filters", () => {
    it("resets filters", async () => {
      renderQualifications();

      const resetBtn = await screen.findByText("Reset");

      fireEvent.click(resetBtn);

      await waitFor(() =>
        expect(mockRpc).toHaveBeenCalled()
      );
    });
  });

  // ── User menu ────────────────────────────────────────────────────────────
  describe("user menu", () => {
    it("shows full name", async () => {
      renderQualifications();

      await waitFor(() =>
        expect(screen.getByText("Jane Doe")).toBeInTheDocument()
      );
    });

    it("shows initials", async () => {
      renderQualifications();

      await waitFor(() =>
        expect(screen.getByText("JD")).toBeInTheDocument()
      );
    });

    it("shows email fallback", async () => {
      mockFetch.mockResolvedValue({
        json: async () => ({
          profile: null,
        }),
      });

      renderQualifications();

      await waitFor(() =>
        expect(
          screen.getByText("test@example.com")
        ).toBeInTheDocument()
      );
    });

    it("opens dropdown menu", async () => {
      renderQualifications();

      const buttons = await screen.findAllByRole("button");

      fireEvent.click(buttons[0]);

      expect(
        screen.getByText("Sign Out")
      ).toBeInTheDocument();
    });

    it("navigates to dashboard", async () => {
      render(
        <MemoryRouter>
          <Qualifications />
        </MemoryRouter>
      );

      const buttons = screen.getAllByRole("button");
      fireEvent.click(buttons[0]);

      const dashboardButtons = screen.getAllByText("Dashboard");
      fireEvent.click(dashboardButtons[1]);

      expect(mockNavigate).toHaveBeenCalledWith(
        "/dashboard"
      );
    });

    it("closes dropdown on outside click", async () => {
      renderQualifications();

      const buttons = await screen.findAllByRole("button");

      fireEvent.click(buttons[0]);

      expect(
        screen.getByText("Sign Out")
      ).toBeInTheDocument();

      fireEvent.mouseDown(document.body);

      await waitFor(() =>
        expect(
          screen.queryByText("Sign Out")
        ).not.toBeInTheDocument()
      );
    });
  });

  // ── Logout ───────────────────────────────────────────────────────────────
  describe("logout", () => {
    it("clears localStorage and redirects", async () => {
      localStorage.setItem("user", "u");
      localStorage.setItem("token", "t");

      renderQualifications();

      const buttons = await screen.findAllByRole("button");

      fireEvent.click(buttons[0]);

      fireEvent.click(screen.getByText("Sign Out"));

      await waitFor(() => {
        expect(
          localStorage.getItem("user")
        ).toBeNull();

        expect(
          localStorage.getItem("token")
        ).toBeNull();

        expect(mockNavigate).toHaveBeenCalledWith("/");
      });
    });
  });

  // ── Profile fetch ────────────────────────────────────────────────────────
  describe("profile fetch", () => {
    it("fetches profile with bearer token", async () => {
      renderQualifications();

      await waitFor(() =>
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining("/api/profile/me"),
          expect.objectContaining({
            headers: expect.objectContaining({
              Authorization: "Bearer mock-token",
            }),
          })
        )
      );
    });

    it("does not fetch without token", async () => {
      mockToken = null;

      renderQualifications();

      await waitFor(() =>
        expect(
          screen.getByText("Accredited Qualifications")
        ).toBeInTheDocument()
      );

      expect(mockFetch).not.toHaveBeenCalled();
    });
  });
});