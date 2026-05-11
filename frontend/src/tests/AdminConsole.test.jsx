import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminConsole from "../pages/AdminConsole";

vi.mock("../components/layout/AdminTopbar", () => ({
  default: () => <div>AdminTopbar</div>,
}));

vi.mock("../components/layout/Sidebar", () => ({
  default: () => <div>EmployerSidebar</div>,
}));

vi.mock("../components/dashboard/Sidebar", () => ({
  Sidebar: () => <div>ApplicantSidebar</div>,
}));

vi.mock("../components/admin/StatsGrid", () => ({
  StatsGrid: () => <div>StatsGrid</div>,
}));

vi.mock("../components/admin/OpportunitiesTable", () => ({
  OpportunitiesTable: ({ mode }) => <div>{mode}</div>,
}));

describe("AdminConsole", () => {
  test("renders admin console", () => {
    render(
      <MemoryRouter>
        <AdminConsole />
      </MemoryRouter>
    );

    expect(screen.getByText(/manage opportunities/i)).toBeInTheDocument();
  });

  test("switches tabs", () => {
    render(
      <MemoryRouter>
        <AdminConsole />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText(/approved/i));

    expect(screen.getByText("approved")).toBeInTheDocument();
  });
});