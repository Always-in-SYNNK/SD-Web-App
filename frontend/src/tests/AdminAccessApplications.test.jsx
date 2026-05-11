import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminAccessApplications from "../pages/AdminAccessApplications";
import { vi } from "vitest";

vi.mock("../context/useAuth", () => ({
  useAuth: () => ({
    user: { isAdmin: true },
  }),
}));

vi.mock("../services/adminService", () => ({
  getAdminApplications: vi.fn(async () => [
    {
      id: "1",
      status: "pending",
      created_at: "2025-01-01",
      profiles: {
        full_name: "John Doe",
        email: "john@test.com",
        role: "provider",
      },
    },
  ]),
  grantAdminAccess: vi.fn(async () => ({})),
  rejectAdminApplication: vi.fn(async () => ({})),
}));

vi.mock("../components/layout/AdminTopbar", () => ({
  default: () => <div>AdminTopbar</div>,
}));

vi.mock("../components/layout/Sidebar", () => ({
  default: () => <div>EmployerSidebar</div>,
}));

vi.mock("../components/dashboard/Sidebar", () => ({
  Sidebar: () => <div>ApplicantSidebar</div>,
}));

describe("AdminAccessApplications", () => {
  test("renders applications", async () => {
    render(
      <MemoryRouter>
        <AdminAccessApplications />
      </MemoryRouter>
    );

    expect(screen.getByText(/manage admin applications/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });
  });

  test("grant button works", async () => {
    render(
      <MemoryRouter>
        <AdminAccessApplications />
      </MemoryRouter>
    );

    const button = await screen.findByText("Grant");

    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("Grant")).toBeInTheDocument();
    });
  });
});