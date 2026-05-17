import { render, fireEvent, screen } from "@testing-library/react";
import { QualificationFilters } from "../components/qualifications/QualificationFilters";

describe("QualificationFilters", () => {
  test("calls setters and reset", () => {
    const setNqfLevel = vi.fn();
    const setField = vi.fn();
    const onReset = vi.fn();

    const { container } = render(
      <QualificationFilters
        nqfLevel=""
        field=""
        setNqfLevel={setNqfLevel}
        setField={setField}
        onReset={onReset}
        loading={false}
      />
    );

    const selects = container.querySelectorAll("select");
    expect(selects.length).toBeGreaterThanOrEqual(2);

    // change NQF select
    fireEvent.change(selects[0], { target: { value: "3" } });
    expect(setNqfLevel).toHaveBeenCalledWith("3");

    // change Field select
    fireEvent.change(selects[1], { target: { value: "Field 001 - Agriculture and Nature Conservation" } });
    expect(setField).toHaveBeenCalled();

    // reset button
    fireEvent.click(screen.getByText(/Reset/i));
    expect(onReset).toHaveBeenCalled();
  });
});
