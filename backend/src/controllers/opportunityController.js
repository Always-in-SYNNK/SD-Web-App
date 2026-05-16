import {
  getDistinctLocations,
  getDistinctFields,
  getDistinctNqfLevels,
  getFilteredOpportunitiesAndQualifications,
  createOpportunity,
  updateOpportunityForProvider,
  getOpportunityForProvider,
  getPending,
  getApproved,
  updateStatus,
  deleteOpportunityById,
  matchingOpportunity,
  getOpportunityById,
} from '../services/opportunityService.js';
import { notifyMatchingOpportunities } from '../services/reminderService.js';

export async function fetchLocations(req, res, next) {
  try {
    const locations = await getDistinctLocations();
    res.status(200).json({ success: true, data: locations });
  } catch (error) {
    next(error);
  }
}
export async function getMatchingOpportunities(req, res, next){
  try{
    const userId = req.user.id;
    //console.log("Matching opportunities controller User ID: ", userId)
    const matches = await matchingOpportunity(userId);
    res.status(200).json({
      success: true,
      count: matches.length,
      data: matches,
    })
  }catch(error){
    next(error);
  }
}
export async function fetchFields(req, res, next) {
  try {
    const fields = await getDistinctFields();
    res.status(200).json({ success: true, data: fields});
  } catch (error) {
    next(error);
  }
}

export async function fetchNqfLevels(req, res, next) {
  try {
    const nqfLevels = await getDistinctNqfLevels();
    res.status(200).json({ success: true, data: nqfLevels});
  } catch (error) {
    next(error);
  }
}

export async function fetchOpportunities(req, res, next) {
  try {
    const result = await getFilteredOpportunitiesAndQualifications({
      field: req.query.field,
      location: req.query.location,
      nqfLevel: req.query.nqfLevel,
      search: req.query.search,
      page: req.query.page,
      limit: req.query.limit,
    });

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
}

// ✅ UPDATED: publishOpportunity - NO notifications here
export async function publishOpportunity(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const data = req.body;

    const result = await createOpportunity({
      userId,
      data,
      status: "pending",
    });

    // ❌ REMOVED: await notifyAllApplicantsNewOpportunity(result.id, data.title);
    // Notifications will be sent by admin when opportunity is approved

    res.status(201).json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function saveDraft(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const data = req.body;

    const result = await createOpportunity({
      userId,
      data,
      status: "draft",
    });

    res.status(201).json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateOpportunity(req, res) {
  try {
    const providerId = req.user?.profileId;
    if (!providerId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { id } = req.params;
    const data = req.body;

    const result = await updateOpportunityForProvider({
      providerId,
      opportunityId: id,
      data,
    });

    res.status(200).json({ success: true, data: result });
  } catch (err) {
    if (err.message === "Opportunity not found") {
      return res.status(404).json({ error: err.message });
    }

    if (err.message === "Not authorized to update this opportunity") {
      return res.status(403).json({ error: err.message });
    }

    res.status(500).json({ error: err.message });
  }
}

export async function getOpportunity(req, res) {
  try {
    const providerId = req.user?.profileId;
    if (!providerId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { id } = req.params;
    const result = await getOpportunityForProvider({
      providerId,
      opportunityId: id,
    });

    res.status(200).json({ success: true, data: result });
  } catch (err) {
    if (err.message === "Opportunity not found") {
      return res.status(404).json({ error: err.message });
    }

    if (err.message === "Not authorized to view this opportunity") {
      return res.status(403).json({ error: err.message });
    }

    res.status(500).json({ error: err.message });
  }
}

export const getPendingOpportunities = async (req, res) => {
  try {
    const data = await getPending();
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getApprovedOpportunities = async (req, res) => {
  try {
    const data = await getApproved();
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ UPDATED: approveOpportunity - ADD notifications here
export const approveOpportunity = async (req, res) => {
  try {
    const { id } = req.params;

    // Update status to approved
    await updateStatus(id, "approved");

    // Get opportunity details for notification
    const opportunity = await getOpportunityById(id);
    
    // Treat missing opportunity as an error
    if (!opportunity) {
      return res.status(404).json({
        success: false,
        error: "Opportunity not found",
      });
    }

    // Send matchingOpportunity notifications to all applicants
     await notifyMatchingOpportunities();
    console.log(`✅ Notifications sent for approved opportunity: ${opportunity.title}`);

    res.status(200).json({
      success: true,
      data: { id, status: "approved", message: "Approved and notifications sent" },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const rejectOpportunity = async (req, res) => {
  try {
    const { id } = req.params;

    await updateStatus(id, "rejected");

    res.status(200).json({
      success: true,
      data: { id, status: "rejected", message: "Rejected" },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteOpportunity = async (req, res) => {
  try {
    const { id } = req.params;

    await deleteOpportunityById(id);

    res.status(200).json({
      success: true,
      data: { id, message: "Deleted" },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};