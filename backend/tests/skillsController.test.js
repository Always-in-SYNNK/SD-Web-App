import { jest } from "@jest/globals";

// Mock supabase client
const mockFrom = jest.fn();
const mockSupabase = {
  from: mockFrom,
};

jest.unstable_mockModule("../src/config/supabaseClient.js", () => ({
  supabase: mockSupabase,
}));

// Mock skillsService functions
const mockGetSkillsByField = jest.fn();
const mockGetApplicantSkills = jest.fn();
const mockGetOpportunitySkills = jest.fn();
const mockSetApplicantSkills = jest.fn();
const mockSetOpportunitySkills = jest.fn();

jest.unstable_mockModule("../src/services/skillsService.js", () => ({
  getSkillsByField: mockGetSkillsByField,
  getApplicantSkills: mockGetApplicantSkills,
  getOpportunitySkills: mockGetOpportunitySkills,
  setApplicantSkills: mockSetApplicantSkills,
  setOpportunitySkills: mockSetOpportunitySkills,
}));

// Import controller after mocks
const {
  getSkills,
  getApplicant,
  getOppSkills,
  setAppSkills,
  setOppSkills,
} = await import("../src/controllers/skillsController.js");

// Helper to create mock express objects
function createMockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

function createMockReq(params = {}, body = {}, user = null) {
  return {
    params: params,
    body: body,
    user: user,
  };
}

describe("skillsController", () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRes = createMockRes();
    mockNext = jest.fn();
  });

  describe("getSkills", () => {
    test("should return 400 if fieldName missing", async () => {
      mockReq = createMockReq({}); // no fieldName
      await getSkills(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: "Field name is required",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test("should return skills successfully", async () => {
      const mockData = [{ id: 1, name: "JavaScript" }];
      mockGetSkillsByField.mockResolvedValue(mockData);
      mockReq = createMockReq({ fieldName: "IT" });
      await getSkills(mockReq, mockRes, mockNext);
      expect(mockGetSkillsByField).toHaveBeenCalledWith("IT");
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        count: 1,
        data: mockData,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test("should handle empty data array", async () => {
      mockGetSkillsByField.mockResolvedValue([]);
      mockReq = createMockReq({ fieldName: "Design" });
      await getSkills(mockReq, mockRes, mockNext);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        count: 0,
        data: [],
      });
    });

    test("should call next on service error", async () => {
      const error = new Error("DB error");
      mockGetSkillsByField.mockRejectedValue(error);
      mockReq = createMockReq({ fieldName: "IT" });
      await getSkills(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockRes.json).not.toHaveBeenCalled();
    });
  });

  describe("getApplicant", () => {
    test("should return 400 if applicantId missing", async () => {
      mockReq = createMockReq({}); // no applicantId
      await getApplicant(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: "Applicant ID is required",
      });
    });

    test("should return applicant skills successfully", async () => {
      const mockSkills = [{ id: 1, name: "React" }];
      mockGetApplicantSkills.mockResolvedValue(mockSkills);
      mockReq = createMockReq({ applicantId: "applicant-123" });
      await getApplicant(mockReq, mockRes, mockNext);
      expect(mockGetApplicantSkills).toHaveBeenCalledWith("applicant-123");
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        applicantSkills: mockSkills,
      });
    });

    test("should call next on service error", async () => {
      const error = new Error("Skills fetch failed");
      mockGetApplicantSkills.mockRejectedValue(error);
      mockReq = createMockReq({ applicantId: "applicant-123" });
      await getApplicant(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("getOppSkills", () => {
    test("should return 400 if opportunityId missing", async () => {
      mockReq = createMockReq({});
      await getOppSkills(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: "Opportunity ID is required",
      });
    });

    test("should return opportunity skills successfully", async () => {
      const mockSkills = [{ id: 2, name: "Python" }];
      mockGetOpportunitySkills.mockResolvedValue(mockSkills);
      mockReq = createMockReq({ opportunityId: "opp-456" });
      await getOppSkills(mockReq, mockRes, mockNext);
      expect(mockGetOpportunitySkills).toHaveBeenCalledWith("opp-456");
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        opportunitySkills: mockSkills,
      });
    });

    test("should call next on service error", async () => {
      const error = new Error("Opportunity skills error");
      mockGetOpportunitySkills.mockRejectedValue(error);
      mockReq = createMockReq({ opportunityId: "opp-456" });
      await getOppSkills(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("setAppSkills", () => {
    test("should return 401 if user not authenticated", async () => {
      mockReq = createMockReq({}, {}, null);
      await setAppSkills(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: "Authentication required",
      });
    });

    test("should return 400 if skillIds missing or not array", async () => {
      mockReq = createMockReq({}, { skillIds: "not-array" }, { id: "user1" });
      await setAppSkills(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: "skillIds must be provided as an array",
      });

      mockReq = createMockReq({}, {}, { id: "user1" });
      await setAppSkills(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    test("should return 404 if profile not found", async () => {
      mockFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: null, error: { message: "Not found" } }),
          }),
        }),
      });
      mockReq = createMockReq({}, { skillIds: [1, 2] }, { id: "user1" });
      await setAppSkills(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: "Profile not found",
      });
    });

    test("should return 404 if applicant profile not found", async () => {
      // mock profile found
      mockFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: { id: "profile1" }, error: null }),
          }),
        }),
      });
      // mock applicant query fails
      mockFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: null, error: { message: "No applicant" } }),
          }),
        }),
      });
      mockReq = createMockReq({}, { skillIds: [1, 2] }, { id: "user1" });
      await setAppSkills(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: "Applicant profile not found",
      });
    });

    test("should successfully set applicant skills", async () => {
      // profile query
      mockFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: { id: "profile1" }, error: null }),
          }),
        }),
      });
      // applicant query
      mockFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: { id: "applicant1" }, error: null }),
          }),
        }),
      });
      mockSetApplicantSkills.mockResolvedValue({ message: "Skills updated" });
      mockReq = createMockReq({}, { skillIds: [10, 20] }, { id: "user1" });
      await setAppSkills(mockReq, mockRes, mockNext);
      expect(mockSetApplicantSkills).toHaveBeenCalledWith("applicant1", [10, 20]);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "Skills updated",
      });
    });

    test("should call next on unexpected error", async () => {
      mockFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockRejectedValue(new Error("DB crash")),
          }),
        }),
      });
      mockReq = createMockReq({}, { skillIds: [1] }, { id: "user1" });
      await setAppSkills(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe("setOppSkills", () => {
    test("should return 401 if user not authenticated", async () => {
      mockReq = createMockReq({}, {}, null);
      await setOppSkills(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: "Authentication required",
      });
    });

    test("should return 400 if opportunityId missing", async () => {
      mockReq = createMockReq({}, { skillIds: [1] }, { id: "user1" });
      await setOppSkills(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: "Opportunity ID is required",
      });
    });

    test("should return 400 if skillIds missing or not array", async () => {
      mockReq = createMockReq({ opportunityId: "opp1" }, {}, { id: "user1" });
      await setOppSkills(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);

      mockReq = createMockReq({ opportunityId: "opp1" }, { skillIds: "string" }, { id: "user1" });
      await setOppSkills(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    test("should find profile by user_id then by id and return 404 if none", async () => {
      // First profile query by user_id returns null
      mockFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      });
      // Second profile query by id returns null
      mockFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      });
      mockReq = createMockReq({ opportunityId: "opp1" }, { skillIds: [1] }, { id: "user1" });
      await setOppSkills(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: "Profile not found",
      });
    });

    test("should return 404 if provider profile not found", async () => {
      // profile found by user_id
      mockFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({ data: { id: "profile1" }, error: null }),
          }),
        }),
      });
      // provider profile query fails
      mockFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: null, error: { message: "No provider" } }),
          }),
        }),
      });
      mockReq = createMockReq({ opportunityId: "opp1" }, { skillIds: [1] }, { id: "user1" });
      await setOppSkills(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: "Provider profile not found",
      });
    });

    test("should return 404 if opportunity not found", async () => {
      // profile found
      mockFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({ data: { id: "profile1" }, error: null }),
          }),
        }),
      });
      // provider profile found
      mockFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: { id: "provider1" }, error: null }),
          }),
        }),
      });
      // opportunity query fails
      mockFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: null, error: { message: "Not found" } }),
          }),
        }),
      });
      mockReq = createMockReq({ opportunityId: "opp1" }, { skillIds: [1] }, { id: "user1" });
      await setOppSkills(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: "Opportunity not found",
      });
    });

    test("should return 403 if provider does not own the opportunity", async () => {
      // profile found
      mockFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({ data: { id: "profile1" }, error: null }),
          }),
        }),
      });
      // provider profile found
      mockFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: { id: "provider1" }, error: null }),
          }),
        }),
      });
      // opportunity returns a different provider_id
      mockFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { provider_id: "other-provider" },
              error: null,
            }),
          }),
        }),
      });
      mockReq = createMockReq({ opportunityId: "opp1" }, { skillIds: [1] }, { id: "user1" });
      await setOppSkills(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: "Not authorized to modify this opportunity's skills",
      });
    });

    test("should successfully set opportunity skills", async () => {
      // profile found
      mockFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({ data: { id: "profile1" }, error: null }),
          }),
        }),
      });
      // provider profile found
      mockFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: { id: "provider1" }, error: null }),
          }),
        }),
      });
      // opportunity owned by this provider
      mockFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { provider_id: "provider1" },
              error: null,
            }),
          }),
        }),
      });
      mockSetOpportunitySkills.mockResolvedValue({ message: "Skills synced" });
      mockReq = createMockReq({ opportunityId: "opp1" }, { skillIds: [100, 200] }, { id: "user1" });
      await setOppSkills(mockReq, mockRes, mockNext);
      expect(mockSetOpportunitySkills).toHaveBeenCalledWith("opp1", [100, 200]);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "Skills synced",
      });
    });

    test("should call next on unexpected error", async () => {
      mockFrom.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockRejectedValue(new Error("Unexpected")),
          }),
        }),
      });
      mockReq = createMockReq({ opportunityId: "opp1" }, { skillIds: [1] }, { id: "user1" });
      await setOppSkills(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });
  });
});