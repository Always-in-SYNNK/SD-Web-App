import { jest } from '@jest/globals';

const mockService = {
  getApplicationsByOpportunity: jest.fn(),
  updateApplicationStatus: jest.fn(),
};

jest.unstable_mockModule('../src/services/employerApplicationService.js', () => mockService);

const {
  fetchApplicationsByOpportunity,
  patchApplicationStatus,
} = await import('../src/controllers/employerApplicationController.js');

const {
  getApplicationsByOpportunity,
  updateApplicationStatus,
} = await import('../src/services/employerApplicationService.js');

// 🔧 Mock response helper
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("Employer Application Controller", () => {

  // =========================
  // GET TESTS
  // =========================

  test("returns 400 if opportunityId missing", async () => {
    const req = { params: {}, user: { profileId: 1 } };
    const res = mockRes();

    await fetchApplicationsByOpportunity(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("returns 401 if provider not authenticated", async () => {
    const req = { params: { opportunityId: 1 }, user: null };
    const res = mockRes();

    await fetchApplicationsByOpportunity(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("returns applications successfully", async () => {
    getApplicationsByOpportunity.mockResolvedValue([{ id: 1 }]);

    const req = { params: { opportunityId: 1 }, user: { profileId: 1 } };
    const res = mockRes();

    await fetchApplicationsByOpportunity(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: [{ id: 1 }],
        count: 1
      })
    );
  });

  // =========================
  // PATCH TESTS
  // =========================

  test("returns 400 if applicationId missing", async () => {
    const req = {
      params: {},
      body: { status: "shortlisted" },
      user: { profileId: 1 }
    };
    const res = mockRes();

    await patchApplicationStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("returns 401 if provider not authenticated", async () => {
    const req = {
      params: { applicationId: 1 },
      body: { status: "shortlisted" },
      user: null
    };
    const res = mockRes();

    await patchApplicationStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("returns 400 for invalid status", async () => {
    const req = {
      params: { applicationId: 1 },
      body: { status: "invalid" },
      user: { profileId: 1 }
    };
    const res = mockRes();

    await patchApplicationStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("updates application status successfully", async () => {
    updateApplicationStatus.mockResolvedValue({
      id: 1,
      status: "shortlisted"
    });

    const req = {
      params: { applicationId: 1 },
      body: { status: "shortlisted" },
      user: { profileId: 1 }
    };
    const res = mockRes();

    await patchApplicationStatus(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: "Applicant shortlisted"
      })
    );
  });

});