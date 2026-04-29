import { jest } from "@jest/globals";

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
    upsertApplicantProfileByUserId: jest.fn(),
    uploadApplicantCV: jest.fn(),
    saveApplicantCVPath: jest.fn(),
    deleteApplicantCVIfExists: jest.fn(),
    addApplicantQualificationByUserId: jest.fn(),
    getApplicantCVSignedUrl: jest.fn(),
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
    });

    // describe("deleteMyQualification", () => {
    //     beforeEach(() => {
    //         // Reset and set up the mock chain before each test
    //         mockSupabaseFrom.mockClear();
    //         mockSupabaseDelete.mockClear();
    //         mockSupabaseEq.mockClear();

    //         // Ensure the chain is properly set up
    //         mockSupabaseDelete.mockReturnValue({ eq: mockSupabaseEq });
    //         mockSupabaseFrom.mockReturnValue({ delete: mockSupabaseDelete });
    //     });

    //     test("deletes qualification", async () => {
    //         req.params = { id: "qual-123" };
    //         mockSupabaseEq.mockResolvedValue({ error: null });

    //         await deleteMyQualification(req, res, next);

    //         expect(mockSupabaseFrom).toHaveBeenCalledWith("applicant_qualifications");
    //         expect(mockSupabaseDelete).toHaveBeenCalled();
    //         expect(mockSupabaseEq).toHaveBeenCalledWith("id", "qual-123");
    //         expect(res.json).toHaveBeenCalledWith({ success: true });
    //     });

    //     test("handles deletion error", async () => {
    //         req.params = { id: "qual-123" };
    //         const error = new Error("Delete failed");
    //         mockSupabaseEq.mockResolvedValue({ error });

    //         await deleteMyQualification(req, res, next);

    //         expect(mockSupabaseFrom).toHaveBeenCalledWith("applicant_qualifications");
    //         expect(next).toHaveBeenCalledWith(error);
    //     });

    //     test("handles database query error", async () => {
    //         req.params = { id: "qual-123" };
    //         const error = new Error("Database connection failed");
    //         mockSupabaseEq.mockRejectedValue(error);

    //         await deleteMyQualification(req, res, next);

    //         expect(mockSupabaseFrom).toHaveBeenCalledWith("applicant_qualifications");
    //         expect(next).toHaveBeenCalledWith(error);
    //     });
    // });
});