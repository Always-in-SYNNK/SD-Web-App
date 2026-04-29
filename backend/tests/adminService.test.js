import { jest } from "@jest/globals";

const mockFrom = jest.fn();

jest.unstable_mockModule("../src/config/supabaseClient.js", () => ({
  supabase: {
    from: mockFrom,
  },
}));

const { getMyApplicationStatus, createApplication, fetchApplications, rejectApplication, approveApplication } = await import(
  "../src/services/adminService.js"
);

describe("adminService", () => {
  afterEach(() => {
    mockFrom.mockReset();
    jest.clearAllMocks();
  });

  describe("getMyApplicationStatus", () => {
    test("returns data successfully", async () => {
      mockFrom.mockReturnValue({
        select: () => ({
          eq: () => ({
            order: () => ({
              limit: () => ({
                maybeSingle: async () => ({ data: { status: "pending" }, error: null }),
              }),
            }),
          }),
        }),
      });

      const result = await getMyApplicationStatus("123");
      expect(result.status).toBe("pending");
    });

    test("returns null when no data found", async () => {
      mockFrom.mockReturnValue({
        select: () => ({
          eq: () => ({
            order: () => ({
              limit: () => ({
                maybeSingle: async () => ({ data: null, error: null }),
              }),
            }),
          }),
        }),
      });

      const result = await getMyApplicationStatus("123");
      expect(result).toBeNull();
    });

    test("throws error when query fails", async () => {
      mockFrom.mockReturnValue({
        select: () => ({
          eq: () => ({
            order: () => ({
              limit: () => ({
                maybeSingle: async () => {
                  throw new Error("Query failed");
                },
              }),
            }),
          }),
        }),
      });

      await expect(getMyApplicationStatus("123")).rejects.toThrow();
    });
  });

  describe("createApplication", () => {
    test("throws if application already exists", async () => {
      mockFrom.mockReturnValueOnce({
        select: () => ({
          eq: () => ({
            in: () => ({
              maybeSingle: async () => ({ data: { id: "exists" }, error: null }),
            }),
          }),
        }),
      });

      await expect(createApplication("123")).rejects.toThrow();
    });

    test("creates application successfully when not exists", async () => {
      mockFrom.mockReturnValueOnce({
        select: () => ({
          eq: () => ({
            in: () => ({
              maybeSingle: async () => ({ data: null, error: null }),
            }),
          }),
        }),
      });

      mockFrom.mockReturnValueOnce({
        insert: async () => ({ error: null }),
      });

      await expect(createApplication("123")).resolves.toBeUndefined();
    });

    test("throws when insert fails", async () => {
      mockFrom.mockReturnValueOnce({
        select: () => ({
          eq: () => ({
            in: () => ({
              maybeSingle: async () => ({ data: null, error: null }),
            }),
          }),
        }),
      });

      mockFrom.mockReturnValueOnce({
        insert: async () => {
          throw new Error("Insert failed");
        },
      });

      await expect(createApplication("123")).rejects.toThrow();
    });
  });

  describe("fetchApplications", () => {
    test("returns all applications", async () => {
      mockFrom.mockReturnValue({
        select: () => ({
          order: async () => ({
            data: [
              { id: "app1", status: "pending" },
              { id: "app2", status: "approved" },
            ],
            error: null,
          }),
        }),
      });

      const result = await fetchApplications();
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("app1");
    });

    test("returns empty array when no applications", async () => {
      mockFrom.mockReturnValue({
        select: () => ({
          order: async () => ({ data: [], error: null }),
        }),
      });

      const result = await fetchApplications();
      expect(result).toEqual([]);
    });

    test("throws when query fails", async () => {
      mockFrom.mockReturnValue({
        select: () => ({
          order: async () => {
            throw new Error("Query failed");
          },
        }),
      });

      await expect(fetchApplications()).rejects.toThrow();
    });
  });

  describe("approveApplication", () => {
    test("approves application successfully", async () => {
      mockFrom
        .mockReturnValueOnce({
          select: () => ({
            eq: () => ({
              single: async () => ({ data: { user_id: "user-1" }, error: null }),
            }),
          }),
        })
        .mockReturnValueOnce({
          update: () => ({
            eq: async () => ({ data: null, error: null }),
          }),
        })
        .mockReturnValueOnce({
          update: () => ({
            eq: async () => ({ data: null, error: null }),
          }),
        });

      await expect(approveApplication("app1")).resolves.toBeUndefined();
    });

    test("throws when approval fails", async () => {
      mockFrom.mockReturnValue({
        select: () => ({
          eq: () => ({
            single: async () => {
              throw new Error("Fetch failed");
            },
          }),
        }),
      });

      await expect(approveApplication("app1")).rejects.toThrow();
    });
  });

  describe("rejectApplication", () => {
    test("rejects application successfully", async () => {
      mockFrom.mockReturnValue({
        update: () => ({
          eq: async () => ({ data: null, error: null }),
        }),
      });

      await expect(rejectApplication("app1")).resolves.toBeUndefined();
    });

    test("throws when rejection fails", async () => {
      mockFrom.mockReturnValue({
        update: () => ({
          eq: async () => {
            throw new Error("Update failed");
          },
        }),
      });

      await expect(rejectApplication("app1")).rejects.toThrow();
    });
  });
});