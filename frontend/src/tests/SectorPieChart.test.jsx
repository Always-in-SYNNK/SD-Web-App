// src/components/analytics/SectorPieChart.test.jsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import SectorPieChart from "../components/analytics/SectorPieChart";

// Mock react-chartjs-2
vi.mock("react-chartjs-2", () => ({
  Doughnut: ({ data }) => (
    <canvas
      data-testid="pie-chart"
      data-labels={JSON.stringify(data.labels)}
      data-values={JSON.stringify(data.datasets[0].data)}
    />
  ),
}));

// Mock chart.js
vi.mock("chart.js", () => ({
  Chart: { register: vi.fn() },
  ArcElement: {},
  Tooltip: {},
  Legend: {},
}));

const MOCK_DATA = [
  { sector: "Engineering",     totalApplications: 89, acceptedApplications: 21, placementRate: 23.6 },
  { sector: "Business",        totalApplications: 98, acceptedApplications: 19, placementRate: 19.4 },
  { sector: "Health Sciences", totalApplications: 53, acceptedApplications: 9,  placementRate: 17.0 },
  { sector: "Arts",            totalApplications: 27, acceptedApplications: 5,  placementRate: 18.5 },
  { sector: "Law",             totalApplications: 32, acceptedApplications: 0,  placementRate: 0    }, // filtered out
];

describe("SectorPieChart", () => {
  it("renders the chart title", () => {
    render(<SectorPieChart data={MOCK_DATA} />);
    expect(screen.getByText("Acceptance by Sector")).toBeDefined();
  });

  it("renders the subtitle", () => {
    render(<SectorPieChart data={MOCK_DATA} />);
    expect(screen.getByText(/Share of accepted applicants/i)).toBeDefined();
  });

  it("renders the doughnut chart when there are accepted applications", () => {
    render(<SectorPieChart data={MOCK_DATA} />);
    expect(screen.getByTestId("pie-chart")).toBeDefined();
  });

  it("shows empty state when no data is passed", () => {
    render(<SectorPieChart data={[]} />);
    expect(screen.getByText("No accepted applications yet")).toBeDefined();
  });

  it("shows empty state when no prop is passed", () => {
    render(<SectorPieChart />);
    expect(screen.getByText("No accepted applications yet")).toBeDefined();
  });

  it("filters out sectors with zero accepted applications", () => {
    render(<SectorPieChart data={MOCK_DATA} />);
    const canvas = screen.getByTestId("pie-chart");
    const labels = JSON.parse(canvas.getAttribute("data-labels"));
    // Law has 0 accepted — should be excluded
    expect(labels).not.toContain("Law");
    expect(labels).toContain("Engineering");
  });

  it("shows empty state when all sectors have zero accepted", () => {
    const zeroData = [
      { sector: "Law", totalApplications: 32, acceptedApplications: 0, placementRate: 0 },
    ];
    render(<SectorPieChart data={zeroData} />);
    expect(screen.getByText("No accepted applications yet")).toBeDefined();
  });

  it("renders correct number of sectors after filtering", () => {
    render(<SectorPieChart data={MOCK_DATA} />);
    const canvas = screen.getByTestId("pie-chart");
    const labels = JSON.parse(canvas.getAttribute("data-labels"));
    // 4 sectors have accepted > 0, Law is filtered out
    expect(labels).toHaveLength(4);
  });

  it("passes correct accepted values to chart", () => {
    render(<SectorPieChart data={MOCK_DATA} />);
    const canvas = screen.getByTestId("pie-chart");
    const values = JSON.parse(canvas.getAttribute("data-values"));
    expect(values).toContain(21); // Engineering
    expect(values).toContain(19); // Business
    expect(values).toContain(9);  // Health Sciences
    expect(values).toContain(5);  // Arts
  });

  it("handles missing sector name with Unknown fallback", () => {
    const noNameData = [
      { sector: null, totalApplications: 10, acceptedApplications: 3, placementRate: 30 },
    ];
    render(<SectorPieChart data={noNameData} />);
    const canvas = screen.getByTestId("pie-chart");
    const labels = JSON.parse(canvas.getAttribute("data-labels"));
    expect(labels).toContain("Unknown");
  });

  it("handles string number values from API", () => {
    const stringData = [
      { sector: "Engineering", totalApplications: "89", acceptedApplications: "21", placementRate: "23.6" },
    ];
    render(<SectorPieChart data={stringData} />);
    expect(screen.getByTestId("pie-chart")).toBeDefined();
  });

  it("handles single sector with accepted applications", () => {
    render(<SectorPieChart data={[MOCK_DATA[0]]} />);
    const canvas = screen.getByTestId("pie-chart");
    const labels = JSON.parse(canvas.getAttribute("data-labels"));
    expect(labels).toHaveLength(1);
    expect(labels[0]).toBe("Engineering");
  });
});