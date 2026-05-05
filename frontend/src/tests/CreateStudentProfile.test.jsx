import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CompleteProfile from "../pages/CreateStudentProfile";

vi.mock("../components/dashboard/Sidebar", () => ({
  Sidebar: () => "Sidebar",
}));

vi.mock("../components/studentProfile/profileForm", () => ({
  ProfileForm: () => "ProfileForm",
}));

vi.mock("../context/useAuth", () => ({
  useAuth: () => ({ token: "mock-token", user: {}, login: vi.fn(), logout: vi.fn() }),
}));

vi.mock("@react-oauth/google", () => ({
  GoogleOAuthProvider: ({ children }) => children,
  GoogleLogin: () => "GoogleLogin",
  useGoogleLogin: () => vi.fn(),
}));

vi.mock("react-router-dom", async () => ({
  ...(await vi.importActual("react-router-dom")),
  useNavigate: () => vi.fn(),
  useLocation: () => ({ state: null, pathname: "/" }),
}));

describe("CreateStudentProfile Page", () => {
  const renderPage = () =>
    render(
      <MemoryRouter>
        <CompleteProfile />
      </MemoryRouter>
    );

  test("renders sidebar and profile form", () => {
    renderPage();
    expect(screen.getByText("Sidebar")).toBeInTheDocument();
    expect(screen.getByText("ProfileForm")).toBeInTheDocument();
  });

  test("renders main heading", () => {
    renderPage();
    expect(screen.getByText(/architect your future/i)).toBeInTheDocument();
  });

  test("renders progress indicator", () => {
    renderPage();
    expect(screen.getByText(/25%/)).toBeInTheDocument();
    expect(screen.getByText(/progress/i)).toBeInTheDocument();
  });
});