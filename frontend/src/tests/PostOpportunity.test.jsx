import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PostOpportunity from "../pages/PostOpportunity";

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
  test("renders page", () => {
    render(
      <MemoryRouter>
        <PostOpportunity />
      </MemoryRouter>
    );

    expect(screen.getByText(/post new opportunity/i)).toBeInTheDocument();
  });
});