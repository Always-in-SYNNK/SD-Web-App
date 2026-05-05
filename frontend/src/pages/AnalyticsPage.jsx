// frontend/src/pages/AnalyticsPage.jsx
//
// ─── What changed from the previous version ──────────────────────────────────
//
// 1. Stat cards now use totals from the backend response (json.totals)
//    instead of calculating them on the frontend. The backend returns:
//    { totalApplications, activeOpportunities, averagePerOpportunity }
//
// 2. Added an Export CSV button that calls GET /api/analytics/export
//    and triggers a browser file download.
//
// 3. MOCK_DATA is kept as a visual fallback only — used when the API
//    call fails (e.g. backend not running locally). Remove it once
//    you are confident the backend is stable.
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
import { getApplicationVolume, exportAnalytics } from "../services/analyticsService";

// ── MOCK DATA ─────────────────────────────────────────────────────────────────
// Visual fallback only — shown when the API call fails.
// The backend now provides statusBreakdown and location, so the mock
// mirrors that shape so the UI looks correct in both states.
const MOCK_DATA = {
  data: [
    {
      opportunityTitle: "Architecture Internship",
      count: 68, status: "approved",
      location: "Johannesburg, ZA",
      opportunityId: "mock-1",
      statusBreakdown: { pending: 20, shortlisted: 30, accepted: 10, rejected: 8 },
    },
    {
      opportunityTitle: "Urban Design Grad Programme",
      count: 54, status: "approved",
      location: "Cape Town, ZA",
      opportunityId: "mock-2",
      statusBreakdown: { pending: 15, shortlisted: 22, accepted: 12, rejected: 5 },
    },
    {
      opportunityTitle: "Heritage Restoration Placement",
      count: 41, status: "approved",
      location: "Pretoria, ZA",
      opportunityId: "mock-3",
      statusBreakdown: { pending: 10, shortlisted: 18, accepted: 8, rejected: 5 },
    },
    {
      opportunityTitle: "Structural Engineering Bursary",
      count: 37, status: "pending",
      location: "Durban, ZA",
      opportunityId: "mock-4",
      statusBreakdown: { pending: 37, shortlisted: 0, accepted: 0, rejected: 0 },
    },
    {
      opportunityTitle: "Landscape Design Learnership",
      count: 28, status: "approved",
      location: "Johannesburg, ZA",
      opportunityId: "mock-5",
      statusBreakdown: { pending: 8, shortlisted: 12, accepted: 5, rejected: 3 },
    },
    {
      opportunityTitle: "CAD Technician Traineeship",
      count: 19, status: "draft",
      location: "Cape Town, ZA",
      opportunityId: "mock-6",
      statusBreakdown: { pending: 19, shortlisted: 0, accepted: 0, rejected: 0 },
    },
  ],
  // Mock totals mirror the shape the backend sends in json.totals
  totals: {
    totalApplications:      247,
    activeOpportunities:    4,
    averagePerOpportunity:  41,
  },
};
// ─────────────────────────────────────────────────────────────────────────────

// ── Stat card — same style as AdminAccessApplications.jsx ────────────────────
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
  const { user } = useAuth();
  const source           = location.state?.source || "provider"; // analytics is provider-facing
  const SidebarComponent = source === "provider" ? EmployerSidebar : ApplicantSidebar;

  const [data,       setData]       = useState(MOCK_DATA.data);
  const [totals,     setTotals]     = useState(MOCK_DATA.totals);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [exporting,  setExporting]  = useState(false);

  // ── Fetch from backend ────────────────────────────────────────────────────
  // getApplicationVolume() returns { data, totals } — both come from the backend.
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getApplicationVolume();
      setData(result.data);
      setTotals(result.totals); // backend-calculated totals, not derived here
    } catch (err) {
      console.error("[AnalyticsPage]", err.message);
      setError("Could not load live analytics. Showing example data.");
      // Keep MOCK_DATA visible so the page doesn't go blank
      setData(MOCK_DATA.data);
      setTotals(MOCK_DATA.totals);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetchData(); }, [fetchData]);

  // ── Export handler ────────────────────────────────────────────────────────
  // Calls GET /api/analytics/export and triggers a CSV download.
  const handleExport = async () => {
    try {
      setExporting(true);
      await exportAnalytics();
    } catch (err) {
      console.error("[AnalyticsPage] Export failed:", err.message);
    } finally {
      setExporting(false);
    }
  };

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

        {/* ── Topbar ── */}
        <AdminTopbar title="Analytics" source={source} />

        <div className="p-12">

          {/* ── Page intro ── */}
          <div className="mb-8">
            <span className="text-sm font-semibold tracking-wider text-[#035b9d] uppercase">
              System Control Room
            </span>
            <div className="flex items-end justify-between mt-2">
              <div>
                <h2 className="text-3xl font-extrabold tracking-tight">
                  Analytics &amp; Governance
                </h2>
                <p className="text-gray-500 mt-2">
                  Application volume per opportunity across all your listings.
                </p>
              </div>

              {/* Export button — calls GET /api/analytics/export */}
              <button
                onClick={handleExport}
                disabled={exporting || data.length === 0}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#035b9d] text-white text-sm font-semibold rounded-full shadow-sm hover:bg-[#024a83] disabled:opacity-50 transition"
              >
                {exporting ? "Exporting…" : "Export CSV"}
              </button>
            </div>
          </div>

          {/* ── Error banner ── */}
          {error && (
            <div className="mb-6 px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
              {error}
            </div>
          )}

          {/* ── Stat cards ── */}
          {/* Values come from totals object returned by the backend */}
          <section className="grid grid-cols-3 gap-4 mb-8">
            <StatCard
              label="Total Applications"
              value={totals.totalApplications}
              color="text-gray-800"
            />
            <StatCard
              label="Active Opportunities"
              value={totals.activeOpportunities}
              color="text-[#035b9d]"
            />
            <StatCard
              label="Avg. Applications / Opportunity"
              value={totals.averagePerOpportunity}
              color="text-green-600"
            />
          </section>

          {/* ── Chart ── */}
          {/* data array includes statusBreakdown per opportunity for tooltip */}
          <section className="mb-6">
            <ApplicationVolumeChart data={data} />
          </section>

          {/* ── Breakdown table ── */}
          {/* Renders statusBreakdown columns + location from backend data */}
          <section>
            <OpportunityBreakdownTable data={data} />
          </section>

        </div>
      </main>
    </div>
  );
}