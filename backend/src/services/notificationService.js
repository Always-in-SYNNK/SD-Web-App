import { supabase } from "../config/supabaseClient.js";
import { sendEmailNotification } from "./emailService.js";

export async function getNotificationsByUserId(userId) {
  // 1. Get profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", userId)
    .single();

  if (profileError) {
    // 3. Then try provider
    const { data: providerProfile, error: providerError } = await supabase
      .from("provider_profiles")
      .select("id")
      .eq("profile_id", userId)
      .maybeSingle();

    if (providerError) throw providerError;
    if (!providerProfile) {
      // No applicant and no provider – user may be admin or incomplete
      return [];
    }

    const { data: notifications, error } = await supabase
      .from("provider_notifications")
      .select("id, type, title, message, is_read, created_at, application_id, opportunity_id")
      .eq("provider_id", providerProfile.id)   // ✅ fixed typo
      .order("created_at", { ascending: false });
    if (error) throw error;
    return notifications || [];
  }
  // 2. Try applicant first
  const { data: applicantProfile, error: applicantError } = await supabase
    .from("applicant_profiles")
    .select("id")
    .eq("profile_id", profile.id)
    .maybeSingle();
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

export async function createProviderNotification({
    providerId, type, title, message, applicationId, opportunityId,
}) {
    const { data, error } = await supabase
        .from("provider_notifications")
        .insert({
            provider_id: providerId,
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
        const { data: application } = await supabase
            .from("applications")
            .select("applicant_id")
            .eq("id", applicationId)
            .single();

        if (application) {
            console.log("createProviderNoti: application exists - ", application.applicant_id);
            const { data: applicant } = await supabase
                .from("applicant_profiles")
                .select("surname")
                .eq("id", application.applicant_id)
                .single();
            console.log("applicant_profile full name: ", applicant.full_name);
            const { data: provider } = await supabase
                .from("provider_profiles")
                .select("profile_id")
                .eq("id", providerId)
                .single();
            console.log("provider: ", provider);
            const { data: profile } = await supabase
                .from("profiles")
                .select("full_name, email")
                .eq("id", provider.profile_id)
                .single();
            console.log("profile: ", profile);
            if (profile && profile.email) {
                console.log("provider profile exists");
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
                    metadata: { provider_id: providerId, opportunity_id: opportunityId, opportunity_title: opportunityTitle }
                });
            }
        }
    } catch (emailError) {
        console.error("Failed to send email notification:", emailError);
    }

    return data;
}
export async function createNotification({
    applicantId,
    type,
    title,
    message,
    applicationId,
    opportunityId,
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
    opportunityTitle = null,
    newStatus,
}) {
    const normalized = String(newStatus).toLowerCase();

    const titleMap = {
        received: "Application received",
        applied: "Application received",
        shortlisted: "You were shortlisted",
        rejected: "Application update",
        offered: "Job Offer Received",
        accepted: "Offer Accepted",
    };

    const messageMap = {
        received: `Your application for "%s" has been received and is under review.`,
        applied: `Your application for "%s" has been received and is under review.`,
        shortlisted: `Good news! You have been shortlisted for "%s".`,
        rejected: `Your application for "%s" was not successful. Keep applying!`,
        offered: `Congratulations! You have received a job offer for "%s". Please review and respond.`,
        accepted: `Your acceptance for "%s" has been recorded. The employer will contact you.`,
    };

    // Get opportunity title - supports BOTH approaches
    let finalOpportunityTitle = null;

    // Method 1: Use passed title (YOUR approach - more efficient)
    if (opportunityTitle) {
        finalOpportunityTitle = opportunityTitle;
    }
    // Method 2: Fetch from database (TEAMMATE's approach - fallback)
    else if (opportunityId) {
        const { data: opportunityData, error: opportunityError } = await supabase
            .from("opportunities")
            .select("title")
            .eq("id", opportunityId)
            .single();

        if (!opportunityError && opportunityData) {
            finalOpportunityTitle = opportunityData.title;
        } else {
            console.error("Could not fetch opportunity title:", opportunityError);
        }
    }

    const title = titleMap[normalized] || "Application status updated";
    const messageTemplate = messageMap[normalized] || `Your application status changed to ${newStatus}.`;
    const message = finalOpportunityTitle
        ? messageTemplate.replace("%s", finalOpportunityTitle)
        : messageTemplate.replace("%s", "the position");

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

    //Getting the rows of applications that have upcoming closing date notifications
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

    //filtering out rows which are invalid (e.g. not sending a closing date noti for opportunities that have already closed)
    const validRows = (rows || []).filter(
        (row) => row.opportunities && row.opportunities.status !== "closed"
    );

    const created = [];

    //Getting rows relevant to the applicant and opportunity
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