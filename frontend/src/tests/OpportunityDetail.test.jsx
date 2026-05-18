// src/tests/OpportunityDetail.test.jsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi, describe, test, expect, beforeEach } from "vitest";

const mockNavigate = vi.fn();
const mockApply = vi.hoisted(() => vi.fn());
const mockFetchMyApplications = vi.hoisted(() => vi.fn());

vi.mock("react-router-dom", async () => ({
  ...(await vi.importActual("react-router-dom")),
  useParams: () => ({ id: "op-1" }),
  useNavigate: () => mockNavigate,
}));

vi.mock("../services/myApplicationService", () => ({
  fetchMyApplications: mockFetchMyApplications,
  applyToOpportunity: mockApply,
}));

vi.mock("../context/useAuth", () => ({
  useAuth: () => ({
    token: "mock-token",
    user: {},
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

vi.mock("../lib/supabaseClient", () => ({
  supabase: {
    from: vi.fn((table) => {
      if (table === "opportunities") {
        return {
          select: () => ({
            eq: () => ({
              single: async () => ({
                data: {
                  id: "op-1",
                  provider_id: "provider-1",
                  title: "Test Opportunity",
                  description: "Opportunity description",
                  location: "Cape Town",
                  duration: "3 months",
                  stipend: 1000,
                  closing_date: "2026-12-31",
                  field: "IT",
                  nqf_level: 5,
                },
                error: null,
              }),
            }),
          }),
        };
      }

      if (table === "provider_profiles") {
        return {
          select: () => ({
            eq: async () => ({
              data: [
                {
                  id: "provider-1",
                  organisation_name: "Tech Academy",
                  organisation_type: "Training Provider",
                  location: "Johannesburg",
                  website_url: "https://example.com",
                  description: "Leading tech education provider",
                  focus_fields: ["Software Development", "Cybersecurity"],
                },
              ],
              error: null,
            }),
          }),
        };
      }

      return {};
    }),
  },
}));

import OpportunityDetail from "../pages/OpportunityDetail";

describe("OpportunityDetail page", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockApply.mockResolvedValue({});
    mockFetchMyApplications.mockResolvedValue([]);

    globalThis.fetch = vi.fn().mockResolvedValue({
      json: async () => ({
        success: true,
        opportunitySkills: [
          { id: 1, title: "Testing" },
          { id: 2, title: "React" },
        ],
      }),
    });
  });

  test("renders opportunity details, provider details, skills, and allows applying", async () => {
    render(
      <MemoryRouter>
        <OpportunityDetail />
      </MemoryRouter>
    );

    // Opportunity content
    expect(
      await screen.findByText("Test Opportunity")
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Opportunity description/i)
    ).toBeInTheDocument();

    expect(screen.getAllByText(/Cape Town/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/3 months/i).length).toBeGreaterThan(0);

    // Skills
    expect(await screen.findByText("Testing")).toBeInTheDocument();
    expect(screen.getByText("React")).toBeInTheDocument();

    // Provider section
    expect(
      await screen.findByText(/About the Provider/i)
    ).toBeInTheDocument();

    expect(screen.getByText("Tech Academy")).toBeInTheDocument();

    expect(
      screen.getByText("Training Provider")
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Leading tech education provider/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText("Software Development")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Cybersecurity")
    ).toBeInTheDocument();

    // Website button/link
    const websiteLink = screen.getByRole("link", {
      name: /Visit Website/i,
    });

    expect(websiteLink).toHaveAttribute(
      "href",
      "https://example.com"
    );

    // Apply
    const applyButton = screen.getAllByRole("button", {
      name: /Apply Now/i,
    })[0];

    fireEvent.click(applyButton);

    await waitFor(() => {
      expect(mockApply).toHaveBeenCalledWith("op-1");
    });

    expect(
      await screen.findAllByText(/Applied ✓/i)
    ).toHaveLength(2);
  });

  test("shows applied state when already applied", async () => {
    mockFetchMyApplications.mockResolvedValue([
      {
        opportunities: {
          id: "op-1",
        },
      },
    ]);

    render(
      <MemoryRouter>
        <OpportunityDetail />
      </MemoryRouter>
    );

    expect(
      await screen.findAllByText(/Applied ✓/i)
    ).toHaveLength(2);
  });

  test("navigates back when back button is clicked", async () => {
    render(
      <MemoryRouter>
        <OpportunityDetail />
      </MemoryRouter>
    );

    const backButton = await screen.findByRole("button", {
      name: /Back to opportunities/i,
    });

    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith("/opportunities");
  });

  test("shows loading spinner initially", () => {
    render(
      <MemoryRouter>
        <OpportunityDetail />
      </MemoryRouter>
    );

    expect(
      screen.getByRole("status", { name: /loading/i })
    ).toBeInTheDocument();
  });
});