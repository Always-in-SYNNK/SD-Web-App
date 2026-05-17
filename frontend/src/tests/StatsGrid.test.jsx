// src/tests/StatsGrid.test.jsx

import { render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { StatsGrid } from "../components/admin/StatsGrid";
import { getAdminStats } from "../services/adminService";

vi.mock("../services/adminService", () => ({
  getAdminStats: vi.fn(),
}));

describe("StatsGrid", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all stat labels", async () => {
    getAdminStats.mockResolvedValue({
      data: {
        approved: 15,
        today: 3,
        pending: 8,
        rejected: 2,
      },
    });

    render(<StatsGrid />);

    expect(screen.getByText("New Today")).toBeInTheDocument();
    expect(screen.getByText("Pending Review")).toBeInTheDocument();
    expect(screen.getByText("Approved")).toBeInTheDocument();
    expect(screen.getByText("Rejected")).toBeInTheDocument();
  });

  it("renders live stat values from the API", async () => {
    getAdminStats.mockResolvedValue({
      data: {
        approved: 15,
        today: 3,
        pending: 8,
        rejected: 2,
      },
    });

    render(<StatsGrid />);

    await waitFor(() => {
      expect(screen.getByText("3")).toBeInTheDocument();
      expect(screen.getByText("8")).toBeInTheDocument();
      expect(screen.getByText("15")).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument();
    });
  });

  it("renders four stat cards", async () => {
    getAdminStats.mockResolvedValue({
      data: {
        approved: 10,
        today: 1,
        pending: 4,
        rejected: 0,
      },
    });

    const { container } = render(<StatsGrid />);

    await waitFor(() => {
      const cards = container.querySelectorAll("article");
      expect(cards.length).toBe(4);
    });
  });

  it("renders default values when API response is empty", async () => {
    getAdminStats.mockResolvedValue({});

    render(<StatsGrid />);

    await waitFor(() => {
      const zeros = screen.getAllByText("0");
      expect(zeros.length).toBeGreaterThan(0);
    });
  });

  it("handles API failure gracefully", async () => {
    const consoleSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    getAdminStats.mockRejectedValue(new Error("API failed"));

    render(<StatsGrid />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to load stats:",
        expect.any(Error)
      );
    });

    consoleSpy.mockRestore();
  });
});