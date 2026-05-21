// backend/src/services/reminderService.js
import { supabase } from "../config/supabaseClient.js";
import { createNotification } from "./notificationService.js";
import { sendEmailNotification } from "./emailService.js";
import { matchingOpportunity } from "./opportunityService.js";

async function sendReminderToApplicant(applicantId, opportunityId, applicationId, title, message, type) {
    try {
        const { data: applicantProfile } = await supabase
            .from("applicant_profiles")
            .select("profile_id")
            .eq("id", applicantId)
            .single();

        if (!applicantProfile) return;

        const { data: profile } = await supabase
            .from("profiles")
            .select("email, full_name")
            .eq("id", applicantProfile.profile_id)
            .single();

        if (!profile) return;

        // Create in-app notification
        await createNotification({
            applicantId: applicantId,
            type: type,
            title: title,
            message: message,
            opportunityId: opportunityId,
            applicationId: applicationId,
        });

        // Send email if available
        if (profile.email && isEmailConfigured()) {
            await sendEmailNotification({
                to: profile.email,
                name: profile.full_name,
                type: type,
                title: title,
                message: message,
                metadata: { opportunity_id: opportunityId, application_id: applicationId }
            });
        }
    } catch (error) {
        console.error(`Error sending reminder to applicant ${applicantId}:`, error);
    }
}

export async function sendClosingDateReminders() {
    console.log("🔍 Checking for opportunities closing soon...");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: opportunities, error } = await supabase
        .from("opportunities")
        .select(`
            id,
            title,
            closing_date,
            applications (
                id,
                applicant_id,
                applicant_profiles (
                    id
                )
            )
        `)
        .eq("status", "approved")
        .not("closing_date", "is", null);

    if (error) {
        console.error("Error fetching opportunities:", error);
        return;
    }

    if (!opportunities || opportunities.length === 0) {
        console.log("📭 No opportunities with closing dates found");
        return;
    }

    let sentCount = 0;

    for (const opp of opportunities || []) {
        const closingDate = new Date(opp.closing_date);
        const daysUntilClose = Math.ceil((closingDate - today) / (1000 * 60 * 60 * 24));

        const shouldSend7Day = daysUntilClose === 7;
        const shouldSend1Day = daysUntilClose === 1;

        if (!shouldSend7Day && !shouldSend1Day) continue;

        const notificationType = shouldSend7Day ? "7_day_reminder" : "24_hour_reminder";
        const reminderTitle = shouldSend7Day
            ? `Opportunity Closing in 7 Days! ⏰`
            : `Final Reminder: Closing Tomorrow! ⚠️`;
        const reminderMessage = shouldSend7Day
            ? `"${opp.title}" closes in 7 days. Make sure your application is submitted!`
            : `"${opp.title}" closes TOMORROW! Submit your application now before it's too late.`;

        for (const application of opp.applications || []) {
            if (!application.applicant_profiles?.id) continue;

            // Check if already sent
            const { data: existing } = await supabase
                .from("applicant_notifications")
                .select("id")
                .eq("applicant_id", application.applicant_profiles.id)
                .eq("opportunity_id", opp.id)
                .eq("type", notificationType)
                .maybeSingle();

            if (existing) continue;

            await sendReminderToApplicant(
                application.applicant_profiles.id,
                opp.id,
                application.id,
                reminderTitle,
                reminderMessage,
                notificationType
            );

            sentCount++;
            console.log(`✅ ${notificationType} sent for "${opp.title}"`);
        }
    }

    console.log(`✅ Closing date reminder check completed. Sent: ${sentCount}`);
    return sentCount;
}

export async function notifyMatchingOpportunities() {
    console.log("🔍 Checking for new matching opportunities for all applicants...");

    // Fetch all applicant profiles with their linked profile
    const { data: applicants, error } = await supabase
        .from("applicant_profiles")
        .select(`
            id,
            profile_id,
            profiles!inner (
                user_id,
                email,
                full_name
            )
        `);

    if (error) {
        console.error("Error fetching applicants:", error);
        return;
    }

    if (!applicants || applicants.length === 0) {
        console.log("📭 No applicants found in the system");
        return;
    }

    console.log(`📊 Found ${applicants.length} applicants to check`);
    let successCount = 0;

    for (const applicant of applicants || []) {
        const userId = applicant.profiles?.user_id;
        if (!userId) continue;

        try {
            // Get matching opportunities (already scored & sorted)
            const matchingOpps = await matchingOpportunity(userId);

            if (!matchingOpps || matchingOpps.length === 0) continue;

            for (const opp of matchingOpps) {
                // Avoid duplicate notifications (only send once per opportunity)
                const { data: existing } = await supabase
                    .from("applicant_notifications")
                    .select("id")
                    .eq("applicant_id", applicant.id)
                    .eq("opportunity_id", opp.id)
                    .eq("type", "matching_opportunity")
                    .maybeSingle();

                if (existing) continue;

                const title = "New Matching Opportunity Found! 🎯";
                const message = `We found a new opportunity "${opp.title}" that matches your skills and preferences.`;

                // Create in-app notification
                await createNotification({
                    applicantId: applicant.id,
                    type: "matching_opportunity",
                    title: title,
                    message: message,
                    opportunityId: opp.id,
                });

                // Send email if configured
                if (applicant.profiles?.email && isEmailConfigured()) {
                    await sendEmailNotification({
                        to: applicant.profiles.email,
                        name: applicant.profiles.full_name || "Applicant",
                        type: "matching_opportunity",
                        title: title,
                        message: message,
                        metadata: {
                            opportunity_id: opp.id,
                            score: opp.score,
                            skill_match_count: opp.skillMatchCount
                        }
                    });
                }

                successCount++;
                console.log(`✅ Matching notification to applicant ${applicant.id} for ${opp.title}`);
            }
        } catch (err) {
            console.error(`Error processing applicant ${applicant.id}:`, err);
        }
    }

    console.log(`✅ Matching opportunities check completed. Sent: ${successCount}`);
    return successCount;
}

// NEW: Check reminders for a specific user (called on login)
export async function checkUserRemindersOnLogin(userId) {
    console.log(`🔍 Checking pending reminders for user ${userId}`);
    
    // Get applicant profile
    const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", userId)
        .single();
    
    if (!profile) return;
    
    const { data: applicant } = await supabase
        .from("applicant_profiles")
        .select("id")
        .eq("profile_id", profile.id)
        .single();
    
    if (!applicant) return;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get all applications with upcoming closing dates
    const { data: applications } = await supabase
        .from("applications")
        .select(`
            id,
            opportunity_id,
            opportunities (
                title,
                closing_date,
                status
            )
        `)
        .eq("applicant_id", applicant.id)
        .eq("opportunities.status", "approved")
        .not("opportunities.closing_date", "is", null);
    
    if (!applications) return;
    
    let remindersSent = 0;
    
    for (const app of applications) {
        const closingDate = new Date(app.opportunities.closing_date);
        const daysUntil = Math.ceil((closingDate - today) / (1000 * 60 * 60 * 24));
        
        if (daysUntil === 7 || daysUntil === 1) {
            const type = daysUntil === 7 ? "7_day_reminder" : "24_hour_reminder";
            const title = daysUntil === 7 
                ? `Opportunity Closing in 7 Days! ⏰`
                : `Final Reminder: Closing Tomorrow! ⚠️`;
            const message = daysUntil === 7
                ? `"${app.opportunities.title}" closes in 7 days. Make sure your application is submitted!`
                : `"${app.opportunities.title}" closes TOMORROW! Submit your application now before it's too late.`;
            
            // Check if already sent
            const { data: existing } = await supabase
                .from("applicant_notifications")
                .select("id")
                .eq("applicant_id", applicant.id)
                .eq("opportunity_id", app.opportunity_id)
                .eq("type", type)
                .maybeSingle();
            
            if (!existing) {
                await sendReminderToApplicant(
                    applicant.id,
                    app.opportunity_id,
                    app.id,
                    title,
                    message,
                    type
                );
                remindersSent++;
            }
        }
    }
    
    console.log(`✅ Sent ${remindersSent} pending reminders to user ${userId}`);
    return remindersSent;
}