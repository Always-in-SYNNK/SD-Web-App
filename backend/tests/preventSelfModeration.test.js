import { jest } from "@jest/globals";

const mockFrom = jest.fn();

jest.unstable_mockModule("../src/config/supabaseClient.js", () => ({
  supabase: {
    from: mockFrom,
  },
}));

const {
  preventSelfModeration,
} = await import("../src/middleware/preventSelfModeration.js");

const mockRes = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

describe("preventSelfModeration", () => {
  afterEach(() => {
    jest.clearAllMocks();
    mockFrom.mockReset();
  });

  test("calls next when admin is not the provider", async () => {
    mockFrom
      // opportunities query
      .mockReturnValueOnce({
        select: () => ({
          eq: () => ({
            single: async () => ({
              data: { provider_id: "provider-1" },
              error: null,
            }),
          }),
        }),
      })

      // provider_profiles query
      .mockReturnValueOnce({
        select: () => ({
          eq: () => ({
            single: async () => ({
              data: { profile_id: "provider-user-id" },
              error: null,
            }),
          }),
        }),
      });

    const req = {
      params: { id: "opp-1" },
      user: { profileId: "admin-user-id" },
    };

    const res = mockRes();
    const next = jest.fn();

    await preventSelfModeration(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  test("returns 404 when opportunity does not exist", async () => {
    mockFrom.mockReturnValueOnce({
      select: () => ({
        eq: () => ({
          single: async () => ({
            data: null,
            error: new Error("Not found"),
          }),
        }),
      }),
    });

    const req = {
      params: { id: "opp-1" },
      user: { profileId: "admin-user-id" },
    };

    const res = mockRes();
    const next = jest.fn();

    await preventSelfModeration(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Opportunity not found",
    });

    expect(next).not.toHaveBeenCalled();
  });

  test("returns 404 when provider profile does not exist", async () => {
    mockFrom
      .mockReturnValueOnce({
        select: () => ({
          eq: () => ({
            single: async () => ({
              data: { provider_id: "provider-1" },
              error: null,
            }),
          }),
        }),
      })

      .mockReturnValueOnce({
        select: () => ({
          eq: () => ({
            single: async () => ({
              data: null,
              error: new Error("Not found"),
            }),
          }),
        }),
      });

    const req = {
      params: { id: "opp-1" },
      user: { profileId: "admin-user-id" },
    };

    const res = mockRes();
    const next = jest.fn();

    await preventSelfModeration(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Provider profile not found",
    });

    expect(next).not.toHaveBeenCalled();
  });

  test("returns 403 when admin tries to moderate own opportunity", async () => {
    mockFrom
      .mockReturnValueOnce({
        select: () => ({
          eq: () => ({
            single: async () => ({
              data: { provider_id: "provider-1" },
              error: null,
            }),
          }),
        }),
      })

      .mockReturnValueOnce({
        select: () => ({
          eq: () => ({
            single: async () => ({
              data: { profile_id: "same-user-id" },
              error: null,
            }),
          }),
        }),
      });

    const req = {
      params: { id: "opp-1" },
      user: { profileId: "same-user-id" },
    };

    const res = mockRes();
    const next = jest.fn();

    await preventSelfModeration(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "You cannot moderate your own opportunity",
    });

    expect(next).not.toHaveBeenCalled();
  });

  test("returns 500 on unexpected error", async () => {
    mockFrom.mockImplementationOnce(() => {
      throw new Error("Database exploded");
    });

    const req = {
      params: { id: "opp-1" },
      user: { profileId: "admin-user-id" },
    };

    const res = mockRes();
    const next = jest.fn();

    await preventSelfModeration(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Database exploded",
    });

    expect(next).not.toHaveBeenCalled();
  });
});