import { render, screen, fireEvent } from "@testing-library/react";
import { jest, describe, test, expect, beforeEach } from "@jest/globals";

const mockNavigate = jest.fn();
const mockApply = jest.fn();

jest.unstable_mockModule("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

jest.unstable_mockModule("../../services/applicationService", () => ({
  applyToOpportunity: (...args) => mockApply(...args),
}));

const { OpportunityCard } = await import("./OpportunityCard");

describe("OpportunityCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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

  test("calls apply API when clicking Apply", async () => {
    mockApply.mockResolvedValue({});

    render(
      <OpportunityCard
        id={1}
        title="Dev Role"
        description="desc"
      />
    );

    fireEvent.click(screen.getByText("Apply"));

    expect(mockApply).toHaveBeenCalledWith(1);
  });

  test("changes button to Applied after success", async () => {
    mockApply.mockResolvedValue({});

    render(
      <OpportunityCard
        id={1}
        title="Dev Role"
        description="desc"
      />
    );

    const button = screen.getByText("Apply");

    fireEvent.click(button);

    // wait for state update
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

    const button = screen.getByText("Applied");
    expect(button).toBeDisabled();
  });
});