// src/pages/AdminAccessApplications.jsx
//
// User story: As a user (applicant/provider), I should be able to apply
// for an admin role. Existing admins can grant or reject access.
//
// This page shows:
// - Analytics overview (placements, users, verifications, system health)
// - A list of admin access applications with Grant / Reject actions
//
// The correct sidebar is rendered based on location.state.source,
// which is set by whichever sidebar navigates here.

import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Sidebar as ApplicantSidebar } from "../components/dashboard/Sidebar";
import EmployerSidebar from "../components/layout/Sidebar";

// ── Static placeholder applications ────────────────────────────────────────
// TODO: replace with a real Supabase fetch once the admin_applications
//       table exists on the backend
const INITIAL_APPLICATIONS = [
  {
    id: 1,
    name: "Zanele Mbeki",
    role: "Senior Architect",
    date: "Oct 24, 2023",
    location: "Johannesburg, ZA",
    portfolioScore: "9.4/10",
    trustLevel: "Verified",
    trustColor: "text-[#006e2d]",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDRbWJvAdae-KiqQW2GVT2yRQ_VFqS8qEfLxz4um1D3aFDnbLJK6cNN-sB2uLgY44LzvpopYBoyQktnceGnMzU9PjELUe9P4LbW0WvSiUG5WbS9J1tO-R5TzdyzX2vwMM1dBvLUDrjTIlgn7_EbmeywauhXj2BrXiRIjJ3jvop73fD-42B5Upt52cJYKgDjdh0NDxjSKXaOea3AqYTFXcxgHFejfHSnxrEHoPvYC3cDlDOorrHS7UQsamdzl0R7_LeoSyacBRdjra-E",
    highlight: true,
  },
  {
    id: 2,
    name: "Thabo Kumalo",
    role: "Urban Planner",
    date: "Oct 23, 2023",
    location: "Cape Town, ZA",
    portfolioScore: "8.2/10",
    trustLevel: "Standard",
    trustColor: "text-gray-500",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAAmlHp9NTCoT3kDFnOiszHC93BSDErUljIjaHI3Lk2tSLOmnFDvHLZTm67EAhS7hlI5JOZOkUlVNaJLPMRlVYV1xVNRyfFvYAZX4rzoQEVIP5nq711-PI0pjgXZAAAM3h8KmvaF3WQ5iML0Hh1TfuOkWnjls4Upk33pIv7EzFN1Y_wNeFXHY4C7Fx8LDxYqGnLid-Xdw0Tg-uGnhAXAEc5MR3y_c7TowEAkqT3SgQ9oDOx60TKotVGtVvRIEeLHDECI8NfMgIqTC1R",
    highlight: false,
  },
  {
    id: 3,
    name: "Lindiwe Dlamini",
    role: "Project Lead",
    date: "Oct 21, 2023",
    location: "Pretoria, ZA",
    portfolioScore: "9.1/10",
    trustLevel: "Verified",
    trustColor: "text-[#006e2d]",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuChrwpWk-0FgQSxmTtlkr2QF-zH-21K79k1ugh_PmA1kMQfQFNuolG52blu72uK6-oyc6xVDNGTMDCwl6VGHcNGfTGQcxT-UKZ73N6dw2HTlEfrRu_mE5uxd8XY1LKNOIyVwE1Q7cVLmP22_zNNGrM9R6_nF-CmAY6BPIAtks5GgkQq5vT91gnVse2EHTUCws0fSYEmUdNxpUStURMoq0w0rap3R8gjYxa_errjqF_4UHoCYJ6qNCdFVbT5cpW0ot-0QGSLQ_N4E1j7",
    highlight: true,
  },
];

// ── Application card ────────────────────────────────────────────────────────
function ApplicationCard({ application, onGrant, onReject }) {
  const { id, name, role, date, location, portfolioScore,
          trustLevel, trustColor, avatar, highlight } = application;

  return (
    <article
      className={`bg-white p-6 rounded-xl flex items-center gap-6
        hover:shadow-lg transition-all
        ${highlight ? "border-l-4 border-[#7d4e00]" : ""}`}
    >
      <img
        src={avatar}
        alt={`Portrait of ${name}`}
        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
      />

      {/* Name + meta */}
      <section className="flex-1 min-w-0">
        <header className="flex items-center gap-3 flex-wrap">
          <h3 className="font-bold text-lg">{name}</h3>
          <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-bold uppercase rounded tracking-wider">
            {role}
          </span>
        </header>
        <p className="text-sm text-gray-500 mt-1">
          Applied: {date} • {location}
        </p>
      </section>

      {/* Scores */}
      <section className="flex gap-4 flex-shrink-0">
        <div className="px-4 py-2 bg-gray-50 rounded-lg">
          <p className="text-[10px] font-bold text-gray-400 uppercase">
            Portfolio Score
          </p>
          <p className="text-sm font-bold text-[#035b9d]">{portfolioScore}</p>
        </div>
        <div className="px-4 py-2 bg-gray-50 rounded-lg">
          <p className="text-[10px] font-bold text-gray-400 uppercase">
            Community Trust
          </p>
          <p className={`text-sm font-bold ${trustColor}`}>{trustLevel}</p>
        </div>
      </section>

      {/* Actions */}
      <section className="flex items-center gap-3 flex-shrink-0">
        <button
          onClick={() => onReject(id)}
          className="px-4 py-2 text-gray-500 font-bold text-sm
            hover:bg-gray-100 transition-colors rounded-lg"
        >
          Reject
        </button>
        <button
          onClick={() => onGrant(id)}
          className="px-6 py-2 bg-[#035b9d] text-white font-bold text-sm
            rounded-full shadow hover:opacity-90 transition-all"
        >
          Grant Access
        </button>
      </section>
    </article>
  );
}

// ── Main page ───────────────────────────────────────────────────────────────
export default function AdminAccessApplications() {
  const location = useLocation();
  const source = location.state?.source || "applicant";
  const SidebarComponent =
    source === "employer" ? EmployerSidebar : ApplicantSidebar;

  const [applications, setApplications] = useState(INITIAL_APPLICATIONS);
  const [notification, setNotification] = useState(null);

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleGrant = (id) => {
    // TODO: call POST /api/admin/grant-access or Supabase update
    //       to set profiles.role = 'admin' for this user
    setApplications((prev) => prev.filter((a) => a.id !== id));
    showNotification("✅ Admin access granted.");
  };

  const handleReject = (id) => {
    // TODO: call POST /api/admin/reject-access or Supabase update
    setApplications((prev) => prev.filter((a) => a.id !== id));
    showNotification("❌ Application rejected.");
  };

  return (
    <div className="flex min-h-screen bg-[#faf9f8]">
      <SidebarComponent />

      <main className="ml-64 min-h-screen w-full">

        {/* ── Top bar ── */}
        <header className="sticky top-0 z-40 flex justify-between items-center
          px-12 h-16 bg-white border-b border-gray-200">
          <h1 className="text-lg font-bold text-gray-900">
            Admin Access Applications
          </h1>
          <div className="flex gap-3 items-center">
            <input
              placeholder="Search applicants..."
              className="bg-gray-100 px-4 py-2 rounded-lg text-sm
                focus:outline-none focus:ring-2 focus:ring-blue-200 w-64"
            />
            <button className="p-2 hover:bg-gray-100 rounded-full">🔔</button>
            <button className="p-2 hover:bg-gray-100 rounded-full">⚙️</button>
          </div>
        </header>

        <section className="p-12 space-y-10 max-w-7xl mx-auto">

          {/* ── Page heading ── */}
          <header className="flex justify-between items-end">
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-widest text-[#035b9d] font-semibold">
                System Control Room
              </p>
              <h2 className="text-5xl font-extrabold tracking-tight text-gray-900">
                Analytics &amp; Governance
              </h2>
            </div>

            {/* Moderation team avatars */}
            <aside className="flex gap-4 items-center">
              <div className="flex -space-x-3">
                {[
                  "https://lh3.googleusercontent.com/aida-public/AB6AXuDKnP35joxbqQAs2b4Qvqvik1AhgFGU9CSv_FgYydPAvjij_WOK6I6YtfoV7jLjzSdHvFxWy5jicJA908HYaBGL46YfuU9xzeFNcNKvrKzeZ7uXfl2eL5creR31q9RuFUeV3IbHXsHkP7gvoLNi_9aOp4IQSLuJ1X0IuQZJwy30bQgxK7f2iYSiiBdeb-eYhn2XsnGGwpf5G3Pko9CspAJGqyqltKTUh5NDeKDSqLmt7XG7sV32SDY1Ev29p9uXpXrVhFPegSJBZwxr",
                  "https://lh3.googleusercontent.com/aida-public/AB6AXuDKywHmmUkMAXNQ-PZNLeu68djR4VQx9zOYF7MdfltN-zGjARrLd8xSsIK3CqgaGPRPEGeSi_GhX1JUK0kQa8mY512HW9F3tMRKv6qALCIP5p4rxkQiyqmuVxxp6hJQ1yBRgRzAWkLu7cwpyW3QqgphVFAaM2soxBxNKAdP7QT0fphUE6mUvG4NHqDxq8lveN_dPtHVkdf1dTepYjA2eao7NF_WehDRpoYebj-JkXGgH7LIddA5UDAyZnDbMsrgpTX22AhdGOGLQnQj",
                  "https://lh3.googleusercontent.com/aida-public/AB6AXuDvtDplOSM2lH6snqB9rPxegtG2CbM_gXm5o0SXoesewepU6nnF4sABHve3CBUVOiF7NgCBUAH4VKUw6UHzfxgT890wCUS2oXrteZnufic-dymMjFJg619YAS9rh1TsYz4Tv_bsqEM5V8k1FgU5dtR_EtgbCtiEhPISK0R2LsM4dCuNcHAvVuPuuU-d5sLEN2e1H5o-_i9afXhA9cG5XlsYjii0Cmrz0LQic7XFHRfHsmV1pvejRRexTb12qoOQ2IApkZiVVo5fjikt",
                ].map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt="Moderation team member"
                    className="w-12 h-12 rounded-full border-4 border-[#faf9f8] object-cover"
                  />
                ))}
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">Moderation Team</p>
                <p className="text-xs text-gray-500">8 Online Now</p>
              </div>
            </aside>
          </header>

          {/* ── Analytics bento grid ── */}
          <section className="grid grid-cols-12 gap-6">

            {/* Hero metric */}
            <article className="col-span-12 lg:col-span-8 bg-white p-8 rounded-xl
              shadow-sm relative overflow-hidden hover:scale-[1.01] transition-transform">
              <div className="relative z-10 flex justify-between">
                <div className="space-y-6">
                  <span className="inline-flex items-center px-3 py-1
                    bg-[#93f9a2] text-[#005320] text-xs font-bold rounded-full">
                    📈 +12% vs last month
                  </span>
                  <h3 className="text-6xl font-extrabold tracking-tight">14,284</h3>
                  <div>
                    <p className="text-xl font-bold">Successful Placements</p>
                    <p className="text-gray-500 max-w-xs mt-1">
                      Verified youth who successfully secured professional roles this quarter.
                    </p>
                  </div>
                </div>

                {/* Bar chart */}
                <figure className="w-1/2 flex items-end justify-end" aria-label="Placement trend bars">
                  <div className="flex gap-2 items-end">
                    {[24, 32, 48, 40, 64].map((h, i) => (
                      <div
                        key={i}
                        className="w-8 bg-[#035b9d] rounded-t-lg transition-all"
                        style={{ height: `${h * 4}px`, opacity: 0.2 + i * 0.2 }}
                      />
                    ))}
                  </div>
                </figure>
              </div>
              <div className="absolute -bottom-12 -right-12 w-64 h-64
                bg-[#035b9d]/5 rounded-full blur-3xl" />
            </article>

            {/* Total users */}
            <article className="col-span-12 md:col-span-6 lg:col-span-4
              bg-gray-50 p-8 rounded-xl flex flex-col justify-between hover:bg-white transition-colors">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-white rounded-xl shadow-sm text-xl">👥</div>
                <span className="text-xs font-bold text-gray-400">Live Stats</span>
              </div>
              <div className="mt-8">
                <h4 className="text-4xl font-extrabold tracking-tight">82.5k</h4>
                <p className="text-lg font-bold mt-1">Total Platform Users</p>
                <div className="mt-4 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-[#035b9d] w-[85%] rounded-full" />
                </div>
                <p className="text-xs mt-2 text-gray-400 font-medium">
                  85% Verification Completion Rate
                </p>
              </div>
            </article>

            {/* Pending verifications */}
            <article className="col-span-12 md:col-span-6 lg:col-span-4
              bg-gray-50 p-8 rounded-xl flex flex-col justify-between hover:bg-white transition-colors">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-white rounded-xl shadow-sm text-xl">✅</div>
                <span className="text-xs font-bold text-gray-400">Action Required</span>
              </div>
              <div className="mt-8">
                <h4 className="text-4xl font-extrabold tracking-tight">312</h4>
                <p className="text-lg font-bold mt-1">Pending Verifications</p>
                <p className="text-gray-400 text-sm mt-2 italic">
                  Avg. processing time: 4.2 hours
                </p>
              </div>
            </article>

            {/* System health */}
            <article className="col-span-12 lg:col-span-8
              bg-[#9f6400] text-white p-8 rounded-xl flex items-center justify-between">
              <div className="flex gap-6 items-center">
                <div className="w-16 h-16 rounded-full border-4 border-white/20
                  flex items-center justify-center text-3xl">
                  🛡️
                </div>
                <div>
                  <h4 className="text-2xl font-bold">System Resilience</h4>
                  <p className="opacity-80 mt-1">
                    All platform services operational. Compliance checks passing at 100%.
                  </p>
                </div>
              </div>
              <button className="px-6 py-3 bg-white text-[#9f6400] rounded-full
                font-bold text-sm hover:scale-105 transition-transform flex-shrink-0">
                Security Audit
              </button>
            </article>

          </section>

          {/* ── Admin access applications ── */}
          <section className="space-y-6">
            <header className="flex justify-between items-center px-2">
              <h2 className="text-3xl font-extrabold tracking-tight">
                Admin Access Applications
              </h2>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                  ⚙️
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                  •••
                </button>
              </div>
            </header>

            {applications.length === 0 ? (
              <p className="text-gray-400 text-sm px-2">
                No pending admin access applications.
              </p>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => (
                  <ApplicationCard
                    key={app.id}
                    application={app}
                    onGrant={handleGrant}
                    onReject={handleReject}
                  />
                ))}
              </div>
            )}
          </section>

        </section>
      </main>

      {/* ── System status FAB ── */}
      <aside className="fixed bottom-8 right-8 bg-gray-900 text-white p-4
        rounded-2xl shadow-2xl flex items-center gap-4 border border-white/10 z-50">
        <div className="relative">
          <div className="w-3 h-3 bg-[#006e2d] rounded-full
            absolute -top-1 -right-1 border-2 border-gray-900" />
          <span className="text-xl">🔗</span>
        </div>
        <div>
          <p className="text-xs font-bold leading-tight">System Status</p>
          <p className="text-[10px] opacity-70">Traffic: High • 14.2k Active Sessions</p>
        </div>
      </aside>

      {/* ── Toast notification ── */}
      {notification && (
        <div className="fixed bottom-24 right-8 bg-gray-900 text-white
          px-6 py-3 rounded-xl shadow-xl text-sm z-50 animate-fade-in">
          {notification}
        </div>
      )}
    </div>
  );
}