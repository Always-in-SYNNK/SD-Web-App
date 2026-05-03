// frontend/src/pages/AnalyticsPage.jsx
//
// ─── FRONTEND HOOKS (search for these comments before running) ────────────────
//
// 1. SIDEBAR: Same pattern as AdminAccessApplications.jsx — import the correct
//    sidebar based on the user's role (provider vs applicant).
//
// 2. ADMINTOBAR: Reuse the same AdminTopbar you already use on other pages.
//
// 3. USEAUTH: Already in your context — same import as your other pages.
//
// 4. SERVICE: Import from the new analyticsService you created.
//
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState, useCallback } from "react";
import { useLocation }                       from "react-router-dom";

// ── FRONTEND HOOK: match your import paths from other pages ──────────────────
import { Sidebar as ApplicantSidebar } from "../components/dashboard/Sidebar";
import EmployerSidebar                  from "../components/layout/Sidebar";
import AdminTopbar                      from "../components/layout/AdminTopbar";
import { useAuth }                      from "../context/useAuth";
// ─────────────────────────────────────────────────────────────────────────────

import ApplicationVolumeChart    from "../components/analytics/ApplicationVolumeChart";
import OpportunityBreakdownTable from "../components/analytics/OpportunityBreakdownTable";

// ── FRONTEND HOOK: import from the new service you created ────────────────────
import { getApplicationVolume } from "../services/analyticsService";
// ─────────────────────────────────────────────────────────────────────────────

// ── MOCK DATA ─────────────────────────────────────────────────────────────────
// Used as the initial fallback while the API isn't connected yet.
// Once getApplicationVolume() returns real data this is never shown.
const MOCK_DATA = [
  { opportunityTitle: "Architecture Internship",        count: 68, status: "approved" },
  { opportunityTitle: "Urban Design Grad Programme",    count: 54, status: "approved" },
  { opportunityTitle: "Heritage Restoration Placement", count: 41, status: "approved" },
  { opportunityTitle: "Structural Engineering Bursary", count: 37, status: "pending"  },
  { opportunityTitle: "Landscape Design Learnership",   count: 28, status: "approved" },
  { opportunityTitle: "CAD Technician Traineeship",     count: 19, status: "draft"    },
];
// ─────────────────────────────────────────────────────────────────────────────

// ── Metric stat card (same style as AdminAccessApplications) ─────────────────
function StatCard({ label, value, color }) {
  return (
    <article className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className={`text-3xl font-extrabold ${color}`}>{value}</p>
    </article>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const location = useLocation();
  const {user} = useAuth();
  const source           = location.state?.source || "applicant";
  const SidebarComponent = source === "provider" ? EmployerSidebar : ApplicantSidebar;

  const [data,    setData]    = useState(MOCK_DATA); // starts with mock, replaced by real data
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  // ── Fetch analytics data ──────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // ── FRONTEND HOOK: this calls your real backend once it's running ──────
      // While the backend isn't ready, getApplicationVolume() will also return
      // MOCK_DATA from analyticsService.js — so the page still renders.
      const result = await getApplicationVolume();
      setData(result);
    } catch (err) {
      console.error("[AnalyticsPage]", err.message);
      setError("Could not load analytics. Showing mock data.");
      setData(MOCK_DATA); // graceful fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetchData(); }, [fetchData]);

  // ── Derived metrics ───────────────────────────────────────────────────────
  const total   = data.reduce((s, d) => s + d.count, 0);
  const oppCount = data.length;
  const avg     = oppCount > 0 ? Math.round(total / oppCount) : 0;

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <main className="min-h-screen bg-[#faf9f8] flex items-center justify-center">
        <p className="text-gray-400">Loading analytics…</p>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#faf9f8]">
      <SidebarComponent />

      <main className="ml-64 min-h-screen w-full min-w-0">

        {/* ── Topbar (reused from other pages) ── */}
        <AdminTopbar title="Analytics" source={source} />

        <div className="p-12">

          {/* ── Page intro ── */}
          <div className="mb-8">
            <span className="text-sm font-semibold tracking-wider text-[#035b9d] uppercase">
              System Control Room
            </span>
            <h2 className="text-3xl font-extrabold mt-2 tracking-tight">
              Analytics &amp; Governance
            </h2>
            <p className="text-gray-500 mt-2">
              Application volume per opportunity across all providers.
            </p>
          </div>

          {/* ── Error banner (only shown if fetch failed) ── */}
          {error && (
            <div className="mb-6 px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
              {error}
            </div>
          )}

          {/* ── Stat cards ── */}
          <section className="grid grid-cols-3 gap-4 mb-8">
            <StatCard
              label="Total Applications"
              value={total}
              color="text-gray-800"
            />
            <StatCard
              label="Active Opportunities"
              value={oppCount}
              color="text-[#035b9d]"
            />
            <StatCard
              label="Avg. Applications / Opportunity"
              value={avg}
              color="text-green-600"
            />
          </section>

          {/* ── Chart ── */}
          <section className="mb-6">
            <ApplicationVolumeChart data={data} />
          </section>

          {/* ── Breakdown table ── */}
          <section>
            <OpportunityBreakdownTable data={data} />
          </section>

        </div>
      </main>
    </div>
  );
}