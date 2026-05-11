// frontend/src/components/admin/__tests__/OpportunitiesTable.test.jsx

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OpportunitiesTable } from "../components/admin/OpportunitiesTable";
import { vi } from "vitest";

vi.mock("../components/opportunities/OpportunityCard", () => ({
    OpportunityCard: ({
        title,
        onDelete,
        onApprove,
        onReject,
    }) => (
        <div>
            <p>{title}</p>

            {onDelete && (
                <button onClick={() => onDelete(1)}>
                    Delete
                </button>
            )}

            {onApprove && (
                <button onClick={() => onApprove(1)}>
                    Approve
                </button>
            )}

            {onReject && (
                <button onClick={() => onReject(1)}>
                    Reject
                </button>
            )}
        </div>
    ),
}));

vi.mock("../services/opportunityService", () => ({
    getPendingOpportunities: vi.fn(),
    getApprovedOpportunities: vi.fn(),
    deleteOpportunity: vi.fn(),
    approveOpportunity: vi.fn(),
    rejectOpportunity: vi.fn(),
}));

import {
    getPendingOpportunities,
    getApprovedOpportunities,
    deleteOpportunity,
    approveOpportunity,
    rejectOpportunity,
} from "../services/opportunityService";

describe("OpportunitiesTable", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders loading state", () => {
        getPendingOpportunities.mockReturnValue(
            new Promise(() => {})
        );

        render(<OpportunitiesTable mode="pending" />);

        expect(screen.getByText("Loading...")).toBeInTheDocument();
    });

    it("renders pending opportunities", async () => {
        getPendingOpportunities.mockResolvedValue({
            data: [{ id: 1, title: "Pending Job" }],
            error: null,
        });

        render(<OpportunitiesTable mode="pending" />);

        expect(
            await screen.findByText("Pending Job")
        ).toBeInTheDocument();
    });

    it("renders approved opportunities", async () => {
        getApprovedOpportunities.mockResolvedValue({
            data: [{ id: 2, title: "Approved Job" }],
            error: null,
        });

        render(<OpportunitiesTable mode="approved" />);

        expect(
            await screen.findByText("Approved Job")
        ).toBeInTheDocument();
    });

    it("renders error message", async () => {
        getPendingOpportunities.mockResolvedValue({
            data: [],
            error: { message: "Failed to fetch" },
        });

        render(<OpportunitiesTable mode="pending" />);

        expect(
            await screen.findByText("Failed to fetch")
        ).toBeInTheDocument();
    });

    it("renders empty state", async () => {
        getPendingOpportunities.mockResolvedValue({
            data: [],
            error: null,
        });

        render(<OpportunitiesTable mode="pending" />);

        expect(
            await screen.findByText("No pending opportunities.")
        ).toBeInTheDocument();
    });

    it("approves opportunity successfully", async () => {
        const user = userEvent.setup();

        getPendingOpportunities.mockResolvedValue({
            data: [{ id: 1, title: "Pending Job" }],
            error: null,
        });

        approveOpportunity.mockResolvedValue({
            error: null,
        });

        render(<OpportunitiesTable mode="pending" />);

        await user.click(await screen.findByText("Approve"));

        await waitFor(() => {
            expect(
                screen.queryByText("Pending Job")
            ).not.toBeInTheDocument();
        });
    });

    it("rejects opportunity successfully", async () => {
        const user = userEvent.setup();

        getPendingOpportunities.mockResolvedValue({
            data: [{ id: 1, title: "Pending Job" }],
            error: null,
        });

        rejectOpportunity.mockResolvedValue({
            error: null,
        });

        render(<OpportunitiesTable mode="pending" />);

        await user.click(await screen.findByText("Reject"));

        await waitFor(() => {
            expect(
                screen.queryByText("Pending Job")
            ).not.toBeInTheDocument();
        });
    });

    it("deletes approved opportunity successfully", async () => {
        const user = userEvent.setup();

        getApprovedOpportunities.mockResolvedValue({
            data: [{ id: 1, title: "Approved Job" }],
            error: null,
        });

        deleteOpportunity.mockResolvedValue({
            error: null,
        });

        render(<OpportunitiesTable mode="approved" />);

        await user.click(await screen.findByText("Delete"));

        await waitFor(() => {
            expect(
                screen.queryByText("Approved Job")
            ).not.toBeInTheDocument();
        });
    });
});