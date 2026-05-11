import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminAccessApplications from "../pages/AdminAccessApplications";
import { vi } from "vitest";

const mockGetAdminApplications = vi.fn();
const mockGrantAdminAccess = vi.fn();
const mockRejectAdminApplication = vi.fn();

const baseApplications = [
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
  {
    id: "4",
    status: "pending",
    created_at: "2025-01-04",
    profiles: {
      full_name: "Pat Pending",
      email: "pat@test.com",
      role: "provider",
    },
  },
  {
    id: "2",
    status: "approved",
    created_at: "2025-01-02",
    profiles: {
      full_name: "Jane Approved",
      email: "jane@test.com",
      role: "provider",
    },
  },
  {
    id: "3",
    status: "rejected",
    created_at: "2025-01-03",
    profiles: {
      full_name: "Rita Rejected",
      email: "rita@test.com",
      role: "provider",
    },
  },
];

vi.mock("../context/useAuth", () => ({
  useAuth: () => ({
    user: { isAdmin: true },
  }),
}));

vi.mock("../services/adminService", () => ({
  getAdminApplications: (...args) => mockGetAdminApplications(...args),
  grantAdminAccess: (...args) => mockGrantAdminAccess(...args),
  rejectAdminApplication: (...args) => mockRejectAdminApplication(...args),
}));

vi.mock("../components/layout/AdminTopbar", () => ({
  default: ({ source }) => <div>AdminTopbar {source}</div>,
}));

vi.mock("../components/layout/Sidebar", () => ({
  default: () => <div>EmployerSidebar</div>,
}));

vi.mock("../components/dashboard/Sidebar", () => ({
  Sidebar: () => <div>ApplicantSidebar</div>,
}));

describe("AdminAccessApplications", () => {
  beforeEach(() => {
    mockGetAdminApplications.mockReset();
    mockGrantAdminAccess.mockReset();
    mockRejectAdminApplication.mockReset();

    mockGetAdminApplications.mockImplementation(async () => baseApplications);
    mockGrantAdminAccess.mockImplementation(async () => ({}));
    mockRejectAdminApplication.mockImplementation(async () => ({}));
  });

  test("renders applications", async () => {
    render(
      <MemoryRouter>
        <AdminAccessApplications />
      </MemoryRouter>
    );

    expect(screen.getByText(/manage admin applications/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Jane Approved")).toBeInTheDocument();
      expect(screen.getByText("Rita Rejected")).toBeInTheDocument();
    });
  });

  test("renders provider sidebar when source is provider", async () => {
    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: "/admin-access",
            state: { source: "provider" },
          },
        ]}
      >
        <AdminAccessApplications />
      </MemoryRouter>
    );

    expect(screen.getByText(/admintopbar provider/i)).toBeInTheDocument();
    expect(screen.getByText("EmployerSidebar")).toBeInTheDocument();
  });

  test("filters rows by status", async () => {
    mockGetAdminApplications.mockResolvedValueOnce(baseApplications).mockResolvedValueOnce([
      baseApplications[1],
      baseApplications[2],
      baseApplications[3],
    ]);

    render(
      <MemoryRouter>
        <AdminAccessApplications />
      </MemoryRouter>
    );

    expect(await screen.findByText("John Doe")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /approved/i }));

    await waitFor(() => {
      expect(screen.getByText("Jane Approved")).toBeInTheDocument();
      expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /pending/i }));

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /rejected/i }));

    await waitFor(() => {
      expect(screen.getByText("Rita Rejected")).toBeInTheDocument();
    });
  });

  test("shows empty state when there are no applications", async () => {
    mockGetAdminApplications.mockResolvedValueOnce([]);

    render(
      <MemoryRouter>
        <AdminAccessApplications />
      </MemoryRouter>
    );

    expect(await screen.findByText(/No applications found/i)).toBeInTheDocument();
  });

  test("grant and reject buttons refresh the list", async () => {
    mockGetAdminApplications
      .mockResolvedValueOnce(baseApplications)
      .mockResolvedValueOnce([
        {
          ...baseApplications[0],
          status: "approved",
        },
        baseApplications[1],
        baseApplications[2],
        baseApplications[3],
      ])
      .mockResolvedValueOnce([
        {
          ...baseApplications[0],
          status: "approved",
        },
        baseApplications[1],
        baseApplications[2],
        baseApplications[3],
      ]);

    render(
      <MemoryRouter>
        <AdminAccessApplications />
      </MemoryRouter>
    );

    const johnName = await screen.findByText("John Doe");
    const johnRow = johnName.closest("tr");
    const grantButton = within(johnRow).getByRole("button", { name: "Grant" });
    fireEvent.click(grantButton);

    await waitFor(() => {
      expect(mockGrantAdminAccess).toHaveBeenCalledWith("1");
      expect(screen.getByText("Jane Approved")).toBeInTheDocument();
    });

    const patName = await screen.findByText("Pat Pending");
    const patRow = patName.closest("tr");
    const rejectButton = within(patRow).getByRole("button", { name: "Reject" });
    fireEvent.click(rejectButton);

    await waitFor(() => {
      expect(mockRejectAdminApplication).toHaveBeenCalledWith("4");
    });
  });
});