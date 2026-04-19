import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { jest, describe, test, expect, beforeEach } from "@jest/globals";

const mockNavigate = jest.fn();
const mockApply = jest.fn();

jest.unstable_mockModule("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

jest.unstable_mockModule("../../services/myApplicationService", () => ({
  applyToOpportunity: (...args) => mockApply(...args),
}));

const { OpportunityCard } = await import("./OpportunityCard");

describe("OpportunityCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
      />
    );

    expect(screen.getByText("Dev Role")).toBeInTheDocument();
    expect(screen.getByText(/Joburg/i)).toBeInTheDocument();
  });

  // =========================
  // APPLY FLOW
  // =========================
  test("calls apply API when clicking Apply", () => {
    mockApply.mockResolvedValue({});

    render(<OpportunityCard id={1} title="Dev Role" description="desc" />);

    fireEvent.click(screen.getByText("Apply"));

    expect(mockApply).toHaveBeenCalledWith(1);
  });

  test("changes button to Applied after success", async () => {
    mockApply.mockResolvedValue({});

    render(<OpportunityCard id={1} title="Dev Role" description="desc" />);

    fireEvent.click(screen.getByText("Apply"));

    expect(await screen.findByText("Applied")).toBeInTheDocument();
  });

  test("disables button when already applied", () => {
    render(<OpportunityCard id={1} title="Dev Role" isApplied={true} />);

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

  test("does NOT navigate when admin", () => {
    render(<OpportunityCard id={1} title="Admin Role" isAdmin={true} />);

    fireEvent.click(screen.getByText("Admin Role"));

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  // =========================
  // ADMIN BUTTONS
  // =========================
  test("shows edit and delete buttons for admin", () => {
    const mockEdit = jest.fn();
    const mockDelete = jest.fn();

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

  // =========================
  // STOP PROPAGATION
  // =========================
  test("clicking Apply does not trigger navigation", () => {
    render(<OpportunityCard id={1} title="Dev Role" />);

    fireEvent.click(screen.getByText("Apply"));

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  // =========================
  // ERROR HANDLING
  // =========================
  test("handles API error gracefully", async () => {
    globalThis.alert = jest.fn();

    mockApply.mockRejectedValue({
      response: { data: { error: "Failed to apply" } },
    });

    render(<OpportunityCard id={1} title="Dev Role" />);

    fireEvent.click(screen.getByText("Apply"));

    await waitFor(() => {
      expect(globalThis.alert).toHaveBeenCalledWith("Failed to apply");
    });
  });

  test("sets applied true if API says already applied", async () => {
    globalThis.alert = jest.fn();

    mockApply.mockRejectedValue({
      response: { data: { error: "Already applied" } },
    });

    render(<OpportunityCard id={1} title="Dev Role" />);

    fireEvent.click(screen.getByText("Apply"));

    expect(await screen.findByText("Applied")).toBeInTheDocument();
  });

  // =========================
  // PROP UPDATE (useEffect)
  // =========================
  test("updates applied state when prop changes", async () => {
    const { rerender } = render(
      <OpportunityCard id={1} title="Dev Role" isApplied={false} />
    );

    expect(screen.getByText("Apply")).toBeInTheDocument();

    rerender(
      <OpportunityCard id={1} title="Dev Role" isApplied={true} />
    );

    expect(await screen.findByText("Applied")).toBeInTheDocument();
  });
});