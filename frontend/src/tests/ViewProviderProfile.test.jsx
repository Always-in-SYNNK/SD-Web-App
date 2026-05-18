import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import ViewProviderProfile from "../pages/ViewProviderProfile";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => ({
  ...(await vi.importActual("react-router-dom")),
  useNavigate: () => mockNavigate,
}));

vi.mock("../context/useAuth", () => ({
  useAuth: () => ({
    user: {
      id: "provider-1",
      email: "provider@test.com",
    },
  }),
}));

vi.mock("../services/providerProfileService", () => ({
  fetchProviderProfile: vi.fn().mockResolvedValue({
    full_name: "John Doe",
    email: "provider@test.com",
    provider_profiles: {
      organisation_name: "Growthstage",
      organisation_type: "Private Company",
      location: "Gauteng",
      website_url: "https://growthstage.co.za",
      description: "We provide opportunities for students.",
      focus_fields: ["Technology", "Engineering"],
    },
  }),
}));

vi.mock("../components/layout/Sidebar", () => ({
  default: () => <aside>Sidebar</aside>,
}));

vi.mock("../components/layout/Topbar", () => ({
  default: () => <header>Topbar</header>,
}));

describe("ViewProviderProfile", () => {
  test("renders provider profile information", async () => {
    render(
      <MemoryRouter>
        <ViewProviderProfile />
      </MemoryRouter>
    );

    expect(await screen.findByText(/Provider Profile/i)).toBeInTheDocument();

    expect(screen.getAllByText(/Private Company/i).length).toBeGreaterThan(0);

    expect(screen.getByText(/Gauteng/i)).toBeInTheDocument();

    expect(
      screen.getByText(/We provide opportunities for students/i)
    ).toBeInTheDocument();

    expect(screen.getByText(/Technology/i)).toBeInTheDocument();

    expect(screen.getByText(/Engineering/i)).toBeInTheDocument();

    expect(screen.getByText(/Profile completion/i)).toBeInTheDocument();

    expect(screen.getByText(/100%/i)).toBeInTheDocument();
  });

  test("shows empty focus fields state", async () => {
    const { fetchProviderProfile } = await vi.importMock(
      "../services/providerProfileService"
    );

    fetchProviderProfile.mockResolvedValueOnce({
      full_name: "John Doe",
      email: "provider@test.com",
      provider_profiles: {
        organisation_name: "Growthstage",
        organisation_type: "Private Company",
        focus_fields: [],
      },
    });

    render(
      <MemoryRouter>
        <ViewProviderProfile />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText(/No focus fields selected yet/i)
      ).toBeInTheDocument();
    });
  });
});