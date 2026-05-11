// src/components/analytics/SectorBarChart.test.jsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import SectorBarChart from "../components/analytics/SectorBarChart";

// Mock react-chartjs-2
vi.mock("react-chartjs-2", () => ({
  Chart: ({ data, options }) => (
    <canvas data-testid="bar-chart" data-labels={JSON.stringify(data.labels)} />
  ),
}));

// Mock chart.js registration — no-op
vi.mock("chart.js", () => ({
  Chart: { register: vi.fn() },
  CategoryScale: {},
  LinearScale: {},
  BarElement: {},
  LineElement: {},
  PointElement: {},
  Tooltip: {},
  Legend: {},
}));

const MOCK_DATA = [
  { sector: "Engineering",    totalApplications: 89, acceptedApplications: 21, placementRate: 23.6 },
  { sector: "Business",       totalApplications: 98, acceptedApplications: 19, placementRate: 19.4 },
  { sector: "Health Sciences",totalApplications: 53, acceptedApplications: 9,  placementRate: 17.0 },
  { sector: "Arts",           totalApplications: 27, acceptedApplications: 5,  placementRate: 18.5 },
];

describe("SectorBarChart", () => {
  it("renders the chart title", () => {
    render(<SectorBarChart data={MOCK_DATA} />);
    expect(screen.getByText("Applications per Sector")).toBeDefined();
  });

  it("renders the subtitle", () => {
    render(<SectorBarChart data={MOCK_DATA} />);
    expect(screen.getByText(/Bars show total vs accepted/i)).toBeDefined();
  });

  it("renders the chart canvas when data is provided", () => {
    render(<SectorBarChart data={MOCK_DATA} />);
    expect(screen.getByTestId("bar-chart")).toBeDefined();
  });

  it("shows empty state when data is empty", () => {
    render(<SectorBarChart data={[]} />);
    expect(screen.getByText("No sector data available")).toBeDefined();
  });

  it("shows empty state when no data prop passed", () => {
    render(<SectorBarChart />);
    expect(screen.getByText("No sector data available")).toBeDefined();
  });

  it("sorts data by total_applications descending", () => {
    render(<SectorBarChart data={MOCK_DATA} />);
    const canvas = screen.getByTestId("bar-chart");
    const labels = JSON.parse(canvas.getAttribute("data-labels"));
    // Business (98) should come before Engineering (89)
    expect(labels.indexOf("Business")).toBeLessThan(labels.indexOf("Engineering"));
  });

  it("renders all sectors as labels", () => {
    render(<SectorBarChart data={MOCK_DATA} />);
    const canvas = screen.getByTestId("bar-chart");
    const labels = JSON.parse(canvas.getAttribute("data-labels"));
    expect(labels).toHaveLength(4);
    expect(labels).toContain("Engineering");
    expect(labels).toContain("Business");
    expect(labels).toContain("Health Sciences");
    expect(labels).toContain("Arts");
  });

  it("handles string number values from API", () => {
    const stringData = [
      { sector: "Engineering", totalApplications: "89", acceptedApplications: "21", placementRate: "23.6" },
    ];
    render(<SectorBarChart data={stringData} />);
    expect(screen.getByTestId("bar-chart")).toBeDefined();
  });

  it("handles missing accepted_applications gracefully", () => {
    const incompleteData = [
      { sector: "Engineering", totalApplications: 89 },
    ];
    render(<SectorBarChart data={incompleteData} />);
    expect(screen.getByTestId("bar-chart")).toBeDefined();
  });

  it("handles single sector", () => {
    render(<SectorBarChart data={[MOCK_DATA[0]]} />);
    const canvas = screen.getByTestId("bar-chart");
    const labels = JSON.parse(canvas.getAttribute("data-labels"));
    expect(labels).toHaveLength(1);
  });
});