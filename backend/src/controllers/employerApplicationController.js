import {
  getApplicationsByOpportunity,
  getApplicantDetailsForApplication,
  updateApplicationStatus
} from '../services/employerApplicationService.js';
import { supabase } from '../config/supabaseClient.js';
import { getApplicantCVSignedUrl } from '../services/profileService.js';

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

export async function fetchApplicantDetails(req, res) {
  try {
    const { applicationId } = req.params;
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

    const details = await getApplicantDetailsForApplication(
      applicationId,
      providerProfileId
    );

    res.json({ success: true, ...details });
  } catch (error) {
    const status = error.message?.startsWith('Unauthorized')
      ? 403
      : error.message?.includes('not found')
        ? 404
        : 500;

    res.status(status).json({ success: false, error: error.message });
  }
}

export async function fetchApplicantCvSignedUrl(req, res) {
  try {
    const { applicationId } = req.params;
    const providerProfileId = req.user?.profileId;

    if (!applicationId) {
      return res.status(400).json({ success: false, error: 'Application ID required' });
    }

    if (!providerProfileId) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Provider not authenticated' });
    }

    const { data: application, error: appError } = await supabase
      .from('applications')
      .select(`
        id,
        opportunity_id,
        applicant_profiles!inner (
          cv_url
        ),
        opportunities!inner (
          provider_id
        )
      `)
      .eq('id', applicationId)
      .single();

    if (appError || !application) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }

    if (application.opportunities.provider_id !== providerProfileId) {
      return res.status(403).json({ success: false, error: 'Unauthorized: You do not own this opportunity' });
    }

    const cvPath = application.applicant_profiles?.cv_url;

    if (!cvPath) {
      return res.json({ success: true, signed_url: null });
    }

    const signedUrl = await getApplicantCVSignedUrl(cvPath);
    res.json({ success: true, signed_url: signedUrl });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch signed CV URL' });
  }
}