import { supabase } from "../config/supabaseClient.js";
import { sendEmailNotification } from "./emailService.js";

export async function getNotificationsByUserId(userId) {
    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", userId)
        .single();

    if (profileError) throw profileError;

    const { data: applicantProfile, error: applicantError } = await supabase
        .from("applicant_profiles")
        .select("id")
        .eq("profile_id", profile.id)
        .single();

    if (applicantError) throw applicantError;

    const { data: notifications, error } = await supabase
        .from("applicant_notifications")
        .select("id, type, title, message, is_read, created_at, application_id, opportunity_id")
        .eq("applicant_id", applicantProfile.id)
        .order("created_at", { ascending: false });

    if (error) throw error;

    return notifications || [];
}

export async function readNotification(notificationId, userId) {
    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", userId)
        .single();

    if (profileError) throw profileError;

    const { data: applicantProfile, error: applicantError } = await supabase
        .from("applicant_profiles")
        .select("id")
        .eq("profile_id", profile.id)
        .single();

    if (applicantError) throw applicantError;

    const { data, error } = await supabase
        .from("applicant_notifications")
        .update({ is_read: true })
        .eq("id", notificationId)
        .eq("applicant_id", applicantProfile.id)
        .select()
        .maybeSingle();

    if (error) throw error;
    if (!data) {
        throw new Error(`Notification ${notificationId} not found for applicant ${userId}`);
    }

    return data;
}

async function getOpportunityTitle(opportunityId) {
    if (!opportunityId) return null;
    
    const { data, error } = await supabase
        .from("opportunities")
        .select("title")
        .eq("id", opportunityId)
        .single();
    
    if (error) return null;
    return data?.title;
}

export async function createNotification({
    applicantId,
    type,
    title,
    message,
    applicationId = null,
    opportunityId = null,
}) {
    const { data, error } = await supabase
        .from("applicant_notifications")
        .insert({
            applicant_id: applicantId,
            type,
            title,
            message,
            is_read: false,
            application_id: applicationId,
            opportunity_id: opportunityId,
        })
        .select()
        .single();

    if (error) throw error;

    try {
        const { data: applicantProfile } = await supabase
            .from("applicant_profiles")
            .select("profile_id")
            .eq("id", applicantId)
            .single();

        if (applicantProfile) {
            const { data: profile } = await supabase
                .from("profiles")
                .select("email, full_name")
                .eq("id", applicantProfile.profile_id)
                .single();

            if (profile && profile.email) {
                const opportunityTitle = await getOpportunityTitle(opportunityId);
                
                let emailMessage = message;
                if (opportunityTitle) {
                    emailMessage = message;
                }
                
                await sendEmailNotification({
                    to: profile.email,
                    name: profile.full_name,
                    type: type,
                    title: title,
                    message: emailMessage,
                    metadata: { application_id: applicationId, opportunity_id: opportunityId, opportunity_title: opportunityTitle }
                });
            }
        }
    } catch (emailError) {
        console.error("Failed to send email notification:", emailError);
    }

    return data;
}

export async function notifyApplicationStatusChange({
    applicantId,
    applicationId,
    opportunityId = null,
    newStatus,
}) {
    const normalized = String(newStatus).toLowerCase();
    
    let opportunityTitle = null;
    if (opportunityId) {
        const { data } = await supabase
            .from("opportunities")
            .select("title")
            .eq("id", opportunityId)
            .single();
        opportunityTitle = data?.title;
    }

    const titleMap = {
        received: "Application received",
        applied: "Application received",
        shortlisted: "You were shortlisted",
        rejected: "Application update",
        offered: "Job Offer Received",
        accepted: "Offer Accepted",
    };

    const messageMap = {
        received: `Your application for "${opportunityTitle || "the position"}" has been received and is under review.`,
        applied: `Your application for "${opportunityTitle || "the position"}" has been received and is under review.`,
        shortlisted: `Good news! You have been shortlisted for "${opportunityTitle || "the position"}".`,
        rejected: `Your application for "${opportunityTitle || "the position"}" was not successful. Keep applying!`,
        offered: `Congratulations! You have received a job offer for "${opportunityTitle || "the position"}". Please review and respond.`,
        accepted: `Your acceptance for "${opportunityTitle || "the position"}" has been recorded. The employer will contact you.`,
    };

    const title = titleMap[normalized] || "Application status updated";
    const message = messageMap[normalized] || `Your application status changed to ${newStatus}.`;

    return createNotification({
        applicantId,
        type: "application_status_change",
        title: title,
        message: message,
        applicationId,
        opportunityId,
    });
}

export async function triggerUpcomingClosingDateNotifications(daysAhead = 3) {
    const today = new Date();
    const endDate = new Date();
    endDate.setDate(today.getDate() + daysAhead);

    const start = today.toISOString().slice(0, 10);
    const end = endDate.toISOString().slice(0, 10);

    const { data: rows, error } = await supabase
        .from("applications")
        .select(`
            id,
            applicant_id,
            opportunity_id,
            opportunities (
                id,
                title,
                closing_date,
                status
            )
        `)
        .gte("opportunities.closing_date", start)
        .lte("opportunities.closing_date", end);

    if (error) throw error;

    const validRows = (rows || []).filter(
        (row) => row.opportunities && row.opportunities.status !== "closed"
    );

    const created = [];

    for (const row of validRows) {
        const closingDate = row.opportunities.closing_date;
        const title = row.opportunities.title;

        const { data: existing, error: existingError } = await supabase
            .from("applicant_notifications")
            .select("id")
            .eq("applicant_id", row.applicant_id)
            .eq("opportunity_id", row.opportunity_id)
            .eq("type", "upcoming_closing_date")
            .maybeSingle();

        if (existingError) throw existingError;
        if (existing) continue;

        const notification = await createNotification({
            applicantId: row.applicant_id,
            type: "upcoming_closing_date",
            title: "Opportunity closing soon",
            message: `"${title}" is closing on ${closingDate}. Apply now!`,
            applicationId: row.id,
            opportunityId: row.opportunity_id,
        });

        created.push(notification);
    }

    return created;
}