import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { EditProfileForm } from "./editProfileForm";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => ({
  ...(await vi.importActual("react-router-dom")),
  useNavigate: () => mockNavigate,
}));

vi.mock("../../context/useAuth", () => ({
  useAuth: () => ({ token: "mock-token" }),
}));

vi.mock("./personalInfo", () => ({
  PersonalInfoSection: () => <div>PersonalInfoSection</div>,
}));

vi.mock("./education", () => ({
  EducationSection: () => <div>EducationSection</div>,
}));

vi.mock("./qualifications", () => ({
  QualificationsSection: () => <div>QualificationsSection</div>,
}));

vi.mock("./skills", () => ({
  SkillsSection: () => <div>SkillsSection</div>,
}));

vi.mock("./connectivity", () => ({
  ConnectivitySection: () => <div>ConnectivitySection</div>,
}));

vi.mock("./cvUpload", () => ({
  CVUploadSection: () => <div>CVUploadSection</div>,
}));

global.fetch = vi.fn();

describe("EditProfileForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetch.mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({
        profile: {
          full_name: "Kirsten",
          surname: "Strydom",
          bio: "Developer",
          location: "Gauteng",
          nqf_level: 7,
          email: "kirsten@example.com",
        },
      }),
      json: async () => ({}),
    });
  });

  const renderForm = () =>
    render(
      <MemoryRouter>
        <EditProfileForm />
      </MemoryRouter>
    );

  test("shows loading state initially", () => {
    renderForm();
    expect(screen.getByText(/loading your profile/i)).toBeInTheDocument();
  });

  test("renders all sections after loading", async () => {
    renderForm();
    expect(await screen.findByText("PersonalInfoSection")).toBeInTheDocument();
    expect(await screen.findByText("EducationSection")).toBeInTheDocument();
    expect(await screen.findByText("QualificationsSection")).toBeInTheDocument();
    expect(await screen.findByText("SkillsSection")).toBeInTheDocument();
    expect(await screen.findByText("ConnectivitySection")).toBeInTheDocument();
    expect(await screen.findByText("CVUploadSection")).toBeInTheDocument();
  });

  test("renders Save Changes button", async () => {
    renderForm();
    expect(await screen.findByText("Save Changes")).toBeInTheDocument();
  });

  test("renders Discard Changes button", async () => {
    renderForm();
    expect(await screen.findByText(/discard changes/i)).toBeInTheDocument();
  });

  test("Discard Changes navigates to dashboard", async () => {
    renderForm();
    fireEvent.click(await screen.findByText(/discard changes/i));
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
  });

  test("Save Changes calls POST /api/profile/me", async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({
          profile: {
            full_name: "Kirsten",
            surname: "Strydom",
            bio: "Developer",
            location: "Gauteng",
            nqf_level: 7,
            email: "kirsten@example.com",
          },
        }),
        json: async () => ({}),
      })
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) });

    renderForm();
    fireEvent.click(await screen.findByText("Save Changes"));

    await waitFor(() => {
      const postCall = fetch.mock.calls.find((call) => call[1]?.method === "POST");
      expect(postCall).toBeDefined();
      expect(postCall[0]).toContain("/api/profile/me");
    });
  });

  test("shows success message after save", async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({
          profile: {
            full_name: "Kirsten",
            surname: "Strydom",
            bio: "Developer",
            location: "Gauteng",
            nqf_level: 7,
            email: "kirsten@example.com",
          },
        }),
        json: async () => ({}),
      })
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) });

    renderForm();
    fireEvent.click(await screen.findByText("Save Changes"));

    expect(await screen.findByText(/profile saved/i)).toBeInTheDocument();
  });

  test("shows error message on failed save", async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({
          profile: {
            full_name: "Kirsten",
            surname: "Strydom",
            bio: "",
            location: "",
            nqf_level: "",
            email: "kirsten@example.com",
          },
        }),
        json: async () => ({}),
      })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "Failed to save profile" }),
      });

    renderForm();
    fireEvent.click(await screen.findByText("Save Changes"));

    expect(await screen.findByText(/failed to save profile/i)).toBeInTheDocument();
  });

  test("navigates to dashboard after successful save", async () => {
  fetch
    .mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify({
        profile: {
          full_name: "Kirsten",
          surname: "Strydom",
          bio: "Developer",
          location: "Gauteng",
          nqf_level: 7,
          email: "kirsten@example.com",
        },
      }),
      json: async () => ({}),
    })
    .mockResolvedValueOnce({ ok: true, json: async () => ({}) });

  renderForm();
  fireEvent.click(await screen.findByText("Save Changes"));

  await waitFor(() => {
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
  }, { timeout: 3000 });
});
});