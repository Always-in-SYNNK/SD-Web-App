import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Sidebar from "../components/layout/Sidebar";
import { MemoryRouter } from "react-router-dom";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");

  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({
      pathname: "/pipeline",
      state: {},
    }),
  };
});

describe("Sidebar", () => {
  test("renders employer links", () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );

    expect(
      screen.getByText(/validation pipeline/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/analytics dashboard/i)
    ).toBeInTheDocument();
  });

  test("navigates on click", async () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );

    await userEvent.click(
      screen.getByText(/validation pipeline/i)
    );

    expect(mockNavigate).toHaveBeenCalled();
  });
});