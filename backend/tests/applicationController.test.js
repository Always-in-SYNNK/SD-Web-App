import { jest } from "@jest/globals";

// mock service
const mockApply = jest.fn();

jest.unstable_mockModule("../src/services/applicationService.js", () => ({
  applyToOpportunity: mockApply,
}));

// import AFTER mock
const { apply } = await import("../src/controllers/applicationController.js");

function createMockRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
}

describe("applicationController", () => {
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
});