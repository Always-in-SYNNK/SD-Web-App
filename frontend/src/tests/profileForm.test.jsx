import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ProfileForm } from "../components/studentProfile/profileForm";

//render → mounts your component in a fake DOM
//screen → lets you query elements (like buttons, text
//fireEvent → simulate user actions (clicks)
//waitFor → wait for async stuff (API calls, state updates)
//MemoryRouter → fake router (needed because your component uses navigation)

//fake function used to track if navigation happens
const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => ({
  ...(await vi.importActual("react-router-dom")),
  useNavigate: () => mockNavigate,
}));

vi.mock("../context/useAuth", () => ({
  useAuth: () => ({ token: "mock-token" }),
}));

vi.mock("../components/studentProfile/personalInfo", () => ({
  PersonalInfoSection: () => <div>PersonalInfoSection</div>,
}));

vi.mock("../components/studentProfile/education", () => ({
  EducationSection: () => <div>EducationSection</div>,
}));

vi.mock("../components/studentProfile/skills", () => ({
  SkillsSection: () => <div>SkillsSection</div>,
}));

vi.mock("../components/studentProfile/connectivity", () => ({
  ConnectivitySection: () => <div>ConnectivitySection</div>,
}));

vi.mock("../components/studentProfile/cvUpload", () => ({
  CVUploadSection: () => <div>CVUploadSection</div>,
}));

//fake fetch function to mock API calls
global.fetch = vi.fn();

describe("ProfileForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        profile: {
          full_name: "Thabo",
          surname: "Mokoena",
          bio: "Developer",
          location: "Gauteng",
          nqf_level: 7,
        },
      }),
    });
  });

  const renderForm = () =>
    render(
      <MemoryRouter>
        <ProfileForm />
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
    expect(await screen.findByText("SkillsSection")).toBeInTheDocument();
    expect(await screen.findByText("ConnectivitySection")).toBeInTheDocument();
    expect(await screen.findByText("CVUploadSection")).toBeInTheDocument();
  });

  test("renders Complete Profile button", async () => {
    renderForm();
    expect(await screen.findByText("Complete Profile")).toBeInTheDocument();
  });

  test("renders Save & Exit button", async () => {
    renderForm();
    expect(await screen.findByText(/save & exit/i)).toBeInTheDocument();
  });

  test("Save & Exit navigates to dashboard", async () => {
    renderForm();
    fireEvent.click(await screen.findByText(/save & exit/i));
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
  });

  test("Complete Profile button calls POST /api/profile/me", async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ profile: { full_name: "Thabo", surname: "Mokoena", bio: "", location: "", nqf_level: "" } }),
      })
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) });

    renderForm();
    fireEvent.click(await screen.findByText("Complete Profile"));

    await waitFor(() => {
      const postCall = fetch.mock.calls.find((call) => call[1]?.method === "POST");
      expect(postCall).toBeDefined();
      expect(postCall[0]).toContain("/api/profile/me");
    });
  });

  test("navigates to dashboard after successful save", async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ profile: { full_name: "Thabo", surname: "Mokoena", bio: "", location: "", nqf_level: "" } }),
      })
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) });

    renderForm();
    fireEvent.click(await screen.findByText("Complete Profile"));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });
});