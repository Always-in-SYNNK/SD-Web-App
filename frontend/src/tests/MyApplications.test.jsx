import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { vi, describe, test, expect, beforeEach } from "vitest";

const { mockFetch, mockAccept, mockUnapply, mockNavigate } = vi.hoisted(() => ({
  mockFetch: vi.fn(),
  mockAccept: vi.fn(),
  mockUnapply: vi.fn(),
  mockNavigate: vi.fn(),
}));

vi.mock("../services/myApplicationService", () => ({
  fetchMyApplications: mockFetch,
  acceptOffer: mockAccept,
  unapplyFromApplication: mockUnapply,
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("../components/dashboard/Sidebar", () => ({
  Sidebar: () => null,
}));

vi.mock("../components/applications/RecommendedPanel", () => ({
  RecommendedPanel: () => null,
}));

const { default: MyApplications } = await import("../pages/MyApplications");

describe("MyApplications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // =========================
  // LOAD + RENDER
  // =========================
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
      expect(screen.getByText("Received")).toBeInTheDocument();
    });
  });

  // =========================
  // ERROR STATE
  // =========================
  test("shows error if fetch fails", async () => {
    mockFetch.mockRejectedValue(new Error("Failed"));

    render(<MyApplications />);

    await waitFor(() => {
      expect(screen.getByText(/failed/i)).toBeInTheDocument();
    });
  });

  // =========================
  // ACCEPT OFFER FLOW
  // =========================
  test("accepts an offered application", async () => {
    mockFetch.mockResolvedValue([
      {
        id: 1,
        status: "offered",
        created_at: new Date().toISOString(),
        opportunities: {
          title: "Graduate Role",
          location: "Cape Town",
          closing_date: new Date().toISOString(),
          provider_profiles: { organisation_name: "XYZ" },
        },
      },
    ]);

    render(<MyApplications />);

    const acceptBtn = await screen.findByText("Accept");

    fireEvent.click(acceptBtn);

    await waitFor(() => {
      expect(mockAccept).toHaveBeenCalledWith(1);
    });

    // UI should update to Accepted
    await waitFor(() => {
      expect(screen.getByText("Accepted")).toBeInTheDocument();
    });
  });

  // =========================
  // UNAPPLY FLOW
  // =========================
  test("unapplies from an application", async () => {
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

    const unapplyBtn = await screen.findByText("Unapply");

    fireEvent.click(unapplyBtn);

    await waitFor(() => {
      expect(mockUnapply).toHaveBeenCalledWith(1);
    });

    // Should be removed from UI
    await waitFor(() => {
      expect(screen.queryByText("Intern")).not.toBeInTheDocument();
    });
  });

  // =========================
  // STATUS MAPPING EDGE CASE
  // =========================
  test("maps unknown status to default", async () => {
    mockFetch.mockResolvedValue([
      {
        id: 1,
        status: "weird_status",
        created_at: new Date().toISOString(),
        opportunities: {
          title: "Mystery Job",
          location: "Nowhere",
          provider_profiles: {},
        },
      },
    ]);

    render(<MyApplications />);

    await waitFor(() => {
      expect(screen.getByText("Received")).toBeInTheDocument();
    });
  });

  // =========================
  // META FORMATTING
  // =========================
  test("shows offer closing meta when offered", async () => {
    mockFetch.mockResolvedValue([
      {
        id: 1,
        status: "offered",
        created_at: new Date().toISOString(),
        opportunities: {
          title: "Offer Job",
          location: "Durban",
          closing_date: new Date().toISOString(),
          provider_profiles: {},
        },
      },
    ]);

    render(<MyApplications />);

    await waitFor(() => {
      expect(screen.getByText(/offer closes/i)).toBeInTheDocument();
    });
  });
});