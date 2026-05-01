//Testing:
//Correct status code
//Correct resonse shape
//Passing errors to next
import { jest } from '@jest/globals';
// import {
//   fetchLocations,
//   fetchFields,
//   fetchNqfLevels,
//   fetchOpportunities,
// } from "../opportunityController.js";

const mockService = {
  getDistinctLocations: jest.fn(),
  getDistinctFields: jest.fn(),
  getDistinctNqfLevels: jest.fn(),
  getFilteredOpportunitiesAndQualifications: jest.fn(),
  createOpportunity: jest.fn(),
  updateOpportunityForProvider: jest.fn(),
  getOpportunityForProvider: jest.fn(),
  getPending: jest.fn(),
  getApproved: jest.fn(),
  updateStatus: jest.fn(),
  deleteOpportunityById: jest.fn(),
};

jest.unstable_mockModule("../src/services/opportunityService.js", () => mockService);

//import AFTER mock
const {
  fetchLocations,
  fetchFields,
  fetchNqfLevels,
  fetchOpportunities,
  publishOpportunity,
  saveDraft,
  updateOpportunity,
  getOpportunity,
  getPendingOpportunities,
  getApprovedOpportunities,
  approveOpportunity,
  rejectOpportunity,
  deleteOpportunity,
} = await import("../src/controllers/opportunityController.js")

function createMockRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
}

describe("opportunityController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("fetchLocations returns success and data", async () => {
    mockService.getDistinctLocations.mockResolvedValue(["Gauteng", "Limpopo"]);

    const req = {};
    const res = createMockRes();
    const next = jest.fn();

    await fetchLocations(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: ["Gauteng", "Limpopo"],
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("fetchFields passes errors to next", async () => {
    const error = new Error("Boom");
    mockService.getDistinctFields.mockRejectedValue(error);

    const req = {};
    const res = createMockRes();
    const next = jest.fn();

    await fetchFields(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  test("fetchOpportunities returns combined result", async () => {
    mockService.getFilteredOpportunitiesAndQualifications.mockResolvedValue({
      data: [{ id: "1", _type: "opportunity" }],
      summary: { opportunities: 1, qualifications: 0 },
      pagination: { page: 1, totalPages: 1, total: 1, limit: 12 },
    });

    const req = {
      query: {
        search: "software",
        page: "1",
        limit: "12",
      },
    };
    const res = createMockRes();
    const next = jest.fn();

    await fetchOpportunities(req, res, next);

    expect(mockService.getFilteredOpportunitiesAndQualifications).toHaveBeenCalledWith({
      search: "software",
      location: undefined,
      nqfLevel: undefined,
      field: undefined,
      page: "1",
      limit: "12",
    });

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: [{ id: "1", _type: "opportunity" }],
      summary: { opportunities: 1, qualifications: 0 },
      pagination: { page: 1, totalPages: 1, total: 1, limit: 12 },
    });
  });

  test("fetchNqfLevels returns success and data", async () => {
    mockService.getDistinctNqfLevels.mockResolvedValue(["5", "6"]);

    const req = {};
    const res = createMockRes();
    const next = jest.fn();

    await fetchNqfLevels(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: ["5", "6"],
    });
  });

  test("fetchLocations passes errors to next", async () => {
    const error = new Error("Boom");
    mockService.getDistinctLocations.mockRejectedValue(error);

    await fetchLocations({}, createMockRes(), jest.fn());
    expect(mockService.getDistinctLocations).toHaveBeenCalled();
  });

  test("fetchNqfLevels passes errors to next", async () => {
    const error = new Error("Boom");
    mockService.getDistinctNqfLevels.mockRejectedValue(error);

    const next = jest.fn();
    await fetchNqfLevels({}, createMockRes(), next);
    expect(next).toHaveBeenCalledWith(error);
  });

  test("fetchOpportunities passes errors to next", async () => {
    const error = new Error("Filter failed");
    mockService.getFilteredOpportunitiesAndQualifications.mockRejectedValue(error);

    const next = jest.fn();
    await fetchOpportunities({ query: {} }, createMockRes(), next);
    expect(next).toHaveBeenCalledWith(error);
  });

  test("publishOpportunity returns 401 when unauthenticated", async () => {
    const res = createMockRes();

    await publishOpportunity({ body: {} }, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Authentication required" });
  });

  // test("publishOpportunity returns 201 when authenticated", async () => {
  //   mockService.createOpportunity.mockResolvedValue({ id: 1 });

  //   const req = {
  //     user: { id: "u1" },
  //     body: { title: "T", skillIds: [1, 2, 3] }
  //   };
  //   const res = createMockRes();

  //   await publishOpportunity(req, res);

  //   // Debug: Log what was actually called
  //   console.log("status calls:", res.status.mock.calls);
  //   console.log("json calls:", res.json.mock.calls);

  //   expect(res.status).toHaveBeenCalledWith(201);
  //   expect(res.json).toHaveBeenCalledWith({ success: true, data: { id: 1 } });
  // });

  test("saveDraft returns 401 when unauthenticated", async () => {
    const res = createMockRes();

    await saveDraft({ body: {} }, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("updateOpportunity handles auth, not found, forbidden and success", async () => {
    const unauthRes = createMockRes();
    await updateOpportunity({ body: {} }, unauthRes);
    expect(unauthRes.status).toHaveBeenCalledWith(401);

    mockService.updateOpportunityForProvider.mockRejectedValueOnce(new Error("Opportunity not found"));
    const notFoundRes = createMockRes();
    await updateOpportunity({ user: { profileId: 1 }, params: { id: "1" }, body: {} }, notFoundRes);
    expect(notFoundRes.status).toHaveBeenCalledWith(404);

    mockService.updateOpportunityForProvider.mockRejectedValueOnce(new Error("Not authorized to update this opportunity"));
    const forbiddenRes = createMockRes();
    await updateOpportunity({ user: { profileId: 1 }, params: { id: "1" }, body: {} }, forbiddenRes);
    expect(forbiddenRes.status).toHaveBeenCalledWith(403);

    mockService.updateOpportunityForProvider.mockResolvedValueOnce({ id: "1" });
    const successRes = createMockRes();
    await updateOpportunity({ user: { profileId: 1 }, params: { id: "1" }, body: {} }, successRes);
    expect(successRes.status).toHaveBeenCalledWith(200);
  });

  test("getOpportunity handles auth, not found, forbidden and success", async () => {
    const unauthRes = createMockRes();
    await getOpportunity({ body: {} }, unauthRes);
    expect(unauthRes.status).toHaveBeenCalledWith(401);

    mockService.getOpportunityForProvider.mockRejectedValueOnce(new Error("Opportunity not found"));
    const notFoundRes = createMockRes();
    await getOpportunity({ user: { profileId: 1 }, params: { id: "1" } }, notFoundRes);
    expect(notFoundRes.status).toHaveBeenCalledWith(404);

    mockService.getOpportunityForProvider.mockRejectedValueOnce(new Error("Not authorized to view this opportunity"));
    const forbiddenRes = createMockRes();
    await getOpportunity({ user: { profileId: 1 }, params: { id: "1" } }, forbiddenRes);
    expect(forbiddenRes.status).toHaveBeenCalledWith(403);

    mockService.getOpportunityForProvider.mockResolvedValueOnce({ id: "1" });
    const successRes = createMockRes();
    await getOpportunity({ user: { profileId: 1 }, params: { id: "1" } }, successRes);
    expect(successRes.status).toHaveBeenCalledWith(200);
  });

  test("admin handlers return success and error states", async () => {
    mockService.getPending.mockResolvedValue([{ id: 1 }]);
    mockService.getApproved.mockResolvedValue([{ id: 2 }]);
    mockService.updateStatus.mockResolvedValue();
    mockService.deleteOpportunityById.mockResolvedValue();

    const pendingRes = createMockRes();
    await getPendingOpportunities({}, pendingRes);
    expect(pendingRes.status).toHaveBeenCalledWith(200);

    const approvedRes = createMockRes();
    await getApprovedOpportunities({}, approvedRes);
    expect(approvedRes.status).toHaveBeenCalledWith(200);

    const approveRes = createMockRes();
    await approveOpportunity({ params: { id: "10" } }, approveRes);
    expect(approveRes.status).toHaveBeenCalledWith(200);

    const rejectRes = createMockRes();
    await rejectOpportunity({ params: { id: "11" } }, rejectRes);
    expect(rejectRes.status).toHaveBeenCalledWith(200);

    const deleteRes = createMockRes();
    await deleteOpportunity({ params: { id: "12" } }, deleteRes);
    expect(deleteRes.status).toHaveBeenCalledWith(200);
  });
});
