// frontend/src/components/auth/__tests__/AuthLayout.test.jsx

import { render, screen } from "@testing-library/react";
import AuthLayout from "../components/auth/AuthLayout";

describe("AuthLayout", () => {
    it("renders hero panel content", () => {
        render(
            <AuthLayout
                heroPanel={<div>Hero Panel</div>}
                formPanel={<div>Form Panel</div>}
            />
        );

        expect(screen.getByText("Hero Panel")).toBeInTheDocument();
    });

    it("renders form panel content", () => {
        render(
            <AuthLayout
                heroPanel={<div>Hero Panel</div>}
                formPanel={<div>Form Panel</div>}
            />
        );

        expect(screen.getByText("Form Panel")).toBeInTheDocument();
    });

    it("renders main layout container", () => {
        render(
            <AuthLayout
                heroPanel={<div>Hero Panel</div>}
                formPanel={<div>Form Panel</div>}
            />
        );

        expect(screen.getByRole("main")).toBeInTheDocument();
    });

    it("renders both panels together", () => {
        render(
            <AuthLayout
                heroPanel={<section>Hero Content</section>}
                formPanel={<section>Form Content</section>}
            />
        );

        expect(screen.getByText("Hero Content")).toBeInTheDocument();
        expect(screen.getByText("Form Content")).toBeInTheDocument();
    });
});