import {
  getLocations,
  getFields,
  getNqfLevels,
  getOpportunities,
} from "./api";

global.fetch = jest.fn();

describe("api.js", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("getLocations fetches locations endpoint", async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: ["Gauteng"] }),
    });

    const result = await getLocations();

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/opportunities/filters/locations")
    );
    expect(result).toEqual({ success: true, data: ["Gauteng"] });
  });

  test("getOpportunities includes query params", async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: [],
        summary: { opportunities: 0, qualifications: 0 },
        pagination: { page: 1, totalPages: 0, total: 0, limit: 12 },
      }),
    });

    await getOpportunities({
      field: "Information Technology",
      location: "Gauteng",
      nqfLevel: "6",
      search: "software",
      page: 1,
      limit: 12,
    });

    const calledUrl = fetch.mock.calls[0][0];

    expect(calledUrl).toContain("field=Information+Technology");
    expect(calledUrl).toContain("location=Gauteng");
    expect(calledUrl).toContain("nqfLevel=6");
    expect(calledUrl).toContain("search=software");
    expect(calledUrl).toContain("page=1");
    expect(calledUrl).toContain("limit=12");
  });

  test("throws backend message for non-ok response", async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      json: async () => ({ message: "Boom" }),
    });

    await expect(getFields()).rejects.toThrow("Boom");
  });
});
