// frontend/src/tests/EditProviderProfileForm.test.jsx

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { EditProviderProfileForm } from "../components/employer/EditProviderProfileForm";

const mockNavigate = vi.fn();
const mockEditProviderProfile = vi.fn();

vi.mock("../context/useAuth", () => ({
  useAuth: () => ({
    user: {
      id: "provider-123",
      email: "provider@test.com",
    },
  }),
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("../services/providerProfileService", () => ({
  fetchProviderProfileByUserId: vi.fn(() =>
    Promise.resolve({
      full_name: "John Doe",
      provider_profiles: {
        organisation_name: "Tech Corp",
        organisation_type: "Private Company",
        description: "We build software",
        focus_fields: ["Services"],
        location: "Gauteng",
        website_url: "https://techcorp.com",
      },
    })
  ),

  editProviderProfile: (...args) =>
    mockEditProviderProfile(...args),
}));

describe("EditProviderProfileForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads existing provider profile data into the form", async () => {
    render(<EditProviderProfileForm />);

    expect(
      await screen.findByDisplayValue("John Doe")
    ).toBeInTheDocument();

    expect(
      screen.getByDisplayValue("Tech Corp")
    ).toBeInTheDocument();

    expect(
      screen.getByDisplayValue("https://techcorp.com")
    ).toBeInTheDocument();

    expect(
      screen.getByDisplayValue("We build software")
    ).toBeInTheDocument();

    expect(
      screen.getByText(/1 selected/i)
    ).toBeInTheDocument();
  });

  it("saves edited profile successfully", async () => {
    mockEditProviderProfile.mockResolvedValue({});

    render(<EditProviderProfileForm />);

    const organisationInput =
      await screen.findByDisplayValue("Tech Corp");

    fireEvent.change(organisationInput, {
      target: { value: "Updated Tech Corp" },
    });

    expect(organisationInput).toHaveValue("Updated Tech Corp");

    const saveButton = screen.getByRole("button", {
      name: /save changes/i,
    });

    fireEvent.click(saveButton);

    await waitFor(() => {
        expect(mockEditProviderProfile).toHaveBeenCalled();
        });

        const [userId, payload] =
        mockEditProviderProfile.mock.calls[0];

        expect(userId).toBe("provider-123");

        expect(payload.organisation_name).toBe(
        "Updated Tech Corp"
        );

    expect(
      await screen.findByText(/profile saved/i)
    ).toBeInTheDocument();
  });

  it("shows loading state initially", () => {
    render(<EditProviderProfileForm />);

    expect(
        screen.getByText(/loading your profile/i)
    ).toBeInTheDocument();
    });

    it("toggles focus fields on and off", async () => {
    render(<EditProviderProfileForm />);

    const fieldButton = (
    await screen.findAllByRole("button")
    ).find((button) =>
    button.textContent.includes("Services")
    );

    // initially selected from mocked data
    expect(fieldButton.textContent).toContain("✓");

    // remove
    fireEvent.click(fieldButton);

    await waitFor(() => {
      expect(fieldButton.textContent).not.toContain("✓");
    });

    // add back
    fireEvent.click(fieldButton);

    await waitFor(() => {
      expect(fieldButton.textContent).toContain("✓");
    });
    });

    it("navigates back when discard changes is clicked", async () => {
    render(<EditProviderProfileForm />);

    const discardButton = await screen.findByRole("button", {
        name: /discard changes/i,
    });

    await userEvent.click(discardButton);

    expect(mockNavigate).toHaveBeenCalledWith(
        "/provider/profile"
    );
    });

    it("shows error message when save fails", async () => {
    mockEditProviderProfile.mockRejectedValue(
        new Error("Failed to save")
    );

    render(<EditProviderProfileForm />);

    const saveButton = await screen.findByRole("button", {
        name: /save changes/i,
    });

    await userEvent.click(saveButton);

    expect(
        await screen.findByText(/failed to save/i)
    ).toBeInTheDocument();
    });

    it("shows missing profile completion fields", async () => {
        vi.resetModules();

        vi.doMock("../context/useAuth", () => ({
            useAuth: () => ({
            user: {
                id: "provider-123",
                email: "provider@test.com",
            },
            }),
        }));

        vi.doMock("react-router-dom", () => ({
            useNavigate: () => vi.fn(),
        }));

        vi.doMock("../services/providerProfileService", () => ({
            fetchProviderProfileByUserId: vi.fn(() =>
            Promise.resolve({
                full_name: "",
                provider_profiles: {
                organisation_name: "",
                organisation_type: "",
                description: "",
                focus_fields: [],
                location: "",
                website_url: "",
                },
            })
            ),
            editProviderProfile: vi.fn(),
        }));

        const { EditProviderProfileForm: FreshComponent } =
            await import(
            "../components/employer/EditProviderProfileForm"
            );

        render(<FreshComponent />);

        const missingSummary = await screen.findByText(/missing:/i);

        expect(missingSummary).toHaveTextContent(/full name/i);
        });
    });

    describe("EditProviderProfileForm error states", () => {
  it("shows error when profile fetch fails", async () => {
    vi.resetModules();

    vi.doMock("../context/useAuth", () => ({
      useAuth: () => ({
        user: {
          id: "provider-123",
          email: "provider@test.com",
        },
      }),
    }));

    vi.doMock("react-router-dom", () => ({
      useNavigate: () => vi.fn(),
    }));

    vi.doMock("../services/providerProfileService", () => ({
      fetchProviderProfileByUserId: vi.fn(() =>
        Promise.reject(new Error("Fetch failed"))
      ),
      editProviderProfile: vi.fn(),
    }));

    const { EditProviderProfileForm: FreshComponent } =
      await import(
        "../components/employer/EditProviderProfileForm"
      );

    render(<FreshComponent />);

    expect(
      await screen.findByText(
        /failed to load your profile/i
      )
    ).toBeInTheDocument();
  });
});
