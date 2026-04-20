// ============================================================
// ENTRY POINT — starts the Express server
// DO NOT MODIFY FOR APP DEPLOYMENT TO WORK
// ============================================================
import app from "./app.js"
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🔑 Google Client ID : ${process.env.GOOGLE_CLIENT_ID  ? "Configured ✓" : "MISSING ✗"}`);
  console.log(`🗄️  Supabase URL     : ${process.env.SUPABASE_URL       ? "Configured ✓" : "MISSING ✗"}`);
  console.log(`📧 Email user       : ${process.env.EMAIL_USER         ? "Configured ✓" : "MISSING ✗"}`);
});