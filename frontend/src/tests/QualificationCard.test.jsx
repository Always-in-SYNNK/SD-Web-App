import { render, screen, fireEvent } from "@testing-library/react";

const navigateMock = vi.fn();
vi.mock("react-router-dom", async () => ({
  ...(await vi.importActual("react-router-dom")),
  useNavigate: () => navigateMock,
}));

import { QualificationCard } from "../components/qualifications/QualificationCard";

describe("QualificationCard", () => {
  test("renders fields and navigates on button click", () => {
    render(
      <QualificationCard
        qual_id={"qual-1"}
        title={"Diploma of Testing"}
        nqf_level={5}
        field={"Field 001"}
        originator={"Uni"}
        min_credits={120}
      />
    );

    expect(screen.getByText(/Diploma of Testing/)).toBeInTheDocument();
    expect(screen.getByText(/NQF Level 5/)).toBeInTheDocument();
    expect(screen.getByText(/120 credits/)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/View/));
    // navigation function should have been called
    expect(navigateMock).toHaveBeenCalled();
  });
});
