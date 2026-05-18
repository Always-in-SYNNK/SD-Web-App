import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { OpportunityFilters } from "../components/opportunities/OpportunityFilters";

describe("OpportunityFilters", () => {
  const props = {
    location: "",
    nqfLevel: "",
    field: "",
    setLocation: vi.fn(),
    setNqfLevel: vi.fn(),
    setField: vi.fn(),
    onReset: vi.fn(),
    onViewMatch: vi.fn(),
    loading: false,
  };

  it("renders headings", () => {
    render(<OpportunityFilters {...props} />);

    expect(screen.getByText("Filters")).toBeInTheDocument();
    expect(screen.getByText("Premium Match")).toBeInTheDocument();
  });

  it("renders all select inputs", () => {
    render(<OpportunityFilters {...props} />);

    expect(screen.getByText("Province")).toBeInTheDocument();
    expect(screen.getByText("NQF Level")).toBeInTheDocument();
    expect(screen.getByText("Field")).toBeInTheDocument();
  });

  it("calls setLocation", () => {
    render(<OpportunityFilters {...props} />);

    const selects = screen.getAllByRole("combobox");

    fireEvent.change(selects[0], {
      target: { value: "Gauteng" },
    });

    expect(props.setLocation).toHaveBeenCalledWith("Gauteng");
  });

  it("calls setNqfLevel", () => {
    render(<OpportunityFilters {...props} />);

    const selects = screen.getAllByRole("combobox");

    fireEvent.change(selects[1], {
      target: { value: "5" },
    });

    expect(props.setNqfLevel).toHaveBeenCalledWith("5");
  });

  it("calls setField", () => {
    render(<OpportunityFilters {...props} />);

    const selects = screen.getAllByRole("combobox");

    fireEvent.change(selects[2], {
      target: {
        value: "Services",
      },
    });

    expect(props.setField).toHaveBeenCalled();
  });

  it("calls reset", () => {
    render(<OpportunityFilters {...props} />);

    fireEvent.click(screen.getByText("Reset"));

    expect(props.onReset).toHaveBeenCalled();
  });

  it("calls view match", () => {
    render(<OpportunityFilters {...props} />);

    fireEvent.click(screen.getByText("View Match"));

    expect(props.onViewMatch).toHaveBeenCalled();
  });

  it("disables controls when loading", () => {
    render(
      <OpportunityFilters
        {...props}
        loading={true}
      />
    );

    screen.getAllByRole("combobox").forEach((el) => {
      expect(el).toBeDisabled();
    });

    expect(
      screen.getByText("View Match")
    ).toBeDisabled();
  });
});