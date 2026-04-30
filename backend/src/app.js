// ============================================================
// APP — Express setup, middleware, and route mounting
// DO NOT MODIFY CORS SETTINGS OR ROUTE PREFIXES FOR APP DEPLOYMENT TO WORK
// ============================================================

import express from "express";
import cors from "cors";
import session from "express-session";
import path from "path";

import applicationRoutes from "./routes/applicationRoutes.js";
import employerApplicationRoutes from "./routes/employerApplicationRoutes.js";
import applicantAuthRoutes from "./routes/applicantAuthRoutes.js";
import providerAuthRoutes from "./routes/providerAuthRoutes.js";
import myApplicationRoutes from "./routes/myApplicationRoutes.js";
import opportunityRoutes from "./routes/opportunityRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import skillsRoutes from "./routes/skillsRoutes.js";

const app = express();

// SIMPLE CORS 
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
}));

app.use(express.json());

// ─── Session middleware ───────────────────────────────────────────────────────
app.use(session({
  secret: process.env.SESSION_SECRET || "dev-secret-change-in-production",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 24 * 60 * 60 * 1000,
  },
}));

// ─── Application Routes ───────────────────────────────────────────────────────
app.use('/api/applications', applicationRoutes);

// ─── Skills Routes ───────────────────────────────────────────────────────
app.use('/api/skills', skillsRoutes);

// ─── Employer Application Routes ──────────────────────────────────────────────
app.use('/api/employer/applications', employerApplicationRoutes);

// ─── Admin Routes ─────────────────────────────────────────────────────────────
app.use("/api/admin", adminRoutes);

// ─── Auth routes ─────────────────────────────────────────────────────────────

app.use("/api/auth/applicant", applicantAuthRoutes);
app.use("/api/auth/provider",  providerAuthRoutes);

// ─── Application routes ────────────────────────────────────────────────────────

app.use("/applications", myApplicationRoutes);

// ─── Email verification ───────────────────────────────────────────────────────
import { supabase } from "./config/supabaseClient.js";

app.get("/verify-email", async (req, res) => {
  const { token } = req.query;

  console.log("=== VERIFICATION LINK CLICKED ===");
  console.log("Token:", token);

  if (!token) {
    return res.redirect("http://localhost:5173/auth-error?message=missing-token");
  }

  try {
    const { data: pending, error } = await supabase
      .from("pending_verifications")
      .select("*")
      .eq("verification_token", token)
      .single();

    if (error || !pending) {
      return res.redirect("http://localhost:5173/auth-error?message=invalid-link");
    }

    if (new Date(pending.token_expires) < new Date()) {
      await supabase.from("pending_verifications").delete().eq("verification_token", token);
      return res.redirect("http://localhost:5173/auth-error?message=expired-link");
    }

    await supabase
      .from("pending_verifications")
      .update({ email_verified: true })
      .eq("verification_token", token);

    req.session.pendingVerificationEmail = pending.email;

    console.log("✅ Email verified for:", pending.email);

    return res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verified | GrowthStageSA</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Public Sans', system-ui, -apple-system, sans-serif;
            background: linear-gradient(135deg, #f0eeea 0%, #e8e5df 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1rem;
          }
          main {
            max-width: 480px;
            width: 100%;
            background: white;
            border-radius: 2rem;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            overflow: hidden;
          }
          header {
            background: #002356;
            padding: 2rem;
            text-align: center;
          }
          .logo {
            width: 64px;
            height: 64px;
            background: rgba(255,255,255,0.1);
            border-radius: 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1rem;
          }
          .logo svg {
            width: 40px;
            height: 40px;
            color: white;
          }
          h1 {
            color: white;
            font-size: 1.5rem;
            font-weight: 700;
          }
          section {
            padding: 2rem;
            text-align: center;
          }
          .checkmark {
            width: 72px;
            height: 72px;
            background: #10b981;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.5rem;
            font-size: 2.5rem;
            color: white;
          }
          h2 {
            color: #002356;
            font-size: 1.75rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
          }
          p {
            color: #475569;
            line-height: 1.6;
            margin-bottom: 1rem;
          }
          .email {
            background: #f1f5f9;
            padding: 0.75rem;
            border-radius: 0.75rem;
            font-family: monospace;
            font-size: 0.875rem;
            color: #002356;
            margin: 1.5rem 0;
            word-break: break-all;
          }
          button {
            background: #002356;
            color: white;
            border: none;
            padding: 0.875rem 1.5rem;
            border-radius: 0.75rem;
            font-weight: 600;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.2s;
            width: 100%;
          }
          button:hover {
            background: #003b8e;
            transform: translateY(-1px);
          }
          footer {
            background: #f8fafc;
            padding: 1rem;
            text-align: center;
            border-top: 1px solid #e2e8f0;
          }
          footer small {
            color: #94a3b8;
            font-size: 0.75rem;
          }
        </style>
      </head>
      <body>
        <main>
          <header>
            <figure class="logo">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z" fill="currentColor"/>
              </svg>
            </figure>
            <h1>GrowthStageSA</h1>
          </header>
          <section>
            <figure class="checkmark">✓</figure>
            <h2>Email Verified</h2>
            <p>Your email has been successfully verified.</p>
            <p class="email">${pending.email}</p>
            <button onclick="window.location.href='http://localhost:5173/provider-registration'">
              Continue to Registration →
            </button>
          </section>
          <footer>
            <small>Secure verification • Link expires in 24 hours</small>
          </footer>
        </main>
      </body>
      </html>
    `);

  } catch (err) {
    console.error("Verification error:", err);
    return res.redirect("http://localhost:5173/auth-error?message=server-error");
  }
});

// ─── Helper: Error page (redirects to React home) ────────────────────────────

function errorPage(title, message) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title} | GrowthStageSA</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Public Sans', system-ui, -apple-system, sans-serif;
          background: linear-gradient(135deg, #f0eeea 0%, #e8e5df 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }
        main {
          max-width: 420px;
          width: 100%;
          background: white;
          border-radius: 2rem;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          overflow: hidden;
          text-align: center;
        }
        header {
          background: #002356;
          padding: 2rem;
        }
        .logo {
          width: 56px;
          height: 56px;
          background: rgba(255,255,255,0.1);
          border-radius: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 0.75rem;
        }
        .logo svg {
          width: 32px;
          height: 32px;
          color: white;
        }
        h1 {
          color: white;
          font-size: 1.25rem;
          font-weight: 600;
        }
        section {
          padding: 2rem;
        }
        .error-icon {
          width: 64px;
          height: 64px;
          background: #ef4444;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.25rem;
          font-size: 2rem;
          color: white;
          font-weight: bold;
        }
        h2 {
          color: #002356;
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0.75rem;
        }
        p {
          color: #475569;
          line-height: 1.5;
          margin-bottom: 1.5rem;
        }
        button {
          background: #002356;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 0.75rem;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
          width: 100%;
        }
        button:hover {
          background: #003b8e;
        }
        footer {
          background: #f8fafc;
          padding: 0.75rem;
          border-top: 1px solid #e2e8f0;
        }
        footer small {
          color: #94a3b8;
          font-size: 0.7rem;
        }
      </style>
    </head>
    <body>
      <main>
        <header>
          <figure class="logo">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z" fill="currentColor"/>
            </svg>
          </figure>
          <h1>GrowthStageSA</h1>
        </header>
        <section>
          <figure class="error-icon">!</figure>
          <h2>${title}</h2>
          <p>${message}</p>
          <button onclick="window.location.href='http://localhost:5173'">
            Return to Home
          </button>
        </section>
        <footer>
          <small>GrowthStage South Africa</small>
        </footer>
      </main>
    </body>
    </html>
  `;
}

// ─── Mount API routes ────────────────────────────────────────────────────────
app.get("/api/test-route", (req, res) => {
  res.json({ ok: true });
});

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "API is running" });
});

app.use("/api/opportunities", opportunityRoutes);



// Profile routes

app.use("/api/profile", profileRoutes);

// Notifications routes

app.use("/api/notifications", notificationRoutes);

// ─── 404 fallback ─────────────────────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});

app.use(errorHandler);

// ─── Global error handler ─────────────────────────────────────────────────────

// app.use((err, req, res, next) => {
//   console.error("Unhandled error:", err);
//   res.status(500).json({ error: "Internal server error" });
// });

export default app;
