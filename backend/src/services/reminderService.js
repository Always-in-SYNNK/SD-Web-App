import { supabase } from "../config/supabaseClient.js";
import { createNotification } from "./notificationService.js";
import { sendEmailNotification } from "./emailService.js";

async function sendReminderToApplicant(applicantId, opportunityId, applicationId, title, message, type) {
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

    await createNotification({
        applicantId: applicantId,
        type: type,
        title: title,
        message: message,
        opportunityId: opportunityId,
        applicationId: applicationId,
    });

    if (profile.email) {
        await sendEmailNotification({
            to: profile.email,
            name: profile.full_name,
            type: type,
            title: title,
            message: message,
            metadata: { opportunity_id: opportunityId, application_id: applicationId }
        });
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

    for (const opp of opportunities || []) {
        const closingDate = new Date(opp.closing_date);
        closingDate.setHours(0, 0, 0, 0);
        
        const daysUntilClose = Math.ceil((closingDate - today) / (1000 * 60 * 60 * 24));
        
        const shouldSend7Day = daysUntilClose === 7;
        const shouldSend1Day = daysUntilClose === 1;
        
        if (!shouldSend7Day && !shouldSend1Day) continue;
        
        // Improved notification content
        const notificationType = shouldSend7Day ? "7_day_reminder" : "24_hour_reminder";
        
        let reminderTitle = "";
        let reminderMessage = "";
        
        if (shouldSend7Day) {
            reminderTitle = "📅 7 Days Left to Apply!";
            reminderMessage = `Don't miss your chance! "${opp.title}" closes in 7 days. Take action now and submit your application before time runs out.`;
        } else {
            reminderTitle = "⚠️ FINAL REMINDER: Closing Tomorrow!";
            reminderMessage = `🚨 URGENT: "${opp.title}" closes TOMORROW! This is your last opportunity to apply. Don't let this chance slip away - submit your application today!`;
        }
        
        let notificationCount = 0;
        
        for (const application of opp.applications || []) {
            if (!application.applicant_profiles?.id) continue;
            
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
            
            notificationCount++;
        }
        
        if (notificationCount > 0) {
            console.log(`✅ ${notificationType} sent for "${opp.title}" to ${notificationCount} applicants`);
        } else {
            console.log(`📭 No applicants to remind for "${opp.title}"`);
        }
    }
    
    console.log("✅ Closing date reminder check completed");
}

export async function notifyAllApplicantsNewOpportunity(opportunityId, opportunityTitle) {
    console.log(`📢 Sending new opportunity notifications for: ${opportunityTitle}`);
    
    // First, check if there are any applicants
    const { data: applicants, error, count } = await supabase
        .from("applicant_profiles")
        .select("id, profile_id", { count: 'exact' });

    if (error) {
        console.error("Error fetching applicants:", error);
        return;
    }

    if (!applicants || applicants.length === 0) {
        console.log("📭 No applicants found in the system. No notifications sent.");
        return;
    }

    console.log(`📊 Found ${applicants.length} applicants to notify`);

    // Improved notification content
    const title = "🎉 New Opportunity Available!";
    const message = `Exciting news! "${opportunityTitle}" has been approved and is now open for applications. This opportunity matches your profile - don't wait, apply today!`;
    
    let successCount = 0;

    for (const applicant of applicants || []) {
        const { data: profile } = await supabase
            .from("profiles")
            .select("email, full_name")
            .eq("id", applicant.profile_id)
            .single();

        await createNotification({
            applicantId: applicant.id,
            type: "new_opportunity",
            title: title,
            message: message,
            opportunityId: opportunityId,
        });

        if (profile?.email) {
            await sendEmailNotification({
                to: profile.email,
                name: profile.full_name,
                type: "new_opportunity",
                title: title,
                message: message,
                metadata: { opportunity_id: opportunityId }
            });
            successCount++;
        }
    }
    
    console.log(`✅ New opportunity notification sent to ${successCount} applicants for: ${opportunityTitle}`);
}