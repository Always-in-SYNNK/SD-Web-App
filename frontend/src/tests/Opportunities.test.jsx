// Opportunities.test.jsx

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Opportunities from "../pages/Opportunities";

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

// ── API mock ─────────────────────────────────────────────────────────────────
const mockGetLocations = vi.fn();
const mockGetFields = vi.fn();
const mockGetNqfLevels = vi.fn();
const mockGetOpportunities = vi.fn();

vi.mock("../lib/api", () => ({
  getLocations: (...args) => mockGetLocations(...args),
  getFields: (...args) => mockGetFields(...args),
  getNqfLevels: (...args) => mockGetNqfLevels(...args),
  getOpportunities: (...args) => mockGetOpportunities(...args),
}));

// ── Child mocks ──────────────────────────────────────────────────────────────
vi.mock("../components/dashboard/Sidebar", () => ({
  Sidebar: ({ activePage }) => (
    <div data-testid="sidebar" data-active={activePage} />
  ),
}));

vi.mock("../components/opportunities/OpportunityFilters", () => ({
  OpportunityFilters: ({ onReset, onViewMatch }) => (
    <div data-testid="opportunity-filters">
      <button onClick={onReset}>Reset Filters</button>
      <button onClick={onViewMatch}>View Matches</button>
    </div>
  ),
}));

vi.mock("../components/opportunities/OpportunityList", () => ({
  OpportunityList: ({ loading, error, items }) => (
    <div data-testid="opportunity-list">
      {loading && <span>Loading...</span>}
      {error && <span>{error}</span>}

      {items?.map((item) => (
        <span key={item.id}>{item.title}</span>
      ))}
    </div>
  ),
}));

vi.mock("../components/opportunities/matchingOpportunity", () => ({
  MatchingOpportunities: () => (
    <div data-testid="matching-opportunities" />
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
const renderOpportunities = () =>
  render(
    <MemoryRouter>
      <Opportunities />
    </MemoryRouter>
  );

// ── Default API setup ────────────────────────────────────────────────────────
const defaultApiSetup = () => {
  mockGetLocations.mockResolvedValue({
    data: ["Cape Town", "Johannesburg"],
  });

  mockGetFields.mockResolvedValue({
    data: ["Engineering", "Design"],
  });

  mockGetNqfLevels.mockResolvedValue({
    data: [3, 4, 5],
  });

  mockGetOpportunities.mockResolvedValue({
    data: [
      {
        id: 1,
        title: "Learnership A",
        _type: "opportunity",
      },
    ],
    pagination: {
      page: 1,
      total: 1,
    },
    summary: {
      opportunities: 1,
      qualifications: 0,
    },
  });
};

// ═══════════════════════════════════════════════════════════════════════════════
describe("Opportunities page", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    globalThis.fetch = mockFetch;

    mockAuthUser = {
      email: "test@example.com",
    };

    mockToken = "mock-token";

    mockFetch.mockResolvedValue({
      json: async () => ({
        profile: {
          full_name: "Jane Doe",
        },
      }),
    });

    defaultApiSetup();
  });

  afterEach(() => {
    localStorage.clear();
  });

  // ── Structure ─────────────────────────────────────────────────────────────
  describe("structure", () => {
    it("renders heading", async () => {
      renderOpportunities();

      await waitFor(() =>
        expect(
          screen.getByText("Accredited Opportunities")
        ).toBeInTheDocument()
      );
    });

    it("renders Explore Careers", async () => {
      renderOpportunities();

      await waitFor(() =>
        expect(
          screen.getByText("Explore Careers")
        ).toBeInTheDocument()
      );
    });

    it("renders Sidebar", async () => {
      renderOpportunities();

      await waitFor(() =>
        expect(
          screen.getByTestId("sidebar").dataset.active
        ).toBe("/opportunities")
      );
    });

    it("renders filters", async () => {
      renderOpportunities();

      await waitFor(() =>
        expect(
          screen.getByTestId("opportunity-filters")
        ).toBeInTheDocument()
      );
    });

    it("renders opportunity list", async () => {
      renderOpportunities();

      await waitFor(() =>
        expect(
          screen.getByTestId("opportunity-list")
        ).toBeInTheDocument()
      );
    });
  });

  // ── API ──────────────────────────────────────────────────────────────────
  describe("api calls", () => {
    it("calls dropdown apis", async () => {
      renderOpportunities();

      await waitFor(() => {
        expect(mockGetLocations).toHaveBeenCalled();
        expect(mockGetFields).toHaveBeenCalled();
        expect(mockGetNqfLevels).toHaveBeenCalled();
      });
    });

    it("calls getOpportunities", async () => {
      renderOpportunities();

      await waitFor(() =>
        expect(mockGetOpportunities).toHaveBeenCalled()
      );
    });

    it("filters out qualifications", async () => {
      mockGetOpportunities.mockResolvedValue({
        data: [
          {
            id: 1,
            title: "Learnership A",
            _type: "opportunity",
          },
          {
            id: 2,
            title: "Qualification",
            _type: "qualification",
          },
        ],
      });

      renderOpportunities();

      await waitFor(() =>
        expect(
          screen.getByText("Learnership A")
        ).toBeInTheDocument()
      );

      expect(
        screen.queryByText("Qualification")
      ).not.toBeInTheDocument();
    });
  });

  // ── Search ───────────────────────────────────────────────────────────────
  describe("search", () => {
    it("renders input", async () => {
      renderOpportunities();

      await waitFor(() =>
        expect(
          screen.getByPlaceholderText(
            "Search and press Enter..."
          )
        ).toBeInTheDocument()
      );
    });

    it("updates input", async () => {
      renderOpportunities();

      const input = await screen.findByPlaceholderText(
        "Search and press Enter..."
      );

      fireEvent.change(input, {
        target: { value: "engineering" },
      });

      expect(input.value).toBe("engineering");
    });

    it("calls getOpportunities on Enter", async () => {
      renderOpportunities();

      const input = await screen.findByPlaceholderText(
        "Search and press Enter..."
      );

      fireEvent.change(input, {
        target: { value: "design" },
      });

      fireEvent.keyDown(input, {
        key: "Enter",
      });

      await waitFor(() =>
        expect(mockGetOpportunities).toHaveBeenCalled()
      );
    });

    it("does not trigger search on non-enter", async () => {
      renderOpportunities();

      const input = await screen.findByPlaceholderText(
        "Search and press Enter..."
      );

      mockGetOpportunities.mockClear();

      fireEvent.keyDown(input, {
        key: "a",
      });

      expect(mockGetOpportunities).not.toHaveBeenCalled();
    });
  });

  // ── Match mode ────────────────────────────────────────────────────────────
  describe("match mode", () => {
    it("shows matching component", async () => {
      renderOpportunities();

      const btn = await screen.findByText("View Matches");

      fireEvent.click(btn);

      await waitFor(() =>
        expect(
          screen.getByTestId("matching-opportunities")
        ).toBeInTheDocument()
      );
    });

    it("returns to normal mode", async () => {
      renderOpportunities();

      fireEvent.click(await screen.findByText("View Matches"));

      fireEvent.click(
        await screen.findByText("← Back to All Opportunities")
      );

      await waitFor(() =>
        expect(
          screen.getByPlaceholderText(
            "Search and press Enter..."
          )
        ).toBeInTheDocument()
      );
    });
  });

  // ── User menu ────────────────────────────────────────────────────────────
  describe("user menu", () => {
    it("shows full name", async () => {
      renderOpportunities();

      await waitFor(() =>
        expect(screen.getByText("Jane Doe")).toBeInTheDocument()
      );
    });

    it("opens menu", async () => {
      renderOpportunities();

      const buttons = await screen.findAllByRole("button");

      fireEvent.click(buttons[0]);

      expect(
        screen.getByText("Sign Out")
      ).toBeInTheDocument();
    });

    it("navigates to dashboard", async () => {
      render(
        <MemoryRouter>
          <Opportunities />
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

    it("logs out correctly", async () => {
      localStorage.setItem("user", "u");
      localStorage.setItem("token", "t");

      renderOpportunities();

      const buttons = await screen.findAllByRole("button");

      fireEvent.click(buttons[0]);

      fireEvent.click(screen.getByText("Sign Out"));

      await waitFor(() => {
        expect(localStorage.getItem("user")).toBeNull();
        expect(localStorage.getItem("token")).toBeNull();
        expect(mockNavigate).toHaveBeenCalledWith("/");
      });
    });
  });

  // ── Profile fetch ────────────────────────────────────────────────────────
  describe("profile fetch", () => {
    it("fetches profile with bearer token", async () => {
      renderOpportunities();

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

      renderOpportunities();

      await waitFor(() =>
        expect(
          screen.getByText("Accredited Opportunities")
        ).toBeInTheDocument()
      );

      expect(mockFetch).not.toHaveBeenCalled();
    });
  });
});