// src/pages/AdminAnalytics.test.jsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminAnalytics from "../pages/AdminAnalytics";

// ── Mocks ────────────────────────────────────────────────────────────────────

vi.mock("../context/useAuth", () => ({
  useAuth: () => ({ user: { role: "admin", isAdmin: true } }),
}));

vi.mock("../components/dashboard/Sidebar", () => ({
  Sidebar: () => <div data-testid="applicant-sidebar" />,
}));

vi.mock("../components/layout/Sidebar", () => ({
  default: () => <div data-testid="employer-sidebar" />,
}));

vi.mock("../components/layout/AdminTopbar", () => ({
  default: ({ title }) => <div data-testid="topbar">{title}</div>,
}));

vi.mock("../components/analytics/SectorBarChart", () => ({
  default: ({ data }) => <div data-testid="sector-bar-chart" data-count={data.length} />,
}));

vi.mock("../components/analytics/SectorPieChart", () => ({
  default: ({ data }) => <div data-testid="sector-pie-chart" data-count={data.length} />,
}));

vi.mock("../components/analytics/OpportunityBreakdownTable", () => ({
  default: ({ data }) => <div data-testid="breakdown-table" data-count={data.length} />,
}));

const mockGetPlacementRates = vi.fn();
const mockGetApplicationVolume = vi.fn();

vi.mock("../services/analyticsService", () => ({
  getPlacementRates:    (...args) => mockGetPlacementRates(...args),
  getApplicationVolume: (...args) => mockGetApplicationVolume(...args),
}));

// ── Helpers ──────────────────────────────────────────────────────────────────

function renderPage(source = "applicant") {
  return render(
    <MemoryRouter initialEntries={[{ pathname: "/analytics", state: { source } }]}>
      <AdminAnalytics />
    </MemoryRouter>
  );
}

const MOCK_SECTORS = [
  { sector: "Engineering", total_applications: 89, accepted_applications: 21, placement_rate: 23.6 },
  { sector: "Business",    total_applications: 98, accepted_applications: 19, placement_rate: 19.4 },
];

const MOCK_TABLE = [
  { opportunityTitle: "Internship", count: 68, status: "approved", location: "JHB", opportunityId: "1", statusBreakdown: { pending: 0, shortlisted: 0, accepted: 0, rejected: 0 } },
];

const MOCK_TOTALS = { totalApplications: 187, activeOpportunities: 2, averagePerOpportunity: 93 };

// ── Tests ────────────────────────────────────────────────────────────────────

describe("AdminAnalytics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading state initially", () => {
    mockGetPlacementRates.mockReturnValue(new Promise(() => {}));
    mockGetApplicationVolume.mockReturnValue(new Promise(() => {}));
    renderPage();
    expect(screen.getByText("Loading analytics…")).toBeDefined();
  });

  it("renders page title after load", async () => {
    mockGetPlacementRates.mockResolvedValue({ raw: MOCK_SECTORS });
    mockGetApplicationVolume.mockResolvedValue({ data: MOCK_TABLE, totals: MOCK_TOTALS });
    renderPage();
    await waitFor(() => expect(screen.getByText("Analytics & Governance")).toBeDefined());
  });

  it("renders topbar with Analytics title", async () => {
    mockGetPlacementRates.mockResolvedValue({ raw: MOCK_SECTORS });
    mockGetApplicationVolume.mockResolvedValue({ data: MOCK_TABLE, totals: MOCK_TOTALS });
    renderPage();
    await waitFor(() => expect(screen.getByTestId("topbar")).toBeDefined());
    expect(screen.getByTestId("topbar").textContent).toBe("Analytics");
  });

  it("renders all three stat cards", async () => {
    mockGetPlacementRates.mockResolvedValue({ raw: MOCK_SECTORS });
    mockGetApplicationVolume.mockResolvedValue({ data: MOCK_TABLE, totals: MOCK_TOTALS });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText("Total Applications")).toBeDefined();
      expect(screen.getByText("Active Opportunities")).toBeDefined();
      expect(screen.getByText("Avg. Applications / Opportunity")).toBeDefined();
    });
  });

  it("displays live totals from API", async () => {
    mockGetPlacementRates.mockResolvedValue({ raw: MOCK_SECTORS });
    mockGetApplicationVolume.mockResolvedValue({ data: MOCK_TABLE, totals: MOCK_TOTALS });
    renderPage();
    await waitFor(() => expect(screen.getByText("187")).toBeDefined());
    expect(screen.getByText("2")).toBeDefined();
    expect(screen.getByText("93")).toBeDefined();
  });

  it("renders both charts", async () => {
    mockGetPlacementRates.mockResolvedValue({ raw: MOCK_SECTORS });
    mockGetApplicationVolume.mockResolvedValue({ data: MOCK_TABLE, totals: MOCK_TOTALS });
    renderPage();
    await waitFor(() => {
      expect(screen.getByTestId("sector-bar-chart")).toBeDefined();
      expect(screen.getByTestId("sector-pie-chart")).toBeDefined();
    });
  });

  it("renders breakdown table", async () => {
    mockGetPlacementRates.mockResolvedValue({ raw: MOCK_SECTORS });
    mockGetApplicationVolume.mockResolvedValue({ data: MOCK_TABLE, totals: MOCK_TOTALS });
    renderPage();
    await waitFor(() => expect(screen.getByTestId("breakdown-table")).toBeDefined());
  });

  it("passes sector data to charts", async () => {
    mockGetPlacementRates.mockResolvedValue({ raw: MOCK_SECTORS });
    mockGetApplicationVolume.mockResolvedValue({ data: MOCK_TABLE, totals: MOCK_TOTALS });
    renderPage();
    await waitFor(() => {
      expect(screen.getByTestId("sector-bar-chart").getAttribute("data-count")).toBe("2");
      expect(screen.getByTestId("sector-pie-chart").getAttribute("data-count")).toBe("2");
    });
  });

  it("shows error banner when placements API fails but keeps mock data", async () => {
    mockGetPlacementRates.mockRejectedValue(new Error("No token provided. Please log in."));
    mockGetApplicationVolume.mockResolvedValue({ data: MOCK_TABLE, totals: MOCK_TOTALS });
    renderPage();
    await waitFor(() =>
      expect(screen.getByText("Could not load live data. Showing example data.")).toBeDefined()
    );
    // Charts still render with mock data
    expect(screen.getByTestId("sector-bar-chart")).toBeDefined();
  });

  it("still renders charts when apps API fails", async () => {
    mockGetPlacementRates.mockResolvedValue({ raw: MOCK_SECTORS });
    mockGetApplicationVolume.mockRejectedValue(new Error("Request failed: 401"));
    renderPage();
    await waitFor(() => expect(screen.getByTestId("sector-bar-chart")).toBeDefined());
    expect(screen.getByTestId("sector-pie-chart")).toBeDefined();
  });

  it("falls back to mock totals when apps API fails", async () => {
    mockGetPlacementRates.mockResolvedValue({ raw: MOCK_SECTORS });
    mockGetApplicationVolume.mockRejectedValue(new Error("Request failed: 401"));
    renderPage();
    // Mock totals have totalApplications: 247
    await waitFor(() => expect(screen.getByText("247")).toBeDefined());
  });

  it("uses applicant sidebar when source is applicant", async () => {
    mockGetPlacementRates.mockResolvedValue({ raw: MOCK_SECTORS });
    mockGetApplicationVolume.mockResolvedValue({ data: MOCK_TABLE, totals: MOCK_TOTALS });
    renderPage("applicant");
    await waitFor(() => expect(screen.getByTestId("applicant-sidebar")).toBeDefined());
  });

  it("uses employer sidebar when source is provider", async () => {
    mockGetPlacementRates.mockResolvedValue({ raw: MOCK_SECTORS });
    mockGetApplicationVolume.mockResolvedValue({ data: MOCK_TABLE, totals: MOCK_TOTALS });
    renderPage("provider");
    await waitFor(() => expect(screen.getByTestId("employer-sidebar")).toBeDefined());
  });

  it("both APIs fail — still renders page with mock data", async () => {
    mockGetPlacementRates.mockRejectedValue(new Error("Network error"));
    mockGetApplicationVolume.mockRejectedValue(new Error("Network error"));
    renderPage();
    await waitFor(() => expect(screen.getByText("Analytics & Governance")).toBeDefined());
    expect(screen.getByTestId("sector-bar-chart")).toBeDefined();
  });
});