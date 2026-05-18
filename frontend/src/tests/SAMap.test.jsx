import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, test, expect, beforeEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import SAMap from "../components/home/SAMap";

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("SAMap Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderMap = () => {
    return render(
      <BrowserRouter>
        <SAMap />
      </BrowserRouter>
    );
  };

  test("renders map section with title", () => {
    renderMap();
    // Use getByRole so the matcher works against the full accessible name,
    // which combines text across child elements (e.g. the <strong> tag).
    expect(
      screen.getByRole("heading", { name: /Opportunities Across South Africa/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/Hover over any province/)).toBeInTheDocument();
  });

  test("renders total opportunities banner", () => {
    renderMap();
    expect(screen.getByText("Total Opportunities")).toBeInTheDocument();
    expect(screen.getByText("across all 9 provinces")).toBeInTheDocument();
  });

  test("renders all 9 provinces in the list", () => {
    renderMap();
    expect(screen.getByText("Gauteng")).toBeInTheDocument();
    expect(screen.getByText("Western Cape")).toBeInTheDocument();
    expect(screen.getByText("KwaZulu-Natal")).toBeInTheDocument();
    expect(screen.getByText("Eastern Cape")).toBeInTheDocument();
    expect(screen.getByText("Mpumalanga")).toBeInTheDocument();
    expect(screen.getByText("Limpopo")).toBeInTheDocument();
    expect(screen.getByText("North West")).toBeInTheDocument();
    expect(screen.getByText("Free State")).toBeInTheDocument();
    expect(screen.getByText("Northern Cape")).toBeInTheDocument();
  });

  test("province list items are clickable", () => {
    renderMap();
    const gautengButton = screen.getByText("Gauteng").closest("button");
    if (gautengButton) {
      fireEvent.click(gautengButton);
      expect(mockNavigate).toHaveBeenCalledWith("/opportunities");
    }
  });

  test("renders Browse All Opportunities button", () => {
    renderMap();
    const browseButton = screen.getByText("Browse All Opportunities →");
    expect(browseButton).toBeInTheDocument();

    fireEvent.click(browseButton);
    expect(mockNavigate).toHaveBeenCalledWith("/opportunities");
  });

  test("renders SVG map", () => {
    renderMap();
    const svgElement = document.querySelector("svg");
    expect(svgElement).toBeInTheDocument();
  });

  test("displays opportunity counts for each province", () => {
    renderMap();
    expect(screen.getByText("186")).toBeInTheDocument(); // Gauteng
    expect(screen.getByText("67")).toBeInTheDocument();  // Western Cape
    expect(screen.getByText("78")).toBeInTheDocument();  // KZN
    expect(screen.getByText("61")).toBeInTheDocument();  // Eastern Cape
    expect(screen.getByText("38")).toBeInTheDocument();  // Mpumalanga
    expect(screen.getByText("42")).toBeInTheDocument();  // Limpopo
    expect(screen.getByText("35")).toBeInTheDocument();  // North West
    expect(screen.getByText("54")).toBeInTheDocument();  // Free State
    expect(screen.getByText("28")).toBeInTheDocument();  // Northern Cape
  });
});
