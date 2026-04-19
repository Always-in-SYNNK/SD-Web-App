import { render, screen, fireEvent } from "@testing-library/react";
import { jest, describe, test, expect } from "@jest/globals";
import { ApplicationCard } from "./ApplicationCard";

describe("ApplicationCard", () => {
  test("renders basic application info", () => {
    render(
      <ApplicationCard
        title="Software Intern"
        company="Google"
        location="Johannesburg"
        status="Received"
        meta="Submitted Jan 1, 2024"
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
        onAccept={mockFn}
      />
    );

    fireEvent.click(screen.getByText("Accept"));
    expect(mockFn).toHaveBeenCalled();
  });
});