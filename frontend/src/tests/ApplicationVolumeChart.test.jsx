import { render, screen } from "@testing-library/react";
import ApplicationVolumeChart from "../components/analytics/ApplicationVolumeChart";

vi.mock("react-chartjs-2", () => ({
  Bar: () => <div>BarChart</div>,
  Line: () => <div>LineChart</div>,
}));

vi.mock("chart.js", () => ({
  Chart: {},
  CategoryScale: {},
  LinearScale: {},
  BarElement: {},
  LineElement: {},
  PointElement: {},
  Tooltip: {},
  Filler: {},
  ChartJS: {
    register: vi.fn(),
  },
}));

describe("ApplicationVolumeChart", () => {
  test("renders chart title", () => {
    render(
      <ApplicationVolumeChart
        data={[
          {
            opportunityTitle: "Internship",
            count: 10,
          },
        ]}
      />
    );

    expect(
      screen.getByText(/application volume per opportunity/i)
    ).toBeInTheDocument();
  });
});