// ============================================
// APPLICATION SERVICE
// This file contains the brain/logic of our feature
// It decides: "Can this employer see these applications?"
//            "Can they shortlist this person?"
// ============================================

import { supabase } from "../config/supabaseClient.js";

/**
 * Get all applications for a specific job posting
 * 
 * HOW IT WORKS:
 * 1. Check if the employer actually owns this job (security)
 * 2. If yes, fetch all applications with applicant details
 * 3. If no, throw error "You don't own this"
 * 
 * @param {string} opportunityId - The job posting ID
 * @param {string} providerProfileId - The employer's profile ID
 */
export async function getApplicationsByOpportunity(opportunityId, providerProfileId) {
    console.log(`[AppService] Fetching applications for job: ${opportunityId}`);

    // STEP 1: VERIFY OWNERSHIP
    // So Employer A can't see Employer B's applications
    // Real world: You can't open someone else's mail
    const { data: opportunity, error: oppError } = await supabase
        .from('opportunities')
        .select('provider_id')
        .eq('id', opportunityId)
        .single();

    if (oppError || !opportunity) {
        throw new Error('Job posting not found');
    }

    // If the logged-in employer doesn't own this job, reject
    if (opportunity.provider_id !== providerProfileId) {
        throw new Error('Unauthorized: This is not your job posting');
    }

    // STEP 2: FETCH APPLICATIONS
    // Get all applications with the applicant's full profile
    // The '!inner' means only get applications that have matching applicant data

    const { data: applications, error: appError } = await supabase
        .from('applications')
        .select(`
            id,
            status,
            cover_letter,
            cv_url,
            applied_at,
            updated_at,
            applicant_profiles!inner (
                id,
                bio,
                location,
                nqf_level,
                cv_url,
                phone_number,
                skills,
                profile_id,
                profiles!inner (
                    id,
                    full_name,
                    email,
                    avatar_url
                )
            )
        `)
        .eq('opportunity_id', opportunityId)
        .order('applied_at', { ascending: false });  // Newest first

    if (appError) {
        throw appError;
    }

    // STEP 3: FORMAT DATA FOR FRONTEND
    // The database returns nested data. We flatten it for easier use in React
    const formattedApplications = applications.map(app => ({
        applicationId: app.id,
        status: app.status,
        coverLetter: app.cover_letter,
        cvUrl: app.cv_url || app.applicant_profiles.cv_url,
        appliedAt: app.applied_at,
        updatedAt: app.updated_at,
        applicant: {
            id: app.applicant_profiles.profile_id,
            name: app.applicant_profiles.profiles.full_name,
            email: app.applicant_profiles.profiles.email,
            avatar: app.applicant_profiles.profiles.avatar_url,
            bio: app.applicant_profiles.bio,
            location: app.applicant_profiles.location,
            nqfLevel: app.applicant_profiles.nqf_level,
            skills: app.applicant_profiles.skills || [],    //We need to go into applicant_skills for this
            phoneNumber: app.applicant_profiles.phone_number
        }
    }));

    return formattedApplications;
}

/**
 * Update application status (Shortlist or Reject)
 * 
 * HOW IT WORKS:
 * 1. Find the application
 * 2. Check if the employer owns the job (security)
 * 3. Update the status in database
 * 
 * @param {string} applicationId - The application ID
 * @param {string} newStatus - 'shortlisted' or 'rejected'
 * @param {string} providerProfileId - The employer's profile ID
 */
export async function updateApplicationStatus(applicationId, newStatus, providerProfileId) {
    console.log(`[AppService] Updating application ${applicationId} to: ${newStatus}`);

    // Only allow valid statuses
    const validStatuses = ['shortlisted', 'rejected'];
    if (!validStatuses.includes(newStatus)) {
        throw new Error(`Invalid status. Must be 'shortlisted' or 'rejected'`);
    }

    // STEP 1: FIND THE APPLICATION
    const { data: application, error: appError } = await supabase
        .from('applications')
        .select(`
            id,
            applicant_id,
            status,
            opportunity_id,
            opportunities!inner (
                provider_id
            )
        `)
        .eq('id', applicationId)
        .single();

    if (appError || !application) {
        throw new Error('Application not found');
    }

    // STEP 2: VERIFY OWNERSHIP
    // The employer must own the job this application is for
    if (application.opportunities.provider_id !== providerProfileId) {
        throw new Error('Unauthorized: This is not your job posting');
    }

    // STEP 3: UPDATE THE STATUS
    const { data: updated, error: updateError } = await supabase
        .from('applications')
        .update({
            status: newStatus,
            updated_at: new Date().toISOString()
        })
        .eq('id', applicationId)
        .select()
        .single();

    if (updateError) throw updateError;
    
    // STEP 4: Create Notification
    try {
        await notifyApplicationStatusChange(application.applicant_id, applicationId, application.opportunity_id, newStatus);
    } catch (notificationError) {
        console.error("Failed to create notification:", notificationError);
    }


    return {
        applicationId: updated.id,
        status: updated.status,
        updatedAt: updated.updated_at
    };
}