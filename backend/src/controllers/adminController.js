import * as adminService from "../services/adminService.js";

export const applyForAdmin = async (req, res) => {
  try {
    const profileId = req.user.profileId;

    await adminService.createApplication(profileId);

    res.json({ message: "Application submitted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getMyAdminApplicationStatus = async (req, res) => {
  try {
    const profileId = req.user.profileId;
    const application = await adminService.getMyApplicationStatus(profileId);

    res.json({
      exists: Boolean(application),
      status: application?.status || null,
      application,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAdminApplications = async (req, res) => {
  try {
    const data = await adminService.fetchApplications();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const approveApplication = async (req, res) => {
  try {
    const { id } = req.params;

    await adminService.approveApplication(id);

    res.json({ message: "Approved" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const rejectApplication = async (req, res) => {
  try {
    const { id } = req.params;

    await adminService.rejectApplication(id);

    res.json({ message: "Rejected" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};