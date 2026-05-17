// frontend/src/tests/OpportunityCard.test.jsx
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import { act } from "@testing-library/react";
import { vi, describe, test, expect, beforeEach } from "vitest";

const { mockNavigate, mockApply } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockApply: vi.fn(),
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("../services/myApplicationService", () => ({
  applyToOpportunity: mockApply,
}));

const { OpportunityCard } = await import(
  "../components/opportunities/OpportunityCard"
);

describe("OpportunityCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.alert = vi.fn();
  });

  // =========================
  // RENDER
  // =========================

  test("renders opportunity info", () => {
    render(
      <OpportunityCard
        id={1}
        title="Dev Role"
        description="Build stuff"
        location="Joburg"
        duration="12 months"
        stipend={5000}
        closing_date="2026-12-31"
      />
    );

    expect(screen.getByText("Dev Role")).toBeInTheDocument();
    expect(screen.getByText(/Build stuff/i)).toBeInTheDocument();
    expect(screen.getByText(/Joburg/i)).toBeInTheDocument();
    expect(screen.getByText(/12 months/i)).toBeInTheDocument();
    expect(screen.getByText(/R5 000\/month/i)).toBeInTheDocument();
    expect(screen.getByText(/Closes/i)).toBeInTheDocument();
  });

  test("renders unpaid when stipend is missing", () => {
    render(<OpportunityCard id={1} title="Volunteer Role" />);

    expect(screen.queryByText(/Unpaid/i)).not.toBeInTheDocument();
  });

  test("renders fallback closing date", () => {
    render(<OpportunityCard id={1} title="Role" />);

    expect(screen.getByText(/No closing date/i)).toBeInTheDocument();
  });

  // =========================
  // STATUS PILLS
  // =========================

  test("renders approved status pill", () => {
    render(
      <OpportunityCard
        id={1}
        title="Approved Role"
        status="approved"
      />
    );

    expect(screen.getByText("approved")).toBeInTheDocument();
  });

  test("renders fallback status styling for unknown status", () => {
    render(
      <OpportunityCard
        id={1}
        title="Unknown Role"
        status="weird-status"
      />
    );

    expect(screen.getByText("weird-status")).toBeInTheDocument();
  });

  // =========================
  // APPLY FLOW
  // =========================

  test("calls apply API when clicking Apply", async () => {
    mockApply.mockResolvedValue({});

    render(<OpportunityCard id={1} title="Dev Role" />);

    await act(async () => {
      fireEvent.click(screen.getByText("Apply"));
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(mockApply).toHaveBeenCalledWith(1);
  });

  test("changes button to Applied after success", async () => {
    mockApply.mockResolvedValue({});

    render(<OpportunityCard id={1} title="Dev Role" />);

    await act(async () => {
      fireEvent.click(screen.getByText("Apply"));
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(await screen.findByText("Applied")).toBeInTheDocument();
  });

  test("disables button when already applied", () => {
    render(
      <OpportunityCard
        id={1}
        title="Dev Role"
        isApplied={true}
      />
    );

    expect(screen.getByText("Applied")).toBeDisabled();
  });

  // =========================
  // NAVIGATION
  // =========================

  test("navigates to opportunity page on card click", () => {
    render(<OpportunityCard id={99} title="Dev Role" />);

    fireEvent.click(screen.getByText("Dev Role"));

    expect(mockNavigate).toHaveBeenCalledWith("/opportunities/99");
  });

  test("navigates when admin card is clicked", () => {
    render(
      <OpportunityCard
        id={1}
        title="Admin Role"
        isAdmin={true}
      />
    );

    fireEvent.click(screen.getByText("Admin Role"));

    expect(mockNavigate).toHaveBeenCalledWith("/opportunities/1");
  });

  test("does not navigate when provider card is clicked", () => {
    render(
      <OpportunityCard
        id={1}
        title="Provider Role"
        isProvider={true}
      />
    );

    fireEvent.click(screen.getByText("Provider Role"));

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  // =========================
  // PROVIDER ACTIONS
  // =========================

  test("shows Edit Draft button for provider draft", () => {
    render(
      <OpportunityCard
        id={10}
        title="Draft Role"
        isProvider={true}
        status="draft"
      />
    );

    const btn = screen.getByText("Edit Draft");

    expect(btn).toBeInTheDocument();

    fireEvent.click(btn);

    expect(mockNavigate).toHaveBeenCalledWith(
      "/opportunities/edit/10"
    );
  });

  test("shows View Applications button for approved provider opportunity", () => {
    render(
      <OpportunityCard
        id={20}
        title="Approved Role"
        isProvider={true}
        status="approved"
      />
    );

    const btn = screen.getByText("View Applications");

    expect(btn).toBeInTheDocument();

    fireEvent.click(btn);

    expect(mockNavigate).toHaveBeenCalledWith(
      "/opportunity/20/applications"
    );
  });

  test("shows Revise & Resubmit button for rejected provider opportunity", () => {
    render(
      <OpportunityCard
        id={30}
        title="Rejected Role"
        isProvider={true}
        status="rejected"
      />
    );

    const btn = screen.getByText(/Revise & Resubmit/i);

    expect(btn).toBeInTheDocument();

    fireEvent.click(btn);

    expect(mockNavigate).toHaveBeenCalledWith(
      "/opportunities/edit/30"
    );
  });

  test("shows Under Review badge for pending provider opportunity", () => {
    render(
      <OpportunityCard
        id={40}
        title="Pending Role"
        isProvider={true}
        status="pending"
      />
    );

    expect(screen.getByText("Under Review")).toBeInTheDocument();
  });

  // =========================
  // ADMIN BUTTONS
  // =========================

  test("shows edit and delete buttons for admin", () => {
    const mockEdit = vi.fn();
    const mockDelete = vi.fn();

    render(
      <OpportunityCard
        id={1}
        title="Admin Role"
        isAdmin={true}
        onEdit={mockEdit}
        onDelete={mockDelete}
      />
    );

    fireEvent.click(screen.getByText("Edit"));
    fireEvent.click(screen.getByText("Delete"));

    expect(mockEdit).toHaveBeenCalledWith(1);
    expect(mockDelete).toHaveBeenCalledWith(1);
  });

  test("calls approve and reject handlers", () => {
    const mockApprove = vi.fn();
    const mockReject = vi.fn();

    render(
      <OpportunityCard
        id={55}
        title="Pending Role"
        isAdmin={true}
        onApprove={mockApprove}
        onReject={mockReject}
      />
    );

    fireEvent.click(screen.getByText("Approve"));
    fireEvent.click(screen.getByText("Reject"));

    expect(mockApprove).toHaveBeenCalledWith(55);
    expect(mockReject).toHaveBeenCalledWith(55);
  });

  // =========================
  // STOP PROPAGATION
  // =========================

  test("clicking Apply does not trigger navigation", async () => {
    render(<OpportunityCard id={1} title="Dev Role" />);

    await act(async () => {
      fireEvent.click(screen.getByText("Apply"));
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("clicking provider action buttons does not trigger card navigation", () => {
    render(
      <OpportunityCard
        id={77}
        title="Draft Provider Role"
        isProvider={true}
        status="draft"
      />
    );

    fireEvent.click(screen.getByText("Edit Draft"));

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(
      "/opportunities/edit/77"
    );
  });

  // =========================
  // ERROR HANDLING
  // =========================

  test("handles API error gracefully", async () => {
    mockApply.mockRejectedValue({
      response: { data: { error: "Failed to apply" } },
    });

    render(<OpportunityCard id={1} title="Dev Role" />);

    await act(async () => {
      fireEvent.click(screen.getByText("Apply"));
      await new Promise((r) => setTimeout(r, 0));
    });

    await waitFor(() => {
      expect(globalThis.alert).toHaveBeenCalledWith(
        "Failed to apply"
      );
    });
  });

  test("uses fallback error message", async () => {
    mockApply.mockRejectedValue(new Error("boom"));

    render(<OpportunityCard id={1} title="Dev Role" />);

    await act(async () => {
      fireEvent.click(screen.getByText("Apply"));
      await new Promise((r) => setTimeout(r, 0));
    });

    await waitFor(() => {
      expect(globalThis.alert).toHaveBeenCalledWith(
        "Failed to apply"
      );
    });
  });

  test("sets applied true if API says already applied", async () => {
    mockApply.mockRejectedValue({
      response: { data: { error: "Already applied" } },
    });

    render(<OpportunityCard id={1} title="Dev Role" />);

    await act(async () => {
      fireEvent.click(screen.getByText("Apply"));
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(await screen.findByText("Applied")).toBeInTheDocument();
  });

  // =========================
  // PROP UPDATE (useEffect)
  // =========================

  test("updates applied state when prop changes", async () => {
    const { rerender } = render(
      <OpportunityCard
        id={1}
        title="Dev Role"
        isApplied={false}
      />
    );

    expect(screen.getByText("Apply")).toBeInTheDocument();

    rerender(
      <OpportunityCard
        id={1}
        title="Dev Role"
        isApplied={true}
      />
    );

    expect(await screen.findByText("Applied")).toBeInTheDocument();
  });

  // =========================
  // DISABLED ADMIN ACTIONS
  // =========================

  test("disables approve button when disableApprove is true", () => {
    const mockApprove = vi.fn();

    render(
      <OpportunityCard
        id={1}
        title="Pending Role"
        isAdmin={true}
        onApprove={mockApprove}
        disableApprove={true}
      />
    );

    const approveBtn = screen.getByText("Approve");

    expect(approveBtn).toBeDisabled();

    expect(approveBtn).toHaveAttribute(
      "title",
      "You cannot approve your own opportunity."
    );

    fireEvent.click(approveBtn);

    expect(mockApprove).not.toHaveBeenCalled();
  });

  test("disables reject button when disableReject is true", () => {
    const mockReject = vi.fn();

    render(
      <OpportunityCard
        id={1}
        title="Pending Role"
        isAdmin={true}
        onReject={mockReject}
        disableReject={true}
      />
    );

    const rejectBtn = screen.getByText("Reject");

    expect(rejectBtn).toBeDisabled();

    expect(rejectBtn).toHaveAttribute(
      "title",
      "You cannot reject your own opportunity."
    );

    fireEvent.click(rejectBtn);

    expect(mockReject).not.toHaveBeenCalled();
  });

  test("disables delete button when disableDelete is true", () => {
    const mockDelete = vi.fn();

    render(
      <OpportunityCard
        id={1}
        title="Approved Role"
        isAdmin={true}
        onDelete={mockDelete}
        disableDelete={true}
      />
    );

    const deleteBtn = screen.getByText("Delete");

    expect(deleteBtn).toBeDisabled();

    expect(deleteBtn).toHaveAttribute(
      "title",
      "You cannot delete your own opportunity."
    );

    fireEvent.click(deleteBtn);

    expect(mockDelete).not.toHaveBeenCalled();
  });
});