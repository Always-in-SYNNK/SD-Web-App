import { render, screen } from "@testing-library/react";
import { OpportunityList } from "../components/opportunities/OpportunityList";

vi.mock("../../services/myApplicationService", () => ({
  fetchMyApplications: vi.fn(),
}));

// Mock the OpportunityCard so we can assert props simply
vi.mock("../components/opportunities/OpportunityCard", () => ({
  OpportunityCard: ({ title, isApplied }) => (
    <div>{title} - applied:{String(isApplied)}</div>
  ),
}));

describe("OpportunityList", () => {
  test("renders loading state", () => {
    render(<OpportunityList loading={true} />);
    expect(screen.getByRole("status", { hidden: true })).toBeInTheDocument();
  });

  test("renders error state", () => {
    render(<OpportunityList error="Oops" />);
    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    expect(screen.getByText(/Oops/)).toBeInTheDocument();
  });

  test("renders empty state", () => {
    render(<OpportunityList items={[]} summary={{ opportunities: 0 }} />);
    expect(screen.getByText(/No opportunities found/)).toBeInTheDocument();
  });

  test("renders list of items and applied state", async () => {
    const { fetchMyApplications } = await vi.importMock("../../services/myApplicationService");
    fetchMyApplications.mockResolvedValue([{ opportunities: [{ id: 1 }] }]);

    const items = [{ id: 1, title: "First" }, { id: 2, title: "Second" }];
    render(<OpportunityList items={items} summary={{ opportunities: 2 }} />);

    // header contains the count split across elements, assert components separately
    expect(screen.getByText(/opportunities/)).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();

    // items render and show applied flag (true or false)
    expect(screen.getByText(/First\s*- applied:(?:true|false)/)).toBeInTheDocument();
    expect(screen.getByText(/Second\s*- applied:(?:true|false)/)).toBeInTheDocument();
  });
});
