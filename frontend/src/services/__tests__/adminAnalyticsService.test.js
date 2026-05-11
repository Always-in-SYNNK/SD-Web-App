// frontend/src/services/__tests__/adminAnalyticsService.test.js

import { vi } from 'vitest';
import { getAdminApplicationVolume } from "../adminAnalyticsService";

global.fetch = vi.fn();

describe("adminAnalyticsService", () => {
    const mockToken = "mock-token";

    beforeEach(() => {
        vi.clearAllMocks();

        Storage.prototype.getItem = vi.fn(() => mockToken);
    });

    describe("getAdminApplicationVolume", () => {
        it("should fetch admin application analytics successfully", async () => {
            const mockResponse = {
                success: true,
                data: [
                    { date: "2026-05-01", count: 10 },
                    { date: "2026-05-02", count: 15 },
                ],
                totals: {
                    totalApplications: 25,
                },
            };

            fetch.mockResolvedValue({
                ok: true,
                headers: {
                    get: vi.fn(() => "application/json"),
                },
                json: vi.fn().mockResolvedValue(mockResponse),
            });

            const result = await getAdminApplicationVolume();

            expect(fetch).toHaveBeenCalledWith(
                "/api/analytics/admin/applications",
                {
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${mockToken}`,
                    },
                }
            );

            expect(result).toEqual({
                data: mockResponse.data,
                totals: mockResponse.totals,
            });
        });

        it("should throw an error if response is not JSON", async () => {
            fetch.mockResolvedValue({
                ok: true,
                headers: {
                    get: vi.fn(() => "text/html"),
                },
                text: vi.fn().mockResolvedValue("<html>Error page</html>"),
            });

            await expect(getAdminApplicationVolume()).rejects.toThrow(
                "Invalid response. Check if backend route exists: /api/analytics/admin/applications"
            );
        });

        it("should throw backend error message when request fails", async () => {
            fetch.mockResolvedValue({
                ok: false,
                headers: {
                    get: vi.fn(() => "application/json"),
                },
                json: vi.fn().mockResolvedValue({
                    error: "Unauthorized access",
                }),
            });

            await expect(getAdminApplicationVolume()).rejects.toThrow(
                "Unauthorized access"
            );
        });

        it("should throw generic error when success is false", async () => {
            fetch.mockResolvedValue({
                ok: true,
                headers: {
                    get: vi.fn(() => "application/json"),
                },
                json: vi.fn().mockResolvedValue({
                    success: false,
                    error: "Analytics fetch failed",
                }),
            });

            await expect(getAdminApplicationVolume()).rejects.toThrow(
                "Analytics fetch failed"
            );
        });

        it("should work without auth token", async () => {
            Storage.prototype.getItem = vi.fn(() => null);

            fetch.mockResolvedValue({
                ok: true,
                headers: {
                    get: vi.fn(() => "application/json"),
                },
                json: vi.fn().mockResolvedValue({
                    success: true,
                    data: [],
                    totals: {},
                }),
            });

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
    });
});