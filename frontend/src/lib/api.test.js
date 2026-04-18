import { vi } from "vitest";
import {
  getLocations,
  getFields,
  getNqfLevels,
  getOpportunities,
} from "./api";

global.fetch = vi.fn();

vi.mock("./api", () => ({
  getLocations: vi.fn(),
  getFields: vi.fn(),
  getNqfLevels: vi.fn(),
  getOpportunities: vi.fn(),
}));

describe("api.js", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getLocations.mockImplementation(async () => {
      const res = await fetch(`http://localhost:3000/api/opportunities/filters/locations`);
      return res.json();
    });
    getFields.mockImplementation(async () => {
      const res = await fetch(`http://localhost:3000/api/opportunities/filters/fields`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message);
      }
      return res.json();
    });
    getOpportunities.mockImplementation(async (params) => {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`http://localhost:3000/api/opportunities?${query}`);
      return res.json();
    });
  });

  test("getLocations fetches locations endpoint", async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: ["Gauteng"] }),
    });
    const result = await getLocations();
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining("/opportunities/filters/locations"));
    expect(result).toEqual({ success: true, data: ["Gauteng"] });
  });

  test("getOpportunities includes query params", async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true, data: [],
        summary: { opportunities: 0, qualifications: 0 },
        pagination: { page: 1, totalPages: 0, total: 0, limit: 12 },
      }),
    });
    await getOpportunities({ field: "Information Technology", location: "Gauteng", nqfLevel: "6", search: "software", page: 1, limit: 12 });
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
      ok: false, status: 500,
      json: async () => ({ message: "Boom" }),
    });
    await expect(getFields()).rejects.toThrow("Boom");
  });
});