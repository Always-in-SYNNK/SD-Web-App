import { render, screen } from "@testing-library/react";
import { describe, expect, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import EditProviderProfile from "../pages/EditProviderProfile";

vi.mock("../context/useAuth", () => ({
  useAuth: () => ({
    user: {
      id: "provider-1",
      email: "provider@test.com",
    },
  }),
}));

vi.mock("../components/layout/Sidebar", () => ({
  default: () => <aside>Sidebar</aside>,
}));

vi.mock("../components/layout/Topbar", () => ({
  default: () => <header>Topbar</header>,
}));

vi.mock("../components/employer/EditProviderProfileForm", () => ({
  EditProviderProfileForm: () => (
    <form>Edit Provider Profile Form</form>
  ),
}));

describe("EditProviderProfile", () => {
  test("renders edit provider profile page", () => {
    render(
      <MemoryRouter>
        <EditProviderProfile />
      </MemoryRouter>
    );

    expect(screen.getByText(/Edit Profile/i)).toBeInTheDocument();

    expect(
      screen.getByText(
        /Keep your organisation details up to date/i
      )
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Edit Provider Profile Form/i)
    ).toBeInTheDocument();
  });
});