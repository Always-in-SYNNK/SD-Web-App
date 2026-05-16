import { Router } from 'express';
import { supabase } from '../config/supabaseClient.js';
import providerAuthMiddleware from '../middleware/providerAuthMiddleware.js';
import {
  fetchApplicantCvSignedUrl,
  fetchApplicantDetails,
} from '../controllers/employerApplicationController.js';
import { notifyApplicationStatusChange } from "../services/notificationService.js";


const router = Router();

export async function getApplicationsForOpportunityHandler(req, res) {
  try {
    const { opportunityId } = req.params;

    if (!opportunityId) {
      return res.status(400).json({ success: false, error: 'Opportunity ID required' });
    }

    // Get applications with applicant details
    const { data: applications, error } = await supabase
      .from('applications')
      .select(`
        id,
        status,
        created_at,
        match_score,
        applicant_profiles!inner (
          id,
          surname,
          bio,
          location,
          nqf_level,
          cv_url,
          profile_id,
          profiles!inner (
            id,
            full_name,
            email
          )
        )
      `)
      .eq('opportunity_id', opportunityId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const formattedApplications = (applications || []).map(app => ({
      applicationId: app.id,
      status: app.status,
      appliedAt: app.created_at,
      matchScore: app.match_score,
      applicant: {
        id: app.applicant_profiles.profile_id,
        applicantProfileId: app.applicant_profiles.id,
        name: app.applicant_profiles.profiles.full_name,
        surname: app.applicant_profiles.surname,
        email: app.applicant_profiles.profiles.email,
        bio: app.applicant_profiles.bio,
        location: app.applicant_profiles.location,
        nqfLevel: app.applicant_profiles.nqf_level,
        cvUrl: app.applicant_profiles.cv_url
      }
    }));

    return res.json({ success: true, data: formattedApplications, count: formattedApplications.length });

  } catch (error) {
    console.error('Error fetching applications:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function updateApplicationStatusHandler(req, res) {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;

    if (!applicationId) {
      return res.status(400).json({ success: false, error: 'Application ID required' });
    }

    // Employer actions should only move an application to shortlist, reject, or offer.
    const validStatuses = ['shortlisted', 'rejected', 'offered'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        error: `Valid status required. Allowed: ${validStatuses.join(', ')}` 
      });
    }

    console.log(`📝 Updating application ${applicationId} to status: ${status}`);


     // Get the OLD status before updating (for notification)
    const { data: oldApplication, error: fetchError } = await supabase
      .from('applications')
      .select('status, applicant_id, opportunity_id')
      .eq('id', applicationId)
      .single();

    if (fetchError) {
      console.error('Error fetching old status:', fetchError);
    }

    const { data, error } = await supabase
      .from('applications')
      .update({ status })
      .eq('id', applicationId)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ success: false, error: error.message });
    }

       //TRIGGER NOTIFICATION TO APPLICANT (only if status actually changed)
    if (oldApplication && oldApplication.status !== status) {
      try {
        // Get the applicant's profile ID
        const { data: applicantProfile } = await supabase
          .from('applicant_profiles')
          .select('id')
          .eq('id', oldApplication.applicant_id)
          .single();

        if (applicantProfile) {
          await notifyApplicationStatusChange({
            applicantId: applicantProfile.id,
            applicationId: applicationId,
            opportunityId: oldApplication.opportunity_id,
            newStatus: status
          });
          console.log(`✅ Notification sent to applicant for status change to: ${status}`);
        }
      } catch (notifyError) {
        // Don't let notification failure break the main flow
        console.error('Notification error:', notifyError);
      }
    }

    const message = status === 'shortlisted' ? 'Candidate shortlisted successfully' :
            status === 'offered' ? 'Offer sent successfully' :
            'Candidate rejected successfully';

    return res.json({ success: true, message, data });

  } catch (error) {
    console.error('Error updating application:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

// All routes require provider authentication
router.use(providerAuthMiddleware);

// GET /api/employer/applications/:applicationId/details
router.get('/:applicationId/details', fetchApplicantDetails);

// GET /api/employer/applications/opportunity/:opportunityId
router.get('/opportunity/:opportunityId', getApplicationsForOpportunityHandler);

// GET /api/employer/applications/:applicationId/cv/signed-url
router.get('/:applicationId/cv/signed-url', fetchApplicantCvSignedUrl);

// PATCH /api/employer/applications/:applicationId
router.patch('/:applicationId', updateApplicationStatusHandler);

export default router;
