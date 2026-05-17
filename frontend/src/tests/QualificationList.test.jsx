// frontend/src/tests/QualificationList.test.jsx
import { render, screen } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";

// Mock QualificationItem
vi.mock("../components/dashboard/QualificationItem", () => ({
  QualificationItem: ({
    icon,
    title,
    org,
    date,
    accent,
  }) => (
    <div data-testid="qualification-item">
      <span>{icon}</span>
      <span>{title}</span>
      <span>{org}</span>
      <span>{date}</span>
      <span>{accent ? "accented" : "normal"}</span>
    </div>
  ),
}));

const { QualificationList } = await import(
  "../components/dashboard/QualificationList"
);

describe("QualificationList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders portfolio heading", () => {
    render(<QualificationList qualifications={[]} />);

    expect(screen.getByText("Your Portfolio")).toBeInTheDocument();
  });

  test("renders empty state when no qualifications exist", () => {
    render(<QualificationList qualifications={[]} />);

    expect(
      screen.getByText("No qualifications added yet.")
    ).toBeInTheDocument();
  });

  test("renders qualification items", () => {
    const qualifications = [
      {
        id: 1,
        qualification_name: "Computer Science",
        originator: "Wits University",
        date_obtained: "2025",
        status: "completed",
      },
      {
        id: 2,
        title: "Business Management",
        originator: "UNISA",
        status: "in progress",
      },
    ];

    render(<QualificationList qualifications={qualifications} />);

    const items = screen.getAllByTestId("qualification-item");

    expect(items).toHaveLength(2);

    expect(screen.getByText("Computer Science")).toBeInTheDocument();
    expect(screen.getByText("Wits University")).toBeInTheDocument();
    expect(screen.getByText("2025")).toBeInTheDocument();

    expect(screen.getByText("Business Management")).toBeInTheDocument();
    expect(screen.getByText("UNISA")).toBeInTheDocument();
    expect(screen.getByText("in progress")).toBeInTheDocument();
  });

  test("passes accent=true when status is completed", () => {
    render(
      <QualificationList
        qualifications={[
          {
            id: 1,
            qualification_name: "IT",
            status: "completed",
          },
        ]}
      />
    );

    expect(screen.getByText("accented")).toBeInTheDocument();
  });

  test("passes accent=false when status is not completed", () => {
    render(
      <QualificationList
        qualifications={[
          {
            id: 1,
            qualification_name: "Marketing",
            status: "pending",
          },
        ]}
      />
    );

    expect(screen.getByText("normal")).toBeInTheDocument();
  });

  test("uses fallback empty strings for missing originator and date", () => {
    render(
      <QualificationList
        qualifications={[
          {
            id: 1,
            qualification_name: "Law",
          },
        ]}
      />
    );

    expect(screen.getByText("Law")).toBeInTheDocument();

    const items = screen.getAllByTestId("qualification-item");
    expect(items).toHaveLength(1);
  });
});