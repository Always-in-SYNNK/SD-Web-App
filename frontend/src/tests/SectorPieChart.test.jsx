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
  { sector: "Engineering",     total_applications: 89, accepted_applications: 21, placement_rate: 23.6 },
  { sector: "Business",        total_applications: 98, accepted_applications: 19, placement_rate: 19.4 },
  { sector: "Health Sciences", total_applications: 53, accepted_applications: 9,  placement_rate: 17.0 },
  { sector: "Arts",            total_applications: 27, accepted_applications: 5,  placement_rate: 18.5 },
  { sector: "Law",             total_applications: 32, accepted_applications: 0,  placement_rate: 0    }, // filtered out
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
      { sector: "Law", total_applications: 32, accepted_applications: 0, placement_rate: 0 },
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
      { sector: null, total_applications: 10, accepted_applications: 3, placement_rate: 30 },
    ];
    render(<SectorPieChart data={noNameData} />);
    const canvas = screen.getByTestId("pie-chart");
    const labels = JSON.parse(canvas.getAttribute("data-labels"));
    expect(labels).toContain("Unknown");
  });

  it("handles string number values from API", () => {
    const stringData = [
      { sector: "Engineering", total_applications: "89", accepted_applications: "21", placement_rate: "23.6" },
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