import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OpportunitiesTable } from "../components/admin/OpportunitiesTable";

vi.mock("../services/opportunityService", () => ({
  getPendingOpportunities: vi.fn(),
  getApprovedOpportunities: vi.fn(),
  approveOpportunity: vi.fn(),
  rejectOpportunity: vi.fn(),
  deleteOpportunity: vi.fn(),
}));

import {
  getPendingOpportunities,
  approveOpportunity,
} from "../services/opportunityService";

describe("OpportunitiesTable", () => {
  test("shows loading state", () => {
    getPendingOpportunities.mockResolvedValue({
      data: [],
      error: null,
    });

    render(<OpportunitiesTable mode="pending" />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test("renders opportunities", async () => {
    getPendingOpportunities.mockResolvedValue({
      data: [
        {
          id: 1,
          title: "Software Internship",
        },
      ],
      error: null,
    });

    render(<OpportunitiesTable mode="pending" />);

    await waitFor(() => {
      expect(
        screen.getByText(/software internship/i)
      ).toBeInTheDocument();
    });
  });

  test("approves opportunity", async () => {
    getPendingOpportunities.mockResolvedValue({
      data: [
        {
          id: 1,
          title: "Internship",
        },
      ],
      error: null,
    });

    approveOpportunity.mockResolvedValue({
      error: null,
    });

    render(<OpportunitiesTable mode="pending" />);

    const approveBtn = await screen.findByRole("button", {
      name: /approve/i,
    });

    await userEvent.click(approveBtn);

    expect(approveOpportunity).toHaveBeenCalledWith(1);
  });
});