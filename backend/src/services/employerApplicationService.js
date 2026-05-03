import { supabase } from "../config/supabaseClient.js";

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

export async function updateApplicationStatus(applicationId, newStatus, providerProfileId) {
    const validStatuses = ['shortlisted', 'rejected'];
    if (!validStatuses.includes(newStatus)) {
        throw new Error(`Invalid status. Must be: ${validStatuses.join(', ')}`);
    }
    
    // Verify provider owns this application's opportunity
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
    
    if (application.opportunities.provider_id !== providerProfileId) {
        throw new Error('Unauthorized: You do not own this opportunity');
    }
    
    // Update status
    const { data: updated, error: updateError } = await supabase
        .from('applications')
        .update({ status: newStatus })
        .eq('id', applicationId)
        .select()
        .single();
    
    if (updateError) throw updateError;
    
    return {
        applicationId: updated.id,
        status: updated.status
    };
}