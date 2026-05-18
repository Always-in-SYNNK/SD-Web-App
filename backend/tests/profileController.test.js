import { jest } from "@jest/globals";
import { fetchProviderProfileByUserId } from "../src/services/profileService.js";

const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

// Mock supabase with a more flexible approach
const mockSupabaseEq = jest.fn();
const mockSupabaseDelete = jest.fn();
const mockSupabaseFrom = jest.fn();

// Set up the chain properly
mockSupabaseDelete.mockReturnValue({ eq: mockSupabaseEq });
mockSupabaseFrom.mockReturnValue({ delete: mockSupabaseDelete });

jest.unstable_mockModule("../src/config/supabaseClient.js", () => ({
    supabase: { from: mockSupabaseFrom },
}));

// Mock profileService with all functions
const mockService = {
    getApplicantProfileByUserId: jest.fn(),
    getApplicantProfileByProfileId: jest.fn(),
    upsertApplicantProfileByUserId: jest.fn(),
    uploadApplicantCV: jest.fn(),
    saveApplicantCVPath: jest.fn(),
    deleteApplicantCVIfExists: jest.fn(),
    addApplicantQualificationByUserId: jest.fn(),
    getApplicantCVSignedUrl: jest.fn(),
    fetchProviderProfileByUserId: jest.fn(),
    editProviderProfile: jest.fn(),
};

jest.unstable_mockModule("../src/services/profileService.js", () => mockService);

// Import controller
const {
    getMyApplicantProfile,
    saveMyApplicantProfile,
    uploadMyApplicantCV,
    getMyQualifications,
    addMyQualification,
    deleteMyQualification,
    getSignedCVUrl,
    getApplicantProfileById,
    getProviderProfile,
    updateProviderProfile,
} = await import("../src/controllers/profileController.js");

// Helper to create response object
const mockRes = () => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
});

describe("profileController", () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            user: { id: "user-123" },
            body: {},
            file: null,
            params: {},
        };
        res = mockRes();
        next = jest.fn();

        // Reset all mocks
        Object.values(mockService).forEach(mock => mock.mockReset());
        mockSupabaseFrom.mockClear();
        mockSupabaseDelete.mockClear();
        mockSupabaseEq.mockClear();
    });

    afterAll(() => {
        consoleErrorSpy.mockRestore();
    });

    describe("getMyApplicantProfile", () => {
        test("returns profile successfully", async () => {
            const profile = { id: "profile-1", full_name: "Yanni" };
            mockService.getApplicantProfileByUserId.mockResolvedValue(profile);

            await getMyApplicantProfile(req, res, next);

            expect(mockService.getApplicantProfileByUserId).toHaveBeenCalledWith("user-123");
            expect(res.json).toHaveBeenCalledWith({ success: true, profile });
        });

        test("handles errors", async () => {
            const error = new Error("DB failed");
            mockService.getApplicantProfileByUserId.mockRejectedValue(error);

            await getMyApplicantProfile(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe("saveMyApplicantProfile", () => {
        test("saves profile successfully", async () => {
            req.body = { full_name: "Yanni", bio: "Developer" };
            const saved = { profile_id: "profile-1", ...req.body };
            mockService.upsertApplicantProfileByUserId.mockResolvedValue(saved);

            await saveMyApplicantProfile(req, res, next);

            expect(mockService.upsertApplicantProfileByUserId).toHaveBeenCalledWith("user-123", req.body);
            expect(res.json).toHaveBeenCalledWith({ success: true, applicant_profile: saved });
        });

        test("handles errors", async () => {
            const error = new Error("Save failed");
            mockService.upsertApplicantProfileByUserId.mockRejectedValue(error);

            await saveMyApplicantProfile(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe("uploadMyApplicantCV", () => {
        test("returns 400 when no file", async () => {
            await uploadMyApplicantCV(req, res, next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ success: false, error: "No file uploaded" });
        });

        test("uploads CV successfully", async () => {
            req.file = { buffer: Buffer.from("pdf"), originalname: "cv.pdf" };
            mockService.deleteApplicantCVIfExists.mockResolvedValue();
            mockService.uploadApplicantCV.mockResolvedValue("path/to/cv.pdf");
            mockService.saveApplicantCVPath.mockResolvedValue();

            await uploadMyApplicantCV(req, res, next);

            expect(mockService.uploadApplicantCV).toHaveBeenCalledWith("user-123", req.file);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                cv_url: "path/to/cv.pdf",
                message: "CV uploaded successfully.",
            });
        });

        test("handles errors", async () => {
            req.file = { buffer: Buffer.from("pdf"), originalname: "cv.pdf" };
            const error = new Error("Upload failed");
            mockService.deleteApplicantCVIfExists.mockResolvedValue();
            mockService.uploadApplicantCV.mockRejectedValue(error);

            await uploadMyApplicantCV(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe("getMyQualifications", () => {
        test("returns qualifications", async () => {
            const qualifications = [{ id: 1, name: "BSc" }, { id: 2, name: "MSc" }];
            mockService.getApplicantProfileByUserId.mockResolvedValue({ qualifications });

            await getMyQualifications(req, res, next);

            expect(res.json).toHaveBeenCalledWith({ success: true, qualifications });
        });

        test("handles errors", async () => {
            const error = new Error("Qualifications failed");
            mockService.getApplicantProfileByUserId.mockRejectedValue(error);

            await getMyQualifications(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe("addMyQualification", () => {
        test("adds qualification", async () => {
            req.body = { name: "PhD", year: 2025 };
            const newQualification = { id: "qual-123", ...req.body };
            mockService.addApplicantQualificationByUserId.mockResolvedValue(newQualification);

            await addMyQualification(req, res, next);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ success: true, qualification: newQualification });
        });

        test("handles errors", async () => {
            const error = new Error("Create qualification failed");
            mockService.addApplicantQualificationByUserId.mockRejectedValue(error);

            await addMyQualification(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe("deleteMyQualification", () => {
        test("deletes qualification", async () => {
            req.params = { id: "qual-123" };
            mockSupabaseDelete.mockReturnValue({ eq: mockSupabaseEq });
            mockSupabaseFrom.mockReturnValue({ delete: mockSupabaseDelete });
            mockSupabaseEq.mockResolvedValue({ error: null });

            await deleteMyQualification(req, res, next);

            expect(mockSupabaseFrom).toHaveBeenCalledWith("applicant_qualifications");
            expect(mockSupabaseDelete).toHaveBeenCalled();
            expect(mockSupabaseEq).toHaveBeenCalledWith("id", "qual-123");
            expect(res.json).toHaveBeenCalledWith({ success: true });
        });

        test("handles deletion error result", async () => {
            req.params = { id: "qual-123" };
            const error = new Error("Delete failed");
            mockSupabaseDelete.mockReturnValue({ eq: mockSupabaseEq });
            mockSupabaseFrom.mockReturnValue({ delete: mockSupabaseDelete });
            mockSupabaseEq.mockResolvedValue({ error });

            await deleteMyQualification(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });

        test("handles query rejection", async () => {
            req.params = { id: "qual-123" };
            const error = new Error("Database connection failed");
            mockSupabaseDelete.mockReturnValue({ eq: mockSupabaseEq });
            mockSupabaseFrom.mockReturnValue({ delete: mockSupabaseDelete });
            mockSupabaseEq.mockRejectedValue(error);

            await deleteMyQualification(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe("getSignedCVUrl", () => {
        test("returns null when no CV exists", async () => {
            mockSupabaseFrom.mockImplementation((table) => {
                if (table === "profiles") {
                    return {
                        select: () => ({
                            eq: () => ({
                                single: async () => ({ data: { id: "profile-1" } }),
                            }),
                        }),
                    };
                }

                if (table === "applicant_profiles") {
                    return {
                        select: () => ({
                            eq: () => ({
                                single: async () => ({ data: { cv_url: null } }),
                            }),
                        }),
                    };
                }

                return undefined;
            });

            await getSignedCVUrl(req, res, next);

            expect(res.json).toHaveBeenCalledWith({ success: true, signed_url: null });
            expect(mockService.getApplicantCVSignedUrl).not.toHaveBeenCalled();
        });

        test("returns signed URL when CV exists", async () => {
            mockSupabaseFrom.mockImplementation((table) => {
                if (table === "profiles") {
                    return {
                        select: () => ({
                            eq: () => ({
                                single: async () => ({ data: { id: "profile-1" } }),
                            }),
                        }),
                    };
                }

                if (table === "applicant_profiles") {
                    return {
                        select: () => ({
                            eq: () => ({
                                single: async () => ({ data: { cv_url: "cv/path.pdf" } }),
                            }),
                        }),
                    };
                }

                return undefined;
            });
            mockService.getApplicantCVSignedUrl.mockResolvedValue("https://signed-url");

            await getSignedCVUrl(req, res, next);

            expect(mockService.getApplicantCVSignedUrl).toHaveBeenCalledWith("cv/path.pdf");
            expect(res.json).toHaveBeenCalledWith({ success: true, signed_url: "https://signed-url" });
        });

        test("passes errors to next", async () => {
            const error = new Error("Profile query failed");
            mockSupabaseFrom.mockImplementation((table) => {
                if (table === "profiles") {
                    return {
                        select: () => ({
                            eq: () => ({
                                single: async () => {
                                    throw error;
                                },
                            }),
                        }),
                    };
                }

                return undefined;
            });

            await getSignedCVUrl(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe("getApplicantProfileById", () => {
        test("returns 400 when applicant profile id is missing", async () => {
            req.params = {};

            await getApplicantProfileById(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                error: "Applicant profile ID is required",
            });
            expect(mockService.getApplicantProfileByProfileId).not.toHaveBeenCalled();
        });

        test("returns applicant profile by id", async () => {
            req.params = { applicantProfileId: "ap-123" };
            const profile = { id: "ap-123", headline: "Engineer" };
            mockService.getApplicantProfileByProfileId.mockResolvedValue(profile);

            await getApplicantProfileById(req, res, next);

            expect(mockService.getApplicantProfileByProfileId).toHaveBeenCalledWith("ap-123");
            expect(res.json).toHaveBeenCalledWith({ success: true, profile });
        });

        test("handles errors", async () => {
            req.params = { applicantProfileId: "ap-123" };
            const error = new Error("Lookup failed");
            mockService.getApplicantProfileByProfileId.mockRejectedValue(error);

            await getApplicantProfileById(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe("getProviderProfile", () => {
        test("returns provider profile successfully", async () => {
            const providerProfile = {
                id: "provider-123",
                organisation_name: "Tech Corp",
                organisation_type: "Technology",
            };

            mockService.fetchProviderProfileByUserId.mockResolvedValue(providerProfile);

            await getProviderProfile(req, res);

            expect(mockService.fetchProviderProfileByUserId)
                .toHaveBeenCalledWith("user-123");

            expect(res.status).toHaveBeenCalledWith(200);

            expect(res.json).toHaveBeenCalledWith(providerProfile);
        });

        test("returns 404 when provider profile is not found", async () => {
            mockService.fetchProviderProfileByUserId.mockResolvedValue(null);

            await getProviderProfile(req, res);

            expect(res.status).toHaveBeenCalledWith(404);

            expect(res.json).toHaveBeenCalledWith({
                error: "Provider profile not found",
            });
        });

        test("returns 500 when service throws error", async () => {
            const error = new Error("Database failed");

            mockService.fetchProviderProfileByUserId.mockRejectedValue(error);

            await getProviderProfile(req, res);

            expect(res.status).toHaveBeenCalledWith(500);

            expect(res.json).toHaveBeenCalledWith({
                error: "Internal server error",
            });
        });
    });

    describe("updateProviderProfile", () => {
        test("updates provider profile successfully", async () => {
            req.body = {
                organisation_name: "Updated Corp",
                description: "New description",
            };

            const updatedProfile = {
                id: "provider-123",
                ...req.body,
            };

            mockService.editProviderProfile.mockResolvedValue(updatedProfile);

            await updateProviderProfile(req, res);

            expect(mockService.editProviderProfile).toHaveBeenCalledWith(
                "user-123",
                req.body
            );

            expect(res.status).toHaveBeenCalledWith(200);

            expect(res.json).toHaveBeenCalledWith(updatedProfile);
        });

        test("returns 500 when update fails", async () => {
            const error = new Error("Update failed");

            mockService.editProviderProfile.mockRejectedValue(error);

            await updateProviderProfile(req, res);

            expect(res.status).toHaveBeenCalledWith(500);

            expect(res.json).toHaveBeenCalledWith({
                error: "Failed to update profile",
            });
        });
    });
});