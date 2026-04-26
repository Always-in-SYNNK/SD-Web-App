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
});
