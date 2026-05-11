import { jest } from "@jest/globals";

const mockFrom = jest.fn();
const mockRpc = jest.fn();

jest.unstable_mockModule("../src/config/supabaseClient.js", () => ({
  supabase: {
    from: mockFrom,
    rpc: mockRpc,
  },
}));

const {
  getSkillsByField,
  getApplicantSkills,
  getOpportunitySkills,
  setApplicantSkills,
  setOpportunitySkills,
} = await import("../src/services/skillsService.js");

describe("skillsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFrom.mockReset();
    mockRpc.mockReset();
  });

  describe("getSkillsByField", () => {
    test("returns skills data from RPC call", async () => {
      const mockSkills = [
        { id: 1, name: "JavaScript", field: "IT" },
        { id: 2, name: "Python", field: "IT" },
      ];

      mockRpc.mockResolvedValue({
        data: mockSkills,
        error: null,
      });

      const result = await getSkillsByField("IT");

      expect(result).toEqual(mockSkills);
      expect(mockRpc).toHaveBeenCalledWith("get_skills_by_field", {
        field_input: "IT",
      });
    });

    test("throws error when RPC call fails", async () => {
      mockRpc.mockResolvedValue({
        data: null,
        error: { message: "RPC failed" },
      });

      await expect(getSkillsByField("IT")).rejects.toThrow("RPC failed");
    });
  });

  describe("getApplicantSkills", () => {
    test("returns mapped skills data for applicant", async () => {
      const mockData = [
        {
          id: 1,
          applicant_id: "app-1",
          skills_id: 10,
          skills: {
            id: 10,
            name: "React",
            field: "Frontend",
          },
        },
        {
          id: 2,
          applicant_id: "app-1",
          skills_id: 20,
          skills: {
            id: 20,
            name: "Node.js",
            field: "Backend",
          },
        },
      ];

      mockFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: mockData,
            error: null,
          }),
        }),
      });

      const result = await getApplicantSkills("app-1");

      expect(result).toEqual([
        {
          id: 10,
          skills_id: 10,
          name: "React",
          field: "Frontend",
        },
        {
          id: 20,
          skills_id: 20,
          name: "Node.js",
          field: "Backend",
        },
      ]);
    });

    test("returns empty array when no skills found", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

      mockFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      });

      const result = await getApplicantSkills("app-1");

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith("No data found, returning empty array");

      consoleSpy.mockRestore();
    });

    test("throws error when query fails", async () => {
      mockFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: null,
            error: { message: "Query failed" },
          }),
        }),
      });

      await expect(getApplicantSkills("app-1")).rejects.toThrow("Query failed");
    });

    test("handles missing skills relation gracefully", async () => {
      const mockData = [
        {
          id: 1,
          applicant_id: "app-1",
          skills_id: 10,
          skills: null, // Missing skills relation
        },
      ];

      mockFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            data: mockData,
            error: null,
          }),
        }),
      });

      const result = await getApplicantSkills("app-1");

      expect(result).toEqual([
        {
          id: 10,
          skills_id: 10,
          name: null,
          field: null,
        },
      ]);
    });
  });

  describe("getOpportunitySkills", () => {
    test("returns skills data from RPC call", async () => {
      const mockSkills = [
        { id: 1, name: "JavaScript", field: "IT" },
        { id: 2, name: "Python", field: "IT" },
      ];

      mockRpc.mockResolvedValue({
        data: mockSkills,
        error: null,
      });

      const result = await getOpportunitySkills("opp-1");

      expect(result).toEqual(mockSkills);
      expect(mockRpc).toHaveBeenCalledWith("get_opportunity_skills_json", {
        opportunity_id_param: "opp-1",
      });
    });

    test("throws error when RPC call fails", async () => {
      mockRpc.mockResolvedValue({
        data: null,
        error: { message: "RPC failed" },
      });

      await expect(getOpportunitySkills("opp-1")).rejects.toThrow("RPC failed");
    });
  });

  describe("setApplicantSkills", () => {
    test("throws error when applicantId is not provided", async () => {
      await expect(setApplicantSkills(null, [1, 2, 3])).rejects.toThrow(
        "Applicant ID is required"
      );
    });

    test("throws error when skillIds is not an array", async () => {
      await expect(setApplicantSkills("app-1", "not-an-array")).rejects.toThrow(
        "Skill IDs must be provided as an array"
      );
    });

    test("throws error when skillIds is null", async () => {
      await expect(setApplicantSkills("app-1", null)).rejects.toThrow(
        "Skill IDs must be provided as an array"
      );
    });

    test("successfully updates skills with delete and insert", async () => {
      const mockInsertedData = [
        { id: 1, applicant_id: "app-1", skills_id: 10 },
        { id: 2, applicant_id: "app-1", skills_id: 20 },
      ];

      mockFrom
        .mockReturnValueOnce({
          delete: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              error: null,
            }),
          }),
        })
        .mockReturnValueOnce({
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockResolvedValue({
              data: mockInsertedData,
              error: null,
            }),
          }),
        });

      const result = await setApplicantSkills("app-1", [10, 20]);

      expect(result).toEqual({
        success: true,
        message: "Successfully updated 2 skills",
        count: 2,
        skills: mockInsertedData,
      });
    });

    test("returns success when no skills to add (empty array)", async () => {
      mockFrom.mockReturnValueOnce({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            error: null,
          }),
        }),
      });

      const result = await setApplicantSkills("app-1", []);

      expect(result).toEqual({
        success: true,
        message: "All skills removed",
        count: 0,
      });
    });

    test("throws error when delete operation fails", async () => {
      mockFrom.mockReturnValueOnce({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            error: { message: "Delete failed" },
          }),
        }),
      });

      await expect(setApplicantSkills("app-1", [10, 20])).rejects.toThrow(
        "Failed to delete existing skills: Delete failed"
      );
    });

    test("throws error when insert operation fails", async () => {
      mockFrom
        .mockReturnValueOnce({
          delete: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              error: null,
            }),
          }),
        })
        .mockReturnValueOnce({
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockResolvedValue({
              data: null,
              error: { message: "Insert failed" },
            }),
          }),
        });

      await expect(setApplicantSkills("app-1", [10, 20])).rejects.toThrow(
        "Failed to insert skills: Insert failed"
      );
    });
  });

  describe("setOpportunitySkills", () => {
    test("throws error when opportunityId is not provided", async () => {
      await expect(setOpportunitySkills(null, [1, 2, 3])).rejects.toThrow(
        "Opportunity ID is required"
      );
    });

    test("throws error when skillIds is not an array", async () => {
      await expect(setOpportunitySkills("opp-1", "not-an-array")).rejects.toThrow(
        "Skill IDs must be provided as an array"
      );
    });

    test("throws error when skillIds is null", async () => {
      await expect(setOpportunitySkills("opp-1", null)).rejects.toThrow(
        "Skill IDs must be provided as an array"
      );
    });

    test("successfully updates skills with delete and insert", async () => {
      const mockInsertedData = [
        { id: 1, opportunity_id: "opp-1", skills_id: 10 },
        { id: 2, opportunity_id: "opp-1", skills_id: 20 },
      ];

      mockFrom
        .mockReturnValueOnce({
          delete: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              error: null,
            }),
          }),
        })
        .mockReturnValueOnce({
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockResolvedValue({
              data: mockInsertedData,
              error: null,
            }),
          }),
        });

      const result = await setOpportunitySkills("opp-1", [10, 20]);

      expect(result).toEqual({
        success: true,
        message: "Successfully updated 2 skills",
        count: 2,
        skills: mockInsertedData,
      });
    });

    test("returns success when no skills to add (empty array)", async () => {
      mockFrom.mockReturnValueOnce({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            error: null,
          }),
        }),
      });

      const result = await setOpportunitySkills("opp-1", []);

      expect(result).toEqual({
        success: true,
        message: "All skills removed",
        count: 0,
      });
    });

    test("throws error when delete operation fails", async () => {
      mockFrom.mockReturnValueOnce({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            error: { message: "Delete failed" },
          }),
        }),
      });

      await expect(setOpportunitySkills("opp-1", [10, 20])).rejects.toThrow(
        "Failed to delete existing skills: Delete failed"
      );
    });

    test("throws error when insert operation fails", async () => {
      mockFrom
        .mockReturnValueOnce({
          delete: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              error: null,
            }),
          }),
        })
        .mockReturnValueOnce({
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockResolvedValue({
              data: null,
              error: { message: "Insert failed" },
            }),
          }),
        });

      await expect(setOpportunitySkills("opp-1", [10, 20])).rejects.toThrow(
        "Failed to insert skills: Insert failed"
      );
    });
  });
});