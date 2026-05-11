import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import OpportunityForm from "../components/forms/OpportunityForm";
import { vi } from "vitest";

vi.mock("../services/opportunityService", () => ({
  publishOpportunity: vi.fn(async () => ({ error: null })),
  updateOpportunity: vi.fn(async () => ({ error: null })),
  saveDraft: vi.fn(async () => ({ error: null })),
  getOpportunityById: vi.fn(async () => ({
    data: {},
    error: null,
  })),
}));

vi.mock("../lib/api", () => ({
  getFields: vi.fn(async () => ({
    data: ["Engineering", "IT"],
  })),
}));

describe("OpportunityForm", () => {
  test("renders form", async () => {
    render(
      <MemoryRouter>
        <OpportunityForm />
      </MemoryRouter>
    );

    expect(
      screen.getByText(/architect a new opportunity/i)
    ).toBeInTheDocument();
  });

  test("shows validation error", async () => {
    render(
      <MemoryRouter>
        <OpportunityForm />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText(/publish opportunity/i));

    await waitFor(() => {
      expect(
        screen.getByText(/opportunity title is required/i)
      ).toBeInTheDocument();
    });
  });
});