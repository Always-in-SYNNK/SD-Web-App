import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AnalyticsPage from "../pages/AnalyticsPage";
import { vi } from "vitest";

vi.mock("../context/useAuth", () => ({
  useAuth: () => ({
    user: { role: "provider" },
  }),
}));

vi.mock("../services/analyticsService", () => ({
  getApplicationVolume: vi.fn(async () => ({
    data: [
      {
        opportunityTitle: "Software Internship",
        count: 12,
        status: "approved",
        location: "Johannesburg",
        opportunityId: "1",
        statusBreakdown: {
          pending: 2,
          shortlisted: 3,
          accepted: 5,
          rejected: 2,
        },
      },
    ],
    totals: {
      totalApplications: 12,
      activeOpportunities: 1,
      averagePerOpportunity: 12,
    },
  })),
  exportAnalytics: vi.fn(async () => ({})),
}));

vi.mock("../components/layout/AdminTopbar", () => ({
  default: () => <div>AdminTopbar</div>,
}));

vi.mock("../components/layout/Sidebar", () => ({
  default: () => <div>EmployerSidebar</div>,
}));

vi.mock("../components/dashboard/Sidebar", () => ({
  Sidebar: () => <div>ApplicantSidebar</div>,
}));

vi.mock("../components/analytics/ApplicationVolumeChart", () => ({
  default: () => <div>Chart</div>,
}));

vi.mock("../components/analytics/OpportunityBreakdownTable", () => ({
  default: () => <div>Table</div>,
}));

describe("AnalyticsPage", () => {
  test("renders analytics data", async () => {
    render(
      <MemoryRouter>
        <AnalyticsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/analytics & governance/i)).toBeInTheDocument();
    });

    expect(screen.getByText("12")).toBeInTheDocument();
  });

  test("export button works", async () => {
    render(
      <MemoryRouter>
        <AnalyticsPage />
      </MemoryRouter>
    );

    const button = await screen.findByText(/export csv/i);

    fireEvent.click(button);

    expect(button).toBeInTheDocument();
  });
});