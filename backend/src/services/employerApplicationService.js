import { supabase } from "../config/supabaseClient.js";
import { getApplicantSkills } from "./skillsService.js";

export async function getApplicationsByOpportunity(opportunityId, providerProfileId) {
    // Verify provider owns this opportunity
    const { data: opportunity, error: oppError } = await supabase
        .from('opportunities')
        .select('provider_id')
        .eq('id', opportunityId)
        .single();
    
    if (oppError || !opportunity) {
        throw new Error('Opportunity not found');
    }
    
    if (opportunity.provider_id !== providerProfileId) {
        throw new Error('Unauthorized: You do not own this opportunity');
    }
    
    // Fetch applications with applicant details
    const { data: applications, error: appError } = await supabase
        .from('applications')
        .select(`
            id,
            status,
            created_at,
            match_score,
            applicant_profiles!inner (
                id,
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
    
    if (appError) throw appError;
    
    return applications.map(app => ({
        applicationId: app.id,
        status: app.status,
        appliedAt: app.created_at,
        matchScore: app.match_score,
        applicant: {
            id: app.applicant_profiles.profile_id,
            applicantProfileId: app.applicant_profiles.id,
            name: app.applicant_profiles.profiles.full_name,
            email: app.applicant_profiles.profiles.email,
            bio: app.applicant_profiles.bio,
            location: app.applicant_profiles.location,
            nqfLevel: app.applicant_profiles.nqf_level,
            cvUrl: app.applicant_profiles.cv_url
        }
    }));
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
    
    // Only allow valid statuses    
    const validStatuses = ['shortlisted', 'rejected'];
    if (!validStatuses.includes(newStatus)) {
        throw new Error(`Invalid status. Must be: ${validStatuses.join(', ')}`);
    }
    
    // STEP 1: FIND THE APPLICATION
    const { data: application, error: appError } = await supabase
        .from('applications')
        .select(`
            id,
            status,
            opportunity_id,
            opportunities!inner (provider_id)
        `)
        .eq('id', applicationId)
        .single();
    
    if (appError || !application) {
        throw new Error('Application not found');
    }

    // STEP 2: VERIFY OWNERSHIP
    // The employer must own the job this application is for
    if (application.opportunities.provider_id !== providerProfileId) {
        throw new Error('Unauthorized: You do not own this opportunity');
    }
    
    // STEP 3: UPDATE THE STATUS
    const { data: updated, error: updateError } = await supabase
        .from('applications')
        .update({ status: newStatus })
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

export async function getApplicantDetailsForApplication(applicationId, providerProfileId) {
    if (!applicationId) {
        throw new Error('Application ID is required');
    }

    if (!providerProfileId) {
        throw new Error('Unauthorized: Provider not authenticated');
    }

    const { data: application, error: applicationError } = await supabase
        .from('applications')
        .select(`
            id,
            applicant_profiles!inner (
                id,
                bio,
                location,
                nqf_level,
                cv_url,
                profiles!inner (
                    id,
                    full_name,
                    email,
                    role
                )
            ),
            opportunities!inner (
                provider_id
            )
        `)
        .eq('id', applicationId)
        .single();

    if (applicationError || !application) {
        throw new Error('Application not found');
    }

    if (application.opportunities.provider_id !== providerProfileId) {
        throw new Error('Unauthorized: You do not own this opportunity');
    }

    const applicantProfile = application.applicant_profiles;
    const { data: qualifications, error: qualificationsError } = await supabase
        .from('applicant_qualifications')
        .select(`
            id,
            qualification_id,
            qualification_name,
            nqf_level,
            field,
            subfield,
            status,
            originator,
            date_obtained,
            qualifications (
                title,
                nqf_level,
                field,
                subfield
            )
        `)
        .eq('applicant_id', applicantProfile.id);

    if (qualificationsError) {
        throw qualificationsError;
    }

    const normalizedQualifications = (qualifications || []).map((row) => ({
        id: row.id,
        qualification_id: row.qualification_id,
        title: row.qualification_id
            ? row.qualifications?.title
            : row.qualification_name,
        nqf_level: row.qualification_id
            ? row.qualifications?.nqf_level
            : row.nqf_level,
        field: row.qualification_id
            ? row.qualifications?.field
            : row.field,
        subfield: row.qualification_id
            ? row.qualifications?.subfield
            : row.subfield,
        status: row.status,
        originator: row.originator ?? null,
        date_obtained: row.date_obtained,
    }));

    const applicantSkills = await getApplicantSkills(applicantProfile.id);

    return {
        applicantProfileId: applicantProfile.id,
        applicant: {
            id: applicantProfile.profiles.id,
            name: applicantProfile.profiles.full_name,
            email: applicantProfile.profiles.email,
            role: applicantProfile.profiles.role,
            bio: applicantProfile.bio ?? '',
            location: applicantProfile.location ?? '',
            nqfLevel: applicantProfile.nqf_level ?? null,
            cvUrl: applicantProfile.cv_url ?? null,
        },
        applicantSkills,
        qualifications: normalizedQualifications,
    };
}