// ============================================================
// ENTRY POINT — Loads env vars and starts the HTTP server
// ============================================================

require("dotenv").config();

const app  = require("./app");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log(`🔑 Google Client ID : ${process.env.GOOGLE_CLIENT_ID  ? "Configured ✓" : "MISSING ✗"}`);
  console.log(`🗄️  Supabase URL     : ${process.env.SUPABASE_URL       ? "Configured ✓" : "MISSING ✗"}`);
  console.log(`📧 Email user       : ${process.env.EMAIL_USER         ? "Configured ✓" : "MISSING ✗"}`);
});
