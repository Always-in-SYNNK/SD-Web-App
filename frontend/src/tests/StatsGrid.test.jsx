// frontend/src/components/admin/__tests__/StatsGrid.test.jsx

import { render, screen } from "@testing-library/react";
import { StatsGrid } from "../components/admin/StatsGrid";

describe("StatsGrid", () => {
    it("renders all stat labels", () => {
        render(<StatsGrid />);

        expect(screen.getByText("Total Active")).toBeInTheDocument();
        expect(screen.getByText("New Today")).toBeInTheDocument();
        expect(screen.getByText("Flagged")).toBeInTheDocument();
        expect(screen.getByText("Pending Review")).toBeInTheDocument();
    });

    it("renders all stat values", () => {
        render(<StatsGrid />);

        expect(screen.getByText("1,284")).toBeInTheDocument();
        expect(screen.getByText("42")).toBeInTheDocument();
        expect(screen.getByText("12")).toBeInTheDocument();
        expect(screen.getByText("89")).toBeInTheDocument();
    });

    it("renders four stat cards", () => {
        render(<StatsGrid />);

        const cards = document.querySelectorAll(".bg-gray-100");

        expect(cards.length).toBe(4);
    });
});