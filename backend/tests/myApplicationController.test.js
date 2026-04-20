import { jest } from "@jest/globals";

// mock service
const mockApply = jest.fn();

jest.unstable_mockModule("../src/services/myApplicationService.js", () => ({
  applyToOpportunity: mockApply,
  getApplicationsForUser: mockApply,
  deleteApplicationForUser: mockApply,
  acceptOffer: mockApply,
}));

// import AFTER mock
const { 
    apply,
    getMyApplications,
    unapply,
    accept
} = await import("../src/controllers/myApplicationController.js");

function createMockRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
}

describe("myApplicationController", () => {

    // apply ============================================
    test("should return 201 on success", async () => {
        const req = {
            user: { id: "user-123" },
            body: { opportunityId: "opp-456" },
        };

        const res = createMockRes();
        const next = jest.fn();

        mockApply.mockResolvedValue({ success: true });

        await apply(req, res, next);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            data: { success: true },
        });
    });

    test("should return 400 if user already applied", async () => {
        const req = {
            user: { id: "user-123" },
            body: { opportunityId: "opp-456" },
        };

        const res = createMockRes();
        const next = jest.fn();

        mockApply.mockRejectedValue(
            new Error("Already applied to this opportunity")
        );

        await apply(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: "Already applied to this opportunity",
        });
    });

        test("should return 500 for generic errors", async () => {
        const req = {
            user: { id: "user-123" },
            body: { opportunityId: "opp-456" },
        };

        const res = createMockRes();
        const next = jest.fn();

        mockApply.mockRejectedValue(new Error("Something failed"));

        await apply(req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: "Something failed",
        });
    });

    // getMyApplications ===================================
    test("should return applications", async () => {
    const req = { user: { id: "user-123" } };
    const res = createMockRes();

    mockApply.mockResolvedValue([{ id: 1 }]);

    await getMyApplications(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: [{ id: 1 }],
    });
  });

  // unapply=================================================

  test("should delete application", async () => {
    const req = { user: { id: "user-123" }, params: { id: "app-1" } };
    const res = createMockRes();

    mockApply.mockResolvedValue();

    await unapply(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("should return 404 if not found", async () => {
    const req = { user: { id: "user-123" }, params: { id: "app-1" } };
    const res = createMockRes();

    mockApply.mockRejectedValue(
      new Error("Application not found")
    );

    await unapply(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  // accept========================================

  test("should accept offer", async () => {
    const req = { user: { id: "user-123" }, body: { applicationId: "app-1" } };
    const res = createMockRes();

    mockApply.mockResolvedValue({ status: "accepted" });

    await accept(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("should return 400 if not offered", async () => {
    const req = { user: { id: "user-123" }, body: { applicationId: "app-1" } };
    const res = createMockRes();

    mockApply.mockRejectedValue(
      new Error("Only offered applications can be accepted")
    );

    await accept(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});