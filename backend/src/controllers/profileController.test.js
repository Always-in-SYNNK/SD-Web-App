import { jest } from "@jest/globals";

const mockGetApplicantProfileByUserId = jest.fn();
const mockUpsertApplicantProfileByUserId = jest.fn();
const mockUploadApplicantCV = jest.fn();
const mockSaveApplicantCVPath = jest.fn();
const mockDeleteApplicantCVIfExists = jest.fn();

jest.unstable_mockModule("../services/profileService.js", () => ({
    getApplicantProfileByUserId: mockGetApplicantProfileByUserId,
    upsertApplicantProfileByUserId: mockUpsertApplicantProfileByUserId,
    uploadApplicantCV: mockUploadApplicantCV,
    saveApplicantCVPath: mockSaveApplicantCVPath,
    deleteApplicantCVIfExists: mockDeleteApplicantCVIfExists,
}));

const {
    getMyApplicantProfile,
    saveMyApplicantProfile,
    uploadMyApplicantCV,
} = await import("./profileController.js");

function mockRes() {
    return {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
    };
}

describe("profileController", () => {
    let req;
    let res;
    let next;

    beforeEach(() => {
        req = {
            user: { id: "user-123" },
            body: {},
            file: null,
        };
        res = mockRes();
        next = jest.fn();

        mockGetApplicantProfileByUserId.mockReset();
        mockUpsertApplicantProfileByUserId.mockReset();
        mockUploadApplicantCV.mockReset();
        mockSaveApplicantCVPath.mockReset();
        mockDeleteApplicantCVIfExists.mockReset();
    });

    describe("getMyApplicantProfile", () => {
        test("returns applicant profile successfully", async () => {
            const profile = {
                id: "profile-1",
                full_name: "Yanni",
                qualifications: [],
            };

            mockGetApplicantProfileByUserId.mockResolvedValueOnce(profile);

            await getMyApplicantProfile(req, res, next);

            expect(mockGetApplicantProfileByUserId).toHaveBeenCalledWith("user-123");
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                profile,
            });
            expect(next).not.toHaveBeenCalled();
        });

        test("passes errors to next", async () => {
            const error = new Error("DB read failed");
            mockGetApplicantProfileByUserId.mockRejectedValueOnce(error);

            await getMyApplicantProfile(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe("saveMyApplicantProfile", () => {
        test("saves applicant profile successfully", async () => {
            req.body = {
                full_name: "Yanni",
                bio: "Developer",
                location: "Gauteng",
                nqf_level: 6,
            };

            const saved = {
                profile_id: "profile-1",
                bio: "Developer",
                location: "Gauteng",
                nqf_level: 6,
            };

            mockUpsertApplicantProfileByUserId.mockResolvedValueOnce(saved);

            await saveMyApplicantProfile(req, res, next);

            expect(mockUpsertApplicantProfileByUserId).toHaveBeenCalledWith("user-123", req.body);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                applicant_profile: saved,
            });
            expect(next).not.toHaveBeenCalled();
        });

        test("passes save errors to next", async () => {
            const error = new Error("Save failed");
            mockUpsertApplicantProfileByUserId.mockRejectedValueOnce(error);

            await saveMyApplicantProfile(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe("uploadMyApplicantCV", () => {
        test("returns 400 when no file is uploaded", async () => {
            req.file = null;

            await uploadMyApplicantCV(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                error: "No file uploaded",
            });
            expect(next).not.toHaveBeenCalled();
        });

        test("uploads CV and saves path successfully", async () => {
            req.file = {
                buffer: Buffer.from("pdf"),
                originalname: "cv.pdf",
                mimetype: "application/pdf",
            };

            mockDeleteApplicantCVIfExists.mockResolvedValueOnce(null);
            mockUploadApplicantCV.mockResolvedValueOnce("applicants/user-123/123-cv.pdf");
            mockSaveApplicantCVPath.mockResolvedValue({
                profile_id: "profile-1",
                cv_url: "applicants/user-123/123-cv.pdf",
            });

            await uploadMyApplicantCV(req, res, next);

            expect(mockDeleteApplicantCVIfExists).toHaveBeenCalledWith("user-123");
            expect(mockUploadApplicantCV).toHaveBeenCalledWith("user-123", req.file);
            expect(mockSaveApplicantCVPath).toHaveBeenCalledWith(
                "user-123",
                "applicants/user-123/123-cv.pdf"
            );
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                cv_url: "applicants/user-123/123-cv.pdf",
                message: "CV uploaded successfully.",
            });
            expect(next).not.toHaveBeenCalled();
        });

        test("passes upload errors to next", async () => {
            req.file = {
                buffer: Buffer.from("pdf"),
                originalname: "cv.pdf",
                mimetype: "application/pdf",
            };

            const error = new Error("Storage failed");
            mockDeleteApplicantCVIfExists.mockResolvedValueOnce(null);
            mockUploadApplicantCV.mockRejectedValueOnce(error);

            await uploadMyApplicantCV(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });
});