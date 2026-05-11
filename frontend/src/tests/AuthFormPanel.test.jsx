// frontend/src/components/auth/__tests__/AuthFormPanel.test.jsx

import { render, screen, fireEvent } from "@testing-library/react";
import AuthFormPanel from "../components/auth/AuthFormPanel";

describe("AuthFormPanel", () => {
    it("renders children content", () => {
        render(
            <AuthFormPanel onBack={vi.fn()}>
                <div>Login Form</div>
            </AuthFormPanel>
        );

        expect(screen.getByText("Login Form")).toBeInTheDocument();
    });

    it("renders back button", () => {
        render(
            <AuthFormPanel onBack={vi.fn()}>
                <div>Content</div>
            </AuthFormPanel>
        );

        expect(
            screen.getByRole("button", { name: /back to home/i })
        ).toBeInTheDocument();
    });

    it("calls onBack when back button is clicked", () => {
        const mockOnBack = vi.fn();

        render(
            <AuthFormPanel onBack={mockOnBack}>
                <div>Content</div>
            </AuthFormPanel>
        );

        fireEvent.click(
            screen.getByRole("button", { name: /back to home/i })
        );

        expect(mockOnBack).toHaveBeenCalledTimes(1);
    });

    it("renders terms of service link", () => {
        render(
            <AuthFormPanel onBack={vi.fn()}>
                <div>Content</div>
            </AuthFormPanel>
        );

        const termsLink = screen.getByRole("link", {
            name: /terms of service/i,
        });

        expect(termsLink).toHaveAttribute("href", "/terms");
    });

    it("renders privacy policy link", () => {
        render(
            <AuthFormPanel onBack={vi.fn()}>
                <div>Content</div>
            </AuthFormPanel>
        );

        const privacyLink = screen.getByRole("link", {
            name: /privacy policy/i,
        });

        expect(privacyLink).toHaveAttribute("href", "/privacy");
    });

    it("renders footer text", () => {
        render(
            <AuthFormPanel onBack={vi.fn()}>
                <div>Content</div>
            </AuthFormPanel>
        );

        expect(
            screen.getByText(/by continuing, you agree/i)
        ).toBeInTheDocument();
    });

    it("renders arrow icon text", () => {
        render(
            <AuthFormPanel onBack={vi.fn()}>
                <div>Content</div>
            </AuthFormPanel>
        );

        expect(screen.getByText("arrow_back")).toBeInTheDocument();
    });
});