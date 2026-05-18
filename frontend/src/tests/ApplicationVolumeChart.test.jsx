import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ApplicationVolumeChart from "../components/analytics/ApplicationVolumeChart";

// Mock chart.js
vi.mock("chart.js", () => ({
  Chart: {
    register: vi.fn(),
  },
  CategoryScale: {},
  LinearScale: {},
  BarElement: {},
  LineElement: {},
  PointElement: {},
  Tooltip: {},
  Filler: {},
}));

// Mock react-chartjs-2
vi.mock("react-chartjs-2", () => ({
  Bar: ({ data, options }) => (
    <div data-testid="bar-chart">
      <div data-testid="bar-labels">{JSON.stringify(data.labels)}</div>
      <div data-testid="bar-dataset">
        {JSON.stringify(data.datasets)}
      </div>

      {/* execute tooltip callback for coverage */}
      <div data-testid="tooltip-output">
        {JSON.stringify(
          options.plugins.tooltip.callbacks.label({
            dataIndex: 0,
            parsed: { y: 55 },
          })
        )}
      </div>
    </div>
  ),

  Line: ({ data, options }) => (
    <div data-testid="line-chart">
      <div data-testid="line-labels">{JSON.stringify(data.labels)}</div>

      {/* execute tooltip callback for coverage */}
      <div data-testid="line-tooltip">
        {JSON.stringify(
          options.plugins.tooltip.callbacks.label({
            dataIndex: 0,
            parsed: { y: 55 },
          })
        )}
      </div>
    </div>
  ),
}));

describe("ApplicationVolumeChart", () => {
  const mockData = [
    {
      opportunityTitle:
        "Very Long Opportunity Title That Should Be Truncated",
      count: 55,
      statusBreakdown: {
        pending: 5,
        shortlisted: 10,
        offered: 2,
        accepted: 20,
        rejected: 18,
      },
    },
    {
      opportunityTitle: "Developer Role",
      count: 12,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders heading and api text", () => {
    render(<ApplicationVolumeChart data={mockData} />);

    expect(
      screen.getByText("Application Volume per Opportunity")
    ).toBeInTheDocument();

    expect(
      screen.getByText("GET /api/analytics/applications")
    ).toBeInTheDocument();
  });

  it("renders bar chart by default", () => {
    render(<ApplicationVolumeChart data={mockData} />);

    expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
  });

  it("switches to line chart", () => {
    render(<ApplicationVolumeChart data={mockData} />);

    fireEvent.click(screen.getByRole("button", { name: "line" }));

    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
  });

  it("switches back to bar chart", () => {
    render(<ApplicationVolumeChart data={mockData} />);

    fireEvent.click(screen.getByRole("button", { name: "line" }));
    fireEvent.click(screen.getByRole("button", { name: "bar" }));

    expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
  });

  it("shows no opportunities message when data is empty", () => {
    render(<ApplicationVolumeChart data={[]} />);

    expect(
      screen.getByText("No opportunities found")
    ).toBeInTheDocument();
  });

  it("renders legend text", () => {
    render(<ApplicationVolumeChart data={mockData} />);

    expect(screen.getByText("Applications")).toBeInTheDocument();

    expect(
      screen.getByText("Hover a bar to see the status breakdown")
    ).toBeInTheDocument();
  });

  it("truncates long labels", () => {
    render(<ApplicationVolumeChart data={mockData} />);

    const labels = screen.getByTestId("bar-labels");

    expect(labels.textContent).toContain("Very Long Opportunity…");
  });

  it("covers tooltip callback with status breakdown", () => {
    render(<ApplicationVolumeChart data={mockData} />);

    const tooltip = screen.getByTestId("tooltip-output");

    expect(tooltip.textContent).toContain("Pending");
    expect(tooltip.textContent).toContain("Shortlisted");
    expect(tooltip.textContent).toContain("Offered");
    expect(tooltip.textContent).toContain("Accepted");
    expect(tooltip.textContent).toContain("Rejected");
  });

  it("covers tooltip callback without status breakdown", () => {
    const data = [
      {
        opportunityTitle: "Role",
        count: 10,
      },
    ];

    render(<ApplicationVolumeChart data={data} />);

    const tooltip = screen.getByTestId("tooltip-output");

    expect(tooltip.textContent).toContain("Total");
  });
});