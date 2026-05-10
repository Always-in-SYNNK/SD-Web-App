import { useEffect, useState, useCallback } from "react";
import { useLocation }                       from "react-router-dom";

import { Sidebar as ApplicantSidebar } from "../components/dashboard/Sidebar";
import EmployerSidebar                 from "../components/layout/Sidebar";
import AdminTopbar                     from "../components/layout/AdminTopbar";
import { useAuth }                     from "../context/useAuth";

import SectorBarChart            from "../components/analytics/SectorBarChart";
import SectorPieChart            from "../components/analytics/SectorPieChart";
import OpportunityBreakdownTable from "../components/analytics/OpportunityBreakdownTable";

import { getPlacementRates, getApplicationVolume } from "../services/analyticsService";

const MOCK_TABLE = [
  { opportunityTitle: "Architecture Internship",        count: 68, status: "approved", location: "Johannesburg, ZA", opportunityId: "mock-1", statusBreakdown: { pending: 20, shortlisted: 30, accepted: 10, rejected: 8 } },
  { opportunityTitle: "Urban Design Grad Programme",    count: 54, status: "approved", location: "Cape Town, ZA",    opportunityId: "mock-2", statusBreakdown: { pending: 15, shortlisted: 22, accepted: 12, rejected: 5 } },
  { opportunityTitle: "Heritage Restoration Placement", count: 41, status: "approved", location: "Pretoria, ZA",     opportunityId: "mock-3", statusBreakdown: { pending: 10, shortlisted: 18, accepted: 8,  rejected: 5 } },
  { opportunityTitle: "Structural Engineering Bursary", count: 37, status: "pending",  location: "Durban, ZA",       opportunityId: "mock-4", statusBreakdown: { pending: 37, shortlisted: 0,  accepted: 0,  rejected: 0 } },
  { opportunityTitle: "Landscape Design Learnership",   count: 28, status: "approved", location: "Johannesburg, ZA", opportunityId: "mock-5", statusBreakdown: { pending: 8,  shortlisted: 12, accepted: 5,  rejected: 3 } },
];

const MOCK_TOTALS = { totalApplications: 247, activeOpportunities: 4, averagePerOpportunity: 41 };

// ─── Skeleton components ──────────────────────────────────────────────────────

function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-pulse">
      <div className="h-3 w-28 bg-gray-200 rounded mb-3" />
      <div className="h-8 w-16 bg-gray-200 rounded" />
    </div>
  );
}

function ChartSkeleton({ height = 300 }) {
  return (
    <div
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-pulse"
      style={{ height: height + 68 /* card padding */ }}
    >
      <div className="h-4 w-40 bg-gray-200 rounded mb-2" />
      <div className="h-3 w-56 bg-gray-100 rounded mb-6" />
      <div className="flex items-end gap-3 h-48 px-2">
        {[65, 90, 50, 78, 42, 85, 60, 35, 72, 55, 40, 68].map((h, i) => (
          <div
            key={i}
            className="flex-1 bg-gray-100 rounded-t"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, color }) {
  return (
    <article className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className={`text-3xl font-extrabold ${color}`}>{value}</p>
    </article>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminAnalytics() {
  const location = useLocation();
  const { user } = useAuth();

  const source           = location.state?.source || "applicant";
  const SidebarComponent = source === "provider" ? EmployerSidebar : ApplicantSidebar;

  const [sectorData, setSectorData] = useState(null);
  const [tableData,  setTableData]  = useState(MOCK_TABLE);
  const [totals,     setTotals]     = useState(MOCK_TOTALS);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [placementResult, appResult] = await Promise.allSettled([
        getPlacementRates(),
        getApplicationVolume(),
      ]);

      console.log("[placement]", placementResult);
      console.log("[apps]", appResult);

      if (placementResult.status === "fulfilled") {
        setSectorData(placementResult.value);
      } else {
        console.error("[AdminAnalytics] placements:", placementResult.reason?.message);
        setError("Could not load sector data. The charts below may be empty.");
      }

      if (appResult.status === "fulfilled") {
        setTableData(appResult.value.data);
        setTotals(appResult.value.totals);
      } else {
        console.error("[AdminAnalytics] apps:", appResult.reason?.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetchData(); }, [fetchData]);

  return (
    <div className="flex min-h-screen bg-[#faf9f8]">
      <SidebarComponent />
      <main className="ml-64 min-h-screen w-full min-w-0">
        <AdminTopbar title="Analytics" source={source} />
        <div className="p-12">

          {/* ── Header ── */}
          <div className="mb-8">
            <span className="text-sm font-semibold tracking-wider text-[#035b9d] uppercase">
              System Control Room
            </span>
            <h2 className="text-3xl font-extrabold mt-2 tracking-tight">
              Analytics &amp; Governance
            </h2>
            <p className="text-gray-500 mt-2">
              Application volume and acceptance rates per sector.
            </p>
          </div>

          {/* ── Error banner ── */}
          {error && (
            <div className="mb-6 px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
              {error}
            </div>
          )}

          {/* ── Bar chart: full width ── */}
          <section className="mb-6">
            {loading ? (
              <ChartSkeleton height={300} />
            ) : (
              <SectorBarChart data={sectorData?.chartData || []} />
            )}
          </section>

          {/* ── Stat cards on left, Pie chart on right ── */}
          <section className="grid grid-cols-1 xl:grid-cols-[0.9fr_1.6fr] gap-6 mb-6 items-start">
            {/* Left: stat cards */}
            <div className="grid grid-cols-1 gap-4 w-full min-w-0">
              {loading || !totals ? (
                <>
                  <StatCardSkeleton />
                  <StatCardSkeleton />
                  <StatCardSkeleton />
                </>
              ) : (
                <>
                  <StatCard label="Total Applications"              value={totals.totalApplications}    color="text-gray-800"  />
                  <StatCard label="Active Opportunities"            value={totals.activeOpportunities}   color="text-[#035b9d]" />
                  <StatCard label="Avg. Applications / Opportunity" value={totals.averagePerOpportunity} color="text-green-600" />
                </>
              )}
            </div>

            {/* Right: pie chart */}
            <div className="w-full min-w-0">
              {loading ? (
                <ChartSkeleton height={280} />
              ) : (
                <SectorPieChart data={sectorData?.chartData || []} />
              )}
            </div>
          </section>

          {/* ── Opportunity breakdown table ── */}
          <section>
            <OpportunityBreakdownTable data={tableData} />
          </section>

        </div>
      </main>
    </div>
  );
}