import {
  applyToOpportunity,
  deleteApplicationForUser,
  getApplicationsForUser,
} from "../services/applicationService.js";

export async function apply(req, res, next) {
  try {
    const userId = req.user.id; // comes from auth middleware
    const { opportunityId } = req.body;

    const result = await applyToOpportunity({
      userId,
      opportunityId,
    });

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (err) {
        if (err.message === "Already applied to this opportunity") {
            return res.status(400).json({ error: err.message });
        }
        return res.status(500).json({ error: err.message });
        }
}

export async function getMyApplications(req, res, next) {
  try {
    const userId = req.user.id;

    const applications = await getApplicationsForUser(userId);

    res.status(200).json({
      success: true,
      data: applications,
    });
  } catch (err) {
    next(err); // use your improved error handling
  }
}

export async function unapply(req, res) {
  try {
    const userId = req.user.id;
    const { id: applicationId } = req.params;

    await deleteApplicationForUser({ userId, applicationId });

    return res.status(200).json({ success: true });
  } catch (err) {
    if (err.message === "Application not found") {
      return res.status(404).json({ error: err.message });
    }

    return res.status(500).json({ error: err.message });
  }
}