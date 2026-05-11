// frontend/src/components/admin/__tests__/OpportunityRow.test.jsx

import { render, screen } from "@testing-library/react";
import { OpportunityRow } from "../components/admin/OpportunityRow";

describe("OpportunityRow", () => {
    const mockItem = {
        title: "Frontend Developer",
        provider: "GrowthStage",
        type: "Internship",
        status: "Live",
    };

    it("renders opportunity information", () => {
        render(<OpportunityRow item={mockItem} />);

        expect(
            screen.getByText("Frontend Developer")
        ).toBeInTheDocument();

        expect(
            screen.getByText("GrowthStage")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Internship")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Live")
        ).toBeInTheDocument();
    });

    it("renders edit and remove buttons", () => {
        render(<OpportunityRow item={mockItem} />);

        expect(
            screen.getByText("Edit")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Remove")
        ).toBeInTheDocument();
    });

    it("applies green styling for live status", () => {
        render(<OpportunityRow item={mockItem} />);

        const status = screen.getByText("Live");

        expect(status.className).toContain("text-green-600");
    });

    it("applies red styling for non-live status", () => {
        render(
            <OpportunityRow
                item={{
                    ...mockItem,
                    status: "Closed",
                }}
            />
        );

        const status = screen.getByText("Closed");

        expect(status.className).toContain("text-red-500");
    });
});