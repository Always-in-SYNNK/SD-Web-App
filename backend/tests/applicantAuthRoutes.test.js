import { jest } from "@jest/globals";
import request from "supertest";
import express from "express";

const mockFrom = jest.fn();

jest.unstable_mockModule("../src/middleware/authMiddleware.js", () => ({
  default: (req, res, next) => {
    req.user = { id: "123" };
    next();
  },
}));

jest.unstable_mockModule("../src/config/supabaseClient.js", () => ({
  supabase: {
    from: mockFrom,
  },
}));

jest.unstable_mockModule("../src/controllers/authController.js", () => ({
  googleAuth: jest.fn(),
}));

const { default: router } = await import("../src/routes/applicantAuthRoutes.js");

const app = express();
app.use(express.json());
app.use("/api", router);

describe("/me route", () => {
  afterEach(() => {
    mockFrom.mockReset();
    jest.clearAllMocks();
  });

  test("returns user if found", async () => {
    mockFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          single: async () => ({
            data: { id: "123", email: "test@test.com" },
            error: null,
          }),
        }),
      }),
    });

    const res = await request(app).get("/api/me");

    expect(res.status).toBe(200);
    expect(res.body.user).toBeDefined();
  });

  test("returns 404 if user not found", async () => {
    mockFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          single: async () => ({
            data: null,
            error: true,
          }),
        }),
      }),
    });

    const res = await request(app).get("/api/me");

    expect(res.status).toBe(404);
  });
});