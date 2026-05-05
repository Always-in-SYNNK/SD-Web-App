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

    for (const opp of opportunities || []) {
        const closingDate = opp.closing_date;
        const daysUntilClose = Math.ceil((new Date(closingDate) - today) / (1000 * 60 * 60 * 24));
        
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
            
            console.log(`✅ ${notificationType} sent for "${opp.title}"`);
        }
    }
    
    console.log("✅ Closing date reminder check completed");
}

export async function notifyAllApplicantsNewOpportunity(opportunityId, opportunityTitle) {
    console.log(`📢 Sending new opportunity notifications for: ${opportunityTitle}`);
    
    const { data: applicants, error } = await supabase
        .from("applicant_profiles")
        .select("id, profile_id");

    if (error) {
        console.error("Error fetching applicants:", error);
        return;
    }

    for (const applicant of applicants || []) {
        const { data: profile } = await supabase
            .from("profiles")
            .select("email, full_name")
            .eq("id", applicant.profile_id)
            .single();

        const title = "New Opportunity Available! 🎉";
        const message = `A new opportunity "${opportunityTitle}" has been posted that matches your profile.`;

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
        }
    }
    
    console.log(`✅ New opportunity notification sent to ${applicants?.length || 0} applicants`);
}