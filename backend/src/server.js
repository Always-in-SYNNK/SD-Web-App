// ============================================================
// ENTRY POINT — starts the Express server
// DO NOT MODIFY FOR APP DEPLOYMENT TO WORK
// ============================================================

import dotenv from "dotenv";
dotenv.config();

import cron from "node-cron";
import app from "./app.js";
import { triggerUpcomingClosingDateNotifications } from "./services/notificationService.js";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🔑 Google Client ID : ${process.env.GOOGLE_CLIENT_ID  ? "Configured ✓" : "MISSING ✗"}`);
  console.log(`🗄️  Supabase URL     : ${process.env.SUPABASE_URL       ? "Configured ✓" : "MISSING ✗"}`);
  console.log(`📧 Email user       : ${process.env.EMAIL_USER         ? "Configured ✓" : "MISSING ✗"}`);

  // Schedule cron job to check for upcoming closing date notifications
  // Runs daily at 9:00 AM
  cron.schedule("0 9 * * *", async () => {
    try {
      console.log("🔔 Running scheduled notification check...");
      await triggerUpcomingClosingDateNotifications(3); // Check for opportunities closing in 3 days
      console.log("✅ Notification check completed");
    } catch (error) {
      console.error("❌ Error in scheduled notification task:", error);
    }
  });
});