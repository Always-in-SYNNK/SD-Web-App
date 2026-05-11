import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import PostOpportunity from "../pages/PostOpportunity";

// Mock children components
vi.mock("../components/layout/Sidebar", () => ({
  default: () => <div>Sidebar</div>,
}));

vi.mock("../components/layout/Topbar", () => ({
  default: () => <div>Topbar</div>,
}));

vi.mock("../components/forms/OpportunityForm", () => ({
  default: () => <div>OpportunityForm</div>,
}));

describe("PostOpportunity", () => {
  it("renders layout and form", () => {
    render(<PostOpportunity />);

    expect(screen.getByText("Sidebar")).toBeInTheDocument();
    expect(screen.getByText("Topbar")).toBeInTheDocument();
    expect(screen.getByText("OpportunityForm")).toBeInTheDocument();
    expect(screen.getByText(/Post New Opportunity/i)).toBeInTheDocument();
  });
});