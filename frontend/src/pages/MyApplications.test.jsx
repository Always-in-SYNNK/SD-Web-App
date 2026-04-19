import { render, screen, waitFor } from "@testing-library/react";
import { jest, describe, test, expect, beforeEach } from "@jest/globals";

const mockFetch = jest.fn();
const mockAccept = jest.fn();
const mockUnapply = jest.fn();
const mockNavigate = jest.fn();

jest.unstable_mockModule("../services/applicationService", () => ({
  fetchMyApplications: () => mockFetch(),
  acceptOffer: (...args) => mockAccept(...args),
  unapplyFromApplication: (...args) => mockUnapply(...args),
}));

jest.unstable_mockModule("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

jest.unstable_mockModule("../components/dashboard/Sidebar", () => ({
  Sidebar: () => null,
}));

jest.unstable_mockModule("../components/applications/RecommendedPanel", () => ({
  RecommendedPanel: () => null,
}));

const { default: MyApplications } = await import("./MyApplications");

describe("MyApplications", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("loads and displays applications", async () => {
    mockFetch.mockResolvedValue([
      {
        id: 1,
        status: "received",
        created_at: new Date().toISOString(),
        opportunities: {
          title: "Intern",
          location: "Joburg",
          provider_profiles: { organisation_name: "ABC" },
        },
      },
    ]);

    render(<MyApplications />);

    await waitFor(() => {
      expect(screen.getByText("Intern")).toBeInTheDocument();
    });
  });

  test("shows error if fetch fails", async () => {
    mockFetch.mockRejectedValue(new Error("Failed"));

    render(<MyApplications />);

    await waitFor(() => {
      expect(screen.getByText(/failed/i)).toBeInTheDocument();
    });
  });
});