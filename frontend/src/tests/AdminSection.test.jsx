// frontend/src/components/admin/__tests__/AdminSection.test.jsx

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AdminSection from "../components/admin/AdminSection";
import { vi } from "vitest";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", () => ({
    useNavigate: () => mockNavigate,
    useLocation: () => ({
        pathname: "/dashboard",
    }),
}));

vi.mock("../services/adminService", () => ({
    applyForAdmin: vi.fn(),
    getMyAdminApplicationStatus: vi.fn(),
}));

import {
    applyForAdmin,
    getMyAdminApplicationStatus,
} from "../services/adminService";

describe("AdminSection", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders loading state initially", () => {
        getMyAdminApplicationStatus.mockReturnValue(
            new Promise(() => {})
        );

        render(<AdminSection isAdmin={false} />);

        expect(document.querySelector(".animate-pulse")).toBeInTheDocument();
    });

    it("renders admin portal button for admins", async () => {
        render(<AdminSection isAdmin={true} />);

        expect(
            await screen.findByText("Admin Portal")
        ).toBeInTheDocument();
    });

    it("navigates to admin applications when admin button is clicked", async () => {
        render(<AdminSection isAdmin={true} source="provider" />);

        fireEvent.click(await screen.findByText("Admin Portal"));

        expect(mockNavigate).toHaveBeenCalledWith(
            "/admin/applications",
            {
                state: {
                    from: "/dashboard",
                    source: "provider",
                },
            }
        );
    });

    it("renders apply for admin button when user has no application", async () => {
        getMyAdminApplicationStatus.mockResolvedValue({
            status: null,
        });

        render(<AdminSection isAdmin={false} />);

        expect(
            await screen.findByText("Apply for Admin")
        ).toBeInTheDocument();
    });

    it("shows pending state correctly", async () => {
        getMyAdminApplicationStatus.mockResolvedValue({
            status: "pending",
        });

        render(<AdminSection isAdmin={false} />);

        expect(
            await screen.findByText("Pending Review")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Your application is being reviewed.")
        ).toBeInTheDocument();
    });

    it("shows rejected state correctly", async () => {
        getMyAdminApplicationStatus.mockResolvedValue({
            status: "rejected",
        });

        render(<AdminSection isAdmin={false} />);

        expect(
            await screen.findByText("Not Approved")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Your application was not approved.")
        ).toBeInTheDocument();
    });

    it("submits admin application successfully", async () => {
        getMyAdminApplicationStatus.mockResolvedValue({
            status: null,
        });

        applyForAdmin.mockResolvedValue({});

        render(<AdminSection isAdmin={false} />);

        const button = await screen.findByText("Apply for Admin");

        fireEvent.click(button);

        await waitFor(() => {
            expect(applyForAdmin).toHaveBeenCalled();
        });

        expect(
            await screen.findByText("Pending Review")
        ).toBeInTheDocument();
    });

    it("shows error message when apply fails", async () => {
        getMyAdminApplicationStatus.mockResolvedValue({
            status: null,
        });

        applyForAdmin.mockRejectedValue(
            new Error("Application failed")
        );

        render(<AdminSection isAdmin={false} />);

        fireEvent.click(await screen.findByText("Apply for Admin"));

        expect(
            await screen.findByText("Application failed")
        ).toBeInTheDocument();
    });

    it("shows error message when status fetch fails", async () => {
        getMyAdminApplicationStatus.mockRejectedValue(
            new Error("Could not load status")
        );

        render(<AdminSection isAdmin={false} />);

        expect(
            await screen.findByText("Could not load status")
        ).toBeInTheDocument();
    });
});