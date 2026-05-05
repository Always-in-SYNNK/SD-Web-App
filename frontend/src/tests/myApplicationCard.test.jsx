import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, test, expect, beforeEach } from "vitest";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

const { ApplicationCard } = await import("../components/applications/myApplicationCard");

describe("ApplicationCard", () => {
  beforeEach(() => {
     vi.clearAllMocks();
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
        onUnapply={vi.fn()}
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
        onUnapply={vi.fn()}
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
        onAccept={vi.fn()}
      />
    );

    expect(screen.getByText("Accept")).toBeInTheDocument();
  });

  test("calls onUnapply when clicked", () => {
    const mockFn = vi.fn();

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
    const mockFn = vi.fn();

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
        onUnapply={vi.fn()}
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
        onUnapply={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText("Unapply"));

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});