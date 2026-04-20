import { render, screen, fireEvent } from "@testing-library/react";
import { jest, describe, test, expect } from "@jest/globals";

const mockNavigate = jest.fn();

jest.unstable_mockModule("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

const { ApplicationCard } = await import("./myApplicationCard");

describe("ApplicationCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders basic application info", () => {
    render(
      <ApplicationCard
        title="Software Intern"
        company="Google"
        location="Johannesburg"
        status="Received"
        meta="Submitted Jan 1, 2024"
        opportunityId={99}
        onUnapply={jest.fn()}
      />
    );

    expect(screen.getByText("Software Intern")).toBeInTheDocument();
    expect(screen.getByText(/Google/i)).toBeInTheDocument();
    expect(screen.getByText("Received")).toBeInTheDocument();
  });

  test("shows Unapply button for Received", () => {
    render(
      <ApplicationCard
        title="Test"
        location="Joburg"
        status="Received"
        meta="meta"
        opportunityId={99}
        onUnapply={jest.fn()}
      />
    );

    expect(screen.getByText("Unapply")).toBeInTheDocument();
  });

  test("shows Accept button when Offered", () => {
    render(
      <ApplicationCard
        title="Test"
        location="Joburg"
        status="Offered"
        meta="meta"
        opportunityId={99}
        onAccept={jest.fn()}
      />
    );

    expect(screen.getByText("Accept")).toBeInTheDocument();
  });

  test("calls onUnapply when clicked", () => {
    const mockFn = jest.fn();

    render(
      <ApplicationCard
        title="Test"
        location="Joburg"
        status="Received"
        meta="meta"
        opportunityId={99}
        onUnapply={mockFn}
      />
    );

    fireEvent.click(screen.getByText("Unapply"));
    expect(mockFn).toHaveBeenCalled();
  });

  test("calls onAccept when clicked", () => {
    const mockFn = jest.fn();

    render(
      <ApplicationCard
        title="Test"
        location="Joburg"
        status="Offered"
        meta="meta"
        opportunityId={99}
        onAccept={mockFn}
      />
    );

    fireEvent.click(screen.getByText("Accept"));
    expect(mockFn).toHaveBeenCalled();
  });

  test("navigates to opportunity detail when card is clicked", () => {
    render(
      <ApplicationCard
        title="Test"
        location="Joburg"
        status="Received"
        meta="meta"
        opportunityId={77}
        onUnapply={jest.fn()}
      />
    );

    fireEvent.click(screen.getByText("Test"));

    expect(mockNavigate).toHaveBeenCalledWith("/opportunities/77");
  });

  test("action buttons do not trigger navigation", () => {
    render(
      <ApplicationCard
        title="Test"
        location="Joburg"
        status="Received"
        meta="meta"
        opportunityId={77}
        onUnapply={jest.fn()}
      />
    );

    fireEvent.click(screen.getByText("Unapply"));

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});