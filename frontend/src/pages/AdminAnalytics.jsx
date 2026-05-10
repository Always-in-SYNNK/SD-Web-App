import { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";

import { Sidebar as ApplicantSidebar } from "../components/dashboard/Sidebar";
import EmployerSidebar from "../components/layout/Sidebar";
import AdminTopbar from "../components/layout/AdminTopbar";

import ApplicationVolumeChart from "../components/analytics/ApplicationVolumeChart";
import OpportunityBreakdownTable from "../components/analytics/OpportunityBreakdownTable";
import { getAdminApplicationVolume } from "../services/adminAnalyticsService";
import { exportToCSV, exportToPDF, exportToJSON } from '../services/exportService';

function StatCard({ label, value, color }) {
  return (
    <article className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className={`text-3xl font-extrabold ${color}`}>{value?.toLocaleString() || 0}</p>
    </article>
  );
}

function StatusDistributionChart({ data }) {
  const applicationStatuses = {
    received: 0,
    shortlisted: 0,
    offered: 0,
    accepted: 0,
    rejected: 0
  };
  
  data.forEach(opportunity => {
    if (opportunity.statusBreakdown) {
      applicationStatuses.received += opportunity.statusBreakdown.received || 0;
      applicationStatuses.shortlisted += opportunity.statusBreakdown.shortlisted || 0;
      applicationStatuses.offered += opportunity.statusBreakdown.offered || 0;
      applicationStatuses.accepted += opportunity.statusBreakdown.accepted || 0;
      applicationStatuses.rejected += opportunity.statusBreakdown.rejected || 0;
    }
  });
  
  const total = Object.values(applicationStatuses).reduce((a, b) => a + b, 0);
  
  const statusConfig = {
    received: { color: 'bg-gray-400', label: 'Received' },
    shortlisted: { color: 'bg-blue-500', label: 'Shortlisted' },
    offered: { color: 'bg-purple-500', label: 'Offered' },
    accepted: { color: 'bg-green-500', label: 'Accepted' },
    rejected: { color: 'bg-red-500', label: 'Rejected' }
  };

  if (total === 0) {
    return (
      <article className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <header className="mb-4">
          <h3 className="font-bold text-gray-800">Application Status Distribution</h3>
          <p className="text-xs text-gray-400 mt-1">Breakdown of all applications across approved opportunities</p>
        </header>
        <p className="text-gray-400 text-center py-8">No applications received yet</p>
      </article>
    );
  }

  return (
    <article className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <header className="mb-4">
        <h3 className="font-bold text-gray-800">Application Status Distribution</h3>
        <p className="text-xs text-gray-400 mt-1">Breakdown of all applications across approved opportunities</p>
      </header>
      
      <section className="space-y-3">
        {Object.entries(applicationStatuses).map(([status, count]) => {
          const percentage = total ? Math.round((count / total) * 100) : 0;
          return (
            <section key={status} className="space-y-1">
              <section className="flex justify-between text-sm">
                <p className="font-medium text-gray-700 capitalize">{statusConfig[status].label}</p>
                <p className="font-bold text-gray-600">{count} ({percentage}%)</p>
              </section>
              <section className="w-full bg-gray-200 rounded-full h-2">
                <section
                  className={`${statusConfig[status].color} h-2 rounded-full`}
                  style={{ width: `${percentage}%` }}
                />
              </section>
            </section>
          );
        })}
      </section>
    </article>
  );
}

function TopOpportunitiesChart({ data }) {
  const top5 = [...data]
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  
  const maxCount = top5[0]?.count || 1;

  if (top5.length === 0) {
    return (
      <article className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <header className="mb-4">
          <h3 className="font-bold text-gray-800">Top Opportunities by Applications</h3>
          <p className="text-xs text-gray-400 mt-1">Most popular opportunities based on application volume</p>
        </header>
        <p className="text-gray-400 text-center py-8">No application data available yet</p>
      </article>
    );
  }

  return (
    <article className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <header className="mb-4">
        <h3 className="font-bold text-gray-800">Top 5 Opportunities by Applications</h3>
        <p className="text-xs text-gray-400 mt-1">Most popular approved opportunities based on application volume</p>
      </header>
      
      <section className="space-y-3">
        {top5.map((item, index) => (
          <section key={item.opportunityId} className="space-y-1">
            <section className="flex justify-between text-sm">
              <p className="font-medium text-gray-700 truncate max-w-[200px]">
                #{index + 1} {item.opportunityTitle}
              </p>
              <p className="font-bold text-[#035b9d]">{item.count} applications</p>
            </section>
            <section className="w-full bg-gray-200 rounded-full h-2">
              <section
                className="bg-[#035b9d] h-2 rounded-full"
                style={{ width: `${(item.count / maxCount) * 100}%` }}
              />
            </section>
          </section>
        ))}
      </section>
    </article>
  );
}

function InsightsPanel({ data, totals }) {
  const insights = [];
  
  const topOpportunity = [...data].sort((a, b) => b.count - a.count)[0];
  if (topOpportunity && topOpportunity.count > 0) {
    insights.push(`🏆 "${topOpportunity.opportunityTitle}" is the top opportunity with ${topOpportunity.count} applications`);
  }
  
  const zeroApplications = data.filter(opp => opp.count === 0);
  if (zeroApplications.length > 0) {
    insights.push(`⚠️ ${zeroApplications.length} approved opportunity(ies) have received no applications yet`);
  }
  
  if (totals.averagePerOpportunity > 0) {
    insights.push(`📊 Average of ${totals.averagePerOpportunity} applications per approved opportunity`);
  }
  
  if (totals.totalApplications > 0) {
    insights.push(`📈 Total of ${totals.totalApplications.toLocaleString()} applications received across all approved opportunities`);
  }

  if (insights.length === 0) {
    return null;
  }

  return (
    <article className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 shadow-sm border border-blue-100">
      <header className="mb-3">
        <h3 className="font-bold text-gray-800">Key Insights</h3>
        <p className="text-xs text-gray-500 mt-1">Data-driven observations from approved opportunities only</p>
      </header>
      <section className="space-y-2">
        {insights.map((insight, index) => (
          <p key={index} className="text-sm text-gray-700">{insight}</p>
        ))}
      </section>
    </article>
  );
}

export default function AdminAnalytics() {
  const location = useLocation();
  const source = location.state?.source || "admin";
  const SidebarComponent = source === "provider" ? EmployerSidebar : ApplicantSidebar;

  const [data, setData] = useState([]);
  const [totals, setTotals] = useState({
    totalApplications: 0,
    activeOpportunities: 0,
    averagePerOpportunity: 0,
    totalProviders: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getAdminApplicationVolume();
      setData(result.data);
      setTotals(result.totals);
    } catch (err) {
      console.error("[AdminAnalytics]", err.message);
      setError("Could not load analytics data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExportCSV = () => {
    try {
      setIsExporting(true);
      exportToCSV(data, 'admin-analytics-report');
    } catch (err) {
      console.error('CSV export failed:', err);
      setError('Failed to export CSV. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = () => {
    try {
      setIsExporting(true);
      exportToPDF(data, totals);
    } catch (err) {
      console.error('PDF export failed:', err);
      setError('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportJSON = () => {
    try {
      setIsExporting(true);
      exportToJSON(data, totals);
    } catch (err) {
      console.error('JSON export failed:', err);
      setError('Failed to export JSON. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#faf9f8] flex items-center justify-center">
        <p className="text-gray-400">Loading analytics…</p>
      </main>
    );
  }

  return (
    <section className="flex min-h-screen bg-[#faf9f8]">
      <SidebarComponent />

      <main className="ml-64 min-h-screen w-full min-w-0">
        <AdminTopbar title="Admin Analytics" source={source} />

        <section className="p-12">
          <header className="mb-8">
            <section className="flex items-center justify-between">
              <section>
                <p className="text-sm font-semibold tracking-wider text-[#035b9d] uppercase">
                  System Control Room
                </p>
                <h1 className="text-3xl font-extrabold tracking-tight mt-2">
                  Analytics &amp; Governance
                </h1>
                <p className="text-gray-500 mt-2">
                  Application volume per approved opportunity across ALL providers
                </p>
              </section>

              {/* Export Buttons */}
              <section className="flex gap-3">
                <button
                  onClick={handleExportCSV}
                  disabled={isExporting || data.length === 0}
                  className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-green-700 disabled:opacity-50 transition"
                >
                  📊 CSV
                </button>
                <button
                  onClick={handleExportPDF}
                  disabled={isExporting || data.length === 0}
                  className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-red-700 disabled:opacity-50 transition"
                >
                  📄 PDF Report
                </button>
                <button
                  onClick={handleExportJSON}
                  disabled={isExporting || data.length === 0}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-blue-700 disabled:opacity-50 transition"
                >
                  📋 JSON
                </button>
              </section>
            </section>
          </header>

          {error && (
            <section className="mb-6 px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
              {error}
            </section>
          )}

          {/* Key Metrics */}
          <section className="grid grid-cols-4 gap-4 mb-8">
            <StatCard
              label="Total Applications"
              value={totals.totalApplications}
              color="text-gray-800"
            />
            <StatCard
              label="Approved Opportunities"
              value={totals.activeOpportunities}
              color="text-[#035b9d]"
            />
            <StatCard
              label="Avg per Opportunity"
              value={totals.averagePerOpportunity}
              color="text-green-600"
            />
            <StatCard
              label="Active Providers"
              value={totals.totalProviders || 0}
              color="text-purple-600"
            />
          </section>

          {/* Insights Panel */}
          <section className="mb-8">
            <InsightsPanel data={data} totals={totals} />
          </section>

          {/* Two Column Layout for Charts */}
          <section className="grid grid-cols-2 gap-6 mb-8">
            <ApplicationVolumeChart data={data} />
            <StatusDistributionChart data={data} />
          </section>

          {/* Top Opportunities */}
          <section className="mb-8">
            <TopOpportunitiesChart data={data} />
          </section>

          {/* Detailed Table */}
          <section>
            <OpportunityBreakdownTable data={data} />
          </section>
        </section>
      </main>
    </section>
  );
}