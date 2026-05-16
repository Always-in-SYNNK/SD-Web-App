import { render, screen, fireEvent, waitFor } from "@testing-library/react";

vi.mock("react-router-dom", async () => ({
  ...(await vi.importActual("react-router-dom")),
  useParams: () => ({ id: "op-1" }),
  useNavigate: () => vi.fn(),
}));

vi.mock("../lib/supabaseClient", () => ({
  supabase: {
    from: (table) => ({
      select: () => ({
        eq: () => ({
          single: async () => ({
            data: table === "provider_profiles"
              ? [{ organisation_name: "Org" }]
              : { id: "op-1", title: "Test Opportunity", description: "Desc", location: "Cape Town", duration: "3 months", stipend: 1000, closing_date: "2025-12-31" },
            error: null,
          }),
        }),
      }),
      eq: () => ({
        single: async () => ({ data: { id: "op-1", title: "Test Opportunity", description: "Desc", location: "Cape Town", duration: "3 months", stipend: 1000, closing_date: "2025-12-31" }, error: null }),
      }),
      single: async () => ({ data: { id: "op-1", title: "Test Opportunity", description: "Desc", location: "Cape Town", duration: "3 months", stipend: 1000, closing_date: "2025-12-31" }, error: null }),
    }),
  },
}));

vi.mock("../services/myApplicationService", () => ({
  fetchMyApplications: vi.fn().mockResolvedValue([]),
  applyToOpportunity: vi.fn().mockResolvedValue({}),
}));

vi.mock("../context/useAuth", () => ({
  useAuth: () => ({ token: "mock-token", user: {}, login: vi.fn(), logout: vi.fn() }),
}));

import OpportunityDetail from "../pages/OpportunityDetail";
import { MemoryRouter } from "react-router-dom";

// Default fetch mock to prevent network calls in effects
global.fetch = vi.fn().mockResolvedValue({ json: async () => ({ success: false, opportunitySkills: [] }) });

describe("OpportunityDetail page", () => {
  test("renders opportunity details and skills and allows apply", async () => {
    // mock global fetch for skills
    global.fetch = vi.fn().mockResolvedValue({ json: async () => ({ success: true, opportunitySkills: [{ id: 1, title: "Testing" }] }) });

    const { applyToOpportunity } = await vi.importMock("../services/myApplicationService");

    render(
      <MemoryRouter>
        <OpportunityDetail />
      </MemoryRouter>
    );

    expect(await screen.findByText(/Test Opportunity/)).toBeInTheDocument();
    expect(screen.getByText(/About this opportunity/)).toBeInTheDocument();
    expect(await screen.findByText(/Testing/)).toBeInTheDocument();

    const applyButton = screen.getAllByRole("button", { name: /Apply Now|Applying...|Applied/ })[0];
    fireEvent.click(applyButton);

    await waitFor(() => expect(applyToOpportunity).toHaveBeenCalled());
  });
});
