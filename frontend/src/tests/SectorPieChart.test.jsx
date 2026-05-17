import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import SectorPieChart from "../components/analytics/SectorPieChart";

// Mock chart.js
vi.mock("chart.js", () => ({
  Chart: {
    register: vi.fn(),
  },
  ArcElement: {},
  Tooltip: {},
  Legend: {},
}));

// Mock Doughnut
vi.mock("react-chartjs-2", () => ({
  Doughnut: ({ data, options, plugins }) => {
    // cover generateLabels
    const labels =
      options.plugins.legend.labels.generateLabels({
        data,
      });

    // cover tooltip callback
    const tooltip =
      options.plugins.tooltip.callbacks.label({
        dataIndex: 0,
      });

    // cover centreLabel plugin
    const ctx = {
      save: vi.fn(),
      restore: vi.fn(),
      fillText: vi.fn(),
    };

    plugins[0].beforeDraw({
      ctx,
      chartArea: {
        left: 0,
        right: 100,
        top: 0,
        bottom: 100,
      },
    });

    return (
      <div data-testid="doughnut-chart">
        <div data-testid="legend-labels">
          {JSON.stringify(labels)}
        </div>

        <div data-testid="tooltip-label">
          {JSON.stringify(tooltip)}
        </div>
      </div>
    );
  },
}));

describe("SectorPieChart", () => {
  const mockData = [
    {
      sector: "Engineering",
      totalApplications: 100,
      acceptedApplications: 20,
      placementRate: 20,
    },
    {
      sector: "Design",
      totalApplications: 50,
      acceptedApplications: 10,
      placementRate: 20,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders heading", () => {
    render(<SectorPieChart data={mockData} />);

    expect(
      screen.getByText("Acceptance by Sector")
    ).toBeInTheDocument();
  });

  it("renders description", () => {
    render(<SectorPieChart data={mockData} />);

    expect(
      screen.getByText(
        "Share of accepted applicants across sectors"
      )
    ).toBeInTheDocument();
  });

  it("renders doughnut chart", () => {
    render(<SectorPieChart data={mockData} />);

    expect(
      screen.getByTestId("doughnut-chart")
    ).toBeInTheDocument();
  });

  it("shows empty state when no accepted applications", () => {
    render(
      <SectorPieChart
        data={[
          {
            sector: "Engineering",
            acceptedApplications: 0,
          },
        ]}
      />
    );

    expect(
      screen.getByText("No accepted applications yet")
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Data appears once applications are accepted"
      )
    ).toBeInTheDocument();
  });

  it("covers generateLabels callback", () => {
    render(<SectorPieChart data={mockData} />);

    const labels = screen.getByTestId("legend-labels");

    expect(labels.textContent).toContain("Engineering");
    expect(labels.textContent).toContain("%");
  });

  it("covers tooltip callback", () => {
    render(<SectorPieChart data={mockData} />);

    const tooltip = screen.getByTestId("tooltip-label");

    expect(tooltip.textContent).toContain("Accepted");
    expect(tooltip.textContent).toContain("Placement rate");
  });

  it("uses Unknown fallback sector", () => {
    render(
      <SectorPieChart
        data={[
          {
            totalApplications: 10,
            acceptedApplications: 5,
            placementRate: 50,
          },
        ]}
      />
    );

    const labels = screen.getByTestId("legend-labels");

    expect(labels.textContent).toContain("Unknown");
  });
});