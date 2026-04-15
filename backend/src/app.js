// ============================================================
// APP — Express setup, middleware, and route mounting
// ============================================================

const express = require("express");
const cors    = require("cors");
const session = require("express-session");
const path    = require("path");

const applicantAuthRoutes = require("./routes/applicantAuthRoutes"); // your JWT-based flow
const providerAuthRoutes  = require("./routes/providerAuthRoutes");  // Tash's session-based flow

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://localhost:3000",
  ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim()) : []),
];

// ─── Core middleware ──────────────────────────────────────────────────────────

app.use(cors({
  // "credentials: include" in fetch requires a specific allowed origin, not "*".
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
}));

app.use(express.json());

// ─── Session middleware (required by Tash's provider flow) ───────────────────
// Your applicant flow uses stateless JWTs so this doesn't affect it,
// but it must be registered before the provider routes are mounted.

app.use(session({
  secret: process.env.SESSION_SECRET || "dev-secret-change-in-production",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // true in prod (HTTPS), false in dev
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
}));

// ─── Static files (Tash's frontend pages, if still served from here) ─────────
// Remove this block if your frontend is served by a separate dev server (e.g. Vite).

app.use(express.static(path.join(__dirname, "../public")));

// ─── Auth routes ─────────────────────────────────────────────────────────────
// Separate prefixes keep the two flows completely isolated.
//
//  Applicant (your flow)  →  POST /api/auth/applicant/google
//                             GET  /api/auth/applicant/me
//
//  Provider  (Tash's flow) → POST /api/auth/provider/check-user
//                             POST /api/auth/provider/signup
//                             GET  /api/auth/provider/pending-registration
//                             POST /api/auth/provider/complete-registration
//                             POST /api/auth/provider/signin
//                             POST /api/auth/provider/logout
//                             GET  /api/auth/provider/me

app.use("/api/auth/applicant", applicantAuthRoutes);
app.use("/api/auth/provider",  providerAuthRoutes);

// ─── Email verification (Tash's flow) ────────────────────────────────────────
// Kept here (not inside the router) because it lives at a top-level path and
// relies on req.session, which needs to be set before the redirect to /register.

const supabase = require("./config/supabaseClient");

app.get("/verify-email", async (req, res) => {
  const { token } = req.query;

  console.log("=== VERIFICATION LINK CLICKED ===");
  console.log("Token:", token);

  if (!token) {
    return res.status(400).send(errorPage("Missing token", "No verification token was provided."));
  }

  try {
    const { data: pending, error } = await supabase
      .from("pending_verifications")
      .select("*")
      .eq("verification_token", token)
      .single();

    if (error || !pending) {
      return res.send(errorPage("Invalid or Expired Link", "The verification link is invalid or has already been used."));
    }

    if (new Date(pending.token_expires) < new Date()) {
      await supabase.from("pending_verifications").delete().eq("verification_token", token);
      return res.send(errorPage("Link Expired", "The link expired after 24 hours. Please sign up again."));
    }

    await supabase
      .from("pending_verifications")
      .update({ email_verified: true })
      .eq("verification_token", token);

    req.session.pendingVerificationEmail = pending.email;

    console.log("✅ Email verified for:", pending.email);

    return res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Email Verified – SA Learnerships Portal</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f3f4f6; }
          main { max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
          h1 { color: #4F46E5; }
          .email { background: #f3f4f6; padding: 10px; border-radius: 5px; font-family: monospace; margin: 20px 0; word-break: break-all; }
          button { background: #4F46E5; color: white; border: none; padding: 12px 24px; border-radius: 5px; cursor: pointer; font-size: 16px; margin-top: 20px; }
          button:hover { background: #4338ca; }
        </style>
      </head>
      <body>
        <main>
          <h1>📝 Almost Done!</h1>
          <p>Your email has been verified successfully!</p>
          <p class="email">${pending.email}</p>
          <p>Please complete your registration form to finish setting up your account.</p>
          <button onclick="window.location.href='/employer/registration.html'">Continue to Registration →</button>
        </main>
      </body>
      </html>
    `);

  } catch (err) {
    console.error("Verification error:", err);
    return res.send(errorPage("Something Went Wrong", "Please try again or contact support."));
  }
});

// ─── HTML page routes (Tash's static pages) ──────────────────────────────────
// Remove these if the frontend is fully handled by Vite / a separate server.

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.get("/employer/registration.html", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/employer/registration.html"));
});

app.get("/employer/dashboard.html", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/employer/dashboard.html"));
});

// ─── 404 fallback ─────────────────────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});

// ─── Global error handler ─────────────────────────────────────────────────────

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// ─── Helper: plain HTML error page for the email verification flow ────────────

function errorPage(title, message) {
  return `
    <!DOCTYPE html>
    <html>
    <head><title>${title}</title></head>
    <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
      <h1>${title}</h1>
      <p>${message}</p>
      <a href="/">Return Home</a>
    </body>
    </html>
  `;
}

module.exports = app;
