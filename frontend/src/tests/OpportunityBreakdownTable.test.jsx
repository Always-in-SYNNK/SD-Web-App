import { render, screen } from "@testing-library/react";
import OpportunityBreakdownTable from "../components/analytics/OpportunityBreakdownTable";

describe("OpportunityBreakdownTable", () => {
  test("renders opportunity data", () => {
    render(
      <OpportunityBreakdownTable
        data={[
          {
            opportunityTitle: "Software Internship",
            count: 20,
            location: "Johannesburg",
            status: "approved",
            statusBreakdown: {
              pending: 2,
              shortlisted: 5,
              accepted: 10,
              rejected: 3,
            },
          },
        ]}
      />
    );

    expect(screen.getByText("Software Internship")).toBeInTheDocument();
    expect(screen.getByText("Johannesburg")).toBeInTheDocument();
  });
});