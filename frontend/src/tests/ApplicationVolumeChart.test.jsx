// frontend/src/components/analytics/__tests__/ApplicationVolumeChart.test.jsx

import { render, screen, fireEvent } from "@testing-library/react";
import ApplicationVolumeChart from "../components/analytics/ApplicationVolumeChart";
import { vi } from "vitest";

// Mock react-chartjs-2
vi.mock("react-chartjs-2", () => ({
    Bar: ({ data }) => (
        <div data-testid="bar-chart">
            {JSON.stringify(data)}
        </div>
    ),
    Line: ({ data }) => (
        <div data-testid="line-chart">
            {JSON.stringify(data)}
        </div>
    ),
}));

describe("ApplicationVolumeChart", () => {
    const mockData = [
        {
            opportunityId: 1,
            opportunityTitle: "Software Engineering Internship Program",
            count: 50,
            location: "Johannesburg",
            status: "approved",
            statusBreakdown: {
                pending: 20,
                shortlisted: 15,
                offered: 5,
                accepted: 7,
                rejected: 3,
            },
        },
        {
            opportunityId: 2,
            opportunityTitle: "UX Designer Graduate Opportunity",
            count: 30,
            location: "Cape Town",
            status: "pending",
            statusBreakdown: {
                pending: 10,
                shortlisted: 8,
                accepted: 7,
                rejected: 5,
            },
        },
    ];

    it("renders chart title", () => {
        render(<ApplicationVolumeChart data={mockData} />);

        expect(
            screen.getByText("Application Volume per Opportunity")
        ).toBeInTheDocument();
    });

    it("renders bar chart by default", () => {
        render(<ApplicationVolumeChart data={mockData} />);

        expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
    });

    it("switches to line chart when line button is clicked", () => {
        render(<ApplicationVolumeChart data={mockData} />);

        fireEvent.click(screen.getByRole("button", { name: /line/i }));

        expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    });

    it("switches back to bar chart", () => {
        render(<ApplicationVolumeChart data={mockData} />);

        fireEvent.click(screen.getByRole("button", { name: /line/i }));
        fireEvent.click(screen.getByRole("button", { name: /bar/i }));

        expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
    });

    it("renders empty state when no data is provided", () => {
        render(<ApplicationVolumeChart data={[]} />);

        expect(
            screen.getByText("No opportunities found")
        ).toBeInTheDocument();
    });

    it("renders legend text", () => {
        render(<ApplicationVolumeChart data={mockData} />);

        expect(
            screen.getByText("Hover a bar to see the status breakdown")
        ).toBeInTheDocument();
    });

    it("truncates long opportunity titles in chart data", () => {
        render(<ApplicationVolumeChart data={mockData} />);

        const chart = screen.getByTestId("bar-chart");

        expect(chart.textContent).toContain(
            "Software Engineering …"
        );
    });

    it("renders API endpoint text", () => {
        render(<ApplicationVolumeChart data={mockData} />);

        expect(
            screen.getByText("GET /api/analytics/applications")
        ).toBeInTheDocument();
    });
});