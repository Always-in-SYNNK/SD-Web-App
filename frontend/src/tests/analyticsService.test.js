// frontend/src/tests/analyticsService.test.js

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("analyticsService", () => {
  let analyticsService;

  beforeEach(async () => {
    vi.resetModules();

    globalThis.fetch = vi.fn();

    Storage.prototype.getItem = vi.fn(() => "mock-token");

    analyticsService = await import("../services/analyticsService");
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("getApplicationVolume", () => {
    it("should fetch application volume data", async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        headers: {
          get: () => "application/json",
        },
        json: async () => ({
          success: true,
          data: [{ month: "Jan", applications: 10 }],
          totals: { total: 10 },
        }),
      });

      const result = await analyticsService.getApplicationVolume();

      expect(fetch).toHaveBeenCalledWith(
        "/api/analytics/applications",
        expect.objectContaining({
          credentials: "include",
          headers: expect.objectContaining({
            Authorization: "Bearer mock-token",
          }),
        })
      );

      expect(result).toEqual({
        data: [{ month: "Jan", applications: 10 }],
        totals: { total: 10 },
      });
    });
  });

  describe("getApplicationTrends", () => {
    it("should fetch trend data", async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        headers: {
          get: () => "application/json",
        },
        json: async () => ({
          success: true,
          data: [{ date: "2026-01-01", value: 5 }],
        }),
      });

      const result = await analyticsService.getApplicationTrends();

      expect(result).toEqual([
        { date: "2026-01-01", value: 5 },
      ]);
    });
  });

  describe("getPlacementRates", () => {
    it("should transform placement analytics correctly", async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        headers: {
          get: () => "application/json",
        },
        json: async () => ({
          success: true,
          data: [
            {
              sector: "IT",
              total_applications: "20",
              accepted_applications: "5",
              placement_rate: "25",
            },
          ],
        }),
      });

      const result = await analyticsService.getPlacementRates();

      expect(result).toEqual({
        raw: [
          {
            sector: "IT",
            totalApplications: 20,
            acceptedApplications: 5,
            placementRate: 25,
          },
        ],
        chartData: [
          {
            sector: "IT",
            totalApplications: 20,
            acceptedApplications: 5,
            placementRate: 25,
          },
        ],
        totals: {
          totalApplications: 20,
          totalAccepted: 5,
        },
      });
    });

    it("should handle missing fields with defaults", async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        headers: {
          get: () => "application/json",
        },
        json: async () => ({
          success: true,
          data: [{}],
        }),
      });

      const result = await analyticsService.getPlacementRates();

      expect(result.raw[0]).toEqual({
        sector: "Unknown",
        totalApplications: 0,
        acceptedApplications: 0,
        placementRate: 0,
      });
    });
  });

  describe("getProviderPlacementRates", () => {
    it("should transform provider placement data", async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        headers: {
          get: () => "application/json",
        },
        json: async () => ({
          success: true,
          data: [
            {
              sector: "Healthcare",
              totalApplications: 30,
              acceptedApplications: 6,
              placementRate: 20,
            },
          ],
        }),
      });

      const result =
        await analyticsService.getProviderPlacementRates();

      expect(result).toEqual([
        {
          sector: "Healthcare",
          totalApplications: 30,
          acceptedApplications: 6,
          placementRate: 20,
        },
      ]);
    });
  });

  describe("getExportData", () => {
    it("should return export data", async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        headers: {
          get: () => "application/json",
        },
        json: async () => ({
          success: true,
          data: [
            {
              sector: "IT",
              applications: 100,
            },
          ],
        }),
      });

      const result = await analyticsService.getExportData();

      expect(result).toEqual([
        {
          sector: "IT",
          applications: 100,
        },
      ]);
    });

    it("should return empty array if no data exists", async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        headers: {
          get: () => "application/json",
        },
        json: async () => ({
          success: true,
        }),
      });

      const result = await analyticsService.getExportData();

      expect(result).toEqual([]);
    });
  });

  describe("error handling", () => {
    it("should throw error for non-json response", async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        headers: {
          get: () => "text/html",
        },
      });

      await expect(
        analyticsService.getApplicationVolume()
      ).rejects.toThrow(
        "Invalid response from server. Expected JSON but got text/html"
      );
    });

    it("should throw API error message", async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        headers: {
          get: () => "application/json",
        },
        json: async () => ({
          success: false,
          error: "Unauthorized",
        }),
      });

      await expect(
        analyticsService.getApplicationVolume()
      ).rejects.toThrow("Unauthorized");
    });

    it("should throw fallback request error", async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        headers: {
          get: () => "application/json",
        },
        json: async () => ({
          success: false,
        }),
      });

      await expect(
        analyticsService.getApplicationVolume()
      ).rejects.toThrow("Request failed: 500");
    });
  });
});