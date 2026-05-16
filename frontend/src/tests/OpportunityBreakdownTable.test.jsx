// frontend/src/components/analytics/__tests__/OpportunityBreakdownTable.test.jsx

import { render, screen } from "@testing-library/react";
import OpportunityBreakdownTable from "../components/analytics/OpportunityBreakdownTable";

describe("OpportunityBreakdownTable", () => {
    const mockData = [
        {
            opportunityId: 1,
            opportunityTitle: "Software Engineering Internship",
            location: "Johannesburg",
            count: 50,
            status: "approved",
            statusBreakdown: {
                pending: 20,
                shortlisted: 15,
                offered: 10,
                accepted: 10,
                rejected: 5,
            },
        },
        {
            opportunityId: 2,
            opportunityTitle: "UX Designer Graduate Program",
            location: "Cape Town",
            count: 25,
            status: "pending",
            statusBreakdown: {
                pending: 8,
                shortlisted: 7,
                offered: 5,
                accepted: 5,
                rejected: 5,
            },
        },
    ];

    it("renders table heading", () => {
        render(<OpportunityBreakdownTable data={mockData} />);

        expect(
            screen.getByText("Opportunity Breakdown")
        ).toBeInTheDocument();
    });

    it("renders all opportunity titles", () => {
        render(<OpportunityBreakdownTable data={mockData} />);

        expect(
            screen.getByText("Software Engineering Internship")
        ).toBeInTheDocument();

        expect(
            screen.getByText("UX Designer Graduate Program")
        ).toBeInTheDocument();
    });

    it("renders locations", () => {
        render(<OpportunityBreakdownTable data={mockData} />);

        expect(screen.getByText("Johannesburg")).toBeInTheDocument();
        expect(screen.getByText("Cape Town")).toBeInTheDocument();
    });

    it("renders application counts", () => {
        render(<OpportunityBreakdownTable data={mockData} />);

        expect(screen.getByText("50")).toBeInTheDocument();
        expect(screen.getByText("25")).toBeInTheDocument();
    });

    it("renders dynamic status headers", () => {
        render(
            <OpportunityBreakdownTable
                data={mockData}
                statusKeys={[
                    "pending",
                    "shortlisted",
                    "offered",
                    "accepted",
                    "rejected",
                ]}
            />
        );

        expect(screen.getByText("Pending")).toBeInTheDocument();
        expect(screen.getByText("Shortlisted")).toBeInTheDocument();
        expect(screen.getByText("Offered")).toBeInTheDocument();
        expect(screen.getByText("Accepted")).toBeInTheDocument();
        expect(screen.getByText("Rejected")).toBeInTheDocument();
    });

    it("renders status breakdown values", () => {
        render(<OpportunityBreakdownTable data={mockData} />);

        expect(screen.getAllByText("20")[0]).toBeInTheDocument();
        expect(screen.getAllByText("15")[0]).toBeInTheDocument();
        expect(screen.getAllByText("10")[0]).toBeInTheDocument();
        expect(screen.getAllByText("5")[0]).toBeInTheDocument();
    });

    it("renders opportunity status badges", () => {
        render(<OpportunityBreakdownTable data={mockData} />);

        expect(screen.getByText("approved")).toBeInTheDocument();
        expect(screen.getByText("pending")).toBeInTheDocument();
    });

    it("hides opportunity status column when showOpportunityStatus is false", () => {
        render(
            <OpportunityBreakdownTable
                data={mockData}
                showOpportunityStatus={false}
            />
        );

        expect(
            screen.queryByText("Opp. Status")
        ).not.toBeInTheDocument();
    });

    it("renders empty state when no data exists", () => {
        render(<OpportunityBreakdownTable data={[]} />);

        expect(
            screen.getByText("No data available.")
        ).toBeInTheDocument();
    });

    it("renders custom status keys correctly", () => {
        const adminData = [
            {
                opportunityId: 1,
                opportunityTitle: "Admin Analytics",
                location: "Remote",
                count: 100,
                status: "approved",
                statusBreakdown: {
                    received: 70,
                    offered: 30,
                },
            },
        ];

        render(
            <OpportunityBreakdownTable
                data={adminData}
                statusKeys={["received", "offered"]}
            />
        );

        expect(screen.getByText("Received")).toBeInTheDocument();
        expect(screen.getByText("Offered")).toBeInTheDocument();

        expect(screen.getByText("70")).toBeInTheDocument();
        expect(screen.getByText("30")).toBeInTheDocument();
    });

    it("renders fallback location when missing", () => {
        const dataWithoutLocation = [
            {
                opportunityId: 1,
                opportunityTitle: "No Location Job",
                count: 12,
                status: "draft",
                statusBreakdown: {},
            },
        ];

        render(
            <OpportunityBreakdownTable data={dataWithoutLocation} />
        );

        expect(screen.getByText("—")).toBeInTheDocument();
    });

    it("renders 0 for missing status breakdown values", () => {
        const incompleteData = [
            {
                opportunityId: 1,
                opportunityTitle: "Incomplete Breakdown",
                count: 8,
                status: "approved",
                statusBreakdown: {},
            },
        ];

        render(
            <OpportunityBreakdownTable data={incompleteData} />
        );

        const zeros = screen.getAllByText("0");
        expect(zeros.length).toBeGreaterThan(0);
    });
});