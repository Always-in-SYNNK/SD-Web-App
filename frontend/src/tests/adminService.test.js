// frontend/src/tests/adminService.test.js

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("adminService", () => {
  let adminService;

  beforeEach(async () => {
    vi.resetModules();

    globalThis.fetch = vi.fn();

    Storage.prototype.getItem = vi.fn(() => "mock-token");

    adminService = await import("../services/adminService");
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("applyForAdmin", () => {
    it("should submit admin application", async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
      });

      await adminService.applyForAdmin();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/admin/apply"),
        expect.objectContaining({
          method: "POST",
          credentials: "include",
          headers: {
            Authorization: "Bearer mock-token",
          },
        })
      );
    });

    it("should throw parsed error message", async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: "Already applied",
        }),
      });

      await expect(
        adminService.applyForAdmin()
      ).rejects.toThrow("Already applied");
    });

    it("should throw fallback error if response parsing fails", async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => {
          throw new Error("Invalid JSON");
        },
      });

      await expect(
        adminService.applyForAdmin()
      ).rejects.toThrow("Failed to apply");
    });
  });

  describe("getMyAdminApplicationStatus", () => {
    it("should fetch current user application status", async () => {
      const mockData = {
        success: true,
        status: "pending",
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result =
        await adminService.getMyAdminApplicationStatus();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(
          "/api/admin/me/application-status"
        ),
        expect.objectContaining({
          credentials: "include",
          headers: {
            Authorization: "Bearer mock-token",
          },
        })
      );

      expect(result).toEqual(mockData);
    });

    it("should throw fetch status error", async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          message: "Unauthorized",
        }),
      });

      await expect(
        adminService.getMyAdminApplicationStatus()
      ).rejects.toThrow("Unauthorized");
    });
  });

  describe("getAdminApplications", () => {
    it("should fetch all admin applications", async () => {
      const mockApplications = {
        success: true,
        applications: [
          {
            id: 1,
            status: "pending",
          },
        ],
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockApplications,
      });

      const result =
        await adminService.getAdminApplications();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/admin/applications"),
        expect.objectContaining({
          credentials: "include",
          headers: {
            Authorization: "Bearer mock-token",
          },
        })
      );

      expect(result).toEqual(mockApplications);
    });

    it("should throw fallback fetch error", async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      });

      await expect(
        adminService.getAdminApplications()
      ).rejects.toThrow("Failed to fetch");
    });
  });

  describe("grantAdminAccess", () => {
    it("should approve admin application", async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
      });

      await adminService.grantAdminAccess(123);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/admin/123/approve"),
        expect.objectContaining({
          method: "PATCH",
          credentials: "include",
          headers: {
            Authorization: "Bearer mock-token",
          },
        })
      );
    });

    it("should throw approve error", async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: "Approval failed",
        }),
      });

      await expect(
        adminService.grantAdminAccess(1)
      ).rejects.toThrow("Approval failed");
    });
  });

  describe("rejectAdminApplication", () => {
    it("should reject admin application", async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
      });

      await adminService.rejectAdminApplication(456);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/admin/456/reject"),
        expect.objectContaining({
          method: "PATCH",
          credentials: "include",
          headers: {
            Authorization: "Bearer mock-token",
          },
        })
      );
    });

    it("should throw reject error", async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          message: "Rejection failed",
        }),
      });

      await expect(
        adminService.rejectAdminApplication(1)
      ).rejects.toThrow("Rejection failed");
    });
  });

  describe("auth header handling", () => {
    it("should omit authorization header if token does not exist", async () => {
      Storage.prototype.getItem = vi.fn(() => null);

      vi.resetModules();

      adminService = await import("../services/adminService");

      fetch.mockResolvedValueOnce({
        ok: true,
      });

      await adminService.applyForAdmin();

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: {},
        })
      );
    });
  });

  describe("getAdminStats", () => {
  it("should fetch admin opportunity stats", async () => {
    const mockStats = {
      success: true,
      data: {
        approved: 12,
        today: 4,
        pending: 7,
        rejected: 1,
      },
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats,
    });

    const result = await adminService.getAdminStats();

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/admin/admin-stats"),
      expect.objectContaining({
        credentials: "include",
        headers: {
          Authorization: "Bearer mock-token",
        },
      })
    );

    expect(result).toEqual(mockStats);
  });

  it("should throw parsed admin stats error", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: "Stats unavailable",
      }),
    });

    await expect(
      adminService.getAdminStats()
    ).rejects.toThrow("Stats unavailable");
  });

  it("should throw fallback admin stats error", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => {
        throw new Error("Invalid JSON");
      },
    });

    await expect(
      adminService.getAdminStats()
    ).rejects.toThrow(
      "Failed to fetch admin opportunity stats"
    );
  });
});
});