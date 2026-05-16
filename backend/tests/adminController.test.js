import { jest } from "@jest/globals";

const mockAdminService = {
  createApplication: jest.fn(),
  getMyApplicationStatus: jest.fn(),
  fetchApplications: jest.fn(),
  approveApplication: jest.fn(),
  rejectApplication: jest.fn(),
  getAdminStats: jest.fn(),
};

jest.unstable_mockModule("../src/services/adminService.js", () => mockAdminService);

const {
  applyForAdmin,
  getMyAdminApplicationStatus,
  getAdminApplications,
  approveApplication,
  rejectApplication,
  getAdminStats,
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

  test("getMyAdminApplicationStatus when no application exists", async () => {
    adminService.getMyApplicationStatus.mockResolvedValue(null);

    const req = { user: { profileId: "123" } };
    const res = mockRes();

    await getMyAdminApplicationStatus(req, res);

    expect(res.json).toHaveBeenCalledWith({
      exists: false,
      status: null,
      application: null,
    });
  });

  test("getAdminApplications", async () => {
    adminService.fetchApplications.mockResolvedValue([]);

    const req = {};
    const res = mockRes();

    await getAdminApplications(req, res);

    expect(res.json).toHaveBeenCalledWith([]);
  });

  test("getAdminApplications failure", async () => {
    adminService.fetchApplications.mockRejectedValue(
      new Error("Database error")
    );

    const req = {};
    const res = mockRes();

    await getAdminApplications(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
  });

  test("approveApplication", async () => {
    const req = { params: { id: "abc" } };
    const res = mockRes();

    await approveApplication(req, res);

    expect(adminService.approveApplication).toHaveBeenCalledWith("abc");
    expect(res.json).toHaveBeenCalledWith({ message: "Approved" });
  });

  test("approveApplication failure", async () => {
    adminService.approveApplication.mockRejectedValue(
      new Error("Approval failed")
    );

    const req = { params: { id: "abc" } };
    const res = mockRes();

    await approveApplication(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Approval failed" });
  });

  test("rejectApplication", async () => {
    const req = { params: { id: "abc" } };
    const res = mockRes();

    await rejectApplication(req, res);

    expect(adminService.rejectApplication).toHaveBeenCalledWith("abc");
    expect(res.json).toHaveBeenCalledWith({ message: "Rejected" });
  });

  test("rejectApplication failure", async () => {
    adminService.rejectApplication.mockRejectedValue(
      new Error("Rejection failed")
    );

    const req = { params: { id: "abc" } };
    const res = mockRes();

    await rejectApplication(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Rejection failed" });
  });

  test("getAdminStats success", async () => {
    adminService.getAdminStats.mockResolvedValue({
      approved: 10,
      pending: 2,
      rejected: 1,
      today: 3,
    });

    const req = {};
    const res = mockRes();

    await getAdminStats(req, res);

    expect(adminService.getAdminStats).toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: {
        approved: 10,
        pending: 2,
        rejected: 1,
        today: 3,
      },
    });
  });

  test("getAdminStats failure", async () => {
    adminService.getAdminStats.mockRejectedValue(
      new Error("Stats failed")
    );

    const req = {};
    const res = mockRes();

    await getAdminStats(req, res);

    expect(res.status).toHaveBeenCalledWith(500);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Stats failed",
    });
  });
});