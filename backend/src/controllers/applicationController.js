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
        if (err.message === "Already applied to this opportunity") {
            return res.status(400).json({ error: err.message });
        }
        return res.status(500).json({ error: err.message });
        }
}