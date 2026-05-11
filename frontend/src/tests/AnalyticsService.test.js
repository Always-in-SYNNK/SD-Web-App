import { getApplicationVolume } from "../services/analyticsService";

global.fetch = vi.fn();

describe("analyticsService", () => {
  test("fetches analytics data", async () => {
    fetch.mockResolvedValue({
      ok: true,
      headers: {
        get: () => "application/json",
      },
      json: async () => ({
        success: true,
        data: [],
        totals: {},
      }),
    });

    const result = await getApplicationVolume();

    expect(result).toEqual({
      data: [],
      totals: {},
    });
  });
});