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

// ── Service imports ──────────────────────────────────────────────────────────
import { getApplicationVolume } from "../services/analyticsService";
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

// ── Stat Card Component (no div/span) ────────────────────────────────────────
function StatCard({ label, value, color }) {
  return (
    <article className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className={`text-3xl font-extrabold ${color}`}>{value}</p>
    </article>
  );
}

// ── Export Button Component (NO spans) ───────────────────────────────────────
function ExportButton({ onClick, disabled, icon, label, color }) {
  const colorClasses = {
    green: "bg-green-600 hover:bg-green-700",
    red: "bg-red-600 hover:bg-red-700",
    blue: "bg-blue-600 hover:bg-blue-700",
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

// ── Error Banner Component (no div/span) ─────────────────────────────────────
function ErrorBanner({ message }) {
  if (!message) return null;
  
  return (
    <section className="mb-6 px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
      {message}
    </section>
  );
}

// ── Loading Component (no div/span) ──────────────────────────────────────────
function LoadingState() {
  return (
    <main className="min-h-screen bg-[#faf9f8] flex items-center justify-center">
      <p className="text-gray-400">Loading analytics…</p>
    </main>
  );
}

// ── Main AnalyticsPage Component ─────────────────────────────────────────────
export default function AnalyticsPage() {
  const location = useLocation();
  // ✅ USING THE USER VARIABLE - will display welcome message
  const { user } = useAuth();
  const source = location.state?.source || "provider";
  const SidebarComponent = source === "provider" ? EmployerSidebar : ApplicantSidebar;

  const [data, setData] = useState(MOCK_DATA.data);
  const [totals, setTotals] = useState(MOCK_DATA.totals);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);

  // Get user display name
  const userDisplayName = user?.name || user?.email || user?.user_metadata?.full_name || "User";
  const userRole = user?.role || source || "provider";
  const userRoleDisplay = userRole === "provider" ? "Employer" : userRole === "admin" ? "Administrator" : "User";

  // ── Fetch data from backend ────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getApplicationVolume();
      setData(result.data);
      setTotals(result.totals);
    } catch (err) {
      console.error("[AnalyticsPage]", err.message);
      setError("Could not load live analytics. Showing example data.");
      setData(MOCK_DATA.data);
      setTotals(MOCK_DATA.totals);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Export Handlers ────────────────────────────────────────────────────────
  const handleExportCSV = async () => {
    try {
      setExporting(true);
      exportToCSV(data, 'analytics-report');
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
      // ✅ PASSING TOTALS to PDF export
      exportToPDF(data, totals);
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
      // ✅ PASSING BOTH DATA AND TOTALS to JSON export
      exportToJSON(data, totals);
    } catch (err) {
      console.error("[AnalyticsPage] JSON export failed:", err.message);
      setError("Failed to export JSON. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  // ── Loading State ──────────────────────────────────────────────────────────
  if (loading) {
    return <LoadingState />;
  }

  // ── Main Render ────────────────────────────────────────────────────────────
  return (
    <section className="flex min-h-screen bg-[#faf9f8]">
      <SidebarComponent />

      <main className="ml-64 min-h-screen w-full min-w-0">
        <AdminTopbar title="Analytics" source={source} />

        <section className="p-12">
          {/* Header with Welcome Message and Export Buttons */}
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

              {/* Welcome Message and Export Buttons Group */}
              <section className="text-right">
                {/* ✅ USER VARIABLE IS NOW USED - Welcome message */}
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

          {/* Error Banner */}
          <ErrorBanner message={error} />

          {/* Stat Cards Grid */}
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

          {/* Chart Section */}
          <section className="mb-6">
            <ApplicationVolumeChart data={data} />
          </section>

          {/* Breakdown Table Section */}
          <section>
            <OpportunityBreakdownTable data={data} />
          </section>
        </section>
      </main>
    </section>
  );
}