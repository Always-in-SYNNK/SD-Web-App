import { supabase } from "../config/supabaseClient.js";

export async function getNotificationsByUserId(userId) {
    const { data: notifications, error } = await supabase
        .from("applicant_notifications")
        .select("id, type, title, message, is_read, created_at, application_id, opportunity_id")
        .eq("applicant_id", userId)
        .order("created_at", { ascending: false });

    if (error) throw error;

    return notifications || [];
}

export async function readNotification(notificationId, userId) {
    const { data, error } = await supabase
        .from("applicant_notifications")
        .update({ is_read: true })
        .eq("id", notificationId)
        .eq("applicant_id", userId)
        .select()
        .maybeSingle();

    if (error) throw error;
    if (!data) {
        throw new Error(`Notification ${notificationId} not found for applicant ${userId}`);
    }

    return data;
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

    return data;
}

/**
 * Trigger this when an application status changes.
 * applicantId here should match applicant_notifications.applicant_id
 */
export async function notifyApplicationStatusChange({
    applicantId,
    applicationId,
    opportunityId = null,
    newStatus,
}) {
    const normalized = String(newStatus).toLowerCase();

    const titleMap = {
        received: "Application received",
        applied: "Application received",
        shortlisted: "You were shortlisted",
        rejected: "Application update",
        offered: "Offer received",
        accepted: "Offer accepted",
    };

    const messageMap = {
        received: "Your application has been received and is under review.",
        applied: "Your application has been received and is under review.",
        shortlisted: "Good news — you have been shortlisted for this opportunity.",
        rejected: "Unfortunately, your application was not successful.",
        offered: "Congratulations — you have received an offer.",
        accepted: "Your acceptance has been recorded.",
    };

    return createNotification({
        applicantId,
        type: "application_status_change",
        title: titleMap[normalized] || "Application status updated",
        message: messageMap[normalized] || `Your application status changed to ${newStatus}.`,
        applicationId,
        opportunityId,
    });
}

/**
 * Creates notifications for opportunities closing soon.
 * Default: opportunities closing in the next 3 days.
 *
 * Assumes:
 * - applications table has applicant_id and opportunity_id
 * - opportunities table has id, title, closing_date, status
 */
export async function triggerUpcomingClosingDateNotifications(daysAhead = 3) {
    const today = new Date();
    const endDate = new Date();
    endDate.setDate(today.getDate() + daysAhead);

    const start = today.toISOString().slice(0, 10);
    const end = endDate.toISOString().slice(0, 10);

    // Get applications joined to opportunities that are closing soon
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
        (row) =>
            row.opportunities &&
            row.opportunities.status !== "closed"
    );

    const created = [];

    for (const row of validRows) {
        const closingDate = row.opportunities.closing_date;
        const title = row.opportunities.title;

        // Basic duplicate guard:
        // don't recreate the same reminder for same applicant + opportunity + type
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
            message: `"${title}" is closing on ${closingDate}.`,
            applicationId: row.id,
            opportunityId: row.opportunity_id,
        });

        created.push(notification);
    }

    return created;
}