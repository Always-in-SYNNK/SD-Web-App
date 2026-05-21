import { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";

import { Sidebar as ApplicantSidebar } from "../components/dashboard/Sidebar";
import EmployerSidebar                 from "../components/layout/Sidebar";
import AdminTopbar                     from "../components/layout/AdminTopbar";

import SectorBarChart            from "../components/analytics/SectorBarChart";
import SectorPieChart            from "../components/analytics/SectorPieChart";
import ApplicationVolumeChart    from "../components/analytics/ApplicationVolumeChart";
import OpportunityBreakdownTable from "../components/analytics/OpportunityBreakdownTable";

import { getPlacementRates }                      from "../services/analyticsService";
import { getAdminApplicationVolume }              from "../services/adminAnalyticsService";
import { exportToCSV, exportToPDF, exportToJSON } from "../services/exportService";

// ─── Skeletons ────────────────────────────────────────────────────────────────

function StatCardSkeleton() {
  return (
    <article className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-pulse">
      <p className="h-3 w-28 bg-gray-200 rounded mb-3" aria-hidden="true" />
      <p className="h-8 w-16 bg-gray-200 rounded" aria-hidden="true" />
    </article>
  );
}

function ChartSkeleton({ height = 300 }) {
  return (
    <article
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-pulse"
      style={{ minHeight: height + 68 }}
    >
      <h3 className="h-4 w-40 bg-gray-200 rounded mb-2" aria-hidden="true" />
      <p className="h-3 w-56 bg-gray-100 rounded mb-6" aria-hidden="true" />
      <div className="flex items-end gap-3 px-2" style={{ height }} aria-hidden="true">
        {[65, 90, 50, 78, 42, 85, 60, 35, 72, 55, 40, 68].map((h, i) => (
          <div
            key={i}
            className="flex-1 bg-gray-100 rounded-t"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </article>
  );
}

function PanelSkeleton({ height = 220 }) {
  return (
    <article
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-pulse"
      style={{ minHeight: height }}
    >
      <h3 className="h-4 w-40 bg-gray-200 rounded mb-2" aria-hidden="true" />
      <p className="h-3 w-52 bg-gray-100 rounded mb-6" aria-hidden="true" />
      <section className="space-y-4">
        {[80, 60, 95, 45, 70].map((w, i) => (
          <div key={i} className="space-y-1.5">
            <div className="flex justify-between">
              <p className="h-3 bg-gray-200 rounded" style={{ width: `${w * 0.55}%` }} aria-hidden="true" />
              <p className="h-3 w-14 bg-gray-200 rounded" aria-hidden="true" />
            </div>
            <p className="h-2 bg-gray-100 rounded-full w-full" aria-hidden="true" />
          </div>
        ))}
      </section>
    </article>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, color }) {
  return (
    <article className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h2 className="text-sm font-normal text-gray-500 mb-1">{label}</h2>
      <p className={`text-3xl font-extrabold ${color}`}>{value}</p>
    </article>
  );
}

// ─── Inline components ────────────────────────────────────────────────────────

function StatusDistributionChart({ data }) {
  const applicationStatuses = {
    received:     0,
    shortlisted: 0,
    offered:      0,
    accepted:     0,
    rejected:     0,
  };

  data.forEach((opportunity) => {
    if (opportunity.statusBreakdown) {
      applicationStatuses.received    += opportunity.statusBreakdown.received    || 0;
      applicationStatuses.shortlisted += opportunity.statusBreakdown.shortlisted || 0;
      applicationStatuses.offered     += opportunity.statusBreakdown.offered     || 0;
      applicationStatuses.accepted    += opportunity.statusBreakdown.accepted    || 0;
      applicationStatuses.rejected    += opportunity.statusBreakdown.rejected    || 0;
    }
  });

  const total = Object.values(applicationStatuses).reduce((a, b) => a + b, 0);

  const statusConfig = {
    received:    { color: "bg-gray-400",   label: "Received"    },
    shortlisted: { color: "bg-blue-500",   label: "Shortlisted" },
    offered:     { color: "bg-purple-500", label: "Offered"     },
    accepted:    { color: "bg-green-500",  label: "Accepted"    },
    rejected:    { color: "bg-red-500",    label: "Rejected"    },
  };

  return (
    <article className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <header className="mb-4">
        <h3 className="font-bold text-gray-800">Application Status Distribution</h3>
        <p className="text-xs text-gray-400 mt-1">
          Breakdown of all applications across approved opportunities
        </p>
      </header>

      {total === 0 ? (
        <section className="flex flex-col items-center justify-center py-10 gap-1">
          <p className="text-gray-500 text-sm font-medium">No applications received yet</p>
          <p className="text-gray-400 text-xs">Data appears once applications are submitted</p>
        </section>
      ) : (
        <dl className="space-y-3">
          {Object.entries(applicationStatuses).map(([status, count]) => {
            const percentage = total ? Math.round((count / total) * 100) : 0;
            return (
              <div key={status} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <dt className="font-medium text-gray-700 capitalize">
                    {statusConfig[status].label}
                  </dt>
                  <dd className="font-bold text-gray-600">
                    {count} ({percentage}%)
                  </dd>
                </div>
                <figure className="w-full bg-gray-100 rounded-full h-2">
                  <figcaption
                    className={`${statusConfig[status].color} h-2 rounded-full transition-all`}
                    style={{ width: `${percentage}%` }}
                    aria-label={`${percentage} percent`}
                  />
                </figure>
              </div>
            );
          })}
        </dl>
      )}
    </article>
  );
}

function TopOpportunitiesChart({ data }) {
  const top5     = [...data].sort((a, b) => b.count - a.count).slice(0, 5);
  const maxCount = top5[0]?.count || 1;

  return (
    <article className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <header className="mb-4">
        <h3 className="font-bold text-gray-800">Top 5 Opportunities by Applications</h3>
        <p className="text-xs text-gray-400 mt-1">
          Most popular approved opportunities based on application volume
        </p>
      </header>

      {top5.length === 0 ? (
        <section className="flex flex-col items-center justify-center py-10 gap-1">
          <p className="text-gray-500 text-sm font-medium">No application data yet</p>
          <p className="text-gray-400 text-xs">Data appears once applications are submitted</p>
        </section>
      ) : (
        <dl className="space-y-3">
          {top5.map((item, index) => (
            <div key={item.opportunityId} className="space-y-1">
              <div className="flex justify-between text-sm">
                <dt className="font-medium text-gray-700 truncate max-w-[200px]">
                  #{index + 1} {item.opportunityTitle}
                </dt>
                <dd className="font-bold text-[#035b9d]">{item.count} applications</dd>
              </div>
              <figure className="w-full bg-gray-100 rounded-full h-2">
                <figcaption
                  className="bg-[#035b9d] h-2 rounded-full transition-all"
                  style={{ width: `${(item.count / maxCount) * 100}%` }}
                  aria-label={`${Math.round((item.count / maxCount) * 100)} percent`}
                />
              </figure>
            </div>
          ))}
        </dl>
      )}
    </article>
  );
}

function InsightsPanel({ data, totals }) {
  const insights = [];

  const topOpportunity = [...data].sort((a, b) => b.count - a.count)[0];
  if (topOpportunity?.count > 0) {
    insights.push(`🏆 "${topOpportunity.opportunityTitle}" leads with ${topOpportunity.count} applications`);
  }

  const zeroApplications = data.filter((opp) => opp.count === 0);
  if (zeroApplications.length > 0) {
    insights.push(`⚠️ ${zeroApplications.length} approved opportunity(ies) have received no applications yet`);
  }

  if (totals.averagePerOpportunity > 0) {
    insights.push(`📊 Average of ${totals.averagePerOpportunity} applications per approved opportunity`);
  }

  if (totals.totalApplications > 0) {
    insights.push(`📈 ${totals.totalApplications.toLocaleString()} total applications across all approved opportunities`);
  }

  if (insights.length === 0) return null;

  return (
    <article className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 shadow-sm border border-blue-100 h-full">
      <header className="mb-3">
        <h3 className="font-bold text-gray-800">Key Insights</h3>
        <p className="text-xs text-gray-500 mt-1">
          Data-driven observations from approved opportunities only
        </p>
      </header>
      <ul className="space-y-2 list-none p-0 m-0">
        {insights.map((insight, index) => (
          <li key={index} className="text-sm text-gray-700 leading-relaxed">
            {insight}
          </li>
        ))}
      </ul>
    </article>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminAnalytics() {
  const location = useLocation();

  const source           = location.state?.source || "applicant";
  const SidebarComponent = source === "provider" ? EmployerSidebar : ApplicantSidebar;

  const [sectorData,   setSectorData]   = useState(null);
  const [tableData,    setTableData]    = useState([]);
  const [totals,       setTotals]       = useState({
    totalApplications:     0,
    activeOpportunities:   0,
    averagePerOpportunity: 0,
    totalProviders:        0,
  });
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [isExporting,  setIsExporting]  = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [placementResult, appResult] = await Promise.allSettled([
        getPlacementRates(),
        getAdminApplicationVolume(),
      ]);

      console.log("[placement]", placementResult);
      console.log("[apps]",      appResult);

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

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleExport = (fn, label) => async () => {
    try {
      setIsExporting(true);
      fn(tableData, totals, sectorData?.chartData || []);
    } catch (err) {
      console.error(`${label} export failed:`, err);
      setError(`Failed to export ${label}. Please try again.`);
    } finally {
      setIsExporting(false);
    }
  };

  const exportDisabled = isExporting || tableData.length === 0;

  return (
    <div className="flex min-h-screen bg-[#faf9f8]">
      <SidebarComponent />

      <main className="ml-64 min-h-screen w-full min-w-0">
        <AdminTopbar title="Admin Analytics" source={source} />

        <div className="p-12">

          {/* ── Header ── */}
          <header className="mb-8 flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold tracking-wider text-[#035b9d] uppercase">
                System Control Room
              </p>
              <h1 className="text-3xl font-extrabold tracking-tight mt-2">
                Analytics &amp; Governance
              </h1>
              <p className="text-gray-500 mt-2">
                Application volume per approved opportunity and placement rates per sector.
              </p>
            </div>

            <nav className="flex gap-3 mt-1" aria-label="Export Actions">
              <button
                onClick={handleExport(exportToCSV,  "CSV")}
                disabled={exportDisabled}
                className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-green-700 disabled:opacity-50 transition"
              >
                📊 CSV
              </button>
              <button
                onClick={handleExport(exportToPDF,  "PDF")}
                disabled={exportDisabled}
                className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-red-700 disabled:opacity-50 transition"
              >
                📄 PDF Report
              </button>
              <button
                onClick={handleExport(exportToJSON, "JSON")}
                disabled={exportDisabled}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-blue-700 disabled:opacity-50 transition"
              >
                📋 JSON
              </button>
            </nav>
          </header>

          {/* ── Error banner ── */}
          {error && (
            <aside className="mb-6 px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700" role="alert">
              {error}
            </aside>
          )}

          {/* ── 1. Stat cards — one row of 4 ── */}
          <section className="grid grid-cols-4 gap-4 mb-6" aria-label="System Overview Statistics">
            {loading ? (
              <>
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </>
            ) : (
              <>
                <StatCard label="Total Applications"     value={totals.totalApplications}     color="text-gray-800"   />
                <StatCard label="Approved Opportunities" value={totals.activeOpportunities}    color="text-[#035b9d]"  />
                <StatCard label="Avg per Opportunity"    value={totals.averagePerOpportunity}  color="text-green-600"  />
                <StatCard label="Active Providers"       value={totals.totalProviders || 0}    color="text-purple-800" />
              </>
            )}
          </section>

          {/* ── 2. Application Volume Chart — full width ── */}
          <section className="mb-6" aria-label="Application Volume Timeline">
            {loading
              ? <ChartSkeleton height={300} />
              : <ApplicationVolumeChart data={tableData} />
            }
          </section>

          {/* ── 3. Sector Bar Chart — full width ── */}
          <section className="mb-6" aria-label="Placement Rates by Sector">
            {loading
              ? <ChartSkeleton height={300} />
              : <SectorBarChart data={sectorData?.chartData || []} />
            }
          </section>

          {/* ── 4. Pie chart + Status Distribution — side by side ── */}
          <section className="grid grid-cols-2 gap-6 mb-6" aria-label="Distribution Breakdown">
            {loading ? (
              <>
                <ChartSkeleton height={320} />
                <PanelSkeleton height={320} />
              </>
            ) : (
              <>
                <SectorPieChart data={sectorData?.chartData || []} />
                <StatusDistributionChart data={tableData} />
              </>
            )}
          </section>

          {/* ── 5. Top Opportunities + Key Insights — side by side ── */}
          <section className="grid grid-cols-2 gap-6 mb-6" aria-label="Performance Insights">
            {loading ? (
              <>
                <PanelSkeleton height={220} />
                <PanelSkeleton height={220} />
              </>
            ) : (
              <>
                <TopOpportunitiesChart data={tableData} />
                <InsightsPanel data={tableData} totals={totals} />
              </>
            )}
          </section>

          {/* ── 6. Opportunity Breakdown Table — full width ── */}
          <section aria-label="Detailed Opportunity Breakdown">
            <OpportunityBreakdownTable 
              data={tableData}
              statusKeys={['received', 'shortlisted', 'offered', 'accepted', 'rejected']}
              showOpportunityStatus={false}
            />
          </section>

        </div>
      </main>
    </div>
  );
}