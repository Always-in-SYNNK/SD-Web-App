// frontend/src/components/__tests__/FloatingActionButton.test.jsx

import { render, screen } from "@testing-library/react";
import FloatingActionButton from "../components/common/FloatingActionButton";

describe("FloatingActionButton", () => {
    it("renders the floating action button", () => {
        render(<FloatingActionButton />);

        const button = screen.getByRole("button");

        expect(button).toBeInTheDocument();
    });

    it("renders plus symbol", () => {
        render(<FloatingActionButton />);

        expect(screen.getByText("+")).toBeInTheDocument();
    });

    it("has correct styling classes", () => {
        render(<FloatingActionButton />);

        const button = screen.getByRole("button");

        expect(button.className).toContain("fixed");
        expect(button.className).toContain("bottom-8");
        expect(button.className).toContain("right-8");
        expect(button.className).toContain("rounded-full");
    });
});