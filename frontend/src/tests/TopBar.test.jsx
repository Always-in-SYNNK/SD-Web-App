// frontend/src/components/admin/__tests__/TopBar.test.jsx

import { render, screen } from "@testing-library/react";
import { TopBar } from "../components/admin/TopBar";

describe("TopBar", () => {
    it("renders title", () => {
        render(<TopBar />);

        expect(
            screen.getByText("Editorial Empowerment")
        ).toBeInTheDocument();
    });

    it("renders search input", () => {
        render(<TopBar />);

        const input = screen.getByPlaceholderText(
            "Search live opportunities..."
        );

        expect(input).toBeInTheDocument();
    });

    it("renders notification button", () => {
        render(<TopBar />);

        expect(screen.getByText("🔔")).toBeInTheDocument();
    });

    it("renders settings button", () => {
        render(<TopBar />);

        expect(screen.getByText("⚙️")).toBeInTheDocument();
    });

    it("renders two action buttons", () => {
        render(<TopBar />);

        const buttons = screen.getAllByRole("button");

        expect(buttons.length).toBe(2);
    });
});