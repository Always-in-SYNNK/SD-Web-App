import { jest } from "@jest/globals";

const mockAdminService = {
  createApplication: jest.fn(),
  getMyApplicationStatus: jest.fn(),
  fetchApplications: jest.fn(),
  approveApplication: jest.fn(),
  rejectApplication: jest.fn(),
};

jest.unstable_mockModule("../src/services/adminService.js", () => mockAdminService);

const {
  applyForAdmin,
  getMyAdminApplicationStatus,
  getAdminApplications,
  approveApplication,
  rejectApplication,
} = await import("../src/controllers/adminController.js");

const adminService = mockAdminService;

const mockRes = () => {
  const res = {};
  res.json = jest.fn();
  res.status = jest.fn(() => res);
  return res;
};

describe("adminController", () => {
  afterEach(() => jest.clearAllMocks());

  test("applyForAdmin success", async () => {
    const req = { user: { profileId: "123" } };
    const res = mockRes();

    await applyForAdmin(req, res);

    expect(adminService.createApplication).toHaveBeenCalledWith("123");
    expect(res.json).toHaveBeenCalledWith({ message: "Application submitted" });
  });

  test("applyForAdmin failure", async () => {
    adminService.createApplication.mockRejectedValue(new Error("fail"));

    const req = { user: { profileId: "123" } };
    const res = mockRes();

    await applyForAdmin(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  test("getMyAdminApplicationStatus", async () => {
    adminService.getMyApplicationStatus.mockResolvedValue({ status: "pending" });

    const req = { user: { profileId: "123" } };
    const res = mockRes();

    await getMyAdminApplicationStatus(req, res);

    expect(res.json).toHaveBeenCalledWith({
      exists: true,
      status: "pending",
      application: { status: "pending" },
    });
  });

  test("getAdminApplications", async () => {
    adminService.fetchApplications.mockResolvedValue([]);

    const req = {};
    const res = mockRes();

    await getAdminApplications(req, res);

    expect(res.json).toHaveBeenCalledWith([]);
  });

  test("approveApplication", async () => {
    const req = { params: { id: "abc" } };
    const res = mockRes();

    await approveApplication(req, res);

    expect(adminService.approveApplication).toHaveBeenCalledWith("abc");
    expect(res.json).toHaveBeenCalledWith({ message: "Approved" });
  });

  test("rejectApplication", async () => {
    const req = { params: { id: "abc" } };
    const res = mockRes();

    await rejectApplication(req, res);

    expect(adminService.rejectApplication).toHaveBeenCalledWith("abc");
    expect(res.json).toHaveBeenCalledWith({ message: "Rejected" });
  });
});