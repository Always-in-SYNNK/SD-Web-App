import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AnalyticsPage from "../pages/AnalyticsPage";

const mockExportCSV = vi.fn();
const mockExportPDF = vi.fn();
const mockExportJSON = vi.fn();

vi.mock("../context/useAuth", () => ({
  useAuth: () => ({
    user: {
      name: "John Doe",
      role: "provider",
      email: "john@test.com",
    },
  }),
}));

vi.mock("react-router-dom", () => ({
  useLocation: () => ({
    state: { source: "provider" },
  }),
}));

vi.mock("../components/layout/Sidebar", () => ({
  default: () => <div>Employer Sidebar</div>,
}));

vi.mock("../components/dashboard/Sidebar", () => ({
  Sidebar: () => <div>Applicant Sidebar</div>,
}));

vi.mock("../components/layout/AdminTopbar", () => ({
  default: () => <div>Admin Topbar</div>,
}));

vi.mock("../components/analytics/ApplicationVolumeChart", () => ({
  default: () => <div>Application Chart</div>,
}));

vi.mock("../components/analytics/SectorBarChart", () => ({
  default: () => <div>Sector Chart</div>,
}));

vi.mock("../components/analytics/OpportunityBreakdownTable", () => ({
  default: () => <div>Breakdown Table</div>,
}));

vi.mock("../services/analyticsService", () => ({
  getApplicationVolume: vi.fn(() =>
    Promise.resolve({
      data: [
        {
          opportunityTitle: "Software Internship",
          count: 10,
        },
      ],
      totals: {
        totalApplications: 10,
        activeOpportunities: 1,
        averagePerOpportunity: 10,
      },
    })
  ),

  getProviderPlacementRates: vi.fn(() =>
    Promise.resolve([
      {
        sector: "IT",
        placementRate: 80,
      },
    ])
  ),
}));

vi.mock("../services/exportService", () => ({
  exportToCSV: (...args) => mockExportCSV(...args),
  exportToPDF: (...args) => mockExportPDF(...args),
  exportToJSON: (...args) => mockExportJSON(...args),
}));

describe("AnalyticsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("exports CSV successfully", async () => {
    render(<AnalyticsPage />);

    const csvButton = await screen.findByRole("button", {
      name: /csv/i,
    });

    await userEvent.click(csvButton);

    expect(mockExportCSV).toHaveBeenCalled();
  });

  it("shows error when CSV export fails", async () => {
    mockExportCSV.mockImplementation(() => {
      throw new Error("CSV failed");
    });

    render(<AnalyticsPage />);

    const csvButton = await screen.findByRole("button", {
      name: /csv/i,
    });

    await userEvent.click(csvButton);

    expect(
      await screen.findByText(/failed to export csv/i)
    ).toBeInTheDocument();
  });

  it("shows error when PDF export fails", async () => {
    mockExportPDF.mockImplementation(() => {
      throw new Error("PDF failed");
    });

    render(<AnalyticsPage />);

    const pdfButton = await screen.findByRole("button", {
      name: /pdf report/i,
    });

    await userEvent.click(pdfButton);

    expect(
      await screen.findByText(/failed to export pdf/i)
    ).toBeInTheDocument();
  });

  it("shows error when JSON export fails", async () => {
    mockExportJSON.mockImplementation(() => {
      throw new Error("JSON failed");
    });

    render(<AnalyticsPage />);

    const jsonButton = await screen.findByRole("button", {
      name: /json/i,
    });

    await userEvent.click(jsonButton);

    expect(
      await screen.findByText(/failed to export json/i)
    ).toBeInTheDocument();
  });

  it("renders analytics totals after loading", async () => {
    render(<AnalyticsPage />);

    expect(
      await screen.findByText(/total applications/i)
    ).toBeInTheDocument();

    const totalLabel = await screen.findByText(/total applications/i);
    const totalCard = totalLabel.closest("article");
    expect(within(totalCard).getByText("10")).toBeInTheDocument();
  });

  it("renders charts and breakdown table", async () => {
    render(<AnalyticsPage />);

    expect(
      await screen.findByText(/application chart/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/sector chart/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/breakdown table/i)
    ).toBeInTheDocument();
  });

  it("shows provider welcome message", async () => {
    render(<AnalyticsPage />);

    expect(
      await screen.findByText(/welcome back/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/john doe/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/\(Employer\)/i)
    ).toBeInTheDocument();
  });
});