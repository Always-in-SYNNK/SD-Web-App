// frontend/src/components/auth/__tests__/AuthHeroPanel.test.jsx

import { render, screen } from "@testing-library/react";
import AuthHeroPanel from "../components/auth/AuthHeroPanel";
import { vi } from "vitest";

// Mock useAuthFonts hook
vi.mock("../useAuthFonts", () => ({
    default: vi.fn(),
}));

describe("AuthHeroPanel", () => {
    it("renders default headline", () => {
        render(<AuthHeroPanel />);

        expect(
            screen.getByText("Build Your Future,")
        ).toBeInTheDocument();
    });

    it("renders default accent line", () => {
        render(<AuthHeroPanel />);

        expect(
            screen.getByText("One skill at a time.")
        ).toBeInTheDocument();
    });

    it("renders custom headline and accent line", () => {
        render(
            <AuthHeroPanel
                headline="Launch Your Career,"
                accentLine="One opportunity at a time."
            />
        );

        expect(
            screen.getByText("Launch Your Career,")
        ).toBeInTheDocument();

        expect(
            screen.getByText("One opportunity at a time.")
        ).toBeInTheDocument();
    });

    it("renders GrowthStageSA branding", () => {
        render(<AuthHeroPanel />);

        expect(
            screen.getByText("GrowthStageSA")
        ).toBeInTheDocument();
    });

    it("renders default badges", () => {
        render(<AuthHeroPanel />);

        expect(
            screen.getByText("SETA Accredited")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Skills Tracking")
        ).toBeInTheDocument();
    });

    it("renders custom badges", () => {
        const badges = [
            { icon: "verified", label: "Verified Training" },
            { icon: "work", label: "Job Ready" },
        ];

        render(<AuthHeroPanel badges={badges} />);

        expect(
            screen.getByText("Verified Training")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Job Ready")
        ).toBeInTheDocument();
    });

    it("does not render badges section when badges array is empty", () => {
        render(<AuthHeroPanel badges={[]} />);

        expect(
            screen.queryByText("SETA Accredited")
        ).not.toBeInTheDocument();
    });

    it("renders background image when provided", () => {
        render(
            <AuthHeroPanel
                backgroundImageUrl="https://example.com/image.jpg"
            />
        );

        const image = screen.getByAltText("");

        expect(image).toHaveAttribute(
            "src",
            "https://example.com/image.jpg"
        );
    });

    it("does not render image when backgroundImageUrl is missing", () => {
        render(<AuthHeroPanel />);

        expect(screen.queryByAltText("")).not.toBeInTheDocument();
    });

    it("renders badge icons", () => {
        render(<AuthHeroPanel />);

        expect(screen.getByText("verified")).toBeInTheDocument();
        expect(screen.getByText("school")).toBeInTheDocument();
    });
});