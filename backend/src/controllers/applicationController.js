import { applyToOpportunity } from "../services/applicationService.js";

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
    return res.status(401).json({ error: err.message || "Failed to apply to opportunity" });
  }
}