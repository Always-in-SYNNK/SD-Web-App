import { jest } from '@jest/globals';

const mockService = {
  getApplicationsByOpportunity: jest.fn(),
  updateApplicationStatus: jest.fn(),
  getApplicantDetailsForApplication: jest.fn(),
};

jest.unstable_mockModule('../src/services/employerApplicationService.js', () => mockService);

const mockProfileService = {
  getApplicantCVSignedUrl: jest.fn(),
};

jest.unstable_mockModule('../src/services/profileService.js', () => mockProfileService);

const mockSupabase = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn(),
};

jest.unstable_mockModule('../src/config/supabaseClient.js', () => ({
  supabase: mockSupabase,
}));

const {
  fetchApplicationsByOpportunity,
  patchApplicationStatus,
  fetchApplicantDetails,
  fetchApplicantCvSignedUrl,
} = await import('../src/controllers/employerApplicationController.js');

const {
  getApplicationsByOpportunity,
  updateApplicationStatus,
  getApplicantDetailsForApplication,
} = await import('../src/services/employerApplicationService.js');

const { getApplicantCVSignedUrl } = await import('../src/services/profileService.js');
const { supabase } = await import('../src/config/supabaseClient.js');

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

  test("returns 500 when fetching applications fails", async () => {
    getApplicationsByOpportunity.mockRejectedValue(new Error("Service failed"));

    const req = { params: { opportunityId: 1 }, user: { profileId: 1 } };
    const res = mockRes();

    await fetchApplicationsByOpportunity(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: "Service failed"
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

  test("returns 500 when patching application status fails", async () => {
    updateApplicationStatus.mockRejectedValue(new Error("Update failed"));

    const req = {
      params: { applicationId: 1 },
      body: { status: "shortlisted" },
      user: { profileId: 1 }
    };
    const res = mockRes();

    await patchApplicationStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: "Update failed"
      })
    );
  });

  // =========================
  // DETAILS TESTS
  // =========================

  test("returns 400 if applicationId missing for details", async () => {
    const req = { params: {}, user: { profileId: 1 } };
    const res = mockRes();

    await fetchApplicantDetails(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("returns 401 if provider not authenticated for details", async () => {
    const req = { params: { applicationId: 1 }, user: null };
    const res = mockRes();

    await fetchApplicantDetails(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("returns applicant details successfully", async () => {
    getApplicantDetailsForApplication.mockResolvedValue({
      applicantProfileId: "ap-1",
      applicationId: "app-1"
    });

    const req = { params: { applicationId: "app-1" }, user: { profileId: "provider-1" } };
    const res = mockRes();

    await fetchApplicantDetails(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        applicantProfileId: "ap-1",
        applicationId: "app-1"
      })
    );
  });

  test("returns 403 when applicant details service says unauthorized", async () => {
    getApplicantDetailsForApplication.mockRejectedValue(new Error("Unauthorized: provider mismatch"));

    const req = { params: { applicationId: "app-1" }, user: { profileId: "provider-1" } };
    const res = mockRes();

    await fetchApplicantDetails(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  test("returns 404 when applicant details service says not found", async () => {
    getApplicantDetailsForApplication.mockRejectedValue(new Error("Application not found"));

    const req = { params: { applicationId: "app-1" }, user: { profileId: "provider-1" } };
    const res = mockRes();

    await fetchApplicantDetails(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("returns 500 when applicant details service throws unknown error", async () => {
    getApplicantDetailsForApplication.mockRejectedValue(new Error("Unexpected details error"));

    const req = { params: { applicationId: "app-1" }, user: { profileId: "provider-1" } };
    const res = mockRes();

    await fetchApplicantDetails(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  // =========================
  // CV SIGNED URL TESTS
  // =========================

  test("returns 400 if applicationId missing for signed url", async () => {
    const req = { params: {}, user: { profileId: 1 } };
    const res = mockRes();

    await fetchApplicantCvSignedUrl(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("returns 401 if provider not authenticated for signed url", async () => {
    const req = { params: { applicationId: 1 }, user: null };
    const res = mockRes();

    await fetchApplicantCvSignedUrl(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("returns 404 when application not found for signed url", async () => {
    supabase.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: new Error("Not found") })
    });

    const req = { params: { applicationId: "app-1" }, user: { profileId: "provider-1" } };
    const res = mockRes();

    await fetchApplicantCvSignedUrl(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("returns 403 when application belongs to a different provider", async () => {
    supabase.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: {
          id: "app-1",
          opportunity_id: "opp-1",
          applicant_profiles: { cv_url: "cv/path.pdf" },
          opportunities: { provider_id: "other-provider" }
        },
        error: null
      })
    });

    const req = { params: { applicationId: "app-1" }, user: { profileId: "provider-1" } };
    const res = mockRes();

    await fetchApplicantCvSignedUrl(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  test("returns null when application has no CV", async () => {
    supabase.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: {
          id: "app-1",
          opportunity_id: "opp-1",
          applicant_profiles: { cv_url: null },
          opportunities: { provider_id: "provider-1" }
        },
        error: null
      })
    });

    const req = { params: { applicationId: "app-1" }, user: { profileId: "provider-1" } };
    const res = mockRes();

    await fetchApplicantCvSignedUrl(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        signed_url: null
      })
    );
  });

  test("returns signed url when CV exists", async () => {
    supabase.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: {
          id: "app-1",
          opportunity_id: "opp-1",
          applicant_profiles: { cv_url: "cv/path.pdf" },
          opportunities: { provider_id: "provider-1" }
        },
        error: null
      })
    });
    getApplicantCVSignedUrl.mockResolvedValue("https://signed-url.pdf");

    const req = { params: { applicationId: "app-1" }, user: { profileId: "provider-1" } };
    const res = mockRes();

    await fetchApplicantCvSignedUrl(req, res);

    expect(getApplicantCVSignedUrl).toHaveBeenCalledWith("cv/path.pdf");
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        signed_url: "https://signed-url.pdf"
      })
    );
  });

  test("returns 500 when signed url lookup throws", async () => {
    supabase.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockRejectedValue(new Error("Unexpected CV error"))
    });

    const req = { params: { applicationId: "app-1" }, user: { profileId: "provider-1" } };
    const res = mockRes();

    await fetchApplicantCvSignedUrl(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

});