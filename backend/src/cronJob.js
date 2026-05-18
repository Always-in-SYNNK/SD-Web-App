import cron from "node-cron";
import { sendClosingDateReminders } from "./services/reminderService.js";

export function startReminderCron() {
    cron.schedule("0 9 * * *", () => {
        sendClosingDateReminders();
    });
    
    console.log("✅ Reminder cron job scheduled for 9:00 AM daily");
}