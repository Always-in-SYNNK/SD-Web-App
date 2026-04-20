import {
  getApplicationsByOpportunity,
  updateApplicationStatus
} from '../services/employerApplicationService.js';

export async function fetchApplicationsByOpportunity(req, res) {
  try {
    const { opportunityId } = req.params;
    const providerProfileId = req.user?.profileId;

    if (!opportunityId) {
      return res.status(400).json({
        success: false,
        error: 'Opportunity ID is required'
      });
    }

    if (!providerProfileId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Provider not authenticated'
      });
    }

    const applications = await getApplicationsByOpportunity(
      opportunityId,
      providerProfileId
    );

    res.json({
      success: true,
      data: applications,
      count: applications.length
    });

  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      error: error.message || 'Failed to fetch applications'
    });
  }
}

export async function patchApplicationStatus(req, res) {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;
    const providerProfileId = req.user?.profileId;

    if (!applicationId) {
      return res.status(400).json({
        success: false,
        error: 'Application ID is required'
      });
    }

    if (!providerProfileId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Provider not authenticated'
      });
    }

    if (!["shortlisted", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Status must be 'shortlisted' or 'rejected'"
      });
    }

    const updated = await updateApplicationStatus(
      applicationId,
      status,
      providerProfileId
    );

    res.json({
      success: true,
      message:
        status === 'shortlisted'
          ? 'Applicant shortlisted'
          : 'Applicant rejected',
      data: updated
    });

  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      error: error.message || 'Failed to update application'
    });
  }
}