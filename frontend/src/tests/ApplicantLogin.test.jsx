// frontend/src/tests/ApplicantLogin.test.jsx

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ApplicantLogin from "../pages/ApplicantLogin";

const mockNavigate = vi.fn();

let capturedProps = {};

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({
    state: {
      from: "/saved-jobs",
    },
  }),
}));

vi.mock("../components/auth/AuthLayout", () => ({
  default: ({ heroPanel, formPanel }) => (
    <div>
      <div>{heroPanel}</div>
      <div>{formPanel}</div>
    </div>
  ),
}));

vi.mock("../components/auth/AuthHeroPanel", () => ({
  default: ({ headline }) => <div>{headline}</div>,
}));

vi.mock("../components/auth/AuthFormPanel", () => ({
  default: ({ children, onBack }) => (
    <div>
      <button onClick={onBack}>Back</button>
      {children}
    </div>
  ),
}));

vi.mock("../components/auth/GoogleLoginButton", () => ({
  default: (props) => {
    capturedProps = props;

    return (
      <button
        onClick={() =>
          props.onSuccess({
            isNewUser: false,
            user: {
              role: "applicant",
            },
          })
        }
      >
        Google Login
      </button>
    );
  },
}));

describe("ApplicantLogin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders applicant login page content", () => {
    render(<ApplicantLogin />);

    expect(
      screen.getByText(/welcome back/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/build your future/i)
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /google login/i,
      })
    ).toBeInTheDocument();
  });

  it("navigates applicant to previous route after login", async () => {
    render(<ApplicantLogin />);

    const loginButton = screen.getByRole("button", {
      name: /google login/i,
    });

    await userEvent.click(loginButton);

    expect(mockNavigate).toHaveBeenCalledWith(
      "/saved-jobs"
    );
  });

  it("navigates new users to onboarding", async () => {
    // Trigger the mocked component callback directly to simulate new-user flow
    render(<ApplicantLogin />);

    await waitFor(() => expect(capturedProps.onSuccess).toBeDefined());

    // simulate new user
    capturedProps.onSuccess({ isNewUser: true });

    expect(mockNavigate).toHaveBeenCalledWith("/onboarding");
  });

  it("shows processing state when loading", async () => {
    render(<ApplicantLogin />);

    await waitFor(() => expect(capturedProps.onLoadingChange).toBeDefined());

    capturedProps.onLoadingChange(true);

    await waitFor(() => expect(screen.getByText(/processing/i)).toBeInTheDocument());
  });

  it("navigates home when back button is clicked", async () => {
    render(<ApplicantLogin />);

    const backButton = screen.getByRole("button", {
      name: /back/i,
    });

    await userEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});