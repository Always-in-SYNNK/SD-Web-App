import { jest } from "@jest/globals";

// ----------------------------------------------------------------------
// Correct mocks for Supabase client
// ----------------------------------------------------------------------
const mockFrom = jest.fn();
const mockRpc = jest.fn();
const mockStorageFrom = jest.fn();          // for storage.from()
const mockStorage = { from: mockStorageFrom }; // storage is an object

jest.unstable_mockModule("../src/config/supabaseClient.js", () => ({
    supabase: {
        from: mockFrom,
        rpc: mockRpc,
        storage: mockStorage,
    },
}));

// Mock skillsService
jest.unstable_mockModule("../src/services/skillsService.js", () => ({
    getApplicantSkills: jest.fn(),
}));

// Import after mocks
const {
    getApplicantProfileByUserId,
    upsertApplicantProfileByUserId,
    uploadApplicantCV,
    saveApplicantCVPath,
    deleteApplicantCVIfExists,
    getApplicantCVSignedUrl,
    addApplicantQualificationByUserId,
    getApplicantProfileByProfileId,
} = await import("../src/services/profileService.js");

const { getApplicantSkills } = await import("../src/services/skillsService.js");

// Helper to build a standard Supabase query chain
function buildQueryChain(mockChain, finalMethod = "single") {
    // mockChain should be an object like:
    // { data, error, method?: 'single'|'maybeSingle' }
    const { data, error, method = finalMethod } = mockChain;
    const resolver = error
        ? Promise.resolve({ data: null, error })
        : Promise.resolve({ data, error: null });

    const selectMock = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
            [method]: jest.fn().mockResolvedValue(resolver),
        }),
    });
    return { select: selectMock };
}

describe("profileService", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockFrom.mockReset();
        mockRpc.mockReset();
        mockStorageFrom.mockReset();
        getApplicantSkills.mockReset();
    });

    describe("getApplicantProfileByUserId", () => {
        test("returns complete applicant profile with qualifications and skills", async () => {
            const mockProfile = {
                id: "profile-1",
                full_name: "John Doe",
                email: "john@example.com",
                role: "applicant",
            };
            const mockApplicantProfile = {
                id: "applicant-1",
                name: "John",
                surname: "Doe",
                bio: "Software developer",
                location: "Cape Town",
                nqf_level: 7,
                cv_url: "cv/path.pdf",
            };
            const mockQualifications = [
                {
                    id: "qual-1",
                    qualification_id: "q1",
                    qualification_name: null,
                    nqf_level: null,
                    field: null,
                    subfield: null,
                    status: "completed",
                    originator: "University",
                    date_obtained: "2023-01-01",
                    qualifications: {
                        title: "Computer Science Degree",
                        nqf_level: 7,
                        field: "IT",
                        subfield: "Software Development",
                    },
                },
            ];
            const mockSkills = [
                { id: 1, name: "JavaScript", field: "IT" },
                { id: 2, name: "React", field: "Frontend" },
            ];

            // Profile query
            mockFrom.mockReturnValueOnce({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({ data: mockProfile, error: null }),
                    }),
                }),
            });
            // Applicant profile query
            mockFrom.mockReturnValueOnce({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        maybeSingle: jest.fn().mockResolvedValue({ data: mockApplicantProfile, error: null }),
                    }),
                }),
            });
            // Qualifications query
            mockFrom.mockReturnValueOnce({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockResolvedValue({ data: mockQualifications, error: null }),
                }),
            });

            getApplicantSkills.mockResolvedValue({ data: mockSkills, error: null });

            const result = await getApplicantProfileByUserId("user-1");

            expect(result).toEqual({
                user_id: "user-1",
                full_name: "John Doe",
                email: "john@example.com",
                role: "applicant",
                applicant_profile_id: "applicant-1",
                bio: "Software developer",
                location: "Cape Town",
                nqf_level: 7,
                surname: "Doe",
                cv_url: "cv/path.pdf",
                qualifications: [
                    {
                        id: "qual-1",
                        qualification_id: "q1",
                        title: "Computer Science Degree",
                        nqf_level: 7,
                        field: "IT",
                        subfield: "Software Development",
                        status: "completed",
                        originator: "University",
                        date_obtained: "2023-01-01",
                    },
                ],
                skills: mockSkills,
            });
        });

        test("handles applicant profile without qualifications", async () => {
            const mockProfile = {
                id: "profile-1",
                full_name: "Jane Doe",
                email: "jane@example.com",
                role: "applicant",
            };
            const mockApplicantProfile = {
                id: "applicant-1",
                name: "Jane",
                surname: "Doe",
                bio: "Designer",
                location: "Johannesburg",
                nqf_level: 6,
                cv_url: null,
            };

            mockFrom
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            single: jest.fn().mockResolvedValue({ data: mockProfile, error: null }),
                        }),
                    }),
                })
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            maybeSingle: jest.fn().mockResolvedValue({ data: mockApplicantProfile, error: null }),
                        }),
                    }),
                })
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValue({
                        eq: jest.fn().mockResolvedValue({ data: [], error: null }),
                    }),
                });

            getApplicantSkills.mockResolvedValue({ data: [], error: null });

            const result = await getApplicantProfileByUserId("user-2");
            expect(result.qualifications).toEqual([]);
            expect(result.skills).toEqual([]);
        });

        test("handles custom qualifications without qualification_id", async () => {
            const mockProfile = {
                id: "profile-1",
                full_name: "Bob Smith",
                email: "bob@example.com",
                role: "applicant",
            };
            const mockApplicantProfile = {
                id: "applicant-1",
                name: "Bob",
                surname: "Smith",
                bio: "Engineer",
                location: "Durban",
                nqf_level: 8,
                cv_url: null,
            };
            const mockQualifications = [
                {
                    id: "qual-1",
                    qualification_id: null,
                    qualification_name: "Custom Certificate",
                    nqf_level: 5,
                    field: "Engineering",
                    subfield: "Mechanical",
                    status: "completed",
                    originator: "Custom Institute",
                    date_obtained: "2022-06-15",
                    qualifications: null,
                },
            ];

            mockFrom
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            single: jest.fn().mockResolvedValue({ data: mockProfile, error: null }),
                        }),
                    }),
                })
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            maybeSingle: jest.fn().mockResolvedValue({ data: mockApplicantProfile, error: null }),
                        }),
                    }),
                })
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValue({
                        eq: jest.fn().mockResolvedValue({ data: mockQualifications, error: null }),
                    }),
                });

            getApplicantSkills.mockResolvedValue({ data: [], error: null });

            const result = await getApplicantProfileByUserId("user-3");
            expect(result.qualifications[0]).toEqual({
                id: "qual-1",
                qualification_id: null,
                title: "Custom Certificate",
                nqf_level: 5,
                field: "Engineering",
                subfield: "Mechanical",
                status: "completed",
                originator: "Custom Institute",
                date_obtained: "2022-06-15",
            });
        });

        test("throws error when getApplicantSkills fails", async () => {
            const mockProfile = {
                id: "profile-1",
                full_name: "John Doe",
                email: "john@example.com",
                role: "applicant",
            };
            const mockApplicantProfile = {
                id: "applicant-1",
                name: "John",
                surname: "Doe",
                bio: "Developer",
                location: "Cape Town",
                nqf_level: 7,
                cv_url: null,
            };

            mockFrom
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            single: jest.fn().mockResolvedValue({ data: mockProfile, error: null }),
                        }),
                    }),
                })
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            maybeSingle: jest.fn().mockResolvedValue({ data: mockApplicantProfile, error: null }),
                        }),
                    }),
                })
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValue({
                        eq: jest.fn().mockResolvedValue({ data: [], error: null }),
                    }),
                });

            getApplicantSkills.mockRejectedValue(new Error("Skills service error"));

            await expect(getApplicantProfileByUserId("user-1")).rejects.toThrow("Skills service error");
        });
    });

    describe("upsertApplicantProfileByUserId", () => {
        test("successfully upserts applicant profile", async () => {
            const mockProfile = { id: "profile-1" };
            const mockUpsertedData = {
                id: "applicant-1",
                profile_id: "profile-1",
                surname: "Doe",
                bio: "Updated bio",
                location: "Cape Town",
                nqf_level: 7,
            };

            mockFrom
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            single: jest.fn().mockResolvedValue({ data: mockProfile, error: null }),
                        }),
                    }),
                })
                .mockReturnValueOnce({
                    update: jest.fn().mockReturnValue({
                        eq: jest.fn().mockResolvedValue({ error: null }),
                    }),
                })
                .mockReturnValueOnce({
                    upsert: jest.fn().mockReturnValue({
                        select: jest.fn().mockReturnValue({
                            single: jest.fn().mockResolvedValue({ data: mockUpsertedData, error: null }),
                        }),
                    }),
                });

            const payload = {
                full_name: "John Doe",
                surname: "Doe",
                bio: "Updated bio",
                location: "Cape Town",
                nqf_level: 7,
            };

            const result = await upsertApplicantProfileByUserId("user-1", payload);
            expect(result).toEqual(mockUpsertedData);
        });
    });

    describe("uploadApplicantCV", () => {
        test("successfully uploads CV file", async () => {
            const mockFile = {
                originalname: "resume.pdf",
                buffer: Buffer.from("pdf content"),
                mimetype: "application/pdf",
            };
            const mockUploadResult = { path: "applicants/user-1/1234567890-resume.pdf" };

            // Correctly mock supabase.storage.from("cvs").upload()
            mockStorageFrom.mockReturnValue({
                upload: jest.fn().mockResolvedValue({ data: mockUploadResult, error: null }),
            });

            const result = await uploadApplicantCV("user-1", mockFile);
            expect(result).toBe(mockUploadResult.path);
            expect(mockStorageFrom).toHaveBeenCalledWith("cvs");
        });

        test("throws error when no file provided", async () => {
            await expect(uploadApplicantCV("user-1", null)).rejects.toThrow("No file provided.");
        });

        test("handles filename with spaces", async () => {
            const mockFile = {
                originalname: "my resume.pdf",
                buffer: Buffer.from("pdf content"),
                mimetype: "application/pdf",
            };
            const mockUploadResult = { path: "applicants/user-1/1234567890-my_resume.pdf" };

            mockStorageFrom.mockReturnValue({
                upload: jest.fn().mockResolvedValue({ data: mockUploadResult, error: null }),
            });

            const result = await uploadApplicantCV("user-1", mockFile);
            expect(result).toContain("my_resume.pdf");
        });
    });

    describe("saveApplicantCVPath", () => {
        test("successfully saves CV path", async () => {
            const mockProfile = { id: "profile-1" };
            const mockUpsertedData = {
                id: "applicant-1",
                profile_id: "profile-1",
                cv_url: "applicants/user-1/cv.pdf",
            };

            mockFrom
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            single: jest.fn().mockResolvedValue({ data: mockProfile, error: null }),
                        }),
                    }),
                })
                .mockReturnValueOnce({
                    upsert: jest.fn().mockReturnValue({
                        select: jest.fn().mockReturnValue({
                            single: jest.fn().mockResolvedValue({ data: mockUpsertedData, error: null }),
                        }),
                    }),
                });

            const result = await saveApplicantCVPath("user-1", "applicants/user-1/cv.pdf");
            expect(result).toEqual(mockUpsertedData);
        });
    });

    describe("deleteApplicantCVIfExists", () => {
        test("successfully deletes existing CV", async () => {
            const mockProfile = { id: "profile-1" };
            const mockApplicantProfile = { cv_url: "applicants/user-1/cv.pdf" };

            mockFrom
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            single: jest.fn().mockResolvedValue({ data: mockProfile, error: null }),
                        }),
                    }),
                })
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            maybeSingle: jest.fn().mockResolvedValue({ data: mockApplicantProfile, error: null }),
                        }),
                    }),
                });

            mockStorageFrom.mockReturnValue({
                remove: jest.fn().mockResolvedValue({ error: null }),
            });

            const result = await deleteApplicantCVIfExists("user-1");
            expect(result).toBe("applicants/user-1/cv.pdf");
        });

        test("returns null when no CV exists", async () => {
            const mockProfile = { id: "profile-1" };
            const mockApplicantProfile = { cv_url: null };

            mockFrom
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            single: jest.fn().mockResolvedValue({ data: mockProfile, error: null }),
                        }),
                    }),
                })
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            maybeSingle: jest.fn().mockResolvedValue({ data: mockApplicantProfile, error: null }),
                        }),
                    }),
                });

            const result = await deleteApplicantCVIfExists("user-1");
            expect(result).toBeNull();
        });
    });

    describe("getApplicantCVSignedUrl", () => {
        test("successfully gets signed URL", async () => {
            const mockSignedUrl = "https://signed-url.com/cv.pdf";

            mockStorageFrom.mockReturnValue({
                createSignedUrl: jest.fn().mockResolvedValue({ data: { signedUrl: mockSignedUrl }, error: null }),
            });

            const result = await getApplicantCVSignedUrl("cv/path.pdf");
            expect(result).toBe(mockSignedUrl);
        });
    });

    describe("addApplicantQualificationByUserId", () => {
        test("successfully adds qualification with qualification_id", async () => {
            const mockProfile = { id: "profile-1" };
            const mockApplicantProfile = { id: "applicant-1" };
            const mockInsertedData = {
                id: "qual-1",
                applicant_id: "applicant-1",
                qualification_id: "q1",
                status: "completed",
                originator: "University",
                date_obtained: "2023-01-01",
            };

            mockFrom
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            single: jest.fn().mockResolvedValue({ data: mockProfile, error: null }),
                        }),
                    }),
                })
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            single: jest.fn().mockResolvedValue({ data: mockApplicantProfile, error: null }),
                        }),
                    }),
                })
                .mockReturnValueOnce({
                    insert: jest.fn().mockReturnValue({
                        select: jest.fn().mockReturnValue({
                            single: jest.fn().mockResolvedValue({ data: mockInsertedData, error: null }),
                        }),
                    }),
                });

            const payload = {
                qualification_id: "q1",
                status: "completed",
                originator: "University",
                date_obtained: "2023-01-01",
            };

            const result = await addApplicantQualificationByUserId("user-1", payload);
            expect(result).toEqual(mockInsertedData);
        });

        test("successfully adds custom qualification", async () => {
            const mockProfile = { id: "profile-1" };
            const mockApplicantProfile = { id: "applicant-1" };
            const mockInsertedData = {
                id: "qual-1",
                applicant_id: "applicant-1",
                qualification_id: null,
                qualification_name: "Custom Certificate",
                nqf_level: 5,
                field: "Engineering",
                subfield: "Mechanical",
                status: "completed",
                originator: "Custom Institute",
                date_obtained: "2023-01-01",
            };

            mockFrom
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            single: jest.fn().mockResolvedValue({ data: mockProfile, error: null }),
                        }),
                    }),
                })
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            single: jest.fn().mockResolvedValue({ data: mockApplicantProfile, error: null }),
                        }),
                    }),
                })
                .mockReturnValueOnce({
                    insert: jest.fn().mockReturnValue({
                        select: jest.fn().mockReturnValue({
                            single: jest.fn().mockResolvedValue({ data: mockInsertedData, error: null }),
                        }),
                    }),
                });

            const payload = {
                custom_name: "Custom Certificate",
                custom_nqf_level: 5,
                custom_field: "Engineering",
                custom_subfield: "Mechanical",
                status: "completed",
                originator: "Custom Institute",
                date_obtained: "2023-01-01",
            };

            const result = await addApplicantQualificationByUserId("user-1", payload);
            expect(result).toEqual(mockInsertedData);
        });
    });

    describe("getApplicantProfileByProfileId", () => {
        test("returns applicant profile by profile ID", async () => {
            const mockApplicantProfile = {
                id: "applicant-1",
                name: "John",
                surname: "Doe",
                bio: "Developer",
                location: "Cape Town",
                nqf_level: 7,
                cv_url: "cv/path.pdf",
                profiles: {
                    id: "profile-1",
                    full_name: "John Doe",
                    email: "john@example.com",
                    role: "applicant",
                },
            };
            const mockQualifications = [
                {
                    id: "qual-1",
                    qualification_id: "q1",
                    qualification_name: null,
                    nqf_level: null,
                    field: null,
                    subfield: null,
                    status: "completed",
                    originator: "University",
                    date_obtained: "2023-01-01",
                    qualifications: {
                        title: "Computer Science Degree",
                        nqf_level: 7,
                        field: "IT",
                        subfield: "Software Development",
                    },
                },
            ];

            mockFrom
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            single: jest.fn().mockResolvedValue({ data: mockApplicantProfile, error: null }),
                        }),
                    }),
                })
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValue({
                        eq: jest.fn().mockResolvedValue({ data: mockQualifications, error: null }),
                    }),
                });

            const result = await getApplicantProfileByProfileId("applicant-1");
            expect(result).toEqual({
                applicant_profile_id: "applicant-1",
                full_name: "John Doe",
                surname: "Doe",
                email: "john@example.com",
                role: "applicant",
                bio: "Developer",
                location: "Cape Town",
                nqf_level: 7,
                cv_url: "cv/path.pdf",
                qualifications: [
                    {
                        id: "qual-1",
                        qualification_id: "q1",
                        title: "Computer Science Degree",
                        nqf_level: 7,
                        field: "IT",
                        subfield: "Software Development",
                        status: "completed",
                        originator: "University",
                        date_obtained: "2023-01-01",
                    },
                ],
            });
        });

        test("handles profile without qualifications", async () => {
            const mockApplicantProfile = {
                id: "applicant-1",
                name: "Jane",
                surname: "Smith",
                bio: "Designer",
                location: "Johannesburg",
                nqf_level: 6,
                cv_url: null,
                profiles: {
                    id: "profile-1",
                    full_name: "Jane Smith",
                    email: "jane@example.com",
                    role: "applicant",
                },
            };

            mockFrom
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            single: jest.fn().mockResolvedValue({ data: mockApplicantProfile, error: null }),
                        }),
                    }),
                })
                .mockReturnValueOnce({
                    select: jest.fn().mockReturnValue({
                        eq: jest.fn().mockResolvedValue({ data: [], error: null }),
                    }),
                });

            const result = await getApplicantProfileByProfileId("applicant-1");
            expect(result.qualifications).toEqual([]);
        });
    });
});