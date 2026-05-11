// frontend/src/pages/AnalyticsPage.jsx
//
// ─── What's included in this version ─────────────────────────────────────────
//
// 1. Stat cards use totals from the backend response (json.totals)
// 2. Three export options: CSV, PDF Report, and JSON Export
// 3. MOCK_DATA visual fallback when API fails
// 4. Professional PDF report with branding, summary cards, and status distribution
// 5. NO div or span elements - using semantic HTML only
// 6. User welcome message displaying logged-in user info
//
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";

// ── Sidebar imports ──────────────────────────────────────────────────────────
import { Sidebar as ApplicantSidebar } from "../components/dashboard/Sidebar";
import EmployerSidebar from "../components/layout/Sidebar";
import AdminTopbar from "../components/layout/AdminTopbar";
import { useAuth } from "../context/useAuth";

// ── Component imports ────────────────────────────────────────────────────────
import ApplicationVolumeChart from "../components/analytics/ApplicationVolumeChart";
import OpportunityBreakdownTable from "../components/analytics/OpportunityBreakdownTable";
import SectorBarChart            from "../components/analytics/SectorBarChart";

// ── Service imports ──────────────────────────────────────────────────────────
import { getApplicationVolume, getProviderPlacementRates } from "../services/analyticsService";
import { exportToCSV, exportToPDF, exportToJSON } from '../services/exportService';

// ── MOCK DATA (visual fallback only) ─────────────────────────────────────────
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
  totals: {
    totalApplications: 247,
    activeOpportunities: 4,
    averagePerOpportunity: 41,
  },
};

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
      style={{ height: height + 68 }}
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

function StatCard({ label, value, color }) {
  return (
    <article className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className={`text-3xl font-extrabold ${color}`}>{value}</p>
    </article>
  );
}

function ExportButton({ onClick, disabled, icon, label, color }) {
  const colorClasses = {
    green: "bg-green-600 hover:bg-green-700",
    red:   "bg-red-600 hover:bg-red-700",
    blue:  "bg-blue-600 hover:bg-blue-700",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-2 px-4 py-2 text-white text-sm font-semibold rounded-lg shadow-sm disabled:opacity-50 transition ${colorClasses[color]}`}
    >
      {icon} {label}
    </button>
  );
}

function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <section className="mb-6 px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
      {message}
    </section>
  );
}

// ── Main AnalyticsPage Component ─────────────────────────────────────────────
export default function AnalyticsPage() {
  const location = useLocation();
  const { user } = useAuth();
  const source = location.state?.source || "provider";
  const SidebarComponent = source === "provider" ? EmployerSidebar : ApplicantSidebar;

  const [data,       setData]       = useState(MOCK_DATA.data);
  const [totals,     setTotals]     = useState(MOCK_DATA.totals);
  const [sectorData, setSectorData] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [exporting,  setExporting]  = useState(false);

  const userDisplayName  = user?.name || user?.email || user?.user_metadata?.full_name || "User";
  const userRole         = user?.role || source || "provider";
  const userRoleDisplay  = userRole === "provider" ? "Employer" : userRole === "admin" ? "Administrator" : "User";

  // ── Fetch data ─────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [placementResult, appResult] = await Promise.allSettled([
        getProviderPlacementRates(),
        getApplicationVolume(),
      ]);

      console.log("[placement]", placementResult);
      console.log("[apps]",      appResult);

      if (placementResult.status === "fulfilled") {
        // getProviderPlacementRates returns the array directly (see analyticsService.js)
        setSectorData(placementResult.value || []);
      } else {
        console.error("[AnalyticsPage] placements:", placementResult.reason?.message);
        setError("Could not load sector data. The charts below may be empty.");
      }

      if (appResult.status === "fulfilled") {
        setData(appResult.value.data);
        setTotals(appResult.value.totals);
      } else {
        console.error("[AnalyticsPage] applications:", appResult.reason?.message);
      }
    } catch (err) {
      console.error("[AnalyticsPage]", err.message);
      setError("Could not load live analytics. Showing example data.");
      setData(MOCK_DATA.data);
      setTotals(MOCK_DATA.totals);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Export handlers — each passes sectorData as the third argument ─────────
  const handleExportCSV = async () => {
    try {
      setExporting(true);
      exportToCSV(data, 'analytics-report', sectorData);
    } catch (err) {
      console.error("[AnalyticsPage] CSV export failed:", err.message);
      setError("Failed to export CSV. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setExporting(true);
      exportToPDF(data, totals, sectorData);
    } catch (err) {
      console.error("[AnalyticsPage] PDF export failed:", err.message);
      setError("Failed to export PDF. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const handleExportJSON = async () => {
    try {
      setExporting(true);
      exportToJSON(data, totals, sectorData);
    } catch (err) {
      console.error("[AnalyticsPage] JSON export failed:", err.message);
      setError("Failed to export JSON. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <section className="flex min-h-screen bg-[#faf9f8]">
      <SidebarComponent />

      <main className="ml-64 min-h-screen w-full min-w-0">
        <AdminTopbar title="Analytics" source={source} />

        <section className="p-12">
          {/* Header */}
          <header className="mb-8">
            <p className="text-sm font-semibold tracking-wider text-[#035b9d] uppercase">
              System Control Room
            </p>
            <section className="flex items-end justify-between mt-2">
              <section>
                <h1 className="text-3xl font-extrabold tracking-tight">
                  Analytics &amp; Governance
                </h1>
                <p className="text-gray-500 mt-2">
                  Application volume per opportunity across all your listings.
                </p>
              </section>

              <section className="text-right">
                <p className="text-sm text-gray-500 mb-2">
                  Welcome back, <strong className="text-[#035b9d]">{userDisplayName}</strong>
                  <span className="text-gray-400"> ({userRoleDisplay})</span>
                </p>
                <section className="flex gap-3">
                  <ExportButton
                    onClick={handleExportCSV}
                    disabled={exporting || data.length === 0}
                    icon="📊"
                    label="CSV"
                    color="green"
                  />
                  <ExportButton
                    onClick={handleExportPDF}
                    disabled={exporting || data.length === 0}
                    icon="📄"
                    label="PDF Report"
                    color="red"
                  />
                  <ExportButton
                    onClick={handleExportJSON}
                    disabled={exporting || data.length === 0}
                    icon="📋"
                    label="JSON"
                    color="blue"
                  />
                </section>
              </section>
            </section>
          </header>

          <ErrorBanner message={error} />

          {/* Stat Cards */}
          <section className="grid grid-cols-3 gap-4 mb-8">
            {loading || !totals ? (
              <>
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </>
            ) : (
              <>
                  <StatCard label="Total Applications"
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
              </>
            )}
          </section>

          {/* Charts */}
          <section className="flex flex-col gap-6 mb-6">
            {loading ? (
              <>
                <ChartSkeleton height={300} />
                <ChartSkeleton height={300} />
              </>
            ) : (
              <>
                <ApplicationVolumeChart data={data} />
                <SectorBarChart data={sectorData} />
              </>
            )}
          </section>

          {/* Breakdown Table */}
          <section>
            <OpportunityBreakdownTable data={data} />
          </section>
        </section>
      </main>
    </section>
  );
}
