import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Opportunities from "../pages/Opportunities";

// ── Mocks ────────────────────────────────────────────────────────────────────

const mockGetLocations = vi.fn();
const mockGetFields = vi.fn();
const mockGetNqfLevels = vi.fn();
const mockGetOpportunities = vi.fn();

vi.mock("../context/useAuth", () => ({
  useAuth: () => ({
    token: "mock-token",
    user: { email: "john@example.com" },
  }),
}));

vi.mock("../lib/api", () => ({
  getLocations: (...args) => mockGetLocations(...args),
  getFields: (...args) => mockGetFields(...args),
  getNqfLevels: (...args) => mockGetNqfLevels(...args),
  getOpportunities: (...args) => mockGetOpportunities(...args),
}));

vi.mock("../components/dashboard/Sidebar", () => ({
  Sidebar: ({ activePage }) => (
    <div data-testid="sidebar">{activePage}</div>
  ),
}));

vi.mock("../components/notifications/notificationDropdown", () => ({
  NotificationDropdown: () => (
    <div data-testid="notification-dropdown" />
  ),
}));

vi.mock("../components/opportunities/matchingOpportunity", () => ({
  MatchingOpportunities: () => (
    <div data-testid="matching-opportunities">
      Matching Opportunities
    </div>
  ),
}));

vi.mock("../components/opportunities/OpportunityFilters", () => ({
  OpportunityFilters: ({
    location,
    nqfLevel,
    field,
    setLocation,
    setNqfLevel,
    setField,
    onReset,
    onViewMatch,
    loading,
  }) => (
    <div data-testid="opportunity-filters">
      <p>Filters Component</p>
      <p data-testid="filters-loading">
        {loading ? "loading" : "loaded"}
      </p>

      <button onClick={() => setLocation("Johannesburg")}>
        Set Location
      </button>

      <button onClick={() => setNqfLevel("6")}>
        Set NQF
      </button>

      <button onClick={() => setField("Engineering")}>
        Set Field
      </button>

      <button onClick={onReset}>
        Reset Filters
      </button>

      <button onClick={onViewMatch}>
        View Matches
      </button>

      <span data-testid="current-location">{location}</span>
      <span data-testid="current-nqf">{nqfLevel}</span>
      <span data-testid="current-field">{field}</span>
    </div>
  ),
}));

vi.mock("../components/opportunities/OpportunityList", () => ({
  OpportunityList: ({
    items,
    loading,
    error,
    summary,
    pagination,
    onPageChange,
  }) => (
    <div data-testid="opportunity-list">
      <p data-testid="items-count">{items.length}</p>
      <p data-testid="loading-state">
        {loading ? "loading" : "loaded"}
      </p>
      <p data-testid="error-state">{error}</p>
      <p data-testid="summary-opportunities">
        {summary.opportunities}
      </p>
      <p data-testid="summary-qualifications">
        {summary.qualifications}
      </p>
      <p data-testid="pagination-page">
        {pagination?.page || "none"}
      </p>

      <button onClick={() => onPageChange(2)}>
        Next Page
      </button>

      {items.map((item) => (
        <div key={item.id}>{item.title}</div>
      ))}
    </div>
  ),
}));

// ── Global fetch mock ────────────────────────────────────────────────────────

globalThis.fetch = vi.fn(() =>
  Promise.resolve({
    json: () =>
      Promise.resolve({
        profile: {
          full_name: "John Doe",
        },
      }),
  })
);

// ── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_LOCATIONS = {
  data: ["Johannesburg", "Cape Town"],
};

const MOCK_FIELDS = {
  data: ["Engineering", "Business"],
};

const MOCK_NQF = {
  data: ["5", "6"],
};

const MOCK_OPPORTUNITIES = {
  data: [
    {
      id: "1",
      title: "Software Internship",
      _type: "opportunity",
    },
    {
      id: "2",
      title: "Qualification",
      _type: "qualification",
    },
    {
      id: "3",
      title: "Engineering Learnership",
      _type: "opportunity",
    },
  ],
  pagination: {
    page: 1,
    totalPages: 5,
  },
  summary: {
    opportunities: 2,
    qualifications: 1,
  },
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function setupSuccessMocks() {
  mockGetLocations.mockResolvedValue(MOCK_LOCATIONS);
  mockGetFields.mockResolvedValue(MOCK_FIELDS);
  mockGetNqfLevels.mockResolvedValue(MOCK_NQF);
  mockGetOpportunities.mockResolvedValue(MOCK_OPPORTUNITIES);
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe("Opportunities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupSuccessMocks();
  });

  it("renders page heading", async () => {
    render(<Opportunities />);

    expect(
      await screen.findByText("Accredited Opportunities")
    ).toBeDefined();
  });

  it("renders sidebar with active page", async () => {
    render(<Opportunities />);

    expect(await screen.findByTestId("sidebar")).toBeDefined();
    expect(screen.getByTestId("sidebar").textContent).toContain(
      "/opportunities"
    );
  });

  it("renders notification dropdown", async () => {
    render(<Opportunities />);

    expect(
      await screen.findByTestId("notification-dropdown")
    ).toBeDefined();
  });

  it("loads dropdown filter data on mount", async () => {
    render(<Opportunities />);

    await waitFor(() => {
      expect(mockGetLocations).toHaveBeenCalled();
      expect(mockGetFields).toHaveBeenCalled();
      expect(mockGetNqfLevels).toHaveBeenCalled();
    });
  });

  it("loads opportunities on mount", async () => {
    render(<Opportunities />);

    await waitFor(() => {
      expect(mockGetOpportunities).toHaveBeenCalled();
    });
  });

  it("filters out non-opportunity items", async () => {
    render(<Opportunities />);

    await waitFor(() => {
      expect(screen.getByText("Software Internship")).toBeDefined();
      expect(
        screen.getByText("Engineering Learnership")
      ).toBeDefined();
    });

    expect(
      screen.queryByText("Qualification")
    ).toBeNull();
  });

  it("passes summary data to OpportunityList", async () => {
    render(<Opportunities />);

    await waitFor(() => {
      expect(
        screen.getByTestId("summary-opportunities").textContent
      ).toBe("2");

      expect(
        screen.getByTestId("summary-qualifications").textContent
      ).toBe("1");
    });
  });

  it("shows initials from profile full name", async () => {
    render(<Opportunities />);

    await waitFor(() => {
      expect(screen.getByText("JD")).toBeDefined();
    });
  });

  it("updates search input", async () => {
    render(<Opportunities />);

    const input = await screen.findByPlaceholderText(
      "Search and press Enter..."
    );

    fireEvent.change(input, {
      target: { value: "Engineering" },
    });

    expect(input.value).toBe("Engineering");
  });

  it("triggers search on Enter key", async () => {
    render(<Opportunities />);

    const input = await screen.findByPlaceholderText(
      "Search and press Enter..."
    );

    fireEvent.change(input, {
      target: { value: "Developer" },
    });

    fireEvent.keyDown(input, {
      key: "Enter",
      code: "Enter",
    });

    await waitFor(() => {
      expect(mockGetOpportunities).toHaveBeenLastCalledWith(
        expect.objectContaining({
          search: "Developer",
        })
      );
    });
  });

  it("updates location filter", async () => {
    render(<Opportunities />);

    fireEvent.click(
      await screen.findByText("Set Location")
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("current-location").textContent
      ).toBe("Johannesburg");
    });
  });

  it("updates nqf filter", async () => {
    render(<Opportunities />);

    fireEvent.click(await screen.findByText("Set NQF"));

    await waitFor(() => {
      expect(
        screen.getByTestId("current-nqf").textContent
      ).toBe("6");
    });
  });

  it("updates field filter", async () => {
    render(<Opportunities />);

    fireEvent.click(await screen.findByText("Set Field"));

    await waitFor(() => {
      expect(
        screen.getByTestId("current-field").textContent
      ).toBe("Engineering");
    });
  });

  it("resets filters", async () => {
    render(<Opportunities />);

    fireEvent.click(await screen.findByText("Set Location"));
    fireEvent.click(await screen.findByText("Set NQF"));
    fireEvent.click(await screen.findByText("Set Field"));

    fireEvent.click(await screen.findByText("Reset Filters"));

    await waitFor(() => {
      expect(
        screen.getByTestId("current-location").textContent
      ).toBe("");

      expect(
        screen.getByTestId("current-nqf").textContent
      ).toBe("");

      expect(
        screen.getByTestId("current-field").textContent
      ).toBe("");
    });
  });

  it("switches to matching opportunities view", async () => {
    render(<Opportunities />);

    fireEvent.click(
      await screen.findByText("View Matches")
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("matching-opportunities")
      ).toBeDefined();
    });
  });

  it("returns back to all opportunities", async () => {
    render(<Opportunities />);

    fireEvent.click(
      await screen.findByText("View Matches")
    );

    await waitFor(() => {
      expect(
        screen.getByText("← Back to All Opportunities")
      ).toBeDefined();
    });

    fireEvent.click(
      screen.getByText("← Back to All Opportunities")
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("opportunity-list")
      ).toBeDefined();
    });
  });

  it("handles pagination changes", async () => {
    render(<Opportunities />);

    fireEvent.click(
      await screen.findByText("Next Page")
    );

    await waitFor(() => {
      expect(mockGetOpportunities).toHaveBeenLastCalledWith(
        expect.objectContaining({
          page: 2,
        })
      );
    });
  });

  it("handles dropdown loading failure", async () => {
    mockGetLocations.mockRejectedValue(
      new Error("Failed to load filters")
    );

    render(<Opportunities />);

    await waitFor(() => {
      expect(
        screen.getByTestId("error-state").textContent
      ).toContain("Failed to load filters");
    });
  });

  it("handles opportunities loading failure", async () => {
    mockGetOpportunities.mockRejectedValue(
      new Error("Failed to load opportunities")
    );

    render(<Opportunities />);

    await waitFor(() => {
      expect(
        screen.getByTestId("error-state").textContent
      ).toContain("Failed to load opportunities");
    });
  });

  it("shows loading states", async () => {
    mockGetLocations.mockReturnValue(new Promise(() => {}));
    mockGetFields.mockReturnValue(new Promise(() => {}));
    mockGetNqfLevels.mockReturnValue(new Promise(() => {}));
    mockGetOpportunities.mockReturnValue(new Promise(() => {}));

    render(<Opportunities />);

    expect(
      screen.getByTestId("filters-loading").textContent
    ).toBe("loading");

    expect(
      screen.getByTestId("loading-state").textContent
    ).toBe("loading");
  });

  it("handles missing profile gracefully", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({}),
      })
    );

    render(<Opportunities />);

    await waitFor(() => {
      expect(screen.getByText("J")).toBeDefined();
    });
  });

  it("handles profile fetch failure gracefully", async () => {
    globalThis.fetch = vi.fn(() =>
      Promise.reject(new Error("Network error"))
    );

    render(<Opportunities />);

    await waitFor(() => {
      expect(screen.getByText("J")).toBeDefined();
    });
  });
});