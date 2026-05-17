// frontend/src/tests/adminAnalyticsService.test.js
import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";

vi.stubGlobal("fetch", vi.fn());

describe("adminAnalyticsService", () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
    fetch.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("getAdminApplicationVolume returns analytics data successfully", async () => {
    localStorage.setItem("token", "fake-token");

    fetch.mockResolvedValue({
      ok: true,
      headers: {
        get: vi.fn().mockReturnValue("application/json"),
      },
      json: vi.fn().mockResolvedValue({
        success: true,
        data: [{ id: 1, count: 10 }],
        totals: {
          totalApplications: 10,
        },
      }),
    });

    const { getAdminApplicationVolume } = await import(
      "../services/adminAnalyticsService"
    );

    const result = await getAdminApplicationVolume();

    expect(fetch).toHaveBeenCalledWith(
      "/api/analytics/admin/applications",
      {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer fake-token",
        },
      }
    );

    expect(result).toEqual({
      data: [{ id: 1, count: 10 }],
      totals: {
        totalApplications: 10,
      },
    });
  });

  test("works without auth token", async () => {
    fetch.mockResolvedValue({
      ok: true,
      headers: {
        get: vi.fn().mockReturnValue("application/json"),
      },
      json: vi.fn().mockResolvedValue({
        success: true,
        data: [],
        totals: {},
      }),
    });

    const { getAdminApplicationVolume } = await import(
      "../services/adminAnalyticsService"
    );

    await getAdminApplicationVolume();

    expect(fetch).toHaveBeenCalledWith(
      "/api/analytics/admin/applications",
      {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  });

  test("throws error when response is not JSON", async () => {
    const consoleSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    fetch.mockResolvedValue({
      ok: false,
      headers: {
        get: vi.fn().mockReturnValue("text/html"),
      },
      text: vi.fn().mockResolvedValue("<html>Error</html>"),
    });

    const { getAdminApplicationVolume } = await import(
      "../services/adminAnalyticsService"
    );

    await expect(getAdminApplicationVolume()).rejects.toThrow(
      "Invalid response. Check if backend route exists: /api/analytics/admin/applications"
    );

    expect(consoleSpy).toHaveBeenCalled();
  });

  test("throws API error message when request fails", async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 401,
      headers: {
        get: vi.fn().mockReturnValue("application/json"),
      },
      json: vi.fn().mockResolvedValue({
        error: "Unauthorized",
      }),
    });

    const { getAdminApplicationVolume } = await import(
      "../services/adminAnalyticsService"
    );

    await expect(getAdminApplicationVolume()).rejects.toThrow(
      "Unauthorized"
    );
  });

  test("throws fallback error when API fails without message", async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 500,
      headers: {
        get: vi.fn().mockReturnValue("application/json"),
      },
      json: vi.fn().mockResolvedValue({}),
    });

    const { getAdminApplicationVolume } = await import(
      "../services/adminAnalyticsService"
    );

    await expect(getAdminApplicationVolume()).rejects.toThrow(
      "Request failed: 500"
    );
  });

  test("throws error when success is false", async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      headers: {
        get: vi.fn().mockReturnValue("application/json"),
      },
      json: vi.fn().mockResolvedValue({
        success: false,
        error: "Analytics failed",
      }),
    });

    const { getAdminApplicationVolume } = await import(
      "../services/adminAnalyticsService"
    );

    await expect(getAdminApplicationVolume()).rejects.toThrow(
      "Analytics failed"
    );
  });

  test("throws fallback error when success false has no message", async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      headers: {
        get: vi.fn().mockReturnValue("application/json"),
      },
      json: vi.fn().mockResolvedValue({
        success: false,
      }),
    });

    const { getAdminApplicationVolume } = await import(
      "../services/adminAnalyticsService"
    );

    await expect(getAdminApplicationVolume()).rejects.toThrow(
      "Request failed: 200"
    );
  });
});