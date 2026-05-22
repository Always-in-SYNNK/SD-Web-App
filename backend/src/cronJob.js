// backend/src/cronJob.js
import cron from "node-cron";
import { sendClosingDateReminders, notifyMatchingOpportunities } from "./services/reminderService.js";

// Track if cron is running to prevent overlaps
let isRunning = false;

export function startReminderCron() {
    // Only start cron if explicitly enabled (for production with always-on server)
    if (process.env.ENABLE_CRON === 'true') {
        // Run at 9:00 AM daily
        cron.schedule("0 9 * * *", async () => {
            if (isRunning) {
                console.log("⚠️ Previous cron job still running, skipping...");
                return;
            }
            
            isRunning = true;
            console.log(`🕐 Running scheduled reminders at ${new Date().toISOString()}`);
            
            try {
                await sendClosingDateReminders();
                await notifyMatchingOpportunities();
                console.log("✅ Scheduled reminders completed");
            } catch (error) {
                console.error("❌ Cron job failed:", error);
            } finally {
                isRunning = false;
            }
        });
        
        console.log("✅ Cron job scheduled for 9:00 AM daily");
    } else {
        console.log("⚠️ Cron jobs disabled (ENABLE_CRON not set to 'true')");
        console.log("   Use /api/trigger-reminders endpoint for manual triggers");
    }
}

// NEW: HTTP endpoint trigger for external cron services
export async function triggerRemindersManually(req, res) {
    // Security: Check API key
    const apiKey = req.query.key || req.headers['x-cron-secret'];
    const expectedKey = process.env.CRON_SECRET;
    
    if (expectedKey && apiKey !== expectedKey) {
        console.error("❌ Unauthorized cron trigger attempt");
        if (res) return res.status(401).json({ error: 'Unauthorized' });
        throw new Error('Unauthorized');
    }
    
    console.log(`🕐 Manual reminder trigger at ${new Date().toISOString()}`);
    
    try {
        await sendClosingDateReminders();
        await notifyMatchingOpportunities();
        
        if (res) {
            res.json({ 
                success: true, 
                message: 'Reminders triggered successfully',
                timestamp: new Date().toISOString()
            });
        }
        return { success: true };
    } catch (error) {
        console.error("❌ Manual trigger failed:", error);
        if (res) {
            res.status(500).json({ error: error.message });
        }
        throw error;
    }
}